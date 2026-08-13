import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.schemas.chat import ChatRequest, ChatResponse, AgentResponse, ConversationHistory, ConversationMessage
from app.core.dependencies import get_db
from datetime import datetime

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    db: Client = Depends(get_db),
):
    """
    Main citizen chat endpoint.
    Accepts message + language, runs LangGraph pipeline,
    returns structured agent response.
    """
    try:
        # Lazy import — prevents LangGraph from loading at module import time
        from app.agents.graph import run_agent_pipeline
        result = await run_agent_pipeline(
            citizen_message=payload.citizen_message,
            language=payload.language,
            citizen_id=payload.citizen_id,
            request_id=payload.request_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent pipeline failed: {str(e)}",
        )


    return ChatResponse(
        request_id=result["request_id"],
        message_id=str(uuid.uuid4()),
        agent_response=AgentResponse(
            agent_name=result["agent_name"],
            content=result["response"] or "",
            confidence=float(result.get("confidence") or 0.0),
            citations=result.get("citations") or None,
            escalated=bool(result.get("escalated") or False),
        ),
        language=result["language"],
        timestamp=datetime.utcnow(),
    )


@router.get("/chat/{request_id}/history", response_model=ConversationHistory)
async def get_conversation_history(
    request_id: str,
    db: Client = Depends(get_db),
):
    """
    Returns full conversation history for a given request_id.
    Used by frontend to restore chat on page reload.
    """
    response = (
        db.table("conversations")
        .select("*")
        .eq("request_id", request_id)
        .order("created_at")
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No conversation found for this request.",
        )

    messages = [
        ConversationMessage(
            id=row["id"],
            role=row["role"],
            content=row["message"],
            agent_name=row.get("agent_name"),
            confidence=row.get("confidence"),
            timestamp=row["created_at"],
        )
        for row in response.data
    ]

    return ConversationHistory(
        request_id=request_id,
        messages=messages,
    )