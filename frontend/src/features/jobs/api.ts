import { apiClient } from "../../lib/apiClient";
import type { Job, JobInput, JobsResult, JobStatus } from "./types";
const base = (organizationId: string) => `/api/v1/organizations/${organizationId}/jobs`;
export const listJobs = (organizationId: string, params: { page: number; status?: JobStatus; search?: string }) => { const query = new URLSearchParams({ page: String(params.page), page_size: "20", ...(params.status ? { status: params.status } : {}), ...(params.search ? { search: params.search } : {}) }); return apiClient<JobsResult>(`${base(organizationId)}?${query}`); };
export const getJob = (organizationId: string, jobId: string) => apiClient<{ job: Job }>(`${base(organizationId)}/${jobId}`);
export const createJob = (organizationId: string, input: JobInput) => apiClient<{ job: Job }>(base(organizationId), { method: "POST", body: JSON.stringify(input) });
export const updateJob = (organizationId: string, jobId: string, input: Partial<JobInput>) => apiClient<{ job: Job }>(`${base(organizationId)}/${jobId}`, { method: "PATCH", body: JSON.stringify(input) });
export const closeJob = (organizationId: string, jobId: string) => apiClient<{ job: Job }>(`${base(organizationId)}/${jobId}/close`, { method: "POST" });
export const archiveJob = (organizationId: string, jobId: string) => apiClient<{ job: Job }>(`${base(organizationId)}/${jobId}/archive`, { method: "POST" });
