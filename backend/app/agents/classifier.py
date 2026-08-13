import json
import time
from app.services.llm import call_llm_json
from app.services.vector_store import log_agent_action
from app.db.supabase_client import get_supabase_admin_client


INTENT_TYPES = ["policy_question", "document_verification", "complaint", "general"]


def classify_intent(state: dict) -> dict:
    """
    Detects language + classifies intent + confidence score.
    Updates AgentState and logs to agent_logs table.
    """
    start = time.time()

    system_prompt = (
        "You are an intent classifier for a Saudi government citizen services portal. "
        "Analyze the citizen's message (which may contain typos or spelling errors) and return a JSON object with these keys:\n"
        "- intent: one of 'policy_question', 'document_verification', 'complaint', 'general'\n"
        "- language: 'en' or 'ar'\n"
        "- confidence: float between 0.0 and 1.0\n"
        "- reasoning: one short sentence explaining your classification\n\n"
        "Be typo-tolerant. For example, if the user writes 'what r d polcies for iqma', understand that they are asking about Iqama policy.\n"
        "policy_question: asking about rules, procedures, requirements, fees, eligibility, Iqama, business, traffic, labor, taxes, etc.\n"
        "document_verification: wants to upload or verify a document\n"
        "complaint: expressing dissatisfaction, reporting a problem\n"
        "general: greetings, unclear, or does not fit above categories"
    )

    try:
        raw = call_llm_json(system_prompt, state["citizen_message"])
        result = json.loads(raw)
        intent = result.get("intent", "policy_question")
        language = result.get("language", "en")
        confidence = float(result.get("confidence", 0.85))

        if intent not in INTENT_TYPES:
            intent = "policy_question"

    except Exception as err:
        print(f"[Classifier] Intent classification fallback: {err}")
        # Safe intelligent fallback for policy queries
        msg = state.get("citizen_message", "").lower()
        if any(w in msg for w in ["iqama", "absher", "qiwa", "zatca", "visa", "fee", "renew", "police", "policy", "transfer"]):
            intent = "policy_question"
        else:
            intent = "general"
        language = "ar" if any('\u0600' <= c <= '\u06FF' for c in state.get("citizen_message", "")) else "en"
        confidence = 0.8

    latency_ms = int((time.time() - start) * 1000)

    log_agent_action(
        request_id=state["request_id"],
        agent_name="Classifier Agent",
        input_data={"message": state["citizen_message"]},
        output_data={"intent": intent, "language": language, "confidence": confidence},
        confidence=confidence,
        latency_ms=latency_ms,
        client=get_supabase_admin_client(),
    )

    return {
        **state,
        "intent": intent,
        "language": language,
        "confidence": confidence,
    }