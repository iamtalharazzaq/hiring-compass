import { StrictMode, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../features/auth/AuthProvider";
import { OrganizationProvider } from "../features/organizations/OrganizationProvider";

type AppProvidersProps = {
  children: ReactNode;
};
const queryClient = new QueryClient();

export function AppProviders({ children }: AppProvidersProps) {
  return <StrictMode><QueryClientProvider client={queryClient}><AuthProvider><OrganizationProvider>{children}</OrganizationProvider></AuthProvider></QueryClientProvider></StrictMode>;
}
