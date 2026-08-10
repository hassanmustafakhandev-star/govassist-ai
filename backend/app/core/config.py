from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "GovAssist AI"
    DEBUG: bool = False
    API_VERSION: str = "v1"
    FRONTEND_URL: str = "http://localhost:3000"

    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # Groq
    GROQ_API_KEY: str
    LLM_MODEL: str = "llama-3.1-8b-instant"
    MAX_TOKENS: int = 1024

    # Celery (SQLite default)
    CELERY_BROKER_URL: str = "sqla+sqlite:///celery.db"
    CELERY_RESULT_BACKEND: str = "db+sqlite:///celery.db"

    # RAG
    EMBEDDING_MODEL: str = "BAAI/bge-m3"
    TOP_K_RESULTS: int = 5
    CONFIDENCE_THRESHOLD: float = 0.45

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()