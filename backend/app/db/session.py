import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

import logging

logger = logging.getLogger(__name__)

# Create engine with fallback to SQLite if PostgreSQL connection fails
try:
    # Try connecting to configured database
    is_sqlite = settings.DATABASE_URL.startswith("sqlite")
    connect_args = {"check_same_thread": False} if is_sqlite else {}
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        connect_args=connect_args
    )
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info(f"Successfully connected to the database at: {settings.DATABASE_URL}")
except Exception as e:
    logger.warning(f"Database connection failed: {e}. Falling back to SQLite local database (ai_interview_coach.db).")
    sqlite_url = "sqlite:///./ai_interview_coach.db"
    engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )

# Create session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

