import { apiClient } from "../../lib/apiClient";
import type { Member, Organization, OrganizationSummary } from "./types";
export const listOrganizations = () => apiClient<OrganizationSummary[]>("/api/v1/organizations");
export const createOrganization = (name: string) => apiClient<{ organization: Organization; membership: { role: string } }>("/api/v1/organizations", { method: "POST", body: JSON.stringify({ name }) });
export const getOrganization = (id: string) => apiClient<{ organization: Organization }>(`/api/v1/organizations/${id}`);
export const updateOrganization = (id: string, name: string) => apiClient<{ organization: Organization }>(`/api/v1/organizations/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });
export const listMembers = (id: string) => apiClient<{ members: Member[] }>(`/api/v1/organizations/${id}/members`);
export const addMember = (id: string, email: string, role: string) => apiClient<Member>(`/api/v1/organizations/${id}/members`, { method: "POST", body: JSON.stringify({ email, role }) });
export const updateMember = (orgId: string, memberId: string, body: object) => apiClient<{ membership: Member["membership"] }>(`/api/v1/organizations/${orgId}/members/${memberId}`, { method: "PATCH", body: JSON.stringify(body) });
