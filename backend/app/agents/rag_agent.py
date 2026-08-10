import time
from app.services.llm import build_rag_prompt, call_llm
from app.services.vector_store import similarity_search, log_agent_action
from app.db.supabase_client import get_supabase_admin_client


def rag_agent(state: dict) -> dict:
    """
    1. Similarity search on policy_documents
    2. Build RAG prompt with retrieved chunks
    3. LLM generates cited answer
    4. Logs to agent_logs
    """
    start = time.time()
    client = get_supabase_admin_client()

    retrieved = similarity_search(
        query=state["citizen_message"],
        client=client,
        language=state.get("language", "en"),
    )

    if not retrieved:
        no_result_msg = (
            "لم أتمكن من العثور على معلومات ذات صلة في قاعدة بياناتنا. يرجى المحاولة مرة أخرى أو التواصل مع الدعم."
            if state.get("language") == "ar"
            else "I could not find relevant information in our database. Please try rephrasing your question or contact support."
        )
        latency_ms = int((time.time() - start) * 1000)
        log_agent_action(
            request_id=state["request_id"],
            agent_name="Policy Agent",
            input_data={"query": state["citizen_message"]},
            output_data={"response": no_result_msg, "chunks_found": 0},
            confidence=0.0,
            latency_ms=latency_ms,
            client=client,
        )
        return {
            **state,
            "retrieved_docs": [],
            "final_response": no_result_msg,
            "confidence": 0.2,
        }

    system_prompt, user_message = build_rag_prompt(
        query=state["citizen_message"],
        retrieved_chunks=retrieved,
        language=state.get("language", "en"),
    )

    answer = call_llm(system_prompt, user_message)
    citations = [
        chunk.get("source_url")
        for chunk in retrieved
        if chunk.get("source_url")
    ]

    confidence = min(0.95, 0.6 + (len(retrieved) * 0.05))
    latency_ms = int((time.time() - start) * 1000)

    log_agent_action(
        request_id=state["request_id"],
        agent_name="Policy Agent",
        input_data={"query": state["citizen_message"]},
        output_data={
            "response": answer,
            "chunks_found": len(retrieved),
            "citations": citations,
        },
        confidence=confidence,
        latency_ms=latency_ms,
        client=client,
    )

    return {
        **state,
        "retrieved_docs": retrieved,
        "citations": citations,
        "final_response": answer,
        "confidence": confidence,
    }