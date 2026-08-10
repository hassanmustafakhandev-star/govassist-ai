from supabase import Client
from app.db.embeddings import embed_text, embed_batch, chunk_text
from app.core.config import get_settings

settings = get_settings()


def similarity_search(
    query: str,
    client: Client,
    language: str = "en",
    top_k: int = None,
) -> list[dict]:
    """
    Embed query -> pgvector cosine similarity search on policy_documents.
    Returns list of matching chunks with content + source_url.
    """
    query_embedding = embed_text(query)
    k = top_k or settings.TOP_K_RESULTS

    response = client.rpc(
        "match_policy_documents",
        {
            "query_embedding": query_embedding,
            "match_count": k,
            "filter_language": language,
        },
    ).execute()

    return response.data or []


def ingest_policy_document(
    title: str,
    content: str,
    language: str,
    source_url: str,
    client: Client,
) -> int:
    """
    Chunk text -> embed -> insert all chunks into policy_documents table.
    Returns number of chunks inserted.
    """
    chunks = chunk_text(content)
    embeddings = embed_batch(chunks)

    rows = [
        {
            "title": f"{title} — chunk {i+1}",
            "content": chunk,
            "language": language,
            "source_url": source_url,
            "embedding": embedding,
        }
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]

    client.table("policy_documents").insert(rows).execute()
    return len(rows)


def log_agent_action(
    request_id: str,
    agent_name: str,
    input_data: dict,
    output_data: dict,
    confidence: float,
    latency_ms: int,
    client: Client,
) -> None:
    """Insert one row into agent_logs — called at the end of every agent node."""
    try:
        client.table("agent_logs").insert({
            "request_id": request_id,
            "agent_name": agent_name,
            "input": input_data,
            "output": output_data,
            "confidence": confidence,
            "latency_ms": latency_ms,
        }).execute()
    except Exception:
        pass