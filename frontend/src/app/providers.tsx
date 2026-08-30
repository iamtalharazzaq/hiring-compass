import {
  StrictMode,
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../features/auth/AuthProvider";
import { OrganizationProvider } from "../features/organizations/OrganizationProvider";

type AppProvidersProps = {
  children: ReactNode;
};
const queryClient = new QueryClient();
export type Theme = "light" | "dark" | "system";
const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "system", setTheme: () => undefined });
export const useTheme = () => useContext(ThemeContext);
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("hiring-compass-theme");
    return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  });
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { document.documentElement.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme; };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  const setTheme = (value: Theme) => {
    localStorage.setItem("hiring-compass-theme", value);
    setThemeState(value);
  };
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <OrganizationProvider>{children}</OrganizationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
