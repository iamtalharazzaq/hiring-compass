import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { JobForm } from "../components/jobs/JobForm";
import { useJobMutation } from "../features/jobs/queries";
import type { JobInput } from "../features/jobs/types";
import { useOrganization } from "../features/organizations/OrganizationProvider";
export function CreateJobPage() { const { organization } = useOrganization(); const navigate = useNavigate(); const { create } = useJobMutation(organization?.organization.id ?? ""); const submit = (input: JobInput) => create.mutate(input, { onSuccess: ({ job }) => navigate(`/jobs/${job.id}`) }); return <AppShell title="Create job"><p className="text-sm font-semibold text-[var(--color-teal)]">Jobs</p><h1 className="mt-2 text-3xl font-semibold">Create a job</h1><p className="mt-2 text-[var(--color-muted)]">Start with the core details. Requirements and approval come next.</p><JobForm submit={submit} busy={create.isPending} error={create.error?.message} /></AppShell>; }
