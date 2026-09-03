import { apiClient } from "../../lib/apiClient";

export type Offer = { id: string; application_id: string; job_title: string; salary: string; currency: string; start_date: string; employment_type: string; work_location: string; expiry_date: string; additional_terms: string | null; status: "draft" | "pending_approval" | "approved" | "sent" | "accepted" | "declined" | "expired"; candidate_url: string };
export type OfferInput = Pick<Offer, "job_title" | "salary" | "currency" | "start_date" | "employment_type" | "work_location" | "expiry_date" | "additional_terms">;
export type Onboarding = { id: string; status: "not_started" | "in_progress" | "completed"; progress: { completed: number; total: number }; tasks: { id: string; title: string; completed: boolean }[] };
const root = (org: string) => `/api/v1/organizations/${org}`;
export const getOffer = (org: string, application: string) => apiClient<{ offer: Offer | null }>(`${root(org)}/applications/${application}/offer`);
export const createOffer = (org: string, application: string, body: OfferInput) => apiClient<{ offer: Offer }>(`${root(org)}/applications/${application}/offer`, { method: "POST", body: JSON.stringify(body) });
export const offerAction = (org: string, id: string, action: "submit" | "approve" | "send") => apiClient<{ offer: Offer }>(`${root(org)}/offers/${id}/${action}`, { method: "POST" });
export const getOnboarding = (org: string, application: string) => apiClient<{ onboarding: Onboarding | null }>(`${root(org)}/applications/${application}/onboarding`);
export const startOnboarding = (org: string, application: string) => apiClient(`${root(org)}/applications/${application}/onboarding`, { method: "POST" });
export const updateOnboardingTask = (org: string, id: string, completed: boolean) => apiClient(`${root(org)}/onboarding-tasks/${id}`, { method: "PATCH", body: JSON.stringify({ completed }) });
export const completeOnboarding = (org: string, id: string) => apiClient(`${root(org)}/onboardings/${id}/complete`, { method: "POST" });
