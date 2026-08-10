import uuid
import time
from typing import TypedDict, Optional, Literal
from langgraph.graph import StateGraph, END

from app.agents.classifier import classify_intent
from app.agents.rag_agent import rag_agent
from app.agents.verification_agent import verification_agent
from app.agents.escalation_agent import escalation_agent
from app.db.supabase_client import get_supabase_admin_client
from app.core.config import get_settings

settings = get_settings()


# ─── State Definition ────────────────────────────────────────────────────────

class AgentState(TypedDict):
    # Input
    request_id: str
    citizen_id: Optional[str]
    citizen_message: str
    language: Literal["en", "ar"]

    # Classifier output
    intent: Optional[Literal["policy_question", "document_verification", "complaint", "general"]]
    confidence: Optional[float]

    # RAG output
    retrieved_docs: Optional[list]
    citations: Optional[list[str]]

    # Verification output
    verification_result: Optional[dict]

    # Final
    final_response: Optional[str]
    escalated: Optional[bool]


# ─── Routing Logic ───────────────────────────────────────────────────────────

def route_after_classify(state: AgentState) -> str:
    """
    Decides next node after classifier runs.
    Low confidence always escalates regardless of intent.
    """
    confidence = state.get("confidence", 0.0)
    intent = state.get("intent", "general")

    if confidence < settings.CONFIDENCE_THRESHOLD:
        return "escalation_agent"

    routes = {
        "policy_question": "rag_agent",
        "document_verification": "verification_agent",
        "complaint": "escalation_agent",
        "general": "respond",
    }

    return routes.get(intent, "respond")


# ─── General Response Node ───────────────────────────────────────────────────

def general_respond(state: AgentState) -> AgentState:
    """
    Handles general/greeting intents that don't need
    a specialist agent — simple fallback response.
    """
    start = time.time()
    language = state.get("language", "en")

    if language == "ar":
        response = (
            "مرحباً! أنا مساعد GovAssist الذكي. "
            "يمكنني مساعدتك في الأسئلة المتعلقة بالسياسات الحكومية، "
            "التحقق من المستندات، أو تقديم الشكاوى. "
            "كيف يمكنني مساعدتك اليوم؟"
        )
    else:
        response = (
            "Hello! I'm the GovAssist AI assistant. "
            "I can help you with government policy questions, "
            "document verification, or filing a complaint. "
            "How can I assist you today?"
        )

    latency_ms = int((time.time() - start) * 1000)
    
    from app.services.vector_store import log_agent_action
    from app.db.supabase_client import get_supabase_admin_client

    log_agent_action(
        request_id=state["request_id"],
        agent_name="General Agent",
        input_data={"message": state["citizen_message"]},
        output_data={"response": response},
        confidence=1.0,
        latency_ms=latency_ms,
        client=get_supabase_admin_client(),
    )

    return {
        **state,
        "final_response": response,
        "confidence": 1.0,
        "escalated": False,
    }


# ─── DB Helpers ──────────────────────────────────────────────────────────────

def create_request_record(
    citizen_id: Optional[str],
    intent: str,
    client,
) -> str:
    """Insert a new row into requests table, return generated ID."""
    request_id = str(uuid.uuid4())
    client.table("requests").insert({
        "id": request_id,
        "citizen_id": citizen_id,
        "type": intent or "general",
        "status": "open",
    }).execute()
    return request_id


def save_conversation_turn(
    request_id: str,
    citizen_message: str,
    agent_response: str,
    agent_name: str,
    client,
) -> None:
    """Save both citizen message and agent reply as conversation rows."""
    client.table("conversations").insert([
        {
            "request_id": request_id,
            "role": "citizen",
            "message": citizen_message,
        },
        {
            "request_id": request_id,
            "role": "agent",
            "message": agent_response,
        },
    ]).execute()


# ─── Graph Builder ───────────────────────────────────────────────────────────

def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("classify_intent", classify_intent)
    graph.add_node("rag_agent", rag_agent)
    graph.add_node("verification_agent", verification_agent)
    graph.add_node("escalation_agent", escalation_agent)
    graph.add_node("respond", general_respond)

    graph.set_entry_point("classify_intent")

    graph.add_conditional_edges(
        "classify_intent",
        route_after_classify,
        {
            "rag_agent": "rag_agent",
            "verification_agent": "verification_agent",
            "escalation_agent": "escalation_agent",
            "respond": "respond",
        },
    )

    graph.add_edge("rag_agent", END)
    graph.add_edge("verification_agent", END)
    graph.add_edge("escalation_agent", END)
    graph.add_edge("respond", END)

    return graph.compile()


# ─── Main Entry Point ─────────────────────────────────────────────────────────

govassist_graph = build_graph()


async def run_agent_pipeline(
    citizen_message: str,
    language: Literal["en", "ar"] = "en",
    citizen_id: Optional[str] = None,
    request_id: Optional[str] = None,
) -> dict:
    """
    Public interface called by FastAPI route.
    Creates request record if new, runs graph, saves conversation.
    Returns structured dict for API response.
    """
    client = get_supabase_admin_client()

    if not request_id:
        request_id = create_request_record(citizen_id, "general", client)

    initial_state: AgentState = {
        "request_id": request_id,
        "citizen_id": citizen_id,
        "citizen_message": citizen_message,
        "language": language,
        "intent": None,
        "confidence": None,
        "retrieved_docs": None,
        "citations": None,
        "verification_result": None,
        "final_response": None,
        "escalated": None,
    }

    start = time.time()
    final_state = govassist_graph.invoke(initial_state)
    total_ms = int((time.time() - start) * 1000)

    # Determine which agent produced the final response
    intent_to_agent = {
        "policy_question": "Policy Agent",
        "document_verification": "Verification Agent",
        "complaint": "Escalation Agent",
        "general": "General Agent",
    }

    agent_name = (
        "Escalation Agent"
        if final_state.get("escalated")
        else intent_to_agent.get(final_state.get("intent", "general"), "General Agent")
    )

    # Persist conversation turn
    save_conversation_turn(
        request_id=request_id,
        citizen_message=citizen_message,
        agent_response=final_state.get("final_response", ""),
        agent_name=agent_name,
        client=client,
    )

    return {
        "request_id": request_id,
        "agent_name": agent_name,
        "response": final_state.get("final_response", ""),
        "confidence": final_state.get("confidence", 0.0),
        "citations": final_state.get("citations"),
        "escalated": final_state.get("escalated", False),
        "verification_result": final_state.get("verification_result"),
        "language": language,
        "total_latency_ms": total_ms,
    }