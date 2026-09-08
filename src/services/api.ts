import type { ApiError, Complaint } from "../types";
import { classifyLocally } from "./localClassifier";
import { MOCK_COMPLAINTS } from "./mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export class ClassificationError extends Error {}

/** In-memory session store so newly analyzed complaints appear in History
 *  immediately, without a backend. Seeded from the mock dataset. */
let sessionComplaints: Complaint[] = [...MOCK_COMPLAINTS];
let simulatedIdCounter = Math.max(...MOCK_COMPLAINTS.map((c) => c.complaint_id)) + 1;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Whether the app is operating against the real backend or the local
 * demo dataset. Exposed so the UI can (optionally) surface demo-mode
 * status without pretending to be connected to a live service.
 */
export function isDemoMode(): boolean {
  return !API_BASE_URL;
}

export async function classifyComplaint(complaintText: string): Promise<Complaint> {
  const trimmed = complaintText.trim();
  if (!trimmed) {
    throw new ClassificationError("Complaint text is required");
  }

  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_text: trimmed }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        throw new ClassificationError(body?.error ?? "The classification service could not be reached.");
      }

      const data = (await res.json()) as Complaint;
      sessionComplaints = [data, ...sessionComplaints];
      return data;
    } catch (err) {
      if (err instanceof ClassificationError) throw err;
      // Network failure — fall through to local demo classifier below.
    }
  }

  // Demo mode: simulate latency and classify locally.
  await wait(600 + Math.random() * 400);
  const result = classifyLocally(trimmed);
  result.complaint_id = simulatedIdCounter++;
  sessionComplaints = [result, ...sessionComplaints];
  return result;
}

export async function fetchComplaints(): Promise<Complaint[]> {
  if (API_BASE_URL) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/complaints`);
      if (res.ok) {
        const data = (await res.json()) as Complaint[] | { complaints: Complaint[] };
        return Array.isArray(data) ? data : data.complaints;
      }
    } catch {
      // fall through to demo data
    }
  }

  await wait(450);
  return sessionComplaints;
}
