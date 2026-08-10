from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


class ChatRequest(BaseModel):
    citizen_message: str = Field(..., min_length=1, max_length=2000)
    language: Literal["en", "ar"] = "en"
    citizen_id: Optional[str] = None
    request_id: Optional[str] = None


class AgentResponse(BaseModel):
    agent_name: Literal[
        "Policy Agent",
        "Verification Agent",
        "Escalation Agent",
        "General Agent"
    ]
    content: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    citations: Optional[list[str]] = None
    escalated: bool = False


class ChatResponse(BaseModel):
    request_id: str
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    agent_response: AgentResponse
    language: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ConversationMessage(BaseModel):
    id: str
    role: Literal["citizen", "agent"]
    content: str
    agent_name: Optional[str] = None
    confidence: Optional[float] = None
    timestamp: datetime


class ConversationHistory(BaseModel):
    request_id: str
    messages: list[ConversationMessage]