from sentence_transformers import SentenceTransformer
from functools import lru_cache
import numpy as np
from app.core.config import get_settings

settings = get_settings()


@lru_cache()
def get_embedding_model() -> SentenceTransformer:
    """
    Loads bge-m3 once and caches it for the process lifetime.
    bge-m3 is multilingual — strong Arabic + English support.
    """
    print(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
    return SentenceTransformer(settings.EMBEDDING_MODEL)


def embed_text(text: str) -> list[float]:
    """Embed a single string — used for query embedding at inference time."""
    model = get_embedding_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Embed a list of strings — used during policy document ingestion.
    Normalize embeddings for cosine similarity via pgvector.
    """
    model = get_embedding_model()
    embeddings = model.encode(texts, normalize_embeddings=True, batch_size=32)
    return embeddings.tolist()


def chunk_text(
    text: str,
    chunk_size: int = 512,
    overlap: int = 64,
) -> list[str]:
    """
    Simple word-level chunker with overlap.
    Used when ingesting policy documents into policy_documents table.
    """
    words = text.split()
    chunks = []
    start = 0

    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks