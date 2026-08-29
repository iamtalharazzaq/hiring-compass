import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthProvider";
import { createOrganization, listOrganizations } from "./api";
import type { OrganizationSummary } from "./types";
type Value = {
  organization: OrganizationSummary | null;
  loading: boolean;
  create: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
};
const Context = createContext<Value | null>(null);
export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState<OrganizationSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!user) {
      setOrganization(null);
      return;
    }
    const items = await listOrganizations();
    setOrganization(items[0] ?? null);
  };
  useEffect(() => {
    if (authLoading) return;
    refresh()
      .catch(() => setOrganization(null))
      .finally(() => setLoading(false));
  }, [user, authLoading]);
  const create = async (name: string) => {
    const result = await createOrganization(name);
    setOrganization({
      organization: result.organization,
      role: result.membership.role,
    });
  };
  return (
    <Context.Provider
      value={{ organization, loading: authLoading || loading, create, refresh }}
    >
      {children}
    </Context.Provider>
  );
}
export const useOrganization = () => {
  const value = useContext(Context);
  if (!value)
    throw new Error("useOrganization must be used within OrganizationProvider");
  return value;
};
