import time
from app.services.vector_store import log_agent_action
from app.db.supabase_client import get_supabase_admin_client


def escalation_agent(state: dict) -> dict:
    """
    Fires when:
    - intent is 'complaint', OR
    - confidence from classifier is below threshold.
    Creates escalation ticket in requests table and
    returns a human-handoff message to the citizen.
    """
    start = time.time()
    client = get_supabase_admin_client()
    language = state.get("language", "en")
    confidence = state.get("confidence", 0.0)
    intent = state.get("intent", "general")

    # Determine escalation reason
    if intent == "complaint":
        reason = "complaint"
    elif confidence < 0.6:
        reason = "low_confidence"
    else:
        reason = "manual_escalation"

    # Update request status to escalated in DB
    try:
        client.table("requests").update({
            "status": "escalated",
        }).eq("id", state["request_id"]).execute()
    except Exception:
        pass

    # Build citizen-facing message
    if language == "ar":
        if reason == "complaint":
            response = (
                "نأسف لسماع ذلك. تم تصعيد طلبك إلى فريق الدعم البشري "
                "وسيتواصل معك أحد ممثلينا في أقرب وقت ممكن. "
                f"رقم طلبك: {state['request_id'][:8].upper()}"
            )
        else:
            response = (
                "يبدو أن طلبك يحتاج إلى مساعدة متخصصة. "
                "تم تحويلك إلى أحد موظفينا المختصين. "
                f"رقم طلبك: {state['request_id'][:8].upper()}"
            )
    else:
        if reason == "complaint":
            response = (
                "We're sorry to hear that. Your request has been escalated to "
                "our human support team and a representative will follow up with "
                f"you shortly. Your ticket ID: {state['request_id'][:8].upper()}"
            )
        else:
            response = (
                "Your request requires specialist assistance. "
                "You've been transferred to one of our dedicated agents who "
                "will follow up with you. "
                f"Your ticket ID: {state['request_id'][:8].upper()}"
            )

    latency_ms = int((time.time() - start) * 1000)

    log_agent_action(
        request_id=state["request_id"],
        agent_name="Escalation Agent",
        input_data={
            "intent": intent,
            "confidence": confidence,
            "reason": reason,
        },
        output_data={
            "response": response,
            "escalated": True,
            "ticket_id": state["request_id"][:8].upper(),
        },
        confidence=1.0,
        latency_ms=latency_ms,
        client=client,
    )

    return {
        **state,
        "final_response": response,
        "escalated": True,
        "confidence": 1.0,
    }