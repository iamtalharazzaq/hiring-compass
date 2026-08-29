import { apiClient } from "../../lib/apiClient";
import type { Candidate, CandidateInput, CandidatesResult } from "./types";
const base = (org: string) => `/api/v1/organizations/${org}/candidates`;
export const listCandidates = (org: string, page: number, search?: string) => apiClient<CandidatesResult>(`${base(org)}?page=${page}&page_size=20${search ? `&search=${encodeURIComponent(search)}` : ""}`);
export const getCandidate = (org: string, id: string) => apiClient<{ candidate: Candidate }>(`${base(org)}/${id}`);
export const createCandidate = (org: string, input: CandidateInput) => apiClient<{ candidate: Candidate }>(base(org), { method: "POST", body: JSON.stringify(input) });
export const updateCandidate = (org: string, id: string, input: Partial<CandidateInput>) => apiClient<{ candidate: Candidate }>(`${base(org)}/${id}`, { method: "PATCH", body: JSON.stringify(input) });
