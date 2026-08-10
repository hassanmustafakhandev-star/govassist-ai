from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AgentLog(BaseModel):
    id: str
    request_id: str
    agent_name: str
    confidence: float
    latency_ms: int
    created_at: datetime
    input: dict
    output: dict

class AgentLogResponse(BaseModel):
    page: int
    page_size: int
    logs: List[AgentLog]

class StatsResponse(BaseModel):
    requests_today: int
    average_confidence: float
    escalation_rate_percent: float

class RequestItem(BaseModel):
    id: str
    citizen_id: Optional[str]
    type: str
    status: str
    created_at: datetime

class RequestsResponse(BaseModel):
    page: int
    page_size: int
    requests: List[RequestItem]
