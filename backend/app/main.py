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

# CORS — allow all origins for Vercel frontend
# NOTE: allow_credentials MUST be False when allow_origins=["*"]
# (Starlette raises ValueError otherwise — crashes cold start)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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