import { zodResolver } from "@hookform/resolvers/zod";
import { Reorder } from "framer-motion";
import { useEffect, useState } from "react";
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
          <h2 className="text-lg font-semibold">Requirements</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Define what this role needs before it moves to review.
          </p>
        </div>
        {editable && (
          <button
            onClick={() => setEditing(null)}
            className="rounded-xl border px-3 py-2 text-sm font-semibold"
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
      <div className="mt-5 space-y-5">
        {(["required", "preferred"] as const).map((type) => (
          <div key={type}>
            <h3 className="text-sm font-semibold text-[var(--color-teal)]">
              {type === "required" ? "Required" : "Preferred"}
            </h3>
            <Reorder.Group axis="y" values={items.filter((item) => item.requirement_type === type)} onReorder={(next) => saveOrder([...next, ...items.filter((item) => item.requirement_type !== type)])} className="mt-2 space-y-2">
              {items.filter((item) => item.requirement_type === type).map((item) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    drag={editable ? "y" : false}
                    className="flex items-center gap-3 rounded-xl border bg-white p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-[var(--color-muted)]">
                        {categoryLabel(item.category)}
                      </span>
                      <p className="mt-1 text-sm">{item.content}</p>
                    </div>
                    {editable && (
                      <div className="flex shrink-0 gap-1">
                        <button
                          aria-label="Move requirement up"
                          onClick={() => move(item, -1)}
                          className="rounded-lg px-2 py-1 text-sm"
                        >
                          ↑
                        </button>
                        <button
                          aria-label="Move requirement down"
                          onClick={() => move(item, 1)}
                          className="rounded-lg px-2 py-1 text-sm"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => setEditing(item)}
                          className="rounded-lg px-2 py-1 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            mutations.deleteRequirement.mutate({
                              jobId,
                              requirementId: item.id,
                            })
                          }
                          className="rounded-lg px-2 py-1 text-sm text-[var(--color-red)]"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </Reorder.Item>
                ))}
            </Reorder.Group>
          </div>
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
    <form
      onSubmit={handleSubmit(onSave)}
      className="mt-5 rounded-xl bg-[var(--color-canvas)] p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Requirement type
          <select
            {...register("requirement_type")}
            className="mt-1 w-full rounded-lg border bg-white p-2"
          >
            <option value="required">Required</option>
            <option value="preferred">Preferred</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Category
          <select
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
          </select>
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
  );
}
