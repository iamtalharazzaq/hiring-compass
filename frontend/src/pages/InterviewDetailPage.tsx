import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "../components/layout/AppShell";
import { FeedbackForm } from "../components/jobs/FeedbackForm";
import { useOrganization } from "../features/organizations/OrganizationProvider";
import {
  addCriterion,
  allInterviews,
  assignInterviewer,
  deactivateCriterion,
  removeAssignment,
  saveFeedback,
  saveScorecard,
  submitFeedback,
  updateFeedback,
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
  const [criterion, setCriterion] = useState("");
  const [instructions, setInstructions] = useState("");
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
    mutationFn: () =>
      saveScorecard(org, interview!.interview_stage_id, {
        title: card.data?.scorecard?.title || "Interview scorecard",
        instructions,
      }),
    onSuccess: refresh,
  });
  const add = useMutation({
    mutationFn: () =>
      addCriterion(org, card.data!.scorecard!.id, {
        name: criterion,
        is_required: true,
      }),
    onSuccess: () => {
      setCriterion("");
      refresh();
    },
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
      <header>
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
      </header>
      <section className="mt-6 rounded-2xl border bg-[var(--color-surface)] p-5">
        <h2 className="text-lg font-semibold">Assigned interviewers</h2>
        {staff && (
          <select
            aria-label="Add interviewer"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) assign.mutate(event.target.value);
              event.target.value = "";
            }}
            className="mt-3 rounded-lg border bg-[var(--color-surface)] p-2 text-sm"
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
        <div className="mt-3 space-y-2">
          {assigned.data?.items.length ? (
            assigned.data.items.map((item) => (
              <p
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                {names.get(item.user_id) ?? item.user_id}
                {staff && (
                  <button
                    onClick={() => remove.mutate(item.id)}
                    className="underline"
                  >
                    Remove
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
        <section className="mt-6 rounded-2xl border bg-[var(--color-surface)] p-5">
          <h2 className="text-lg font-semibold">{scorecard.title}</h2>
          {scorecard.instructions && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-muted)]">
              {scorecard.instructions}
            </p>
          )}
          {recruiters && (
            <>
              <label className="mt-4 block text-sm font-medium">
                Scorecard instructions
                <textarea
                  defaultValue={scorecard.instructions ?? ""}
                  onChange={(event) => setInstructions(event.target.value)}
                  className="mt-1 w-full rounded-lg border bg-[var(--color-surface)] p-2"
                />
              </label>
              <button
                onClick={() => configure.mutate()}
                className="mt-2 rounded-lg border px-3 py-2 text-sm"
              >
                Save instructions
              </button>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (criterion.trim()) add.mutate();
                }}
                className="mt-4 flex gap-2"
              >
                <input
                  value={criterion}
                  onChange={(event) => setCriterion(event.target.value)}
                  placeholder="Add criterion"
                  className="min-w-0 flex-1 rounded-lg border p-2 text-sm"
                />
                <button className="rounded-lg border px-3 text-sm">Add</button>
              </form>
            </>
          )}
          <div className="mt-4 space-y-2">
            {scorecard.criteria.map((item) => (
              <p key={item.id} className="text-sm">
                {item.position}. {item.name}
                {item.is_required ? " · Required" : ""}
                {recruiters && item.is_active && (
                  <button
                    onClick={() => deactivate.mutate(item.id)}
                    className="ml-2 underline"
                  >
                    Deactivate
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
