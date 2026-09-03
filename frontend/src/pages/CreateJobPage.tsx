import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { JobForm } from "../components/jobs/JobForm";
import { useJobMutation } from "../features/jobs/queries";
import type { JobInput, RequirementInput } from "../features/jobs/types";
import { useOrganization } from "../features/organizations/OrganizationProvider";
export function CreateJobPage() { const { organization } = useOrganization(); const navigate = useNavigate(); const { create } = useJobMutation(organization?.organization.id ?? ""); const submit = (input: JobInput, requirements: RequirementInput[] = []) => create.mutate({ input, requirements }, { onSuccess: ({ job }) => navigate(`/jobs/${job.id}`) }); return <AppShell title="Create job"><Link to="/hiring?tab=jobs" className="text-sm font-semibold">← Back to Jobs</Link><p className="mt-6 text-sm font-semibold text-[var(--color-teal)]">Jobs</p><h1 className="mt-2 text-3xl font-semibold">Create a job</h1><p className="mt-2 text-[var(--color-muted)]">Define the role, work setup, and requirements in one place.</p><JobForm organizationId={organization?.organization.id ?? ""} cancelTo="/hiring?tab=jobs" submit={submit} busy={create.isPending} error={create.error?.message} /></AppShell>; }
