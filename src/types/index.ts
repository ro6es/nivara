export type PriorityLevel = "High" | "Medium" | "Low";

export interface Section {
  code: string;
  title: string;
  confidence: number; // 0–1
}

export interface Priority {
  level: PriorityLevel;
  score: number; // 0–10
}

export interface Routing {
  unit: string;
  reason: string;
}

export interface ExplanationToken {
  token: string;
  weight: number; // 0–1
}

export interface Complaint {
  complaint_id: number;
  complaint_text: string;
  received_at: string; // ISO timestamp
  sections: Section[];
  priority: Priority;
  routing: Routing;
  explanation: ExplanationToken[];
}

export interface ClassifyRequest {
  complaint_text: string;
}

export type ClassifyResponse = Complaint;

export interface ApiError {
  error: string;
}

export interface ComplaintsListResponse {
  complaints: Complaint[];
}

export interface ScanResult {
  extracted_text: string;
  /** OCR engine confidence, 0–100. Undefined when the source doesn't report one. */
  confidence?: number;
}
