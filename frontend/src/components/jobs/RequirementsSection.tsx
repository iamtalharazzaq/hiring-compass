import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "../ui/Select";
import { Reorder } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRequirements, useJobMutation } from "../../features/jobs/queries";
import type {
  JobRequirement,
  RequirementInput,
} from "../../features/jobs/types";

const schema = z.object({
  requirement_type: z.enum(["required", "preferred"]),
  category: z.enum([
    "skill",
    "experience",
    "education",
    "responsibility",
    "certification",
    "other",
  ]),
  content: z.string().trim().min(3).max(500),
});
type Form = z.infer<typeof schema>;
const categoryLabel = (value: string) =>
  value[0].toUpperCase() + value.slice(1);

export function RequirementsSection({
  organizationId,
  jobId,
  editable,
}: {
  organizationId: string;
  jobId: string;
  editable: boolean;
}) {
  const { data, isLoading, error } = useRequirements(organizationId, jobId);
  const mutations = useJobMutation(organizationId);
  const [editing, setEditing] = useState<JobRequirement | null | undefined>();
  const [items, setItems] = useState<JobRequirement[]>([]);
  const [dragging, setDragging] = useState(false);
  useEffect(() => setItems(data?.items ?? []), [data]);
  const saveOrder = (next: JobRequirement[]) => {
    setItems(next);
    mutations.reorderRequirements.mutate({
      jobId,
      ids: next.map((item) => item.id),
    });
  };
  const move = (item: JobRequirement, direction: -1 | 1) => {
    const index = items.indexOf(item);
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    saveOrder(next);
  };
  return (
    <section className="mt-8 rounded-2xl border bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Requirements <span className="ml-2 rounded-full bg-[var(--color-sage)] px-2 py-1 text-xs text-[var(--color-teal)]">{items.length}</span></h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Define what this role needs before it moves to review.
          </p>
        </div>
        {editable && items.length > 0 && (
          <button
            onClick={() => setEditing(null)}
            className="hc-primary-action rounded-full px-4 py-2 text-sm"
          >
            Add requirement
          </button>
        )}
      </div>
      {isLoading && (
        <p className="mt-5 text-sm text-[var(--color-muted)]">
          Loading requirements…
        </p>
      )}
      {error && (
        <p className="mt-5 text-sm text-[var(--color-red)]">{error.message}</p>
      )}
      {editing !== undefined && (
        <RequirementForm
          initial={editing ?? undefined}
          busy={
            mutations.createRequirement.isPending ||
            mutations.updateRequirement.isPending
          }
          error={
            mutations.createRequirement.error?.message ??
            mutations.updateRequirement.error?.message
          }
          onCancel={() => setEditing(undefined)}
          onSave={(input) => {
            if (editing)
              mutations.updateRequirement.mutate(
                { jobId, requirementId: editing.id, input },
                { onSuccess: () => setEditing(undefined) },
              );
            else
              mutations.createRequirement.mutate(
                { jobId, input },
                { onSuccess: () => setEditing(undefined) },
              );
          }}
        />
      )}
      {!isLoading && !error && !items.length && editing === undefined && <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] px-5 py-8 text-center"><h3 className="font-semibold">No requirements added yet</h3><p className="mt-2 text-sm text-[var(--color-muted)]">Requirements help define the role and give your team a consistent way to evaluate candidates.</p>{editable && <button onClick={() => setEditing(null)} className="hc-primary-action mt-4 rounded-full px-4 py-2 text-sm">Add your first requirement</button>}</div>}
      <div className="mt-5 space-y-5">
        {(["required", "preferred"] as const).map((type) => (
          items.some((item) => item.requirement_type === type) ? <div key={type}>
            <h3 className="text-sm font-semibold text-[var(--color-teal)]">
              {type === "required" ? "Required" : "Preferred"}
            </h3>
            <Reorder.Group axis="y" values={items.filter((item) => item.requirement_type === type)} onReorder={(next) => saveOrder([...next, ...items.filter((item) => item.requirement_type !== type)])} className="mt-2 space-y-2">
              {items.filter((item) => item.requirement_type === type).map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    drag={editable ? "y" : false}
                    onClick={() => editable && !dragging && setEditing(item)}
                    onDragStart={() => setDragging(true)}
                    onDragEnd={() => setDragging(false)}
                    role={editable ? "button" : undefined}
                    tabIndex={editable ? 0 : undefined}
                    onKeyDown={(event) => { if (editable && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setEditing(item); } }}
                    className="flex items-center gap-3 rounded-xl border bg-white p-3"
                  >
                    {editable && <GripVertical size={18} aria-hidden="true" className="shrink-0 text-[var(--color-muted)]" />}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-[var(--color-muted)]">
                        {categoryLabel(item.category)}
                      </span>
                      <p className="mt-1 text-sm">{item.content}</p>
                    </div>
                    {editable && (
                      <div className="requirement-actions flex shrink-0 gap-1">
                        <button
                          aria-label="Move requirement up"
                          onClick={() => move(item, -1)}
                          className="rounded-lg px-2 py-1 text-sm"
                        >
                          <ArrowUp size={14} aria-hidden="true" />
                        </button>
                        <button
                          aria-label="Move requirement down"
                          onClick={() => move(item, 1)}
                          className="rounded-lg px-2 py-1 text-sm"
                        >
                          <ArrowDown size={14} aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Edit ${item.content}`}
                          title="Edit requirement"
                          onClick={() => setEditing(item)}
                          className="rounded-lg px-2 py-1 text-sm"
                        >
                          <Pencil size={18} aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Delete ${item.content}`}
                          title="Delete requirement"
                          onClick={() =>
                            mutations.deleteRequirement.mutate({
                              jobId,
                              requirementId: item.id,
                            })
                          }
                          className="rounded-lg px-2 py-1 text-sm text-[var(--color-red)]"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </Reorder.Item>
                ))}
            </Reorder.Group>
          </div> : null
        ))}
      </div>
    </section>
  );
}

function RequirementForm({
  initial,
  busy,
  error,
  onSave,
  onCancel,
}: {
  initial?: JobRequirement;
  busy: boolean;
  error?: string;
  onSave: (input: RequirementInput) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: initial });
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]" aria-hidden="true" />
      <form
        aria-label={initial ? "Edit requirement" : "Add requirement"}
        onSubmit={handleSubmit(onSave)}
        className="fixed inset-0 z-50 m-auto grid h-fit max-h-[90vh] w-[min(36rem,calc(100vw-2rem))] gap-4 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl"
      >
      <div><h2 className="text-lg font-semibold">{initial ? "Edit requirement" : "Add requirement"}</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Define a clear requirement for this role.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Requirement type
          <Select
            {...register("requirement_type")}
            className="mt-1 w-full rounded-lg border bg-white p-2"
          >
            <option value="required">Required</option>
            <option value="preferred">Preferred</option>
          </Select>
        </label>
        <label className="text-sm font-medium">
          Category
          <Select
            {...register("category")}
            className="mt-1 w-full rounded-lg border bg-white p-2"
          >
            {[
              "skill",
              "experience",
              "education",
              "responsibility",
              "certification",
              "other",
            ].map((value) => (
              <option key={value} value={value}>
                {categoryLabel(value)}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <label className="mt-3 block text-sm font-medium">
        Requirement text
        <textarea
          {...register("content")}
          rows={3}
          className="mt-1 w-full rounded-lg border bg-white p-2"
        />
      </label>
      <p className="text-sm text-[var(--color-red)]">
        {errors.content?.message ?? error}
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          disabled={busy}
          className="rounded-lg bg-[var(--color-navy)] px-3 py-2 text-sm font-semibold text-white"
        >
          {busy ? "Saving…" : "Save requirement"}
        </button>
      </div>
      </form>
    </>
  );
}
