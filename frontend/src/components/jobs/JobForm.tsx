import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import type { z } from "zod";
import { jobSchema } from "../../features/jobs/schemas";
import type { Job, JobInput, RequirementInput } from "../../features/jobs/types";
import { RequirementsSection } from "./RequirementsSection";
import { Dropdown } from "../ui/Dropdown";
import { WizardStepper } from "../ui/WizardStepper";

type Form = z.infer<typeof jobSchema>;
type Section = "role" | "workplace" | "requirements" | "review";
const sections: { id: Section; label: string; description: string }[] = [
  { id: "role", label: "Role details", description: "Define the role and its purpose." },
  { id: "workplace", label: "Work setup", description: "Set location, employment, and compensation." },
  { id: "requirements", label: "Requirements", description: "Define how candidates will be evaluated." },
  { id: "review", label: "Review", description: "Confirm the job details before saving." },
];

export function JobForm({ job, organizationId, initialSection = "role", submit, busy, error }: { job?: Job; organizationId: string; initialSection?: Section; cancelTo?: string; submit: (input: JobInput, requirements?: RequirementInput[]) => void; busy: boolean; error?: string }) {
  const initialIndex = Math.max(0, sections.findIndex((item) => item.id === initialSection));
  const { register, handleSubmit, trigger, getValues, setValue, watch, formState: { errors, isValidating } } = useForm<Form>({
    resolver: zodResolver(jobSchema),
    defaultValues: job ? { ...job, description: job.description ?? "", location: job.location ?? "", experience_min_years: job.experience_min_years ?? undefined, experience_max_years: job.experience_max_years ?? undefined, salary_min: job.salary_min ? Number(job.salary_min) : undefined, salary_max: job.salary_max ? Number(job.salary_max) : undefined, salary_currency: job.salary_currency ?? "", employment_type: job.employment_type ?? "", workplace_type: job.workplace_type ?? "" } : {},
  });
  const [section, setSection] = useState<Section>(initialSection);
  const [requirements, setRequirements] = useState<RequirementInput[]>([]);
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
  const onSubmit = (data: Form) => submit({ ...data, description: data.description || null, location: data.location || null, employment_type: data.employment_type || null, workplace_type: data.workplace_type || null, experience_min_years: data.experience_min_years ?? null, experience_max_years: data.experience_max_years ?? null, salary_min: data.salary_min === undefined ? null : String(data.salary_min), salary_max: data.salary_max === undefined ? null : String(data.salary_max), salary_currency: data.salary_currency || null }, requirements);
  const saveFromReview = handleSubmit(onSubmit);

  return <form onSubmit={(event) => event.preventDefault()} className="hc-job-wizard mt-8 max-w-5xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
    <WizardStepper steps={sections} current={sectionIndex} completedThrough={furthestStep} interactive={Boolean(job)} onStep={moveTo}/>

    <div className="mt-5"><h2 className="text-xl font-semibold">{sections[sectionIndex].label}</h2><p className="mt-1 text-sm text-[var(--color-muted)]">{sections[sectionIndex].description}</p></div>
    {section === "role" && <div id="job-role" role="tabpanel" className="hc-job-panel mt-7 grid gap-5"><label className="block text-sm font-medium">Title *<input {...register("title")} className="hc-form-control" /></label>{errors.title && <p role="alert" className="text-sm text-[var(--color-red)]">Enter a job title with at least 3 characters.</p>}<label className="block text-sm font-medium">Description<textarea {...register("description")} rows={7} className="hc-form-control" /></label>{errors.description && <p role="alert" className="text-sm text-[var(--color-red)]">{errors.description.message}</p>}</div>}
    {section === "workplace" && <div id="job-workplace" role="tabpanel" className="hc-job-panel mt-7 grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">Work location<input {...register("location")} className="hc-form-control" /></label><Dropdown label="Employment type" value={watch("employment_type") ?? ""} options={[{ value: "full_time", label: "Full Time" }, { value: "part_time", label: "Part Time" }, { value: "contract", label: "Contract" }, { value: "temporary", label: "Temporary" }, { value: "internship", label: "Internship" }]} onChange={(value) => setValue("employment_type", value, { shouldValidate: true })}/><Dropdown label="Workplace type" value={watch("workplace_type") ?? ""} options={[{ value: "remote", label: "Remote" }, { value: "hybrid", label: "Hybrid" }, { value: "onsite", label: "On Site" }]} onChange={(value) => setValue("workplace_type", value, { shouldValidate: true })}/><label className="block text-sm font-medium">Minimum experience in years<input type="number" {...register("experience_min_years")} className="hc-form-control" /></label><label className="block text-sm font-medium">Maximum experience in years<input type="number" {...register("experience_max_years")} className="hc-form-control" /></label><label className="block text-sm font-medium">Minimum salary<input type="number" {...register("salary_min")} className="hc-form-control" /></label><label className="block text-sm font-medium">Maximum salary<input type="number" {...register("salary_max")} className="hc-form-control" /></label><label className="block text-sm font-medium">Salary currency<input {...register("salary_currency")} className="hc-form-control" /></label></div>}
    {section === "requirements" && <div id="job-requirements" role="tabpanel" className="hc-job-panel">{job ? <RequirementsSection organizationId={organizationId} jobId={job.id} editable /> : <DraftRequirements items={requirements} onChange={setRequirements}/>}</div>}
    {section === "review" && <section className="hc-job-panel mt-7 grid gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-5 text-sm"><div><p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Role details</p><p className="mt-1 font-semibold">{getValues("title") || "Untitled job"}</p><p className="mt-2 whitespace-pre-wrap leading-6 text-[var(--color-muted)]">{getValues("description") || "No description added."}</p></div><div className="border-t border-[var(--color-border)] pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Work setup</p><p className="mt-1 text-[var(--color-muted)]">{[getValues("location") || "Location not set", getValues("employment_type")?.replaceAll("_", " ") || "Employment type not set", getValues("workplace_type") || "Workplace type not set"].join(" · ")}</p></div><div className="border-t border-[var(--color-border)] pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Requirements</p><p className="mt-1 text-[var(--color-muted)]">{job ? "Review requirements above before saving your changes." : requirements.length ? `${requirements.length} requirement${requirements.length === 1 ? "" : "s"} will be saved with this job.` : "No requirements added yet."}</p></div></section>}
    {error && <p role="alert" className="mt-6 text-sm text-[var(--color-red)]">{error}</p>}
    <footer className="mt-7 flex items-center border-t border-[var(--color-border)] pt-5">{sectionIndex > 0 && <button type="button" onClick={() => moveTo(sectionIndex - 1)} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)]"><ArrowLeft size={16}/>Back</button>}<span className="ml-auto"/>{section === "review" ? <button type="button" onClick={saveFromReview} disabled={busy} className="hc-primary-action inline-flex items-center gap-2">{busy ? "Saving…" : job ? "Save changes" : "Save job"}</button> : <button type="button" disabled={isValidating} onClick={next} className="hc-primary-action inline-flex items-center gap-2">{isValidating ? "Checking…" : "Next"}<ArrowRight size={16}/></button>}</footer>
  </form>;
}

function DraftRequirements({ items, onChange }: { items: RequirementInput[]; onChange: (items: RequirementInput[]) => void }) {
  const [type, setType] = useState<RequirementInput["requirement_type"]>("required"); const [category, setCategory] = useState<RequirementInput["category"]>("skill"); const [content, setContent] = useState("");
  const add = () => { if (content.trim().length < 3) return; onChange([...items, { requirement_type: type, category, content: content.trim() }]); setContent(""); };
  return <section className="mt-7 rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-5"><h3 className="font-semibold">Requirements</h3><p className="mt-1 text-sm text-[var(--color-muted)]">Add the requirements to save with this job.</p><div className="mt-5 grid gap-3 sm:grid-cols-[10rem_12rem_minmax(0,1fr)_auto]"><Dropdown label="" value={type} options={[{ value: "required", label: "Required" }, { value: "preferred", label: "Preferred" }]} onChange={(value) => setType(value as RequirementInput["requirement_type"])}/><Dropdown label="" value={category} options={["skill", "experience", "education", "responsibility", "certification", "other"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} onChange={(value) => setCategory(value as RequirementInput["category"])}/><input value={content} onChange={(event) => setContent(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} placeholder="e.g. Five years of Python experience" className="hc-form-control"/><button type="button" onClick={add} disabled={content.trim().length < 3} aria-label="Add requirement" title="Add requirement" className="grid size-11 place-items-center self-end rounded-full border border-[var(--color-navy)] text-[var(--color-navy)] disabled:opacity-40"><Plus size={18} aria-hidden="true"/></button></div>{items.length > 0 && <ul className="mt-4 space-y-2">{items.map((item, index) => <li key={`${item.content}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm"><span><strong>{item.requirement_type === "required" ? "Required" : "Preferred"}</strong> · {item.content}</span><button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="text-[var(--color-red)]">Remove</button></li>)}</ul>}</section>;
}
