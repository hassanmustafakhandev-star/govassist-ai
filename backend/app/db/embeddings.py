from sentence_transformers import SentenceTransformer
from functools import lru_cache
import numpy as np
from app.core.config import get_settings

settings = get_settings()


import httpx

@lru_cache()
def get_embedding_model():
    """Lazy loads local model as fallback if HF API is unavailable."""
    from sentence_transformers import SentenceTransformer
    print(f"Loading local embedding model fallback: {settings.EMBEDDING_MODEL}")
    return SentenceTransformer(settings.EMBEDDING_MODEL)


def embed_text(text: str) -> list[float]:
    """
    Embed a single string.
    First tries Hugging Face Inference API (Fast, 0 RAM usage).
    Falls back to local sentence_transformers if offline.
    """
    try:
        url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.EMBEDDING_MODEL}"
        res = httpx.post(url, json={"inputs": text}, timeout=8.0)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and len(data) > 0:
                if isinstance(data[0], float):
                    return data
                elif isinstance(data[0], list) and isinstance(data[0][0], float):
                    return data[0]
    except Exception as err:
        print(f"Hugging Face API embed fallback triggered: {err}")

    # Fallback to local model if API call fails
    model = get_embedding_model()
    return model.encode(text, normalize_embeddings=True).tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed a list of strings."""
    try:
        url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.EMBEDDING_MODEL}"
        res = httpx.post(url, json={"inputs": texts}, timeout=12.0)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and isinstance(data[0], list):
                return data
    except Exception as err:
        print(f"Hugging Face API batch embed fallback triggered: {err}")

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