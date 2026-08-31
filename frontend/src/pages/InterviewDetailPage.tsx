import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../components/layout/AppShell";
import { FeedbackForm } from "../components/jobs/FeedbackForm";
import { useOrganization } from "../features/organizations/OrganizationProvider";
import {
  addCriterion,
  allInterviews,
  assignInterviewer,
  completeInterview,
  deactivateCriterion,
  removeAssignment,
  saveFeedback,
  saveScorecard,
  submitFeedback,
  updateFeedback,
  updateInterview,
} from "../features/interviews/api";
import {
  useAssignments,
  useFeedback,
  useMyFeedback,
  useScorecard,
} from "../features/interviews/queries";
import { apiClient } from "../lib/apiClient";

export function InterviewDetailPage() {
  const { interviewId = "" } = useParams();
  const { organization } = useOrganization();
  const org = organization?.organization.id ?? "";
  const role = organization?.role ?? "";
  const staff = ["admin", "recruiter", "hiring_manager"].includes(role);
  const recruiters = ["admin", "recruiter"].includes(role);
  const cache = useQueryClient();
  const [instructions, setInstructions] = useState("");
  const [criterion, setCriterion] = useState("");
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [editing, setEditing] = useState(false);
  const update = useMutation({
    mutationFn: (body: Parameters<typeof updateInterview>[2]) => updateInterview(org, interviewId, body),
    onSuccess: () => { setEditing(false); void interviews.refetch(); },
  });
  const complete = useMutation({
    mutationFn: () => completeInterview(org, interviewId),
    onSuccess: () => { void interviews.refetch(); },
  });
  const interviews = useQuery({
    queryKey: ["interviews", org, "upcoming"],
    queryFn: () => allInterviews(org),
    enabled: !!org,
  });
  const interview = interviews.data?.items.find(
    (item) => item.id === interviewId,
  );
  const assigned = useAssignments(org, interviewId);
  const mine = useMyFeedback(org, interviewId);
  const submitted = useFeedback(org, interviewId);
  const card = useScorecard(
    org,
    interview?.interview_stage_id ?? "",
    staff ? undefined : interviewId,
  );
  const members = useQuery({
    queryKey: ["members", org],
    queryFn: () =>
      apiClient<{
        members: {
          user: { id: string; display_name: string };
          membership: { is_active: boolean };
        }[];
      }>(`/api/v1/organizations/${org}/members`),
    enabled: !!org && staff,
  });
  const refresh = () => {
    void cache.invalidateQueries({
      queryKey: ["assignments", org, interviewId],
    });
    void cache.invalidateQueries({ queryKey: ["scorecard", org] });
    void cache.invalidateQueries({
      queryKey: ["my-feedback", org, interviewId],
    });
    void cache.invalidateQueries({ queryKey: ["feedback", org, interviewId] });
  };
  const assign = useMutation({
    mutationFn: (id: string) => assignInterviewer(org, interviewId, id),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (id: string) => removeAssignment(org, id),
    onSuccess: refresh,
  });
  const save = useMutation({
    mutationFn: (body: Parameters<typeof saveFeedback>[2]) =>
      mine.data?.feedback
        ? updateFeedback(org, mine.data.feedback.id, body)
        : saveFeedback(org, interviewId, body),
    onSuccess: refresh,
  });
  const submit = useMutation({
    mutationFn: () => submitFeedback(org, mine.data!.feedback!.id),
    onSuccess: refresh,
  });
  const configure = useMutation({
    mutationFn: async () => {
      await saveScorecard(org, interview!.interview_stage_id, {
        title: card.data?.scorecard?.title || "Interview scorecard",
        instructions,
      });
      if (criterion.trim() && card.data?.scorecard?.id) {
        await addCriterion(org, card.data.scorecard.id, { name: criterion.trim(), is_required: true });
      }
    },
    onSuccess: () => { setCriterion(""); setEditingInstructions(false); refresh(); },
  });
  const deactivate = useMutation({
    mutationFn: (id: string) => deactivateCriterion(org, id),
    onSuccess: refresh,
  });
  if (!interview)
    return (
      <AppShell title="Interview">
        <p className="mt-6">
          {interviews.isLoading
            ? "Loading interview…"
            : "Interview was not found or is no longer available."}
        </p>
      </AppShell>
    );
  const names = new Map(
    members.data?.members.map((member) => [
      member.user.id,
      member.user.display_name,
    ]),
  );
  const scorecard = card.data?.scorecard;
  return (
    <AppShell title="Interview">
      <header className="relative">
        <p className="text-sm font-semibold text-[var(--color-teal)]">
          Interview
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Interview details</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          {new Date(interview.scheduled_at).toLocaleString()} ·{" "}
          {interview.duration_minutes} minutes ·{" "}
          {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>
        <p className="mt-1 text-sm">
          {interview.location_or_meeting_details ||
            "No meeting or location details"}
        </p>
        {recruiters && interview.status === "scheduled" && <button type="button" onClick={() => complete.mutate()} disabled={complete.isPending} className="mt-4 rounded-full bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white">{complete.isPending ? "Completing…" : "Mark completed"}</button>}
        {recruiters && !editing && <button type="button" aria-label="Edit interview" title="Edit interview" onClick={() => setEditing(true)} className="absolute right-0 top-0 inline-flex items-center rounded-xl border p-2 text-sm font-semibold"><Pencil size={16} aria-hidden="true" /></button>}
        {editing && <><div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" aria-hidden="true" /><form aria-label="Edit interview details" className="fixed inset-0 z-50 m-auto grid h-fit max-h-[90vh] w-[min(34rem,calc(100vw-2rem))] gap-3 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const scheduled = String(form.get("scheduled_at") || ""); if (!scheduled) return; update.mutate({ scheduled_at: new Date(scheduled).toISOString(), duration_minutes: Number(form.get("duration_minutes")) || interview.duration_minutes, location_or_meeting_details: String(form.get("details") || "") }); }}>
          <div className="sm:col-span-2"><h2 className="text-lg font-semibold">Edit interview</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Update the date, time, duration, or meeting details.</p></div>
          <label className="text-sm">Date and time<input required name="scheduled_at" type="datetime-local" defaultValue={new Date(interview.scheduled_at).toISOString().slice(0, 16)} className="hc-form-control mt-1 w-full" /></label>
          <label className="text-sm">Duration (minutes)<input required name="duration_minutes" type="number" min="1" defaultValue={interview.duration_minutes} className="hc-form-control mt-1 w-full" /></label>
          <label className="text-sm sm:col-span-2">Location or meeting details<input name="details" defaultValue={interview.location_or_meeting_details ?? ""} className="hc-form-control mt-1 w-full" /></label>
          <div className="flex gap-2 sm:col-span-2"><button type="button" onClick={() => setEditing(false)} className="rounded-xl border px-4 py-2 text-sm">Cancel</button><button disabled={update.isPending} className="hc-primary-action">{update.isPending ? "Saving…" : "Save changes"}</button></div>
          {update.error && <p role="alert" className="text-sm text-[var(--color-red)] sm:col-span-2">{update.error.message}</p>}
        </form></>}
      </header>
      <section className="mt-6 rounded-2xl border bg-[var(--color-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Assigned interviewers</h2>
          {staff && (
            <select
              aria-label="Add interviewer"
              defaultValue=""
              onChange={(event) => {
                if (event.target.value) assign.mutate(event.target.value);
                event.target.value = "";
              }}
              className="rounded-lg border bg-[var(--color-surface)] px-3 py-2 text-sm"
            >
              <option value="">Add an active organization member</option>
              {members.data?.members
                .filter(
                  (member) =>
                    member.membership.is_active &&
                    !assigned.data?.items.some(
                      (item) => item.user_id === member.user.id,
                    ),
                )
                .map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.display_name}
                  </option>
                ))}
            </select>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {assigned.data?.items.length ? (
            assigned.data.items.map((item) => (
              <p
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-4 py-3 text-sm"
              >
                {names.get(item.user_id) ?? item.user_id}
                {staff && (
                  <button
                    type="button"
                    aria-label={`Remove ${names.get(item.user_id) ?? "interviewer"}`}
                    title="Remove interviewer"
                    onClick={() => remove.mutate(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-sage)] hover:text-[var(--color-red)]"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                )}
              </p>
            ))
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              No interviewers assigned.
            </p>
          )}
        </div>
      </section>
      {scorecard ? (
        <section className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-3"><h2 className="text-lg font-semibold">{scorecard.title}</h2><span className="rounded-full bg-[var(--color-sage)] px-3 py-1 text-xs font-semibold text-[var(--color-teal)]">{scorecard.criteria.length} criteria</span></div><p className="mt-1 text-sm text-[var(--color-muted)]">Define what interviewers should evaluate consistently.</p></div>{recruiters && <button type="button" aria-label="Edit interview scorecard" title="Edit interview scorecard" onClick={() => { setInstructions(scorecard.instructions ?? ""); setEditingInstructions(true); }} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[var(--color-text)]"><Pencil size={20} aria-hidden="true" /></button>}</div>
          {scorecard.instructions && <p className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-4 text-sm leading-6 text-[var(--color-muted)]">{scorecard.instructions}</p>}
          {recruiters && (
            <>
              {editingInstructions && <><div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" aria-hidden="true" /><form aria-label="Edit interview scorecard" className="fixed inset-0 z-50 m-auto grid h-fit max-h-[90vh] w-[min(42rem,calc(100vw-2rem))] gap-4 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl" onSubmit={(event) => { event.preventDefault(); configure.mutate(); }}>
                <div><h3 className="text-lg font-semibold">Edit interview scorecard</h3><p className="mt-1 text-sm text-[var(--color-muted)]">Update the instructions and criteria used by interviewers.</p></div>
                <label className="text-sm font-medium">Scorecard instructions<textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} className="hc-form-control mt-1 min-h-28 w-full" /></label>
                <label className="text-sm font-medium">New criterion <span className="font-normal text-[var(--color-muted)]">(optional)</span><input value={criterion} onChange={(event) => setCriterion(event.target.value)} placeholder="Add a criterion" className="hc-form-control mt-1 w-full" /></label>
                <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingInstructions(false)} className="rounded-full border px-4 py-2 text-sm">Cancel</button><button disabled={configure.isPending} className="hc-primary-action">{configure.isPending ? "Saving…" : "Save scorecard"}</button></div>
                {configure.error && <p role="alert" className="text-sm text-[var(--color-red)]">{configure.error.message}</p>}
              </form></>}
            </>
          )}
          <div className="mt-5 space-y-2">
            {scorecard.criteria.map((item) => (
              <p key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] px-4 py-3 text-sm">
                <span><span className="mr-2 text-[var(--color-muted)]">{item.position}.</span><strong>{item.name}</strong>{item.is_required && <span className="ml-2 rounded-full bg-[var(--color-sage)] px-2 py-1 text-xs font-semibold text-[var(--color-teal)]">Required</span>}</span>
                {staff && item.is_active && (
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    title="Remove criterion"
                    onClick={() => deactivate.mutate(item.id)}
                    className="ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-sage)] hover:text-[var(--color-red)]"
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                )}
              </p>
            ))}
          </div>
        </section>
      ) : (
        recruiters && (
          <section className="mt-6 rounded-2xl border p-5">
            <h2 className="font-semibold">Scorecard</h2>
            <button
              onClick={() => configure.mutate()}
              className="mt-3 rounded-lg bg-[var(--color-navy)] px-3 py-2 text-sm text-white"
            >
              Create scorecard
            </button>
          </section>
        )
      )}
      {!staff && scorecard && (
        <section className="mt-6">
          <FeedbackForm
            criteria={scorecard.criteria}
            feedback={mine.data?.feedback ?? null}
            saving={save.isPending || submit.isPending}
            onSave={(body) => save.mutate(body)}
            onSubmit={() => {
              if (
                window.confirm(
                  "Submit this feedback? It cannot be changed after submission.",
                )
              )
                submit.mutate();
            }}
          />
        </section>
      )}
      {staff && (
        <section className="mt-6 rounded-2xl border bg-[var(--color-surface)] p-5">
          <h2 className="text-lg font-semibold">Feedback overview</h2>
          {submitted.data?.items.length ? (
            submitted.data.items.map((item) => (
              <article key={item.id} className="mt-3 border-t pt-3 text-sm">
                <p className="font-medium">
                  Recommendation:{" "}
                  {item.recommendation?.replace("_", " ") ?? "Not provided"}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[var(--color-muted)]">
                  {item.summary || "No summary provided."}
                </p>
              </article>
            ))
          ) : (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              No submitted feedback yet.
            </p>
          )}
        </section>
      )}
    </AppShell>
  );
}
