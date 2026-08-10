from fastapi import Depends, HTTPException, status
from supabase import Client
from app.db.supabase_client import get_supabase_client, get_supabase_admin_client
from app.core.config import Settings, get_settings


def get_db(
    settings: Settings = Depends(get_settings)
) -> Client:
    """Anon Supabase client for citizen-facing routes."""
    return get_supabase_client()


def get_admin_db(
    settings: Settings = Depends(get_settings)
) -> Client:
    """Service role client for admin routes."""
    return get_supabase_admin_client()


def get_llm_config(
    settings: Settings = Depends(get_settings)
) -> dict:
    """LLM config dict passed into agent nodes."""
    return {
        "model": settings.LLM_MODEL,
        "max_tokens": settings.MAX_TOKENS,
        "api_key": settings.GROQ_API_KEY,
    }


def verify_confidence_threshold(confidence: float) -> bool:
    """Reusable check — below threshold triggers escalation."""
    settings = get_settings()
    return confidence >= settings.CONFIDENCE_THRESHOLD