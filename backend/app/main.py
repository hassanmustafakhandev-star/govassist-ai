import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.api.routes import chat, documents, admin

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print(f"Starting {settings.APP_NAME}...")
    yield
    print(f"Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.API_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — allow local dev + production Vercel frontend
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add production frontend URL if set
frontend_url = getattr(settings, "FRONTEND_URL", None)
if frontend_url:
    ALLOWED_ORIGINS.append(frontend_url)

# In development/debug mode also allow all origins
if settings.DEBUG:
    ALLOWED_ORIGINS.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    chat.router,
    prefix="/api/v1",
    tags=["Chat"]
)
app.include_router(
    documents.router,
    prefix="/api/v1",
    tags=["Documents"]
)
app.include_router(
    admin.router,
    prefix="/api/v1",
    tags=["Admin"]
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.API_VERSION,
    }


# Gradio Interface — mounted at /gradio for Hugging Face Spaces
try:
    import gradio as gr
    from app.agents.graph import run_agent_pipeline

    async def gradio_fn(message, history):
        res = await run_agent_pipeline(citizen_message=message, language="en")
        return res.get("response", "")

    gradio_demo = gr.ChatInterface(
        fn=gradio_fn,
        title="GovAssist AI — Saudi Government AI Assistant",
        description="Multi-Agent Policy RAG & Verification Assistant. REST API active at /api/v1/chat",
    )

    app = gr.mount_gradio_app(app, gradio_demo, path="/gradio")
    print("Gradio interface mounted at /gradio")

except Exception as e:
    print(f"Warning: Gradio interface could not be mounted: {e}")
    print("API will still function normally at /api/v1")