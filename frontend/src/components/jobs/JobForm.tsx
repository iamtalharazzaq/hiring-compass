import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import type { z } from "zod";
import { jobSchema } from "../../features/jobs/schemas";
import type { Job, JobInput } from "../../features/jobs/types";
import { RequirementsSection } from "./RequirementsSection";
import { Select } from "../ui/Select";
import { WizardStepper } from "../ui/WizardStepper";

type Form = z.infer<typeof jobSchema>;
type Section = "role" | "workplace" | "requirements" | "review";
const sections: { id: Section; label: string; description: string }[] = [
  { id: "role", label: "Role details", description: "Define the role and its purpose." },
  { id: "workplace", label: "Work setup", description: "Set location, employment, and compensation." },
  { id: "requirements", label: "Requirements", description: "Define how candidates will be evaluated." },
  { id: "review", label: "Review", description: "Confirm the job details before saving." },
];

export function JobForm({ job, organizationId, initialSection = "role", submit, busy, error }: { job?: Job; organizationId: string; initialSection?: Section; cancelTo?: string; submit: (input: JobInput) => void; busy: boolean; error?: string }) {
  const initialIndex = Math.max(0, sections.findIndex((item) => item.id === initialSection));
  const { register, handleSubmit, trigger, getValues, formState: { errors, isValidating } } = useForm<Form>({
    resolver: zodResolver(jobSchema),
    defaultValues: job ? { ...job, description: job.description ?? "", location: job.location ?? "", experience_min_years: job.experience_min_years ?? undefined, experience_max_years: job.experience_max_years ?? undefined, salary_min: job.salary_min ? Number(job.salary_min) : undefined, salary_max: job.salary_max ? Number(job.salary_max) : undefined, salary_currency: job.salary_currency ?? "", employment_type: job.employment_type ?? "", workplace_type: job.workplace_type ?? "" } : {},
  });
  const [section, setSection] = useState<Section>(initialSection);
  const [furthestStep, setFurthestStep] = useState(initialIndex);
  const sectionIndex = sections.findIndex((item) => item.id === section);
  const moveTo = (index: number) => { if (index <= furthestStep) setSection(sections[index].id); };
  const next = async () => {
    const fields = section === "role" ? ["title", "description"] as const : section === "workplace" ? ["location", "employment_type", "workplace_type"] as const : [] as const;
    if (fields.length && !(await trigger(fields, { shouldFocus: true }))) return;
    if (sectionIndex === sections.length - 1) return;
    const nextIndex = sectionIndex + 1;
    setFurthestStep((current) => Math.max(current, nextIndex));
    setSection(sections[nextIndex].id);
  };
  const onSubmit = (data: Form) => submit({ ...data, description: data.description || null, location: data.location || null, employment_type: data.employment_type || null, workplace_type: data.workplace_type || null, experience_min_years: data.experience_min_years ?? null, experience_max_years: data.experience_max_years ?? null, salary_min: data.salary_min === undefined ? null : String(data.salary_min), salary_max: data.salary_max === undefined ? null : String(data.salary_max), salary_currency: data.salary_currency || null });
  const saveFromReview = handleSubmit(onSubmit);

  return <form onSubmit={(event) => event.preventDefault()} className="hc-job-wizard mt-8 max-w-5xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
    <WizardStepper steps={sections} current={sectionIndex} completedThrough={furthestStep} interactive={Boolean(job)} onStep={moveTo}/>

    <div className="mt-5"><h2 className="text-xl font-semibold">{sections[sectionIndex].label}</h2><p className="mt-1 text-sm text-[var(--color-muted)]">{sections[sectionIndex].description}</p></div>
    {section === "role" && <div id="job-role" role="tabpanel" className="hc-job-panel mt-7 grid gap-5"><label className="block text-sm font-medium">Title *<input {...register("title")} className="hc-form-control" /></label>{errors.title && <p role="alert" className="rounded-lg bg-[color-mix(in_srgb,var(--color-red)_12%,transparent)] px-3 py-2 text-sm text-[var(--color-red)]">Enter a job title with at least 3 characters.</p>}<label className="block text-sm font-medium">Description<textarea {...register("description")} rows={7} className="hc-form-control" /></label>{errors.description && <p role="alert" className="text-sm text-[var(--color-red)]">{errors.description.message}</p>}</div>}
    {section === "workplace" && <div id="job-workplace" role="tabpanel" className="hc-job-panel mt-7 grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">Work location<input {...register("location")} className="hc-form-control" /></label><label className="text-sm font-medium">Employment type<Select {...register("employment_type")} className="hc-form-control"><option value="">Select</option><option value="full_time">Full Time</option><option value="part_time">Part Time</option><option value="contract">Contract</option><option value="temporary">Temporary</option><option value="internship">Internship</option></Select></label><label className="text-sm font-medium">Workplace type<Select {...register("workplace_type")} className="hc-form-control"><option value="">Select</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On Site</option></Select></label><label className="block text-sm font-medium">Minimum experience in years<input type="number" {...register("experience_min_years")} className="hc-form-control" /></label><label className="block text-sm font-medium">Maximum experience in years<input type="number" {...register("experience_max_years")} className="hc-form-control" /></label><label className="block text-sm font-medium">Minimum salary<input type="number" {...register("salary_min")} className="hc-form-control" /></label><label className="block text-sm font-medium">Maximum salary<input type="number" {...register("salary_max")} className="hc-form-control" /></label><label className="block text-sm font-medium">Salary currency<input {...register("salary_currency")} className="hc-form-control" /></label></div>}
    {section === "requirements" && <div id="job-requirements" role="tabpanel" className="hc-job-panel">{job ? <RequirementsSection organizationId={organizationId} jobId={job.id} editable /> : <section className="mt-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-6"><div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--color-navy)_16%,transparent)] text-[var(--color-navy)]"><Plus size={18} aria-hidden="true"/></span><div><h3 className="font-semibold">Save this job to add requirements</h3><p className="mt-1 text-sm text-[var(--color-muted)]">Requirements are attached to a job draft so your team can add, edit, and reorder them safely.</p></div></div></section>}</div>}
    {section === "review" && <section className="hc-job-panel mt-7 grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-5 text-sm"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Role details</p><p className="mt-1 font-semibold">{getValues("title") || "Untitled job"}</p><p className="mt-2 whitespace-pre-wrap leading-6 text-[var(--color-muted)]">{getValues("description") || "No description added."}</p></div><div className="border-t border-[var(--color-border)] pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Work setup</p><p className="mt-1 text-[var(--color-muted)]">{[getValues("location") || "Location not set", getValues("employment_type")?.replaceAll("_", " ") || "Employment type not set", getValues("workplace_type") || "Workplace type not set"].join(" · ")}</p></div><div className="border-t border-[var(--color-border)] pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Requirements</p><p className="mt-1 text-[var(--color-muted)]">{job ? "Review requirements above before saving your changes." : "You can add requirements immediately after this draft is saved."}</p></div></section>}
    {error && <p role="alert" className="mt-6 rounded-xl bg-[color-mix(in_srgb,var(--color-red)_12%,transparent)] p-4 text-sm text-[var(--color-red)]">{error}</p>}
    <footer className="mt-7 flex items-center border-t border-[var(--color-border)] pt-5">{sectionIndex > 0 && <button type="button" onClick={() => moveTo(sectionIndex - 1)} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)]"><ArrowLeft size={16}/>Back</button>}<span className="ml-auto"/>{section === "review" ? <button type="button" onClick={saveFromReview} disabled={busy} className="hc-primary-action inline-flex items-center gap-2">{busy ? "Saving…" : job ? "Save changes" : "Save job"}</button> : <button type="button" disabled={isValidating} onClick={next} className="hc-primary-action inline-flex items-center gap-2">{isValidating ? "Checking…" : "Next"}<ArrowRight size={16}/></button>}</footer>
  </form>;
}
