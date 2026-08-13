from supabase import create_client, Client
from app.core.config import get_settings


def get_supabase_client() -> Client:
    """Anon client — citizen-facing, respects RLS policies."""
    settings = get_settings()
    url = settings.SUPABASE_URL if settings.SUPABASE_URL else "https://dummy.supabase.co"
    key = settings.SUPABASE_ANON_KEY if settings.SUPABASE_ANON_KEY else "dummy-key"
    return create_client(url, key)


def get_supabase_admin_client() -> Client:
    """Service role client — admin/backend ops, bypasses RLS."""
    settings = get_settings()
    url = settings.SUPABASE_URL if settings.SUPABASE_URL else "https://dummy.supabase.co"
    key = settings.SUPABASE_SERVICE_ROLE_KEY if settings.SUPABASE_SERVICE_ROLE_KEY else (settings.SUPABASE_ANON_KEY or "dummy-key")
    return create_client(url, key)