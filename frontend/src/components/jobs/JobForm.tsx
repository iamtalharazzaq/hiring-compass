import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { jobSchema } from "../../features/jobs/schemas";
import type { Job, JobInput } from "../../features/jobs/types";
type Form = z.infer<typeof jobSchema>;
const fields: { key: keyof Form; label: string; type?: string }[] = [
  { key: "title", label: "Title *" },
  { key: "location", label: "Location" },
  {
    key: "experience_min_years",
    label: "Minimum experience in years",
    type: "number",
  },
  {
    key: "experience_max_years",
    label: "Maximum experience in years",
    type: "number",
  },
  { key: "salary_min", label: "Minimum salary", type: "number" },
  { key: "salary_max", label: "Maximum salary", type: "number" },
  { key: "salary_currency", label: "Salary currency" },
];
export function JobForm({
  job,
  submit,
  busy,
  error,
}: {
  job?: Job;
  submit: (input: JobInput) => void;
  busy: boolean;
  error?: string;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(jobSchema),
    defaultValues: job
      ? {
          ...job,
          description: job.description ?? "",
          location: job.location ?? "",
          experience_min_years: job.experience_min_years ?? undefined,
          experience_max_years: job.experience_max_years ?? undefined,
          salary_min: job.salary_min ? Number(job.salary_min) : undefined,
          salary_max: job.salary_max ? Number(job.salary_max) : undefined,
          salary_currency: job.salary_currency ?? "",
          employment_type: job.employment_type ?? "",
          workplace_type: job.workplace_type ?? "",
        }
      : {},
  });
  const onSubmit = (data: Form) =>
    submit({
      ...data,
      description: data.description || null,
      location: data.location || null,
      employment_type: data.employment_type || null,
      workplace_type: data.workplace_type || null,
      experience_min_years: data.experience_min_years ?? null,
      experience_max_years: data.experience_max_years ?? null,
      salary_min:
        data.salary_min === undefined ? null : String(data.salary_min),
      salary_max:
        data.salary_max === undefined ? null : String(data.salary_max),
      salary_currency: data.salary_currency || null,
    });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <label className="block text-sm font-medium">
        {fields[0].label}
        <input
          {...register("title")}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3"
        />
      </label>
      <p className="text-sm text-[var(--color-red)]">{errors.title?.message}</p>
      <label className="block text-sm font-medium">
        Description
        <textarea
          {...register("description")}
          rows={5}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3"
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.slice(1).map(({ key, label, type }) => (
          <label key={key} className="block text-sm font-medium">
            {label}
            <input
              type={type}
              {...register(key)}
              className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3"
            />
          </label>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Employment type
          <select
            {...register("employment_type")}
            className="mt-2 w-full rounded-xl border bg-white px-4 py-3"
          >
            <option value="">Select</option>
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="internship">Internship</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Workplace type
          <select
            {...register("workplace_type")}
            className="mt-2 w-full rounded-xl border bg-white px-4 py-3"
          >
            <option value="">Select</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </label>
      </div>
      {error && <p className="text-sm text-[var(--color-red)]">{error}</p>}
      <button
        disabled={busy}
        className="rounded-xl bg-[var(--color-navy)] px-5 py-3 text-sm font-semibold text-white"
      >
        {busy ? "Saving…" : "Save job"}
      </button>
    </form>
  );
}
