from typing import Optional, List, Tuple
from groq import Groq
from app.core.config import get_settings

# Active and verified production models on Groq with graceful fallback
SUPPORTED_MODELS = [
    "qwen/qwen3.8-27b",
    "groq/compound",
    "groq/compound-mini",
    "qwen/qwen3.6-27b",
    "allam-2-7b",
    "openai/gpt-oss-20b",
]


def get_groq_client() -> Groq:
    """Lazy initialize Groq client so module import never crashes."""
    settings = get_settings()
    api_key = settings.GROQ_API_KEY if settings.GROQ_API_KEY else "gsk_dummy_key_for_startup"
    return Groq(api_key=api_key)


def call_llm(
    system_prompt: str,
    user_message: str,
    max_tokens: Optional[int] = None,
    temperature: float = 0.5,
) -> str:
    """
    Call LLM with automated model fallback.
    Tries configured primary model (qwen/qwen3.8-27b), and if unavailable,
    seamlessly cascades through fallback models so the user always gets a response.
    """
    settings = get_settings()
    client = get_groq_client()
    tokens = max_tokens or settings.MAX_TOKENS

    # Build model order: preferred model first, followed by fallbacks
    models_to_try: List[str] = [settings.LLM_MODEL] + [
        m for m in SUPPORTED_MODELS if m != settings.LLM_MODEL
    ]

    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                max_tokens=tokens,
                temperature=temperature,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
            )
            content = response.choices[0].message.content
            if content and content.strip():
                return content.strip()
        except Exception as err:
            last_error = err
            print(f"[LLM Service] Model {model_name} failed: {err}. Trying next fallback...")
            continue

    # If all models fail, raise informative exception
    raise RuntimeError(f"All Groq models failed. Last error: {last_error}")


def call_llm_json(
    system_prompt: str,
    user_message: str,
    max_tokens: Optional[int] = None,
) -> str:
    """
    LLM call strictly expecting valid JSON output.
    """
    settings = get_settings()
    client = get_groq_client()
    tokens = max_tokens or 512

    models_to_try: List[str] = [settings.LLM_MODEL] + [
        m for m in SUPPORTED_MODELS if m != settings.LLM_MODEL
    ]

    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                max_tokens=tokens,
                temperature=0.1,
                response_format={"type": "json_object"},
                messages=[
                    {
                        "role": "system",
                        "content": (
                            f"{system_prompt}\n\n"
                            "STRICT REQUIREMENT: Respond with 100% valid JSON only. "
                            "No markdown code blocks, no backticks, no explanations."
                        ),
                    },
                    {"role": "user", "content": user_message},
                ],
            )
            content = response.choices[0].message.content
            if content and content.strip():
                return content.strip()
        except Exception as err:
            print(f"[LLM JSON] Model {model_name} json_mode error: {err}. Trying standard call...")
            try:
                # Fallback to text prompt if response_format unsupported
                raw = call_llm(
                    f"{system_prompt}\n\nOutput strictly valid JSON only.",
                    user_message,
                    max_tokens=tokens,
                    temperature=0.1,
                )
                return raw
            except Exception:
                continue

    raise RuntimeError("All models failed for JSON generation.")


def build_rag_prompt(
    query: str,
    retrieved_chunks: list[dict],
    language: str = "en",
) -> Tuple[str, str]:
    """
    Builds the ultimate 100% human-like, senior government advisor system + user prompt.
    Adapts seamlessly to Arabic, English, or any language the citizen uses.
    """
    context_blocks = ""
    if retrieved_chunks:
        context_blocks = "\n\n".join(
            f"[Official Source {i+1}: {chunk.get('source_url', 'Saudi Government Portal')}]\n{chunk.get('content', '')}"
            for i, chunk in enumerate(retrieved_chunks)
        )

    system_prompt = (
        "You are 'GovAssist AI' — an esteemed, highly knowledgeable, and deeply empathetic Senior Public Services Advisor "
        "for the Kingdom of Saudi Arabia (المملكة العربية السعودية).\n\n"
        "YOUR CORE IDENTITY & MISSION:\n"
        "- You serve citizens, expatriate residents, and business owners with the warmth, professionalism, and precision "
        "of a seasoned human government expert sitting directly with the beneficiary.\n"
        "- You have encyclopedic, verified mastery of Saudi Government regulations, digital portals, and ministerial procedures, including:\n"
        "  * Absher (أبشر) — Ministry of Interior (Jawazat, Traffic, Civil Affairs, Iqama renewals, exit/re-entry visas)\n"
        "  * Qiwa (قوى) & MHRSD (وزارة الموارد البشرية والتنمية الاجتماعية) — Labor contracts, transfer of sponsorship (نقل الكفالة), Saudization (نطاقات), end-of-service\n"
        "  * Muqeem (مقيم) — Corporate resident permits and exit/re-entry management\n"
        "  * ZATCA (هيئة الزكاة والضريبة والجمارك) — VAT (ضريبة القيمة المضافة), E-invoicing (فاتورة), customs tariffs\n"
        "  * Najiz (ناجز) & Ministry of Justice (وزارة العدل) — Notarization, powers of attorney (وكالات), legal contracts\n"
        "  * Balady (بلدي) & Ministry of Commerce (وزارة التجارة) — Commercial Registrations (السجل التجاري), municipal licenses\n"
        "  * Tawakkalna (توكلنا) & GOSI (التأمينات الاجتماعية) — Identity wallets and social insurance\n\n"
        "COMMUNICATION GUIDELINES (100% HUMAN-LIKE & WARM):\n"
        "1. TONE & EMPATHY: Be warm, dignified, respectful, and crystal-clear. Never sound robotic, cold, or generic. "
        "Speak like a helpful government official who genuinely cares about solving the citizen's problem.\n"
        "2. LANGUAGE ADAPTATION:\n"
        "   - If the user writes in ARABIC (العربية):\n"
        "     * Use refined, natural, and welcoming Modern Standard Arabic (لغة عربية فصحى راقية ومهنية).\n"
        "     * Greet warmly (e.g., 'أهلاً وسهلاً بك عزيزي المستفيد / عزيزتي المستفيدة'، 'يسعدني ويشرفني تقديم المساعدة لك').\n"
        "     * Use authentic Saudi terminology (الإقامة، تأشيرة خروج وعودة، منصة أبشر، منصة قوى، نقل الخدمات، المقابل المالي، إلخ).\n"
        "     * Conclude with a heartfelt, helpful closing (e.g., 'دمتم برعاية الله وحفظه، ويسعدني دائماً الإجابة عن أي استفسار آخر لديك.').\n"
        "   - If the user writes in ENGLISH:\n"
        "     * Respond in polished, welcoming, and executive-standard English.\n"
        "     * Warm opening: 'Welcome to Saudi Citizen & Resident Services. It is a pleasure to assist you.'\n"
        "     * Professional, courteous, and precise step-by-step guidance.\n"
        "     * Conclude with: 'Please feel free to ask if you need further clarification on any step. I am here to help you anytime.'\n"
        "   - If the user writes in URDU, HINDI, or any other language:\n"
        "     * Respond fluently and respectfully in that exact language with full Saudi government requirements, fees, and steps.\n"
        "3. STRUCTURE OF YOUR RESPONSE:\n"
        "   - Direct Answer / Overview: Provide immediate clarity in 1-2 empathetic sentences.\n"
        "   - Step-by-Step Procedure: Numbered, sequential steps explaining how to complete the transaction on the portal.\n"
        "   - Key Requirements & Official Fees: Mention specific fees in SAR (Saudi Riyals), eligibility criteria, validity, or grace periods.\n"
        "   - Official Platforms & Support Helplines: Always cite the official platform link (e.g., Absher.sa, Qiwa.sa, Zatca.gov.sa) and official support numbers (e.g., Absher 920020405 / 19992, MHRSD 19911, ZATCA 19993).\n"
        "   - Warm Closing: Encouraging, open-ended question inviting any additional doubts.\n"
        "4. CITATIONS & ACCURACY:\n"
        "   - If context snippets are provided, cite them seamlessly or integrate their official links.\n"
        "   - If context is sparse, rely on your extensive authentic knowledge of Saudi law and administrative procedures to give a thorough, actionable answer. Never say 'I don't have information' or 'consult a lawyer' when standard published government procedures exist."
    )

    if context_blocks:
        user_message = (
            f"Citizen / Beneficiary Inquiry: {query}\n\n"
            f"Official Saudi Knowledge Base Context:\n{context_blocks}\n\n"
            "Please provide a complete, deeply professional, 100% human-like response tailored to the beneficiary."
        )
    else:
        user_message = (
            f"Citizen / Beneficiary Inquiry: {query}\n\n"
            "Please provide an authoritative, warm, 100% human-like step-by-step guide with fees, official portals, "
            "and helpline numbers based on current Saudi Government regulations."
        )

    return system_prompt, user_message