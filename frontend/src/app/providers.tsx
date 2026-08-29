import { StrictMode, type ReactNode } from "react";
import { AuthProvider } from "../features/auth/AuthProvider";
import { OrganizationProvider } from "../features/organizations/OrganizationProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <StrictMode><AuthProvider><OrganizationProvider>{children}</OrganizationProvider></AuthProvider></StrictMode>;
}
