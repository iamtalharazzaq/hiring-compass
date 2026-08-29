import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { WorkspacePreviewPage } from "../pages/WorkspacePreviewPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { useAuth } from "../features/auth/AuthProvider";

function Protected({ children }: { children: ReactNode }) { const { user, loading } = useAuth(); return loading ? <p>Loading authentication…</p> : user ? children : <Navigate replace to="/login" />; }

export const router = createBrowserRouter([
  { path: "/", element: <Protected><WorkspacePreviewPage /></Protected> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "*", element: <Navigate replace to="/" /> },
]);
