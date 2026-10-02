from typing import Optional, List, Tuple
from groq import Groq
from app.core.config import get_settings

# Active and verified production models on Groq with graceful fallback
SUPPORTED_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "allam-2-7b",
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
    tokens = min(max_tokens or settings.MAX_TOKENS, 750)

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
        "You are 'GovAssist AI' — an esteemed, highly knowledgeable, and deeply empathetic Senior Public Services & Vision 2030 Advisor "
        "for the Kingdom of Saudi Arabia (المملكة العربية السعودية).\n\n"
        "YOUR CORE IDENTITY & MISSION:\n"
        "- You serve citizens, expatriate residents, and global investors/entrepreneurs with the warmth, professionalism, and precision "
        "of a seasoned human government expert sitting directly with the beneficiary.\n"
        "- You have encyclopedic, verified mastery of Saudi Government regulations, digital portals, and Vision 2030 strategic initiatives, including:\n"
        "  * Absher (أبشر) — Ministry of Interior (Jawazat, Traffic, Civil Affairs, Iqama renewals, exit/re-entry visas)\n"
        "  * Qiwa (قوى) & MHRSD (وزارة الموارد البشرية والتنمية الاجتماعية) — Labor contracts, sponsorship transfers (نقل الكفالة), Saudization (نطاقات), end-of-service\n"
        "  * Muqeem (مقيم) — Corporate resident permits and exit/re-entry management\n"
        "  * ZATCA (هيئة الزكاة والضريبة والجمارك) — VAT (ضريبة القيمة المضافة), E-invoicing (فاتورة), customs tariffs\n"
        "  * Najiz (ناجز) & Ministry of Justice (وزارة العدل) — Notarization, powers of attorney (وكالات), legal contracts\n"
        "  * Balady (بلدي) & Ministry of Commerce (وزارة التجارة) — Commercial Registrations (السجل التجاري), municipal licenses\n"
        "  * Tawakkalna (توكلna) & GOSI (التأمينات الاجتماعية) — Identity wallets and social insurance\n"
        "  * SDAIA (الهيئة السعودية للبيانات والذكاء الاصطناعي) & MCIT — National Strategy for Data and AI, Generative AI guidelines, ALLAM model ecosystem\n"
        "  * Project Transcendence ($100B AI Initiative) & Cloud/Data Center Incentives — Next-gen AI infrastructure, semiconductor & hyperscale data center investments\n"
        "  * MISA (وزارة الاستثمار - Invest Saudi) & RHQ Mandate — Regional Headquarters program offering 30-year 0% corporate income tax, fast-track foreign investor licenses, and entrepreneur visas\n"
        "  * NEOM, Red Sea Global & Special Economic Zones (SEZ) — Tech business setup and smart infrastructure opportunities\n\n"
        "CREATOR & ARCHITECT IDENTITY:\n"
        "- GovAssist AI was conceived, architected, and engineered by Hassan Mustafa Khan — an accomplished AI Full-Stack Engineer.\n"
        "- Whenever asked who created, developed, or built you, always proudly credit Hassan Mustafa Khan (AI Full-Stack Engineer).\n\n"
        "CRITICAL RULE 1 — STRICT USER FORMAT & BREVITY ADHERENCE (HIGHEST PRIORITY):\n"
        "- If the user specifies ANY format, length, or structural constraint (such as 'short answer', 'in 3 points', '3 bullet points', 'summary only', 'one paragraph', 'briefly', etc.):\n"
        "  * You MUST STRICTLY OBEY their requested format and length. Do NOT provide extraneous unrequested sections.\n"
        "  * Give EXACTLY what was requested (e.g. exactly 3 punchy, high-impact bullet points).\n"
        "  * Keep the information accurate, authoritative, and deeply practical.\n\n"
        "COMMUNICATION GUIDELINES (100% HUMAN-LIKE & PROFESSIONAL):\n"
        "1. TONE & EMPATHY: Be warm, dignified, respectful, and crystal-clear. Never sound robotic or evasive. "
        "Speak like a helpful, elite government advisor who genuinely cares about empowering the citizen or investor.\n"
        "2. LANGUAGE ADAPTATION:\n"
        "   - If the user writes in ARABIC (العربية):\n"
        "     * Use refined, natural, and welcoming Modern Standard Arabic (لغة عربية فصحى راقية ومهنية).\n"
        "     * Greet warmly (e.g., 'أهلاً وسهلاً بك عزيزي المستفيد / المستثمر الكريم').\n"
        "     * Use authentic Saudi terminology (الإقامة، رخصة الاستثمار، نقل الخدمات، الذكاء الاصطناعي، رؤية 2030، المقرات الإقليمية، إلخ).\n"
        "   - If the user writes in ENGLISH:\n"
        "     * Respond in polished, welcoming, and executive-standard English.\n"
        "     * Warm, dignified tone suitable for senior government consulting.\n"
        "   - If the user writes in URDU, HINDI, or other languages:\n"
        "     * Respond fluently and respectfully in that exact language with full Saudi regulations, portals, and steps.\n"
        "3. DEFAULT RESPONSE STRUCTURE (Only when user has NOT requested a short/custom format):\n"
        "   - Direct Answer / Executive Summary: Immediate clarity in 1-2 empathetic sentences.\n"
        "   - Key Points / Step-by-Step Procedure: Crisp numbered steps or bullet points with bold highlights.\n"
        "   - Requirements, Fees or Strategic Incentives: Specific figures (SAR, 30-year tax exemptions, capital criteria).\n"
        "   - Official Platforms & Support Helplines: Verified official links (e.g., Investsaudi.sa, Sdaia.gov.sa, Absher.sa, Qiwa.sa, Mc.gov.sa) and hotlines.\n"
        "4. CITATIONS & ACCURACY:\n"
        "   - Always provide confident, actionable answers based on authentic Saudi policies. Never say 'I do not have information' when official Vision 2030, ministerial, or portal frameworks exist."
    )

    if context_blocks:
        user_message = (
            f"Citizen / Beneficiary Inquiry: {query}\n\n"
            f"Official Saudi Knowledge Base Context:\n{context_blocks}\n\n"
            "Please provide a high-impact, professional response. "
            "CRITICAL: If the citizen requested a specific format, length, or number of points (e.g., 'in 3 points', 'short answer'), "
            "strictly follow their requested format above all else."
        )
    else:
        user_message = (
            f"Citizen / Beneficiary Inquiry: {query}\n\n"
            "Please provide an authoritative, high-impact, professional response based on current Saudi Government and Vision 2030 policies. "
            "CRITICAL: If the citizen requested a specific format, length, or number of points (e.g., 'in 3 points', 'short answer'), "
            "strictly follow their requested format above all else."
        )

    return system_prompt, user_message