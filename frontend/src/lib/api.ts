import {
  ChatRequest,
  ChatResponse,
  ConversationHistory,
  DocumentUploadResponse,
  DocumentStatusResponse,
  AgentLogResponse,
  StatsResponse,
  RequestsResponse
} from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new ApiError(`API Error: ${response.statusText}`, response.status);
  }

  return response.json() as Promise<T>;
}

export async function sendMessage(payload: ChatRequest): Promise<ChatResponse> {
  return fetchApi<ChatResponse>("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function getHistory(requestId: string): Promise<ConversationHistory> {
  return fetchApi<ConversationHistory>(`/chat/${requestId}/history`);
}

export async function uploadDocument(file: File, requestId: string): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("request_id", requestId);

  return fetchApi<DocumentUploadResponse>("/documents/upload", {
    method: "POST",
    body: formData,
  });
}

export async function pollDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
  return fetchApi<DocumentStatusResponse>(`/documents/${documentId}/status`);
}

export async function getAgentLogs(
  page: number = 1,
  pageSize: number = 20,
  agentName?: string,
  belowThreshold?: boolean
): Promise<AgentLogResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (agentName) params.append("agent_name", agentName);
  if (belowThreshold !== undefined) params.append("below_threshold", belowThreshold.toString());

  return fetchApi<AgentLogResponse>(`/admin/agent-logs?${params.toString()}`);
}

export async function getDashboardStats(): Promise<StatsResponse> {
  return fetchApi<StatsResponse>("/admin/stats");
}

export async function getAllRequests(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<RequestsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (status) params.append("status", status);

  return fetchApi<RequestsResponse>(`/admin/requests?${params.toString()}`);
}
