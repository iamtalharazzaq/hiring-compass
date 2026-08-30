import { apiClient } from "../../lib/apiClient";
export type CommunicationType = "interview_follow_up" | "next_steps" | "offer" | "rejection" | "hold";
export type Communication = { id: string; application_id: string; candidate_id: string; job_id: string; communication_type: CommunicationType; status: string; recipient_email: string; subject: string; body: string; created_by: string; review_notes?: string | null; created_at: string; updated_at: string; submitted_at?: string | null; reviewed_at?: string | null; ready_at?: string | null };
const base = (org: string) => `/api/v1/organizations/${org}`;
export const listCommunications = (org: string, application: string) => apiClient<{ items: Communication[] }>(`${base(org)}/applications/${application}/communications`);
export const createCommunication = (org: string, application: string, input: Pick<Communication, "communication_type" | "subject" | "body">) => apiClient<{ communication: Communication }>(`${base(org)}/applications/${application}/communications`, { method: "POST", body: JSON.stringify(input) });
export const updateCommunication = (org: string, id: string, input: Pick<Communication, "communication_type" | "subject" | "body">) => apiClient<{ communication: Communication }>(`${base(org)}/candidate-communications/${id}`, { method: "PATCH", body: JSON.stringify(input) });
export const submitCommunication = (org: string, id: string) => apiClient<{ communication: Communication }>(`${base(org)}/candidate-communications/${id}/submit`, { method: "POST" });
export const sendCommunication = (org: string, id: string) => apiClient<{ communication: Communication }>(`${base(org)}/candidate-communications/${id}/send`, { method: "POST", body: JSON.stringify({ confirmation: true }) });
