import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Coach Backend"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ai_interview_coach"
    
    # AI Keys & Custom Free-Token Provider Config
    LLM_BASE_URL: str = "https://api.groq.com/openai/v1"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "google/gemma-4-31b-it:free"
    ELEVENLABS_API_KEY: str = ""
    ELEVENLABS_VOICE_ID: str = "21m00Tcm4TlvDq8ikWAM"

    # CORS settings
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
