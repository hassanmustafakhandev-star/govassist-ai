from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    document_id: str
    task_id: str
    status: str
    message: str

class DocumentStatusResponse(BaseModel):
    document_id: str
    status: str
    has_ocr: bool
    created_at: datetime
