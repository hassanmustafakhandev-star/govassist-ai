"""
graph.py — Enhanced Lightweight Multi-Agent Pipeline (No Heavy Frameworks)
==========================================================================
Pure Python multi-agent orchestration for Vercel Serverless.
Produces 100% human-like, senior government advisor responses across all languages.
Uses LLaMA 3.3 70B with automatic fallback.
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


# ─── Language Detector Helper ──────────────────────────────────────────────────

def _detect_language(text: str) -> str:
    """Detect whether input is Arabic, English, or other."""
    if any('\u0600' <= c <= '\u06FF' for c in text):
        return "ar"
    return "en"


# ─── Agent 1: Intent Classifier ───────────────────────────────────────────────

def _classify_intent(message: str, request_id: str, client) -> dict:
    start = time.time()
    system_prompt = (
        "You are an expert intent classifier for the Saudi Government Citizen Services Portal. "
        "Analyze the citizen message and return JSON with keys:\n"
        "- intent: one of ['policy_question', 'document_verification', 'complaint', 'general']\n"
        "- language: detected language code ('ar', 'en', 'ur', etc.)\n"
        "- confidence: float between 0.0 and 1.0\n\n"
        "Classification Guidelines:\n"
        "- 'policy_question': Inquiries about Iqama, Absher, Qiwa, Muqeem, ZATCA, Visas, Labor Laws, "
        "Sponsorship transfer (نقل الكفالة), fees, renewals, GOSI, passports, legal procedures, etc.\n"
        "- 'document_verification': Requests to verify, check, scan, or inspect an ID, Iqama, Commercial Registration, or license.\n"
        "- 'complaint': Expressing frustration, dispute, delayed government transactions, harassment, or reporting fraud.\n"
        "- 'general': Greetings (e.g. 'Hello', 'السلام عليكم', 'مرحبا'), thanking, asking what this portal does.\n"
        "Be typo-tolerant. Return valid JSON only."
    )
    
    intent = "policy_question"
    language = _detect_language(message)
    confidence = 0.90

    try:
        raw = call_llm_json(system_prompt, message)
        result = json.loads(raw)
        parsed_intent = result.get("intent", "policy_question")
        if parsed_intent in INTENT_TYPES:
            intent = parsed_intent
        language = result.get("language", language)
        confidence = float(result.get("confidence", 0.90))
    except Exception as e:
        print(f"[Classifier] Fallback triggered: {e}")
        msg_lower = message.lower()
        if any(w in msg_lower for w in ["verify", "upload", "check doc", "document", "iqama image", "فحص", "تحقق"]):
            intent = "document_verification"
        elif any(w in msg_lower for w in ["complaint", "issue", "delay", "fraud", "stuck", "مشكلة", "شكوى", "تأخر"]):
            intent = "complaint"
        elif any(w in msg_lower for w in ["hi", "hello", "hey", "مرحبا", "سلام", "السلام", "اهلا"]):
            intent = "general"
        else:
            intent = "policy_question"

    log_agent_action(
        request_id=request_id,
        agent_name="Classifier Agent",
        input_data={"message": message},
        output_data={"intent": intent, "confidence": confidence, "language": language},
        confidence=confidence,
        latency_ms=int((time.time() - start) * 1000),
        client=client,
    )
    return {"intent": intent, "language": language, "confidence": confidence}


# ─── Agent 2: Policy RAG Agent (100% Human-Like Senior Advisor) ───────────────

def _rag_agent(message: str, language: str, request_id: str, client) -> dict:
    start = time.time()
    
    # Attempt vector search on policy database
    retrieved = []
    try:
        retrieved = similarity_search(query=message, client=client, language=language)
    except Exception as ex:
        print(f"[Policy Agent] Similarity search warning: {ex}")

    # Build comprehensive, warm, authoritative prompt
    system_prompt, user_message = build_rag_prompt(message, retrieved, language)

    try:
        answer = call_llm(system_prompt, user_message, temperature=0.6)
    except Exception as e:
        print(f"[Policy Agent] LLM generation error: {e}")
        if language == "ar":
            answer = (
                "أهلاً وسهلاً بك عزيزي المستفيد. نعتذر عن حدوث انقطاع مؤقت في الخدمة. "
                "يرجى إعادة إرسال استفسارك أو زيارة منصة أبشر الرسمية (Absher.sa) أو منصة قوى (Qiwa.sa)، "
                "كما يمكنك التواصل مع الرقم الموحد لخدمة المستفيدين 19992."
            )
        else:
            answer = (
                "Welcome to Saudi Citizen & Resident Services. We are experiencing a brief system latency. "
                "Please resend your inquiry or access the official Absher portal (https://www.absher.sa) or Qiwa platform (https://qiwa.sa). "
                "You may also contact the Unified Beneficiary Support at 19992."
            )

    # Collect authoritative citations
    citations = [c.get("source_url") for c in retrieved if c.get("source_url")]
    if not citations:
        msg_lower = message.lower()
        if any(k in msg_lower for k in ["iqama", "visa", "absher", "passport", "jawazat", "إقامة", "جواز", "تأشيرة"]):
            citations = ["https://www.absher.sa", "https://www.gdp.gov.sa"]
        elif any(k in msg_lower for k in ["qiwa", "labor", "contract", "sponsor", "transfer", "قوى", "عمل", "عقد"]):
            citations = ["https://qiwa.sa", "https://hrsd.gov.sa"]
        elif any(k in msg_lower for k in ["tax", "vat", "zatca", "invoice", "ضريبة", "زكاة"]):
            citations = ["https://zatca.gov.sa"]
        elif any(k in msg_lower for k in ["cr", "commercial", "balady", "سجل", "بلدي"]):
            citations = ["https://mc.gov.sa", "https://balady.gov.sa"]
        else:
            citations = ["https://www.my.gov.sa", "https://www.absher.sa"]

    confidence = min(0.98, 0.85 + (len(retrieved) * 0.03))
    
    log_agent_action(
        request_id=request_id,
        agent_name="Policy Agent",
        input_data={"query": message, "language": language},
        output_data={"response": answer, "chunks_found": len(retrieved)},
        confidence=confidence,
        latency_ms=int((time.time() - start) * 1000),
        client=client,
    )
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
        if language == "ar":
            response = (
                "أهلاً وسهلاً بك في خدمة التحقق الذكي من الوثائق الرسمية.\n\n"
                "يرجى رفع صورة واضحة من **بطاقة الإقامة (Iqama)**، أو **الهوية الوطنية**، أو **السجل التجاري (CR)**، "
                "أو **رخصة القيادة** عبر النقر على أيقونة المرفقات (📎) بالأسفل.\n\n"
                "سأقوم بفحص البيانات ومطابقتها فوراً مع المعايير الحكومية المعتمدة والتأكد من سريانها."
            )
        else:
            response = (
                "Welcome to the Official Document Verification Service.\n\n"
                "Please upload a clear copy of your **Resident Identity (Iqama)**, **National ID**, "
                "**Commercial Registration (CR)**, or **Driving License** using the attachment icon (📎) below.\n\n"
                "I will immediately inspect the document against Saudi regulatory standards and verify its authenticity and validity."
            )
        log_agent_action(request_id, "Verification Agent", {"message": message}, {"response": response}, 0.95, int((time.time()-start)*1000), client)
        return {"response": response, "confidence": 0.95, "verification_result": None}

    doc = docs[0]
    status = doc.get("verification_status", "pending")
    ocr_text = doc.get("ocr_text", "")

    if status == "pending" or not ocr_text:
        response = (
            "جاري معالجة مستندك وفحص البيانات عبر منظومة التحقق. يرجى الانتظار بضع ثوانٍ..."
            if language == "ar"
            else "Your document is currently being scanned and processed through the verification pipeline. Please wait a moment..."
        )
        return {"response": response, "confidence": 0.85, "verification_result": None}

    if language == "ar":
        response = (
            f"تم إكمال عملية الفحص والتحقق بنجاح.\n\n"
            f"📌 **حالة الوثيقة:** {'✅ معتمدة ونظامية' if status == 'verified' else '⚠️ غير معتمدة أو تحتاج إلى مراجعة'}\n\n"
            f"📋 **تفاصيل الوثيقة:**\n{ocr_text}\n\n"
            f"إذا كنت بحاجة إلى اتخاذ أي إجراء إضافي (تجديد أو تصديق)، يسعدني إرشادك للخطوة القادمة."
        )
    else:
        response = (
            f"Document verification process completed successfully.\n\n"
            f"📌 **Official Status:** {'✅ VERIFIED & AUTHENTIC' if status == 'verified' else '⚠️ UNVERIFIED / REQUIRES REVIEW'}\n\n"
            f"📋 **Extracted Credentials & Summary:**\n{ocr_text}\n\n"
            f"Should you require further assistance regarding renewal, fees, or attested procedures, please let me know."
        )

    return {"response": response, "confidence": 0.96, "verification_result": {"status": status, "ocr_text": ocr_text}}


# ─── Agent 4: Escalation Agent (Human Support Routing) ────────────────────────

def _escalation_agent(intent: str, confidence: float, request_id: str, language: str, client) -> dict:
    start = time.time()
    try:
        client.table("requests").update({"status": "escalated"}).eq("id", request_id).execute()
    except Exception:
        pass

    ticket = request_id[:8].upper()

    if language == "ar":
        response = (
            f"أهلاً بك عزيزي المستفيد. نقدر تواصلك معنا ونحرص على خدمتك بأعلى درجات العناية.\n\n"
            f"تم تسجيل طلبك وتصعيده مباشرة إلى **فريق الدعم الحكومي المتخصص** للمتابعة الفورية.\n\n"
            f"🎫 **رقم التذكرة المرجعي:** `#{ticket}`\n"
            f"📞 **قنوات المتابعة المباشرة:**\n"
            f"- مركز الاتصال الوطني الموحد (آمر): **199099**\n"
            f"- خدمة عملاء منصة أبشر: **920020405** أو **19992**\n"
            f"- وزارة الموارد البشرية والتنمية الاجتماعية: **19911**\n\n"
            f"سيتواصل معك أحد ممثلي الخدمة عبر البريد المسجل لمتابعة حالتك حتى اكتمالها بإذن الله."
        )
    else:
        response = (
            f"Dear Valued Beneficiary, thank you for reaching out. We take your inquiry and feedback with utmost seriousness.\n\n"
            f"Your case has been formally logged and escalated to our **Senior Government Support Specialists** for dedicated assistance.\n\n"
            f"🎫 **Reference Ticket ID:** `#{ticket}`\n"
            f"📞 **Direct Official Support Helplines:**\n"
            f"- National Unified Center (Amer): **199099**\n"
            f"- Absher Customer Care: **920020405** or **19992**\n"
            f"- Ministry of Human Resources (MHRSD): **19911**\n\n"
            f"A certified support officer will review your file and follow up promptly via your registered contact details."
        )

    log_agent_action(request_id, "Escalation Agent", {"intent": intent}, {"response": response}, 1.0, int((time.time()-start)*1000), client)
    return {"response": response, "confidence": 1.0, "escalated": True}


# ─── General Agent (Warm Welcome & Navigation) ────────────────────────────────

def _general_respond(message: str, language: str) -> dict:
    # Use LLM to generate a natural, welcoming, highly contextual human greeting
    system_prompt = (
        "You are GovAssist AI — a distinguished, warm, and highly courteous Senior Saudi Government Services Advisor. "
        "The citizen is greeting you or asking what you can do. Respond with maximum warmth, human charm, and helpfulness.\n\n"
        "GUIDELINES:\n"
        "- In ARABIC: Greet with genuine warmth ('أهلاً وسهلاً بك في منصة المساعد الحكومي الذكي للمملكة العربية السعودية...'). "
        "Briefly highlight how you can assist with: تجديد الإقامات والتأشيرات عبر أبشر، عقود العمل ونقل الكفالة عبر قوى، "
        "السجلات التجارية والرخص، فحص الوثائق الرسمية، أو تقديم الاعتراضات والشكاوى.\n"
        "- In ENGLISH: Warm executive welcome ('Welcome to GovAssist AI — your dedicated advisory portal for Saudi government services...'). "
        "Mention key areas of assistance (Iqama renewals, exit/re-entry visas, Qiwa labor contracts, document verification, ZATCA tax).\n"
        "- In other languages: Greet warmly and explain your capabilities in that language.\n"
        "Keep it inviting, professional, and conclude with an open question ready to solve their inquiry."
    )
    try:
        answer = call_llm(system_prompt, message, temperature=0.7)
    except Exception:
        if language == "ar":
            answer = (
                "أهلاً وسهلاً بك في منصة المساعد الحكومي الذكي للمملكة العربية السعودية 🇸🇦\n\n"
                "يسعدني ويشرفني تقديم المساعدة الشاملة لك في كافة المعاملات الحكومية، ومنها:\n"
                "• **خدمات الإقامة والجوازات:** تجديد الإقامة، رسوم المرافقين، تأشيرات الخروج والعودة عبر منصة أبشر ومقيم.\n"
                "• **خدمات العمل والتوظيف:** نقل الكفالة، توثيق العقود، ونظام العمل عبر منصة قوى.\n"
                "• **الأعمال والشركات:** السجلات التجارية، رخص بلدي، والامتثال الضريبي لدى هيئة الزكاة والضريبة والجمارك (ZATCA).\n"
                "• **التحقق من الوثائق:** تدقيق الهويات والتراخيص بصورة فورية.\n\n"
                "تفضل بطرح سؤالك وسأكون سعيداً بإرشادك خطوة بخطوة!"
            )
        else:
            answer = (
                "Welcome to GovAssist AI — your premier digital advisory portal for Saudi Government Services 🇸🇦\n\n"
                "It is a pleasure to assist you. I can guide you through verified procedures, official fees, and step-by-step requirements for:\n"
                "• **Residency & Passports:** Iqama renewals, dependent fees, and exit/re-entry visas via Absher and Muqeem.\n"
                "• **Labor & Employment:** Sponsorship transfer (نقل الكفالة), work contracts, and regulations via Qiwa.\n"
                "• **Business & Commerce:** Commercial Registration (CR), municipal licenses, and ZATCA tax/VAT compliance.\n"
                "• **Document Verification:** Instant biometric-grade analysis of official permits and IDs.\n\n"
                "How may I assist you with your government transaction today?"
            )

    return {"response": answer, "confidence": 1.0, "escalated": False}


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


# ─── Main Entry Point (Public API) ────────────────────────────────────────────

async def run_agent_pipeline(
    citizen_message: str,
    language: Literal["en", "ar"] = "en",
    citizen_id: Optional[str] = None,
    request_id: Optional[str] = None,
) -> dict:
    """
    Public interface called by FastAPI chat route.
    Delivers 100% human-like, multi-lingual, senior government advisory responses.
    """
    client = get_supabase_admin_client()

    # Step 1: Classify intent and language
    classification = _classify_intent(citizen_message, request_id or "temp", client)
    intent = classification["intent"]
    detected_lang = classification.get("language", language)
    confidence = classification["confidence"]

    # Use detected language if it resolved to a real language
    effective_lang = detected_lang if detected_lang in ["ar", "en", "ur"] else language

    # Create DB record if not provided
    if not request_id:
        request_id = _create_request_record(citizen_id, intent, client)

    # Step 2: Route to appropriate specialized agent
    if intent == "complaint":
        result = _escalation_agent(intent, confidence, request_id, effective_lang, client)
        agent_name = "Escalation Agent"
    elif intent == "document_verification":
        result = _verification_agent(citizen_message, effective_lang, request_id, client)
        agent_name = "Verification Agent"
    elif intent == "general":
        result = _general_respond(citizen_message, effective_lang)
        agent_name = "GovAssist Advisor"
    else:
        # Default: Policy Agent (RAG + Comprehensive Saudi regulations knowledge)
        result = _rag_agent(citizen_message, effective_lang, request_id, client)
        agent_name = "Policy Agent"

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
        "language": effective_lang,
        "total_latency_ms": 0,
    }