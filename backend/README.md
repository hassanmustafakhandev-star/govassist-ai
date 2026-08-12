---
title: GovAssist AI
emoji: 🏛️
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# GovAssist AI — Saudi Government AI Assistant 🇸🇦

A Multi-Agent AI system for Saudi government citizen services.

## Features
- 🤖 Intent Classification (Policy / Document / Complaint)
- 📄 Document Verification (Iqama, National ID, License)
- 🔍 Policy RAG with vector search
- 💬 Gradio Chat Interface at `/gradio`
- ⚡ REST API at `/api/v1`

## API Endpoints
- `GET /health` — Health check
- `POST /api/v1/chat` — Chat with AI agent
- `POST /api/v1/documents/upload` — Upload document
- `GET /api/v1/documents/{id}/status` — Check document status
- `GET /api/docs` — Swagger UI

## Tech Stack
- FastAPI + Gradio
- LangGraph Multi-Agent Pipeline
- Groq LLM (llama3)
- Supabase (PostgreSQL + Storage)
- sentence-transformers embeddings
