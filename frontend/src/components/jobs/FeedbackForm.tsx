import { useEffect, useState } from "react";
import type { Criterion, Feedback } from "../../features/interviews/api";

type Draft = {
  overall_rating: number | null;
  recommendation: string | null;
  summary: string;
  items: {
    criterion_id: string;
    rating: number | null;
    notes: string | null;
  }[];
};
export function FeedbackForm({
  criteria,
  feedback,
  saving,
  onSave,
  onSubmit,
}: {
  criteria: Criterion[];
  feedback: Feedback | null;
  saving: boolean;
  onSave: (draft: Draft) => void;
  onSubmit: () => void;
}) {
  const [draft, setDraft] = useState<Draft>({
    overall_rating: null,
    recommendation: null,
    summary: "",
    items: [],
  });
  useEffect(() => {
    setDraft({
      overall_rating: feedback?.overall_rating ?? null,
      recommendation: feedback?.recommendation ?? null,
      summary: feedback?.summary ?? "",
      items: criteria
        .filter((item) => item.is_active)
        .map((criterion) => ({
          criterion_id: criterion.id,
          rating:
            feedback?.items.find((item) => item.criterion_id === criterion.id)
              ?.rating ?? null,
          notes:
            feedback?.items.find((item) => item.criterion_id === criterion.id)
              ?.notes ?? "",
        })),
    });
  }, [criteria, feedback]);
  const update = (id: string, values: Partial<Draft["items"][number]>) =>
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.criterion_id === id ? { ...item, ...values } : item,
      ),
    }));
  if (feedback?.status === "submitted")
    return (
      <section className="rounded-2xl border bg-[var(--color-surface)] p-5">
        <h2 className="text-lg font-semibold">Feedback submitted</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Your submitted feedback is part of the internal hiring record and
          cannot be edited.
        </p>
      </section>
    );
  return (
    <form
      className="space-y-5 rounded-2xl border bg-[var(--color-surface)] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <header>
        <h2 className="text-lg font-semibold">Interview feedback</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Rate each criterion from 1 (Strong concern) to 5 (Exceptional).
        </p>
      </header>
      {criteria
        .filter((item) => item.is_active)
        .map((criterion) => {
          const item = draft.items.find(
            (value) => value.criterion_id === criterion.id,
          );
          return (
            <fieldset key={criterion.id} className="border-t pt-4">
              <legend className="font-medium">
                {criterion.name}
                {criterion.is_required && (
                  <span className="text-[var(--color-red)]"> *</span>
                )}
              </legend>
              {criterion.description && (
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {criterion.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label key={rating} className="text-sm">
                    <input
                      type="radio"
                      name={criterion.id}
                      checked={item?.rating === rating}
                      onChange={() => update(criterion.id, { rating })}
                    />{" "}
                    {rating}
                  </label>
                ))}
              </div>
              <textarea
                aria-label={`${criterion.name} notes`}
                required={criterion.is_required}
                value={item?.notes ?? ""}
                onChange={(event) =>
                  update(criterion.id, { notes: event.target.value })
                }
                className="mt-3 min-h-20 w-full rounded-lg border bg-[var(--color-surface)] p-2 text-sm"
                placeholder="Notes"
              />
            </fieldset>
          );
        })}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Overall rating
          <select
            value={draft.overall_rating ?? ""}
            onChange={(event) =>
              setDraft({
                ...draft,
                overall_rating: event.target.value
                  ? Number(event.target.value)
                  : null,
              })
            }
            className="mt-1 block w-full rounded-lg border bg-[var(--color-surface)] p-2"
          >
            <option value="">Not observed</option>
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Recommendation
          <select
            value={draft.recommendation ?? ""}
            onChange={(event) =>
              setDraft({ ...draft, recommendation: event.target.value || null })
            }
            className="mt-1 block w-full rounded-lg border bg-[var(--color-surface)] p-2"
          >
            <option value="">No recommendation</option>
            {["strong_yes", "yes", "mixed", "no", "strong_no"].map((value) => (
              <option key={value} value={value}>
                {value.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium">
        Summary
        <textarea
          value={draft.summary}
          onChange={(event) =>
            setDraft({ ...draft, summary: event.target.value })
          }
          className="mt-1 min-h-24 w-full rounded-lg border bg-[var(--color-surface)] p-2"
        />
      </label>
      <p className="text-xs text-[var(--color-muted)]">
        Submitted feedback becomes part of the internal hiring record.
      </p>
      <div className="flex gap-2">
        <button
          disabled={saving}
          className="rounded-xl bg-[var(--color-navy)] px-3 py-2 text-sm font-semibold text-white"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={saving || !feedback}
          onClick={onSubmit}
          className="rounded-xl border px-3 py-2 text-sm font-semibold"
        >
          Submit final feedback
        </button>
      </div>
    </form>
  );
}
