import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db import models
from app.api.endpoints import router  # Import the endpoint router
from app.services.evaluator import evaluate_answer
from app.services.tts import synthesize_speech

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
try:
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(title=settings.PROJECT_NAME)
app.include_router(router)  # Register router


# Configure CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
if not origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Interview Coach API!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established.")
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"status": "error", "message": "Invalid JSON payload"}))
                continue

            msg_type = message.get("type", "echo")
            logger.info(f"WebSocket received type={msg_type}: {message}")

            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "status": "success"}))
            
            elif msg_type == "start_question":
                question_id = message.get("question_id")
                await websocket.send_text(json.dumps({
                    "type": "question_started",
                    "status": "success",
                    "question_id": question_id,
                    "server_msg": f"Ready to receive audio or transcript for Q#{question_id}"
                }))
            
            elif msg_type == "submit_answer":
                question_id = message.get("question_id")
                answer_text = message.get("answer_text", "")
                
                if not question_id or not answer_text:
                    await websocket.send_text(json.dumps({
                        "type": "evaluation_error",
                        "status": "error",
                        "message": "Missing question_id or answer_text"
                    }))
                    continue

                await websocket.send_text(json.dumps({
                    "type": "evaluation_started",
                    "status": "info",
                    "question_id": question_id,
                    "server_msg": "Analyzing answer with STAR framework..."
                }))

                db = SessionLocal()
                try:
                    question = db.query(models.Question).filter(models.Question.id == question_id).first()
                    if not question:
                        await websocket.send_text(json.dumps({
                            "type": "evaluation_error",
                            "status": "error",
                            "message": f"Question {question_id} not found"
                        }))
                        continue

                    # Save basic answer first
                    db_answer = models.Answer(
                        question_id=question_id,
                        answer_text=answer_text
                    )
                    db.add(db_answer)
                    db.commit()
                    db.refresh(db_answer)

                    # Run evaluation
                    eval_result = await evaluate_answer(
                        question_text=question.question_text,
                        answer_text=answer_text,
                        question_type=question.question_type or "technical",
                        difficulty=question.difficulty or "Medium"
                    )

                    db_answer.clarity_score = eval_result.get("clarity_score", 5)
                    db_answer.technical_score = eval_result.get("technical_score", 5)
                    db_answer.structure_score = eval_result.get("structure_score", 5)
                    db_answer.feedback_markdown = eval_result.get("feedback_markdown", "")
                    db.commit()
                    db.refresh(db_answer)

                    await websocket.send_text(json.dumps({
                        "type": "evaluation_complete",
                        "status": "success",
                        "question_id": question_id,
                        "answer_id": db_answer.id,
                        "scores": {
                            "clarity_score": db_answer.clarity_score,
                            "technical_score": db_answer.technical_score,
                            "structure_score": db_answer.structure_score,
                            "overall_impression": eval_result.get("overall_impression", ""),
                            "feedback_markdown": db_answer.feedback_markdown
                        }
                    }))
                finally:
                    db.close()

            else:
                # Default echo behavior for backwards compatibility with setup console
                response = {
                    "type": "echo",
                    "status": "success",
                    "echo": message.get("text", ""),
                    "server_msg": "Connected to WebSocket Server!"
                }
                await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
