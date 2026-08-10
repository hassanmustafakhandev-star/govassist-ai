export interface ChatRequest {
  citizen_message: string;
  language: "en" | "ar";
  citizen_id?: string;
  request_id?: string;
}

export interface AgentResponse {
  agent_name: "Policy Agent" | "Verification Agent" | "Escalation Agent" | "General Agent";
  content: string;
  confidence: number;
  citations?: string[];
  escalated: boolean;
}

export interface ChatResponse {
  request_id: string;
  message_id: string;
  agent_response: AgentResponse;
  language: string;
  timestamp: string;
}

export interface ConversationMessage {
  id: string;
  role: "citizen" | "agent";
  content: string;
  agent_name?: string;
  confidence?: number;
  timestamp: string;
}

export interface ConversationHistory {
  request_id: string;
  messages: ConversationMessage[];
}

export interface DocumentUploadResponse {
  document_id: string;
  task_id: string;
  status: string;
  message: string;
}

export interface DocumentStatusResponse {
  document_id: string;
  status: string;
  has_ocr: boolean;
  created_at: string;
}

export interface AgentLog {
  id: string;
  request_id: string;
  agent_name: string;
  confidence: number;
  latency_ms: number;
  created_at: string;
  input: any;
  output: any;
}

export interface AgentLogResponse {
  page: number;
  page_size: number;
  logs: AgentLog[];
}

export interface StatsResponse {
  requests_today: number;
  average_confidence: number;
  escalation_rate_percent: number;
}

export interface RequestItem {
  id: string;
  citizen_id?: string;
  type: string;
  status: string;
  created_at: string;
}

export interface RequestsResponse {
  page: number;
  page_size: number;
  requests: RequestItem[];
}
