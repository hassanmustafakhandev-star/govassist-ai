import httpx
from app.core.config import get_settings

settings = get_settings()


def embed_text(text: str) -> list[float]:
    """
    Embed a single string via Hugging Face Inference API.
    Fast, 0MB RAM usage, perfect for serverless (Vercel/Cloud functions).
    """
    try:
        url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.EMBEDDING_MODEL}"
        headers = {}
        # If HF_TOKEN is optionally provided in settings
        if getattr(settings, "HF_TOKEN", None):
            headers["Authorization"] = f"Bearer {settings.HF_TOKEN}"

        res = httpx.post(url, json={"inputs": text}, headers=headers, timeout=10.0)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and len(data) > 0:
                if isinstance(data[0], float):
                    return data
                elif isinstance(data[0], list) and isinstance(data[0][0], float):
                    return data[0]
        else:
            print(f"[Embeddings] HF API Returned status {res.status_code}: {res.text}")
    except Exception as err:
        print(f"[Embeddings] HF API call error: {err}")

    # Fallback zero-vector if external API fails (prevents serverless crash)
    return [0.0] * 1024


def embed_batch(texts: list[str]) -> list[list[float]]:
    """Embed a list of strings."""
    try:
        url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.EMBEDDING_MODEL}"
        headers = {}
        if getattr(settings, "HF_TOKEN", None):
            headers["Authorization"] = f"Bearer {settings.HF_TOKEN}"

        res = httpx.post(url, json={"inputs": texts}, headers=headers, timeout=15.0)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, list) and isinstance(data[0], list):
                return data
    except Exception as err:
        print(f"[Embeddings] HF API batch embed error: {err}")

    return [[0.0] * 1024 for _ in texts]


def chunk_text(
    text: str,
    chunk_size: int = 512,
    overlap: int = 64,
) -> list[str]:
    """
    Simple word-level chunker with overlap.
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