import json
import logging
import asyncio
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.services.parser import extract_raw_text_from_pdf, parse_resume_text
from app.services.generator import generate_interview_questions
from app.services.tts import synthesize_speech
from app.services.evaluator import evaluate_answer

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


# ─── Pydantic Request Models ──────────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str

class AnswerSubmission(BaseModel):
    question_id: int
    answer_text: str
    session_id: int


# ─── SESSION ENDPOINTS ────────────────────────────────────────────────────────

@router.post("/sessions")
async def create_interview_session(
    candidate_name: str = Form(...),
    difficulty: str = Form("Medium"),
    persona: str = Form("Standard Technical Interviewer"),
    resume: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """Initializes an interview session, parses resume if provided, and generates custom questions."""
    logger.info(f"Initializing session for candidate: {candidate_name}")
    
    resume_text = ""
    parsed_profile = {
        "candidate_name": candidate_name,
        "candidate_email": "",
        "skills": ["Software Engineering"],
        "experience": [],
        "projects": []
    }
    
    # 1. Parse CV if uploaded
    if resume:
        if not resume.filename.endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Only PDF files are supported."
            )
        try:
            pdf_bytes = await resume.read()
            if len(pdf_bytes) > 5 * 1024 * 1024:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File size exceeds the 5MB limit."
                )
            resume_text = extract_raw_text_from_pdf(pdf_bytes)
            parsed_profile = await parse_resume_text(resume_text)
            # Use provided name if LLM couldn't parse candidate_name
            if not parsed_profile.get("candidate_name") or parsed_profile.get("candidate_name") in ["Unknown Candidate", "Applicant", "John Doe"]:
                parsed_profile["candidate_name"] = candidate_name
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error parsing resume: {e}")
            # Non-blocking, continue with empty parsed profile but log error
            parsed_profile["candidate_name"] = candidate_name

    try:
        # 2. Save Interview Session to Database
        db_session = models.InterviewSession(
            candidate_name=parsed_profile.get("candidate_name", candidate_name),
            candidate_email=parsed_profile.get("candidate_email", ""),
            resume_text=resume_text,
            resume_metadata=json.dumps({
                "skills": parsed_profile.get("skills", []),
                "experience": parsed_profile.get("experience", []),
                "projects": parsed_profile.get("projects", [])
            })
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        
        # 3. Generate 10 Custom Interview Questions
        generated_data = await generate_interview_questions(
            skills=parsed_profile.get("skills", []),
            experience=parsed_profile.get("experience", []),
            projects=parsed_profile.get("projects", []),
            difficulty=difficulty,
            persona=persona
        )
        
        questions_list = generated_data.get("questions", [])
        db_questions = []
        
        # Save generated questions to DB
        for q in questions_list:
            db_q = models.Question(
                session_id=db_session.id,
                question_text=q.get("question_text"),
                question_type=q.get("question_type"),
                difficulty=q.get("difficulty", difficulty),
                model_answer=q.get("model_answer", "")
            )
            db.add(db_q)
            db_questions.append(db_q)
            
        db.commit()
        
        # Return response payload
        return {
            "session_id": db_session.id,
            "candidate_name": db_session.candidate_name,
            "skills": parsed_profile.get("skills", []),
            "experience": parsed_profile.get("experience", []),
            "projects": parsed_profile.get("projects", []),
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "question_type": q.question_type,
                    "difficulty": q.difficulty,
                    "model_answer": q.model_answer
                } for q in db_questions
            ]
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create session and questions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize interview session: {e}"
        )

@router.get("/sessions/{session_id}")
def get_session_details(session_id: int, db: Session = Depends(get_db)):
    """Retrieves all questions and answers associated with a session."""
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    questions = db.query(models.Question).filter(models.Question.session_id == session_id).all()
    
    questions_data = []
    for q in questions:
        # Get answers for question
        answers = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()
        q_answers = [
            {
                "id": a.id,
                "answer_text": a.answer_text,
                "clarity_score": a.clarity_score,
                "technical_score": a.technical_score,
                "structure_score": a.structure_score,
                "feedback_markdown": a.feedback_markdown,
                "model_answer": a.model_answer
            } for a in answers
        ]
        
        questions_data.append({
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "difficulty": q.difficulty,
            "model_answer": q.model_answer,
            "answers": q_answers
        })
        
    # Load metadata parsed from resume
    metadata = {}
    if session.resume_metadata:
        try:
            metadata = json.loads(session.resume_metadata)
        except:
            pass

    return {
        "session_id": session.id,
        "candidate_name": session.candidate_name,
        "created_at": session.created_at,
        "skills": metadata.get("skills", []),
        "experience": metadata.get("experience", []),
        "projects": metadata.get("projects", []),
        "questions": questions_data
    }


# ─── TTS ENDPOINT ─────────────────────────────────────────────────────────────

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Converts text to speech audio using ElevenLabs API."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    
    audio_bytes = await synthesize_speech(request.text)
    
    if audio_bytes is None:
        raise HTTPException(
            status_code=503,
            detail="TTS service unavailable. Check ElevenLabs API key or quota."
        )
    
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=tts_output.mp3"}
    )


# ─── ANSWER ENDPOINTS ─────────────────────────────────────────────────────────

@router.post("/answers")
async def submit_answer(submission: AnswerSubmission, db: Session = Depends(get_db)):
    """Submits a candidate's answer, saves to DB, and triggers LLM evaluation."""
    logger.info(f"Answer submitted for question_id={submission.question_id}")
    
    # Verify question exists
    question = db.query(models.Question).filter(models.Question.id == submission.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")
    
    # Save the answer to DB first (without scores)
    db_answer = models.Answer(
        question_id=submission.question_id,
        answer_text=submission.answer_text
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    
    # Trigger LLM evaluation
    logger.info(f"Starting evaluation for answer_id={db_answer.id}")
    try:
        evaluation = await evaluate_answer(
            question_text=question.question_text,
            answer_text=submission.answer_text,
            question_type=question.question_type or "technical",
            difficulty=question.difficulty or "Medium"
        )
        
        # Update answer with evaluation scores
        db_answer.clarity_score = evaluation.get("clarity_score", 5)
        db_answer.technical_score = evaluation.get("technical_score", 5)
        db_answer.structure_score = evaluation.get("structure_score", 5)
        db_answer.feedback_markdown = evaluation.get("feedback_markdown", "")
        db_answer.model_answer = evaluation.get("model_answer", "")
        db.commit()
        db.refresh(db_answer)
        
        logger.info(f"Evaluation complete for answer_id={db_answer.id}")
        
    except Exception as e:
        logger.error(f"Evaluation failed for answer_id={db_answer.id}: {e}")
        # Answer is saved even if evaluation fails — can be retried
        evaluation = {
            "clarity_score": db_answer.clarity_score,
            "technical_score": db_answer.technical_score,
            "structure_score": db_answer.structure_score,
            "feedback_markdown": db_answer.feedback_markdown or "Evaluation pending.",
            "model_answer": db_answer.model_answer or question.model_answer or "**10/10 STAR Model Answer**:\n- **Situation**: Define problem & scale.\n- **Task**: Clarify responsibilities.\n- **Action**: Highlight tradeoffs & tools.\n- **Result**: Quantify impact.",
            "overall_impression": "Evaluation could not be completed at this time."
        }
    
    return {
        "answer_id": db_answer.id,
        "question_id": submission.question_id,
        "answer_text": db_answer.answer_text,
        "clarity_score": db_answer.clarity_score,
        "technical_score": db_answer.technical_score,
        "structure_score": db_answer.structure_score,
        "overall_impression": evaluation.get("overall_impression", ""),
        "feedback_markdown": db_answer.feedback_markdown,
        "model_answer": db_answer.model_answer
    }


@router.get("/answers/{answer_id}")
def get_answer_details(answer_id: int, db: Session = Depends(get_db)):
    """Retrieves a specific answer with its evaluation scores and feedback."""
    answer = db.query(models.Answer).filter(models.Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found.")
    
    return {
        "answer_id": answer.id,
        "question_id": answer.question_id,
        "answer_text": answer.answer_text,
        "clarity_score": answer.clarity_score,
        "technical_score": answer.technical_score,
        "structure_score": answer.structure_score,
        "feedback_markdown": answer.feedback_markdown,
        "model_answer": answer.model_answer,
        "created_at": answer.created_at
    }


# ─── ANALYTICS / SUMMARY REPORT ENDPOINT ──────────────────────────────────────

@router.get("/sessions/{session_id}/analytics")
def get_session_analytics(session_id: int, db: Session = Depends(get_db)):
    """Calculates aggregated performance analytics, score averages, readiness level, and executive report."""
    session = db.query(models.InterviewSession).filter(models.InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    session.status = "completed"
    db.commit()
    db.refresh(session)
        
    questions = db.query(models.Question).filter(models.Question.session_id == session_id).all()
    
    total_questions = len(questions)
    answered_questions = 0
    total_clarity = 0
    total_technical = 0
    total_structure = 0
    
    question_breakdown = []
    
    for q in questions:
        # Get the latest answer for each question
        answers = db.query(models.Answer).filter(models.Answer.question_id == q.id).order_by(models.Answer.id.desc()).all()
        
        # Determine fallback 10/10 model answer if needed
        default_model = q.model_answer or f"**10/10 Perfect STAR / Technical Model Answer for:** *\"{q.question_text}\"*\n\n- **Situation & Context**: Establish the engineering context and scale clearly right at the beginning.\n- **Task & Architecture**: Define precise ownership, design tradeoffs, and technical requirements.\n- **Action Taken**: Detail exact tools, algorithms, schema indexing, and async performance optimizations implemented.\n- **Measurable Result**: Quantify success with clear metrics (e.g., reduced query latency by 60%, zero downtime during deployment, 99.9% uptime achieved)."
        
        if answers and answers[0].clarity_score is not None:
            latest_ans = answers[0]
            answered_questions += 1
            total_clarity += (latest_ans.clarity_score or 0)
            total_technical += (latest_ans.technical_score or 0)
            total_structure += (latest_ans.structure_score or 0)
            
            question_breakdown.append({
                "question_id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "difficulty": q.difficulty,
                "answered": True,
                "clarity_score": latest_ans.clarity_score,
                "technical_score": latest_ans.technical_score,
                "structure_score": latest_ans.structure_score,
                "feedback_summary": latest_ans.feedback_markdown[:250] + "..." if latest_ans.feedback_markdown and len(latest_ans.feedback_markdown) > 250 else latest_ans.feedback_markdown,
                "model_answer": latest_ans.model_answer or default_model
            })
        else:
            question_breakdown.append({
                "question_id": q.id,
                "question_text": q.question_text,
                "question_type": q.question_type,
                "difficulty": q.difficulty,
                "answered": False,
                "clarity_score": 0,
                "technical_score": 0,
                "structure_score": 0,
                "feedback_summary": "No answer submitted.",
                "model_answer": default_model
            })
            
    avg_clarity = round(total_clarity / answered_questions, 1) if answered_questions > 0 else 0.0
    avg_technical = round(total_technical / answered_questions, 1) if answered_questions > 0 else 0.0
    avg_structure = round(total_structure / answered_questions, 1) if answered_questions > 0 else 0.0
    
    overall_score = round((avg_clarity + avg_technical + avg_structure) / 3.0, 1) if answered_questions > 0 else 0.0
    
    # Readiness categorization
    if overall_score >= 8.0:
        readiness_level = "Ready for Top-Tier Technical Interviews 🚀"
        readiness_color = "emerald"
    elif overall_score >= 6.5:
        readiness_level = "Promising Candidate — Fine-Tune STAR Methodology ⭐"
        readiness_color = "sky"
    elif overall_score >= 4.0:
        readiness_level = "Developing Skills — Focus on Depth and Clarity 📈"
        readiness_color = "amber"
    else:
        readiness_level = "Foundational Stage — Practice Structured Storytelling 💡"
        readiness_color = "rose"
        
    # Generate executive summary markdown
    metadata = {}
    if session.resume_metadata:
        try:
            metadata = json.loads(session.resume_metadata)
        except:
            pass
            
    skills_str = ", ".join(metadata.get("skills", ["Software Engineering"]))
    
    executive_summary = f"""# Executive Performance Report for {session.candidate_name}

## 📊 Session Metrics
- **Overall Competency Score:** `{overall_score} / 10`
- **Questions Completed:** `{answered_questions} of {total_questions}`
- **Evaluation Benchmark:** `{readiness_level}`

---

## 📈 Core Dimension Breakdown
- **Clarity & Articulation (`{avg_clarity}/10`):** Candidate communicates concepts with { 'high precision and logical flow' if avg_clarity >= 7.5 else 'moderate clarity; practice eliminating filler words and summarizing key points early' }.
- **Technical Accuracy (`{avg_technical}/10`):** Demonstrated domain mastery across key skill areas (`{skills_str}`). { 'Solid engineering fundamentals.' if avg_technical >= 7.5 else 'Recommend reviewing core architecture tradeoffs and edge-case handling.' }
- **STAR Methodology (`{avg_structure}/10`):** { 'Excellent structure: Situation, Task, Action, and Result clearly articulated.' if avg_structure >= 7.5 else 'To boost scores, explicitly state the measurable **Result/Outcome** and specific **Action** you took.' }

---

## 🎯 Actionable Next Steps
1. **Highlight Quantifiable Results:** Always close behavioral and technical stories with numbers, percentages, or performance improvements.
2. **Deep-Dive Technical Tradeoffs:** When answering system design or algorithmic questions, discuss time/space complexity and scalability proactively.
3. **Keep Practicing Live Audio:** Continue using the Voice Practice engine to build confidence under real interview constraints.
"""

    return {
        "session_id": session.id,
        "candidate_name": session.candidate_name,
        "total_questions": total_questions,
        "answered_questions": answered_questions,
        "average_clarity": avg_clarity,
        "average_technical": avg_technical,
        "average_structure": avg_structure,
        "overall_score": overall_score,
        "readiness_level": readiness_level,
        "readiness_color": readiness_color,
        "question_breakdown": question_breakdown,
        "executive_summary_markdown": executive_summary
    }

