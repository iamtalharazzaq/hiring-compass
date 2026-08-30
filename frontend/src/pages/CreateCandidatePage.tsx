import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { CandidateForm } from "../components/candidates/CandidateForm";
import { useCandidateMutation } from "../features/candidates/queries";
import { useOrganization } from "../features/organizations/OrganizationProvider";
export function CreateCandidatePage() { const navigate = useNavigate(); const { organization } = useOrganization(); const mutation = useCandidateMutation(organization?.organization.id ?? ""); return <AppShell title="Add candidate"><Link to="/hiring?tab=candidates" className="text-sm font-semibold">← Back to Candidates</Link><h1 className="mt-6 text-3xl font-semibold">Add candidate</h1><p className="mt-2 text-[var(--color-muted)]">Create a reusable profile before connecting this person to a role.</p><CandidateForm busy={mutation.create.isPending} error={mutation.create.error?.message} onSubmit={(input) => mutation.create.mutate(input, { onSuccess: (result) => navigate(`/candidates/${result.candidate.id}`) })} /></AppShell>; }
