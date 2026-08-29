import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { me, refresh, logout as logoutRequest } from "./api";
import { setAccessToken } from "../../lib/apiClient";
import type { AuthPayload, User } from "./types";

type AuthContextValue = { user: User | null; loading: boolean; authenticate: (payload: AuthPayload) => void; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  const authenticate = (payload: AuthPayload) => { setAccessToken(payload.access_token); setUser(payload.user); };
  useEffect(() => { refresh().then((payload) => { setAccessToken(payload.access_token); return me(); }).then((result) => setUser(result.user)).catch(() => setAccessToken(null)).finally(() => setLoading(false)); }, []);
  const logout = async () => { await logoutRequest().catch(() => undefined); setAccessToken(null); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within AuthProvider"); return context; };
