"""
graph.py — Lightweight Agent Pipeline (No LangGraph/LangChain)
===============================================================
Pure Python multi-agent orchestration for Vercel Serverless.
Identical public interface: run_agent_pipeline()
"""

import uuid
import json
import time
from typing import Optional, Literal

from app.core.config import get_settings
from app.services.llm import call_llm, call_llm_json, build_rag_prompt
from app.db.supabase_client import get_supabase_admin_client
from app.services.vector_store import similarity_search, log_agent_action


settings = get_settings()

INTENT_TYPES = ["policy_question", "document_verification", "complaint", "general"]


# ─── Agent 1: Intent Classifier ───────────────────────────────────────────────

def _classify_intent(message: str, request_id: str, client) -> dict:
    system_prompt = (
        "You are an intent classifier for a Saudi government citizen services portal. "
        "Return JSON with keys: intent (one of policy_question|document_verification|complaint|general), "
        "language (en or ar), confidence (0.0-1.0). "
        "Be typo-tolerant. Policy questions include anything about Iqama, Absher, Qiwa, ZATCA, visas, labor law, fees."
    )
    start = time.time()
    try:
        raw = call_llm_json(system_prompt, message)
        result = json.loads(raw)
        intent = result.get("intent", "policy_question")
        language = result.get("language", "en")
        confidence = float(result.get("confidence", 0.85))
        if intent not in INTENT_TYPES:
            intent = "policy_question"
    except Exception:
        msg_lower = message.lower()
        policy_kws = ["iqama", "absher", "qiwa", "zatca", "visa", "fee", "renew", "policy", "labor", "transfer", "sponsor"]
        intent = "policy_question" if any(k in msg_lower for k in policy_kws) else "general"
        language = "ar" if any('\u0600' <= c <= '\u06FF' for c in message) else "en"
        confidence = 0.80

    log_agent_action(
        request_id=request_id,
        agent_name="Classifier Agent",
        input_data={"message": message},
        output_data={"intent": intent, "confidence": confidence},
        confidence=confidence,
        latency_ms=int((time.time() - start) * 1000),
        client=client,
    )
    return {"intent": intent, "language": language, "confidence": confidence}


# ─── Agent 2: Policy RAG Agent ────────────────────────────────────────────────

def _rag_agent(message: str, language: str, request_id: str, client) -> dict:
    start = time.time()
    retrieved = similarity_search(query=message, client=client, language=language)

    if not retrieved:
        response = (
            "لم أتمكن من العثور على معلومات ذات صلة. يرجى إعادة صياغة سؤالك."
            if language == "ar"
            else "I couldn't find relevant information in our policy database. Please try rephrasing your question."
        )
        log_agent_action(request_id, "Policy Agent", {"query": message}, {"response": response}, 0.2, int((time.time()-start)*1000), client)
        return {"response": response, "confidence": 0.2, "citations": []}

    system_prompt, user_message = build_rag_prompt(message, retrieved, language)
    try:
        answer = call_llm(system_prompt, user_message)
    except Exception as e:
        answer = f"I encountered an issue generating a response. Please try again. ({type(e).__name__})"

    citations = [c.get("source_url") for c in retrieved if c.get("source_url")]
    confidence = min(0.95, 0.6 + len(retrieved) * 0.05)
    log_agent_action(request_id, "Policy Agent", {"query": message}, {"response": answer}, confidence, int((time.time()-start)*1000), client)
    return {"response": answer, "confidence": confidence, "citations": citations}


# ─── Agent 3: Document Verification Agent ─────────────────────────────────────

def _verification_agent(message: str, language: str, request_id: str, client) -> dict:
    start = time.time()
    try:
        doc_response = (
            client.table("documents")
            .select("*")
            .eq("request_id", request_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        docs = doc_response.data or []
    except Exception:
        docs = []

    if not docs:
        response = (
            "يرجى رفع المستند المطلوب للتحقق منه باستخدام زر الرفع أدناه."
            if language == "ar"
            else "Please upload the document you'd like verified using the upload button below."
        )
        log_agent_action(request_id, "Verification Agent", {"message": message}, {"response": response}, 0.9, int((time.time()-start)*1000), client)
        return {"response": response, "confidence": 0.9, "verification_result": None}

    doc = docs[0]
    status = doc.get("verification_status", "pending")
    ocr_text = doc.get("ocr_text", "")

    if status == "pending" or not ocr_text:
        response = (
            "جاري معالجة مستندك. يرجى الانتظار لحظة."
            if language == "ar"
            else "Your document is still being processed. Please wait a moment."
        )
        return {"response": response, "confidence": 0.8, "verification_result": None}

    response = (
        f"Document verification complete. Status: **{status.upper()}**\n\n{ocr_text}"
    )
    return {"response": response, "confidence": 0.92, "verification_result": {"status": status, "ocr_text": ocr_text}}


# ─── Agent 4: Escalation Agent ────────────────────────────────────────────────

def _escalation_agent(intent: str, confidence: float, request_id: str, language: str, client) -> dict:
    start = time.time()
    try:
        client.table("requests").update({"status": "escalated"}).eq("id", request_id).execute()
    except Exception:
        pass

    reason = "complaint" if intent == "complaint" else "low_confidence"
    ticket = request_id[:8].upper()

    if language == "ar":
        response = (
            f"نأسف لسماع ذلك. تم تصعيد طلبك إلى فريق الدعم البشري. رقم طلبك: {ticket}"
            if reason == "complaint"
            else f"يبدو أن طلبك يحتاج إلى مساعدة متخصصة. رقم طلبك: {ticket}"
        )
    else:
        response = (
            f"We're sorry to hear that. Your request has been escalated to our support team. Ticket ID: {ticket}"
            if reason == "complaint"
            else f"Your request requires specialist assistance. A dedicated agent will follow up. Ticket ID: {ticket}"
        )

    log_agent_action(request_id, "Escalation Agent", {"intent": intent}, {"response": response}, 1.0, int((time.time()-start)*1000), client)
    return {"response": response, "confidence": 1.0, "escalated": True}


# ─── General Response ──────────────────────────────────────────────────────────

def _general_respond(language: str) -> dict:
    if language == "ar":
        response = "مرحباً! أنا مساعد GovAssist الذكي. كيف يمكنني مساعدتك في خدمات الحكومة السعودية اليوم؟"
    else:
        response = "Hello! I'm GovAssist AI. I can help you with government policy questions, document verification, or filing a complaint. How can I assist you today?"
    return {"response": response, "confidence": 1.0, "escalated": False}


# ─── DB Helpers ───────────────────────────────────────────────────────────────

def _create_request_record(citizen_id: Optional[str], intent: str, client) -> str:
    request_id = str(uuid.uuid4())
    try:
        client.table("requests").insert({
            "id": request_id,
            "citizen_id": citizen_id,
            "type": intent or "general",
            "status": "open",
        }).execute()
    except Exception:
        pass
    return request_id


def _save_conversation(request_id: str, citizen_message: str, agent_response: str, client):
    try:
        client.table("conversations").insert([
            {"request_id": request_id, "role": "citizen", "message": citizen_message},
            {"request_id": request_id, "role": "agent", "message": agent_response},
        ]).execute()
    except Exception:
        pass


# ─── Main Entry Point (public API — unchanged) ────────────────────────────────

async def run_agent_pipeline(
    citizen_message: str,
    language: Literal["en", "ar"] = "en",
    citizen_id: Optional[str] = None,
    request_id: Optional[str] = None,
) -> dict:
    """
    Public interface called by FastAPI chat route.
    Pure Python multi-agent pipeline — no LangGraph required.
    """
    client = get_supabase_admin_client()

    # Step 1: Classify intent
    classification = _classify_intent(citizen_message, request_id or "temp", client)
    intent = classification["intent"]
    language = classification.get("language", language)
    confidence = classification["confidence"]

    # Create DB record now we have intent
    if not request_id:
        request_id = _create_request_record(citizen_id, intent, client)

    # Step 2: Route to appropriate agent
    escalate = (confidence < settings.CONFIDENCE_THRESHOLD) or (intent == "complaint")

    if escalate:
        result = _escalation_agent(intent, confidence, request_id, language, client)
        agent_name = "Escalation Agent"
    elif intent == "policy_question":
        result = _rag_agent(citizen_message, language, request_id, client)
        agent_name = "Policy Agent"
    elif intent == "document_verification":
        result = _verification_agent(citizen_message, language, request_id, client)
        agent_name = "Verification Agent"
    else:
        result = _general_respond(language)
        agent_name = "General Agent"

    # Step 3: Persist conversation
    _save_conversation(request_id, citizen_message, result["response"], client)

    return {
        "request_id": request_id,
        "agent_name": agent_name,
        "response": result["response"],
        "confidence": result.get("confidence", confidence),
        "citations": result.get("citations"),
        "escalated": result.get("escalated", False),
        "verification_result": result.get("verification_result"),
        "language": language,
        "total_latency_ms": 0,
    }