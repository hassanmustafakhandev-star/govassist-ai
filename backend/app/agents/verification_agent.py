import time
import json
from app.services.llm import call_llm_json
from app.services.vector_store import log_agent_action
from app.db.supabase_client import get_supabase_admin_client


def verification_agent(state: dict) -> dict:
    """
    Handles document verification requests.
    If a document was uploaded, reads OCR result from DB.
    If no document yet, prompts citizen to upload one.
    """
    start = time.time()
    client = get_supabase_admin_client()
    language = state.get("language", "en")

    # Check if a document has been uploaded for this request
    doc_response = (
        client.table("documents")
        .select("*")
        .eq("request_id", state["request_id"])
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    docs = doc_response.data

    # No document uploaded yet — ask citizen to upload
    if not docs:
        response = (
            "يرجى رفع المستند المطلوب للتحقق منه باستخدام زر الرفع أدناه."
            if language == "ar"
            else "Please upload the document you'd like verified using the upload button below."
        )
        latency_ms = int((time.time() - start) * 1000)
        log_agent_action(
            request_id=state["request_id"],
            agent_name="Verification Agent",
            input_data={"message": state["citizen_message"]},
            output_data={"response": response, "status": "awaiting_upload"},
            confidence=0.9,
            latency_ms=latency_ms,
            client=client,
        )
        return {
            **state,
            "final_response": response,
            "confidence": 0.9,
        }

    doc = docs[0]
    verification_status = doc.get("verification_status", "pending")
    ocr_text = doc.get("ocr_text", "")

    # Document still processing
    if verification_status == "pending" or not ocr_text:
        response = (
            "جاري معالجة مستندك. يرجى الانتظار لحظة."
            if language == "ar"
            else "Your document is still being processed. Please wait a moment."
        )
        latency_ms = int((time.time() - start) * 1000)
        log_agent_action(
            request_id=state["request_id"],
            agent_name="Verification Agent",
            input_data={"document_id": doc["id"]},
            output_data={"response": response, "status": "pending"},
            confidence=0.8,
            latency_ms=latency_ms,
            client=client,
        )
        return {
            **state,
            "final_response": response,
            "confidence": 0.8,
        }

    # Document processed — generate human-readable verification summary
    system_prompt = (
        "You are a document verification assistant for a government portal. "
        "Based on the verification status and OCR text, write a clear, "
        "professional summary for the citizen. "
        "Return JSON with keys: summary (string), is_valid (bool), "
        "missing_fields (list of strings, empty if none). "
        f"{'Respond in Arabic.' if language == 'ar' else 'Respond in English.'}"
    )

    user_message = (
        f"Verification status: {verification_status}\n"
        f"OCR extracted text:\n{ocr_text[:1500]}"
    )

    raw = call_llm_json(system_prompt, user_message)

    try:
        result = json.loads(raw)
        summary = result.get("summary", "")
        is_valid = result.get("is_valid", False)
        missing_fields = result.get("missing_fields", [])
        confidence = 0.92 if is_valid else 0.75
    except (json.JSONDecodeError, ValueError):
        summary = (
            "تم التحقق من المستند بنجاح." if language == "ar"
            else f"Document verification complete. Status: {verification_status}."
        )
        is_valid = verification_status == "verified"
        missing_fields = []
        confidence = 0.6

    latency_ms = int((time.time() - start) * 1000)

    log_agent_action(
        request_id=state["request_id"],
        agent_name="Verification Agent",
        input_data={"document_id": doc["id"], "status": verification_status},
        output_data={
            "summary": summary,
            "is_valid": is_valid,
            "missing_fields": missing_fields,
        },
        confidence=confidence,
        latency_ms=latency_ms,
        client=client,
    )

    return {
        **state,
        "final_response": summary,
        "confidence": confidence,
        "verification_result": {
            "is_valid": is_valid,
            "missing_fields": missing_fields,
            "status": verification_status,
        },
    }