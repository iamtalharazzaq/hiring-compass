import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Select } from "../ui/Select";
import type { Candidate, CandidateInput } from "../../features/candidates/types";

const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "India", "Pakistan", "Other"];
const schema = z.object({ first_name: z.string().trim().min(1).max(80), last_name: z.string().trim().min(1).max(80), email: z.string().email().or(z.literal("")), phone: z.string().max(30), current_title: z.string().max(160), years_of_experience: z.coerce.number().int().min(0).max(60).optional().or(z.literal("")), address: z.string().max(160), country: z.string(), summary: z.string().max(2000) });
type Form = z.infer<typeof schema>;
const splitLocation = (location: string | null) => { const value = location ?? ""; const country = countries.find((item) => value.endsWith(`, ${item}`)); return country ? { address: value.slice(0, -(country.length + 2)), country } : { address: value, country: "" }; };

export function CandidateForm({ candidate, busy, error, onSubmit }: { candidate?: Candidate; busy: boolean; error?: string; onSubmit: (input: CandidateInput) => void }) {
  const place = splitLocation(candidate?.location ?? null); const names = (candidate?.full_name ?? "").trim().split(/\s+/); const defaults: Form = candidate ? { first_name: names[0] ?? "", last_name: names.slice(1).join(" "), email: candidate.email ?? "", phone: candidate.phone ?? "", current_title: candidate.current_title ?? "", years_of_experience: candidate.years_of_experience ?? "", ...place, summary: candidate.summary ?? "" } : { first_name: "", last_name: "", email: "", phone: "", current_title: "", years_of_experience: "", address: "", country: "", summary: "" };
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: defaults });
  const field = (name: keyof Form, label: string, type = "text") => <label className="block text-sm font-medium" key={name}>{label}{(name === "first_name" || name === "last_name") && " *"}<input type={type} {...register(name)} className="hc-form-control" aria-invalid={Boolean(errors[name])} />{errors[name] ? <span className="hc-form-error">{errors[name]?.message}</span> : <span className="hc-form-help">Enter {label.toLowerCase()}.</span>}</label>;
  return <form onSubmit={handleSubmit((data) => onSubmit({ full_name: `${data.first_name} ${data.last_name}`.trim(), email: data.email || null, phone: data.phone || null, location: [data.address, data.country].filter(Boolean).join(", ") || null, current_title: data.current_title || null, years_of_experience: data.years_of_experience === "" || data.years_of_experience === undefined ? null : data.years_of_experience, summary: data.summary || null }))} className="mx-auto mt-8 max-w-3xl space-y-5">
    <div className="grid gap-5 sm:grid-cols-2">{field("first_name", "First name")}{field("last_name", "Last name")}{field("email", "Email", "email")}{field("phone", "Phone")}{field("current_title", "Current title")}{field("years_of_experience", "Years of experience", "number")}{field("address", "Address")}<label className="block text-sm font-medium">Country<Select {...register("country")} className="hc-form-control"><option value="">Select country</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</Select><span className="hc-form-help">Choose the candidate’s country.</span></label></div>
    <label className="block text-sm font-medium">Professional summary<textarea rows={5} {...register("summary")} className="hc-form-control" aria-invalid={Boolean(errors.summary)} />{errors.summary ? <span className="hc-form-error">{errors.summary.message}</span> : <span className="hc-form-help">Add context that will help your team assess this candidate.</span>}</label>
    {error && <p role="alert" className="text-sm text-[var(--color-red)]">{error}</p>}<button disabled={busy} className="rounded-xl bg-[var(--color-navy)] px-5 py-3 font-semibold text-white">{busy ? "Saving…" : "Save candidate"}</button>
  </form>;
}
