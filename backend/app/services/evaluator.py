import json
import logging
from app.services.llm import call_llm_self_healing

logger = logging.getLogger(__name__)

# Expected JSON schema for evaluation response
EVALUATION_SCHEMA = """{
  "clarity_score": "integer (1-10, how clearly the candidate communicated their answer)",
  "technical_score": "integer (1-10, technical accuracy and depth of the answer)",
  "structure_score": "integer (1-10, how well the answer follows the STAR method structure)",
  "overall_impression": "string (one sentence summary like 'Strong answer with room for more specifics')",
  "model_answer": "string (A flawless 10/10 perfect, expert-level model answer for this exact question structured with the STAR method or deep technical breakdown with concrete metrics and best practices)",
  "feedback_markdown": "string (detailed markdown feedback with sections: ## Strengths, ## Areas for Improvement, ## STAR Analysis with **Situation**, **Task**, **Action**, **Result** subsections)"
}"""


async def evaluate_answer(
    question_text: str,
    answer_text: str,
    question_type: str = "technical",
    difficulty: str = "Medium",
    persona: str = "Standard Technical Interviewer"
) -> dict:
    """Evaluates a candidate's answer using LLM with STAR method framework.
    
    Args:
        question_text: The interview question that was asked
        answer_text: The candidate's transcribed spoken answer
        question_type: Type of question (technical/behavioral/coding)
        difficulty: Difficulty level (Easy/Medium/Hard)
        persona: Interviewer persona for tone calibration
    
    Returns:
        Dictionary with scores and feedback, or fallback on failure
    """
    if not answer_text or not answer_text.strip():
        return get_empty_evaluation("No answer was provided.")

    prompt = (
        f"You are an experienced interview evaluator using the '{persona}' persona.\n"
        f"A candidate was asked the following {question_type} question at '{difficulty}' difficulty:\n\n"
        f"**Question:** {question_text}\n\n"
        f"**Candidate's Answer (transcribed from speech):**\n{answer_text}\n\n"
        "Evaluate their answer using the following criteria:\n\n"
        "1. **Clarity Score (1-10):** How clearly did they communicate? Consider articulation, "
        "coherence, and whether the answer was easy to follow. Account for the fact this was "
        "spoken aloud (minor speech disfluencies like 'um' are normal).\n\n"
        "2. **Technical Score (1-10):** How technically accurate and deep was the answer? "
        "Did they demonstrate real understanding or just surface-level knowledge?\n\n"
        "3. **Structure Score (1-10):** How well did the answer follow the STAR method "
        "(Situation, Task, Action, Result)? Even for technical questions, did they provide "
        "context, explain their approach, and describe outcomes?\n\n"
        "4. **Feedback:** Provide detailed, constructive feedback in markdown format with:\n"
        "   - `## Strengths` — What they did well (2-3 bullet points)\n"
        "   - `## Areas for Improvement` — Specific, actionable suggestions (2-3 bullet points)\n"
        "   - `## STAR Analysis` — Break down their answer into **Situation**, **Task**, "
        "**Action**, **Result** components. Note which elements were present or missing.\n\n"
        "5. **10/10 Perfect Model Answer (`model_answer`):** Provide an absolute 10/10 masterclass answer for this exact question. If behavioral, use explicit **STAR Framework** headers (`**Situation**`, `**Task**`, `**Action**`, `**Result**`) with realistic quantitative metrics. If technical, provide deep architecture insights, algorithmic trade-offs, and industry best practices that would impress a Principal Engineer.\n\n"
        "Be encouraging but honest. This is a practice session meant to help them improve.\n"
        "Return your evaluation as a valid JSON object."
    )

    try:
        result = await call_llm_self_healing(prompt, EVALUATION_SCHEMA)
        
        # Validate and clamp scores to 1-10
        for key in ["clarity_score", "technical_score", "structure_score"]:
            if key in result:
                try:
                    score = int(result[key])
                    result[key] = max(1, min(10, score))
                except (ValueError, TypeError):
                    result[key] = 5  # Default mid-score on parse failure
        
        # Ensure feedback_markdown exists
        if "feedback_markdown" not in result or not result["feedback_markdown"]:
            result["feedback_markdown"] = "Evaluation completed but detailed feedback was not generated."
            
        # Ensure model_answer exists
        if "model_answer" not in result or not result["model_answer"]:
            result["model_answer"] = "**10/10 Perfect STAR Model Answer Framework**:\n\n- **Situation**: Establish context, scale, and high-stakes problem constraints.\n- **Task**: Clarify personal ownership and exact engineering goals.\n- **Action**: Explain architectural trade-offs, specific tools, and deep execution steps taken.\n- **Result**: Highlight quantifiable impact (e.g., 50% latency reduction, 99.99% reliability, zero downtime)."
        
        # Ensure overall_impression exists
        if "overall_impression" not in result:
            avg = (result.get("clarity_score", 5) + result.get("technical_score", 5) + result.get("structure_score", 5)) / 3
            if avg >= 7:
                result["overall_impression"] = "Strong answer demonstrating solid understanding."
            elif avg >= 5:
                result["overall_impression"] = "Decent answer with room for improvement in specifics."
            else:
                result["overall_impression"] = "Answer needs more depth and structure. Keep practicing!"
        
        logger.info(f"Evaluation complete: clarity={result.get('clarity_score')}, "
                     f"technical={result.get('technical_score')}, structure={result.get('structure_score')}")
        return result
        
    except Exception as e:
        logger.error(f"Answer evaluation failed: {e}")
        return get_empty_evaluation(f"Evaluation engine encountered an error: {e}")


def get_empty_evaluation(reason: str = "") -> dict:
    """Returns a fallback evaluation structure when LLM evaluation fails."""
    return {
        "clarity_score": 5,
        "technical_score": 5,
        "structure_score": 5,
        "overall_impression": reason or "Unable to evaluate at this time.",
        "model_answer": "**10/10 Perfect STAR Model Answer Framework**:\n\n- **Situation**: Establish context, scale, and high-stakes problem constraints.\n- **Task**: Clarify personal ownership and exact engineering goals.\n- **Action**: Explain architectural trade-offs, specific tools, and deep execution steps taken.\n- **Result**: Highlight quantifiable impact (e.g., 50% latency reduction, 99.99% reliability, zero downtime).",
        "feedback_markdown": (
            "## Evaluation Unavailable\n\n"
            f"*{reason}*\n\n"
            "Please try submitting your answer again. If the issue persists, "
            "the evaluation service may be temporarily rate-limited."
        )
    }
