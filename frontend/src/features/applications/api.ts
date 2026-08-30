import { apiClient } from "../../lib/apiClient";
export type ApplicationStatus = "new" | "shortlisted" | "interviewing" | "decision_pending" | "offer_approved" | "on_hold" | "rejected";
export type Application = { id: string; job_id: string; candidate_id: string; status: ApplicationStatus; created_at: string; status_changed_at: string };
export const listJobApplications = (org: string, job: string) => apiClient<{ items: Application[] }>(`/api/v1/organizations/${org}/jobs/${job}/applications?page=1&page_size=100`);
export const listCandidateApplications = (org: string, candidate: string) => apiClient<{ items: Application[] }>(`/api/v1/organizations/${org}/candidates/${candidate}/applications?page=1&page_size=100`);
export const addApplication = (org: string, job: string, candidate_id: string) => apiClient<{ application: Application }>(`/api/v1/organizations/${org}/jobs/${job}/applications`, { method: "POST", body: JSON.stringify({ candidate_id }) });
export const changeApplicationStatus = (org: string, id: string, status: ApplicationStatus) => apiClient<{ application: Application }>(`/api/v1/organizations/${org}/applications/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
