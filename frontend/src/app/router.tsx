import { createBrowserRouter, Navigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";

import { OverviewPage } from "../pages/OverviewPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { useAuth } from "../features/auth/AuthProvider";
import { useOrganization } from "../features/organizations/OrganizationProvider";
import { OrganizationSetupPage } from "../pages/OrganizationSetupPage";
import { OrganizationSettingsPage } from "../pages/OrganizationSettingsPage";
import { HiringPage } from "../pages/HiringPage";
import { CreateJobPage } from "../pages/CreateJobPage";
import { EditJobPage } from "../pages/EditJobPage";
import { JobDetailPage } from "../pages/JobDetailPage";
import { CreateCandidatePage } from "../pages/CreateCandidatePage";
import { CandidateDetailPage } from "../pages/CandidateDetailPage";
import { EditCandidatePage } from "../pages/EditCandidatePage";
import { MarketingPage } from "../pages/MarketingPage";
import { AuthPage } from "../pages/AuthPage";
import { InterviewsPage } from "../pages/InterviewsPage";
import { InterviewDetailPage } from "../pages/InterviewDetailPage";
import { ApprovalsPage } from "../pages/ApprovalsPage";
import { RecruiterGuidePage } from "../pages/RecruiterGuidePage";
import { isPortalHost, portalUrl, publicUrl } from "../lib/hosts";

function CrossOriginRedirect({ to }: { to: string }) { useEffect(() => { window.location.replace(to); }, [to]); return null; }
function PublicPage({ children }: { children: ReactNode }) { return isPortalHost() ? <CrossOriginRedirect to={publicUrl(`${window.location.pathname}${window.location.search}${window.location.hash}`)} /> : children; }
function PortalPage({ children }: { children: ReactNode }) { return isPortalHost() ? children : <CrossOriginRedirect to={portalUrl(`${window.location.pathname}${window.location.search}${window.location.hash}`)} />; }
function Protected({ children }: { children: ReactNode }) { const { user, loading } = useAuth(); const { organization, loading: orgLoading } = useOrganization(); if (loading || orgLoading) return <p>Loading workspace…</p>; return user ? organization ? children : <Navigate replace to="/setup-organization" /> : <Navigate replace to="/login" />; }
function Setup() { const { user, loading } = useAuth(); const { organization, loading: orgLoading } = useOrganization(); if (loading || orgLoading) return <p>Loading workspace…</p>; return user ? organization ? <Navigate replace to="/app" /> : <OrganizationSetupPage /> : <Navigate replace to="/login" />; }

export const router = createBrowserRouter([
  { path: "/", element: isPortalHost() ? <Navigate replace to="/app" /> : <PublicPage><MarketingPage /></PublicPage> },
  { path: "/product", element: <PublicPage><Navigate replace to="/#product" /></PublicPage> },
  { path: "/how-it-works", element: <PublicPage><Navigate replace to="/#how-it-works" /></PublicPage> },
  { path: "/pricing", element: <PublicPage><Navigate replace to="/#pricing" /></PublicPage> },
  { path: "/about", element: <PublicPage><Navigate replace to="/#about" /></PublicPage> },
  { path: "/contact", element: <PublicPage><Navigate replace to="/#contact" /></PublicPage> },
  { path: "/app", element: <PortalPage><Protected><OverviewPage /></Protected></PortalPage> },
  { path: "/auth", element: <PortalPage><AuthPage /></PortalPage> },
  { path: "/login", element: <PortalPage><LoginPage /></PortalPage> },
  { path: "/signup", element: <PortalPage><SignupPage /></PortalPage> },
  { path: "/setup-organization", element: <PortalPage><Setup /></PortalPage> },
  { path: "/settings", element: <PortalPage><Protected><OrganizationSettingsPage /></Protected></PortalPage> },
  { path: "/settings/guide", element: <PortalPage><Protected><RecruiterGuidePage /></Protected></PortalPage> },
  { path: "/hiring", element: <PortalPage><Protected><HiringPage /></Protected></PortalPage> },
  { path: "/jobs", element: <PortalPage><Navigate replace to="/hiring?tab=jobs" /></PortalPage> },
  { path: "/jobs/new", element: <PortalPage><Navigate replace to="/hiring/jobs/new" /></PortalPage> },
  { path: "/hiring/jobs/new", element: <PortalPage><Protected><CreateJobPage /></Protected></PortalPage> },
  { path: "/jobs/:jobId", element: <PortalPage><Protected><JobDetailPage /></Protected></PortalPage> },
  { path: "/jobs/:jobId/edit", element: <PortalPage><Protected><EditJobPage /></Protected></PortalPage> },
  { path: "/candidates", element: <PortalPage><Navigate replace to="/hiring?tab=candidates" /></PortalPage> },
  { path: "/candidates/new", element: <PortalPage><Navigate replace to="/hiring/candidates/new" /></PortalPage> },
  { path: "/hiring/candidates/new", element: <PortalPage><Protected><CreateCandidatePage /></Protected></PortalPage> },
  { path: "/candidates/:candidateId", element: <PortalPage><Protected><CandidateDetailPage /></Protected></PortalPage> },
  { path: "/candidates/:candidateId/edit", element: <PortalPage><Protected><EditCandidatePage /></Protected></PortalPage> },
  { path: "/interviews", element: <PortalPage><Protected><InterviewsPage /></Protected></PortalPage> },
  { path: "/interviews/:interviewId", element: <PortalPage><Protected><InterviewDetailPage /></Protected></PortalPage> },
  { path: "/approvals", element: <PortalPage><Protected><ApprovalsPage /></Protected></PortalPage> },
  { path: "*", element: isPortalHost() ? <Navigate replace to="/app" /> : <Navigate replace to="/" /> },
]);
