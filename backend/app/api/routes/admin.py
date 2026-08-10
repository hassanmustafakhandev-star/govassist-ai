from fastapi import APIRouter, Depends, Query
from supabase import Client

from app.core.dependencies import get_admin_db
from app.schemas.admin import AgentLogResponse, StatsResponse, RequestsResponse

router = APIRouter()


@router.get("/admin/agent-logs", response_model=AgentLogResponse)
async def get_agent_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    agent_name: str = Query(default=None),
    below_threshold: bool = Query(default=False),
    db: Client = Depends(get_admin_db),
):
    try:
        query = db.table("agent_logs").select(
            "id, request_id, agent_name, confidence, latency_ms, created_at, input, output"
        )

        if agent_name:
            query = query.eq("agent_name", agent_name)

        if below_threshold:
            query = query.lt("confidence", 0.6)

        offset = (page - 1) * page_size
        response = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        logs = response.data or []
    except Exception:
        logs = []

    return {
        "page": page,
        "page_size": page_size,
        "logs": logs,
    }


@router.get("/admin/stats", response_model=StatsResponse)
async def get_dashboard_stats(
    db: Client = Depends(get_admin_db),
):
    from datetime import datetime, timezone

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    total_requests_today = 0
    avg_confidence = 0.0
    escalation_rate = 0.0

    try:
        requests_response = (
            db.table("requests")
            .select("id")
            .gte("created_at", f"{today}T00:00:00")
            .execute()
        )
        total_requests_today = len(requests_response.data or [])
    except Exception:
        pass

    try:
        logs_response = (
            db.table("agent_logs")
            .select("confidence, agent_name")
            .execute()
        )
        logs = logs_response.data or []

        avg_confidence = (
            round(sum(l["confidence"] for l in logs if l.get("confidence")) / len(logs), 2)
            if logs else 0.0
        )
        escalated_count = sum(
            1 for l in logs if l.get("agent_name") == "Escalation Agent"
        )
        escalation_rate = (
            round((escalated_count / len(logs)) * 100, 1)
            if logs else 0.0
        )
    except Exception:
        pass

    return {
        "requests_today": total_requests_today,
        "average_confidence": avg_confidence,
        "escalation_rate_percent": escalation_rate,
    }


@router.get("/admin/requests", response_model=RequestsResponse)
async def get_all_requests(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: str = Query(default=None),
    db: Client = Depends(get_admin_db),
):
    try:
        query = db.table("requests").select("*")

        if status:
            query = query.eq("status", status)

        offset = (page - 1) * page_size
        response = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        requests = response.data or []
    except Exception:
        requests = []

    return {
        "page": page,
        "page_size": page_size,
        "requests": requests,
    }