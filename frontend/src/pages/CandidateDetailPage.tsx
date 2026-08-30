import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { ApplicationHistory } from "../components/candidates/ApplicationHistory";
import { CommunicationsSection } from "../components/candidates/CommunicationsSection";
import { ActivityTimeline } from "../components/candidates/ActivityTimeline";
import { ResumeSection } from "../components/candidates/ResumeSection";
import { useCandidate } from "../features/candidates/queries";
import { useOrganization } from "../features/organizations/OrganizationProvider";

export function CandidateDetailPage() {
  const { candidateId = "" } = useParams(); const { organization } = useOrganization(); const org = organization?.organization.id ?? ""; const { data, isLoading, error } = useCandidate(org, candidateId);
  if (isLoading) return <AppShell title="Candidate"><p>Loading candidate…</p></AppShell>;
  if (!data) return <AppShell title="Candidate"><p>{error?.message ?? "Candidate was not found."}</p></AppShell>;
  const candidate = data.candidate; const manage = ["admin", "recruiter"].includes(organization?.role ?? ""); const view = ["admin", "recruiter", "hiring_manager"].includes(organization?.role ?? "");
  return <AppShell title="Candidate details"><Link to="/candidates" className="text-sm font-semibold">← Candidates</Link><header className="mt-6 flex items-center justify-between"><div><h1 className="text-3xl font-semibold">{candidate.full_name}</h1><p className="mt-1 text-[var(--color-muted)]">{candidate.current_title ?? "Candidate profile"}</p></div>{manage && <Link to={`/candidates/${candidate.id}/edit`} className="rounded-xl border px-4 py-2 text-sm font-semibold">Edit candidate</Link>}</header><section className="mt-8 rounded-2xl border bg-[var(--color-surface)] p-6"><p>{candidate.email ?? "—"}{candidate.phone ? ` · ${candidate.phone}` : ""}</p><p className="mt-2 text-sm text-[var(--color-muted)]">{candidate.location ?? "—"} · {candidate.years_of_experience ?? "—"} years experience</p><p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[var(--color-muted)]">{candidate.summary ?? "No summary added."}</p></section>{view && <><ResumeSection organizationId={org} candidateId={candidate.id} editable={manage} /><ApplicationHistory organizationId={org} candidateId={candidate.id} /><CommunicationsSection candidateId={candidate.id} candidateName={candidate.full_name} /><ActivityTimeline organizationId={org} candidateId={candidate.id} /></>}</AppShell>;
}
