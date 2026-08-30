import { apiClient } from "../../lib/apiClient";
export type Decision = { id: string; application_id: string; proposed_outcome: "proceed_to_offer" | "reject" | "hold"; rationale: string; status: "draft" | "pending_approval" | "approved" | "returned" | "withdrawn"; proposer_name?: string | null; review_notes?: string | null; submitted_at: string | null; reviewed_at: string | null };
const base = (org: string) => `/api/v1/organizations/${org}`;
export const approvals = (org: string) => apiClient<{ items: Decision[]; pagination: { total: number } }>(`${base(org)}/approvals/hiring-decisions`);
export const approveDecision = (org: string, id: string, review_notes?: string) => apiClient(`${base(org)}/hiring-decisions/${id}/approve`, { method: "POST", body: JSON.stringify({ review_notes }) });
export const returnDecision = (org: string, id: string, review_notes: string) => apiClient(`${base(org)}/hiring-decisions/${id}/return`, { method: "POST", body: JSON.stringify({ review_notes }) });
