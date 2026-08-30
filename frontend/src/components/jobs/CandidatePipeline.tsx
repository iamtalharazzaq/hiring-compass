import { useState } from "react";
import { useApplicationMutation, useJobApplications } from "../../features/applications/queries";
import type { ApplicationStatus } from "../../features/applications/api";
import { useInterviewActions, useStages } from "../../features/interviews/queries";
import { ScheduleInterviewForm } from "./ScheduleInterviewForm";

const statuses: ApplicationStatus[] = ["new", "shortlisted", "interviewing", "on_hold", "rejected"];

export function CandidatePipeline({ organizationId, jobId, editable }: { organizationId: string; jobId: string; editable: boolean }) {
  const { data, isLoading } = useJobApplications(organizationId, jobId);
  const mutation = useApplicationMutation(organizationId, jobId);
  const { data: stageData } = useStages(organizationId, jobId);
  const interviews = useInterviewActions(organizationId, jobId);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  if (isLoading) return <section className="mt-8 rounded-2xl border p-6">Loading candidates…</section>;
  return <section className="mt-8 rounded-2xl border bg-[var(--color-surface)] p-6"><h2 className="text-lg font-semibold">Candidates</h2><div className="mt-5 grid gap-4 md:grid-cols-5">{statuses.map((status) => <div key={status}><h3 className="text-sm font-semibold text-[var(--color-teal)]">{status === "on_hold" ? "On hold" : status[0].toUpperCase() + status.slice(1)}</h3><div className="mt-2 space-y-2">{data?.items.filter((item) => item.status === status).map((item) => <article key={item.id} className="rounded-xl border bg-white p-3"><a href={`/candidates/${item.candidate_id}`} className="text-sm font-semibold">Candidate {item.candidate_id.slice(0, 8)}</a>{editable && status === "shortlisted" && <button onClick={() => setApplicationId(item.id)} className="mt-2 w-full rounded-lg bg-[var(--color-navy)] p-1 text-xs text-white">Schedule interview</button>}{applicationId === item.id && <ScheduleInterviewForm stages={stageData?.items ?? []} pending={interviews.schedule.isPending} onCancel={() => setApplicationId(null)} onSchedule={(body) => interviews.schedule.mutate({ app: item.id, ...body }, { onSuccess: () => setApplicationId(null) })} />}{editable && !["rejected", "interviewing"].includes(status) && <select value={status} onChange={(event) => mutation.status.mutate({ id: item.id, status: event.target.value as ApplicationStatus })} className="mt-2 w-full rounded-lg border p-1 text-xs"><option value="new">New</option><option value="shortlisted">Shortlisted</option><option value="on_hold">On hold</option><option value="rejected">Rejected</option></select>}</article>)}</div></div>)}</div></section>;
}
