from groq import Groq
from app.core.config import get_settings

settings = get_settings()
_client = Groq(api_key=settings.GROQ_API_KEY)


def call_llm(
    system_prompt: str,
    user_message: str,
    max_tokens: int = None,
) -> str:
    """Single LLM call — returns plain text response."""
    response = _client.chat.completions.create(
        model=settings.LLM_MODEL,
        max_tokens=max_tokens or settings.MAX_TOKENS,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
    )
    return response.choices[0].message.content


def call_llm_json(
    system_prompt: str,
    user_message: str,
    max_tokens: int = None,
) -> str:
    """
    LLM call expecting JSON output.
    System prompt must instruct model to return only valid JSON.
    Caller is responsible for json.loads() on the result.
    """
    json_system = (
        f"{system_prompt}\n\n"
        "IMPORTANT: Respond with valid JSON only. "
        "No markdown, no code fences, no explanation."
    )
    return call_llm(json_system, user_message, max_tokens)


def build_rag_prompt(
    query: str,
    retrieved_chunks: list[dict],
    language: str = "en",
) -> tuple[str, str]:
    """
    Builds system + user prompt for RAG answer generation.
    Returns (system_prompt, user_message) tuple.
    """
    context_blocks = "\n\n".join(
        f"[Source {i+1}: {chunk.get('source_url', 'N/A')}]\n{chunk['content']}"
        for i, chunk in enumerate(retrieved_chunks)
    )

    if language == "ar":
        lang_instruction = (
            "يجب أن تردَّ باللغة العربية الفصحى الواضحة."
            " استخدم لغة دافئة وودية ومهنية في آنٍ واحد."
        )
    else:
        lang_instruction = "Respond in clear, friendly, and professional English."

    system_prompt = (
        "You are GovAssist AI — a friendly, knowledgeable Saudi government services assistant. "
        "Your job is to help citizens and residents of Saudi Arabia navigate government processes with confidence.\n\n"
        "RESPONSE RULES:\n"
        "1. Use ONLY the provided context to answer. Do NOT invent information.\n"
        "2. If the citizen's message has spelling mistakes or is vague, intelligently understand their intent and answer accordingly.\n"
        "3. Structure your answer clearly: start with a direct answer, then provide step-by-step details if applicable.\n"
        "4. Use bullet points, numbered lists, and bold key terms for readability.\n"
        "5. Always mention relevant fees, deadlines, and official portals (like Absher, Qiwa, ZATCA).\n"
        "6. After each fact, cite the source in brackets like [Source 1].\n"
        "7. End every response with a warm, helpful closing line like 'Is there anything else I can help you with?'\n"
        "8. If the user asks in Arabic, respond entirely in Arabic. If in English, respond in English.\n"
        f"{lang_instruction}"
    )

    user_message = (
        f"Citizen question: {query}\n\n"
        f"Available context from Saudi government policy database:\n{context_blocks}"
    )

    return system_prompt, user_message