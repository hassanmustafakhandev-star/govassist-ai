from app.core.config import get_settings
from app.db.supabase_client import get_supabase_client, get_supabase_admin_client
from app.schemas.chat import ChatRequest, ChatResponse, AgentResponse
from app.schemas.documents import DocumentUploadResponse, DocumentStatusResponse
from app.schemas.admin import AgentLogResponse, StatsResponse
from app.services.llm import call_llm, call_llm_json, build_rag_prompt
from app.db.embeddings import embed_text, embed_batch, chunk_text
from app.services.vector_store import similarity_search, ingest_policy_document, log_agent_action
from app.agents.classifier import classify_intent
from app.agents.rag_agent import rag_agent
from app.agents.verification_agent import verification_agent
from app.agents.escalation_agent import escalation_agent
from app.agents.graph import build_graph, run_agent_pipeline
from app.api.routes import chat, documents, admin
from app.workers.celery_app import celery_app
from app.workers.ocr_task import process_document_ocr
print('ALL IMPORTS OK')
