import { useState } from "react";
import {
  useInterviewActions,
  useStages,
} from "../../features/interviews/queries";
export function InterviewPlan({
  organizationId,
  jobId,
  editable,
}: {
  organizationId: string;
  jobId: string;
  editable: boolean;
}) {
  const { data, isLoading } = useStages(organizationId, jobId);
  const actions = useInterviewActions(organizationId, jobId);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("45");
  const items = data?.items ?? [];
  const move = (index: number, change: number) => {
    const next = [...items];
    [next[index], next[index + change]] = [next[index + change], next[index]];
    actions.reorder.mutate(next.map((x) => x.id));
  };
  return (
    <section className="mt-8 rounded-2xl border bg-[var(--color-surface)] p-6">
      <h2 className="text-lg font-semibold">Interview plan</h2>
      {isLoading ? (
        <p className="mt-3 text-sm">Loading stages…</p>
      ) : !items.length ? (
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          No stages yet. A practical plan often starts with recruiter screen,
          technical interview, hiring manager interview, and final interview.
        </p>
      ) : (
        <ol className="mt-4 space-y-2">
          {items.map((stage, index) => (
            <li
              key={stage.id}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              <span className="text-sm text-[var(--color-muted)]">
                {stage.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {stage.name}{" "}
                  {!stage.is_active && (
                    <span className="text-xs text-[var(--color-muted)]">
                      Inactive
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {stage.description || "No description"}
                  {stage.duration_minutes
                    ? ` · ${stage.duration_minutes} min`
                    : ""}
                </p>
              </div>
              {editable && (
                <>
                  <button
                    aria-label={`Move ${stage.name} up`}
                    disabled={!index}
                    onClick={() => move(index, -1)}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    ↑
                  </button>
                  <button
                    aria-label={`Move ${stage.name} down`}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    ↓
                  </button>
                  {stage.is_active && (
                    <button
                      onClick={() => actions.deactivate.mutate(stage.id)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      Deactivate
                    </button>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      )}
      {editable && (
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim())
              actions.addStage.mutate({
                name,
                description: null,
                duration_minutes: Number(duration) || undefined,
              });
            setName("");
          }}
        >
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Stage name"
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            aria-label="Default duration in minutes"
            className="w-24 rounded-lg border px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-[var(--color-navy)] px-3 py-2 text-sm font-semibold text-white">
            Add stage
          </button>
        </form>
      )}
    </section>
  );
}
