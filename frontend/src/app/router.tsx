import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { OverviewPage } from "../pages/OverviewPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { useAuth } from "../features/auth/AuthProvider";
import { useOrganization } from "../features/organizations/OrganizationProvider";
import { OrganizationSetupPage } from "../pages/OrganizationSetupPage";
import { OrganizationSettingsPage } from "../pages/OrganizationSettingsPage";
import { JobsPage } from "../pages/JobsPage";
import { CreateJobPage } from "../pages/CreateJobPage";
import { EditJobPage } from "../pages/EditJobPage";
import { JobDetailPage } from "../pages/JobDetailPage";
import { CandidatesPage } from "../pages/CandidatesPage";
import { CreateCandidatePage } from "../pages/CreateCandidatePage";
import { CandidateDetailPage } from "../pages/CandidateDetailPage";
import { EditCandidatePage } from "../pages/EditCandidatePage";

function Protected({ children }: { children: ReactNode }) { const { user, loading } = useAuth(); const { organization, loading: orgLoading } = useOrganization(); if (loading || orgLoading) return <p>Loading workspace…</p>; return user ? organization ? children : <Navigate replace to="/setup-organization" /> : <Navigate replace to="/login" />; }
function Setup() { const { user, loading } = useAuth(); const { organization, loading: orgLoading } = useOrganization(); if (loading || orgLoading) return <p>Loading workspace…</p>; return user ? organization ? <Navigate replace to="/" /> : <OrganizationSetupPage /> : <Navigate replace to="/login" />; }

export const router = createBrowserRouter([
  { path: "/", element: <Protected><OverviewPage /></Protected> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/setup-organization", element: <Setup /> },
  { path: "/settings", element: <Protected><OrganizationSettingsPage /></Protected> },
  { path: "/jobs", element: <Protected><JobsPage /></Protected> },
  { path: "/jobs/new", element: <Protected><CreateJobPage /></Protected> },
  { path: "/jobs/:jobId", element: <Protected><JobDetailPage /></Protected> },
  { path: "/jobs/:jobId/edit", element: <Protected><EditJobPage /></Protected> },
  { path: "/candidates", element: <Protected><CandidatesPage /></Protected> },
  { path: "/candidates/new", element: <Protected><CreateCandidatePage /></Protected> },
  { path: "/candidates/:candidateId", element: <Protected><CandidateDetailPage /></Protected> },
  { path: "/candidates/:candidateId/edit", element: <Protected><EditCandidatePage /></Protected> },
  { path: "*", element: <Navigate replace to="/" /> },
]);
