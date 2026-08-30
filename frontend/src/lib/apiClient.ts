let accessToken: string | null = sessionStorage.getItem("hiring-compass-access-token");
export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) sessionStorage.setItem("hiring-compass-access-token", token);
  else sessionStorage.removeItem("hiring-compass-access-token");
};
export async function apiClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}${path}`, {
    ...init, credentials: "include", headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...init.headers },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message ?? "Something went wrong.");
  return payload.data as T;
}
