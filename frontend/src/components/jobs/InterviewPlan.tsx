import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
  const [editingStage, setEditingStage] = useState<(typeof items)[number] | null>(null);
  const items = (data?.items ?? []).filter((stage) => stage.is_active);
  return (
    <section className="mt-8 rounded-2xl border bg-[var(--color-surface)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Interview plan</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Define the stages candidates move through.</p></div><span className="rounded-full bg-[var(--color-sage)] px-3 py-1 text-xs font-semibold text-[var(--color-teal)]">{items.length} {items.length === 1 ? "stage" : "stages"}</span></div>
      {isLoading ? (
        <p className="mt-3 text-sm">Loading stages…</p>
      ) : !items.length ? (
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          No stages yet. A practical plan often starts with recruiter screen,
          technical interview, hiring manager interview, and final interview.
        </p>
      ) : (
        <ol className="mt-5 space-y-3">
          {items.map((stage) => (
            <li
              key={stage.id}
              onClick={() => editable && setEditingStage(stage)}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-4 transition-colors hover:border-[var(--color-navy)]"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--color-sage)] text-xs font-semibold text-[var(--color-teal)]">
                {stage.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{stage.name}</p>
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
                    type="button"
                    aria-label={`Edit ${stage.name}`}
                    title="Edit stage"
                    onClick={(event) => { event.stopPropagation(); setEditingStage(stage); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-canvas)]"
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${stage.name}`}
                    title="Remove stage"
                    onClick={(event) => { event.stopPropagation(); actions.deactivate.mutate(stage.id); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] transition hover:bg-[var(--color-sage)] hover:text-[var(--color-red)]"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ol>
      )}
      {editable && (
        <form
          className="mt-5 grid gap-3 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-canvas)] p-4 sm:grid-cols-[1fr_7rem_auto] sm:items-end"
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
          <label className="text-xs font-medium text-[var(--color-muted)]">Stage name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Technical interview" className="hc-form-control mt-1 w-full" /></label>
          <label className="text-xs font-medium text-[var(--color-muted)]">Duration<input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            aria-label="Default duration in minutes"
            className="hc-form-control mt-1 w-full"
          /></label>
          <button className="hc-primary-action">
            Add stage
          </button>
        </form>
      )}
      {editingStage && editable && (
        <>
          <div className="fixed inset-0 z-40 bg-[var(--color-overlay)]" aria-hidden="true" />
          <form aria-label="Edit interview stage" className="fixed inset-0 z-50 m-auto grid h-fit w-[min(34rem,calc(100vw-2rem))] gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const stageName = String(form.get("name") || "").trim(); if (!stageName) return; actions.updateStage.mutate({ id: editingStage.id, body: { name: stageName, duration_minutes: Number(form.get("duration")) || undefined, description: String(form.get("description") || "") || null } }, { onSuccess: () => setEditingStage(null) }); }}>
            <div><h3 className="text-lg font-semibold">Edit interview stage</h3><p className="mt-1 text-sm text-[var(--color-muted)]">Update this stage in your interview plan.</p></div>
            <label className="text-sm font-medium">Stage name<input name="name" defaultValue={editingStage.name} className="hc-form-control mt-1 w-full" /></label>
            <div className="grid gap-3 sm:grid-cols-[1fr_7rem]"><label className="text-sm font-medium">Description<input name="description" defaultValue={editingStage.description ?? ""} className="hc-form-control mt-1 w-full" /></label><label className="text-sm font-medium">Duration<input name="duration" type="number" min="1" defaultValue={editingStage.duration_minutes ?? 45} className="hc-form-control mt-1 w-full" /></label></div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingStage(null)} className="rounded-full border px-4 py-2 text-sm">Cancel</button><button disabled={actions.updateStage.isPending} className="hc-primary-action">{actions.updateStage.isPending ? "Saving…" : "Save stage"}</button></div>
          </form>
        </>
      )}
    </section>
  );
}
