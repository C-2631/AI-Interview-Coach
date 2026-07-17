import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String(100), nullable=False)
    candidate_email = Column(String(100), nullable=True)
    resume_text = Column(Text, nullable=True)
    resume_metadata = Column(Text, nullable=True) # JSON stored as string for simplicity
    status = Column(String(50), default="in_progress") # in_progress, completed
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    questions = relationship("Question", back_populates="session", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=True) # behavioral, technical, coding
    difficulty = Column(String(20), nullable=True) # easy, medium, hard
    model_answer = Column(Text, nullable=True) # 10/10 Perfect STAR or Technical answer
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    session = relationship("InterviewSession", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_text = Column(Text, nullable=False) # Whisper transcript
    audio_file_path = Column(String(255), nullable=True)
    
    # STAR method & evaluation scores
    clarity_score = Column(Integer, nullable=True)     # 1-10
    technical_score = Column(Integer, nullable=True)   # 1-10
    structure_score = Column(Integer, nullable=True)   # 1-10 (STAR structure compliance)
    feedback_markdown = Column(Text, nullable=True)    # Detailed LLM breakdown
    model_answer = Column(Text, nullable=True)         # 10/10 Perfect Model Answer
    
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    question = relationship("Question", back_populates="answers")
