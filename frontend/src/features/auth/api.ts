import { apiClient } from "../../lib/apiClient";
import type { AuthPayload, User } from "./types";

export const signIn = (email: string, password: string) => apiClient<AuthPayload>("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const signUp = (email: string, display_name: string, password: string) => apiClient<AuthPayload>("/api/v1/auth/signup", { method: "POST", body: JSON.stringify({ email, display_name, password }) });
export const refresh = () => apiClient<AuthPayload>("/api/v1/auth/refresh", { method: "POST" });
export const me = () => apiClient<{ user: User }>("/api/v1/auth/me");
export const logout = () => apiClient<{ status: string }>("/api/v1/auth/logout", { method: "POST" });
