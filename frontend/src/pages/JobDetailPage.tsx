import { Link, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { CandidatePipeline } from "../components/jobs/CandidatePipeline";
import { JobStatusBadge } from "../components/jobs/JobStatusBadge";
import { InterviewPlan } from "../components/jobs/InterviewPlan";
import { RequirementsSection } from "../components/jobs/RequirementsSection";
import { useJob, useJobMutation, useRequirements } from "../features/jobs/queries";
import { useOrganization } from "../features/organizations/OrganizationProvider";

export function JobDetailPage() {
  const { jobId = "" } = useParams();
  const { organization } = useOrganization();
  const org = organization?.organization.id ?? "";
  const { data, isLoading, error } = useJob(org, jobId);
  const { data: requirementData } = useRequirements(org, jobId);
  const mutations = useJobMutation(org);
  if (isLoading) return <AppShell title="Job"><p>Loading job…</p></AppShell>;
  if (!data) return <AppShell title="Job"><p>{error?.message ?? "Job was not found."}</p></AppShell>;
  const job = data.job;
  const editable = ["admin", "recruiter"].includes(organization?.role ?? "");
  const requirementsEditable = editable && ["draft", "pending_approval"].includes(job.status);
  const approver = ["admin", "hiring_manager"].includes(organization?.role ?? "");
  const canSubmit = Boolean(job.title && job.description && requirementData?.items.length && requirementData.items.some((item) => item.requirement_type === "required"));
  return <AppShell title="Job details"><header className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold">{job.title}</h1><JobStatusBadge status={job.status} /></div><div className="flex flex-wrap items-end gap-2">{editable && job.status === "draft" && <Link to={`/jobs/${job.id}/edit`} className="hc-primary-action">Edit Job</Link>}{editable && job.status === "draft" && <div><button onClick={() => mutations.submit.mutate(job.id)} disabled={mutations.submit.isPending || !canSubmit} className="hc-primary-action">{mutations.submit.isPending ? "Submitting…" : "Submit for Approval"}</button>{!canSubmit && <p className="mt-1 max-w-56 text-right text-xs text-[var(--color-muted)]">Add a description and at least one required requirement to submit.</p>}</div>}{approver && job.status === "pending_approval" && <button onClick={() => window.confirm("Approve this job? Candidates will be allowed after approval.") && mutations.approve.mutate(job.id)} disabled={mutations.approve.isPending} className="hc-primary-action">Approve Job</button>}{approver && job.status === "pending_approval" && <button onClick={() => { const note = window.prompt("Why should this job be sent back to draft?"); if (note?.trim()) mutations.returnToDraft.mutate({ id: job.id, note }); }} className="rounded-xl border px-4 py-2 text-sm font-semibold">Request Changes</button>}</div></header>{job.status === "pending_approval" && <p className="mt-4 rounded-xl bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-muted)]">This job is awaiting approval. Candidates cannot be added until it is approved.</p>}{job.status === "approved" && <p className="mt-4 rounded-xl bg-[var(--color-sage)] px-4 py-3 text-sm text-[var(--color-teal)]">Approved — candidates can now be added to this role.</p>}<section className="mt-8 rounded-2xl border bg-[var(--color-surface)] p-6"><h2 className="font-semibold">Role summary</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-muted)]">{job.description || "No description has been added yet."}</p></section><RequirementsSection organizationId={org} jobId={job.id} editable={requirementsEditable} />{job.status === "approved" && <InterviewPlan organizationId={org} jobId={job.id} editable={editable} />}{["approved", "closed", "archived"].includes(job.status) ? <CandidatePipeline organizationId={org} jobId={job.id} editable={editable} jobStatus={job.status} /> : <section className="mt-8 rounded-2xl border p-6 text-sm text-[var(--color-muted)]">Candidates can be added after this job description is approved.</section>}{(mutations.submit.error || mutations.approve.error || mutations.returnToDraft.error) && <p role="alert" className="mt-4 text-sm text-[var(--color-red)]">{mutations.submit.error?.message ?? mutations.approve.error?.message ?? mutations.returnToDraft.error?.message}</p>}</AppShell>;
}
