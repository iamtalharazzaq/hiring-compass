import { useSearchParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { JobsList } from "./JobsPage";
import { CandidatesList } from "./CandidatesPage";
export function HiringPage() {
  const [params, setParams] = useSearchParams(); const tab = params.get("tab") === "candidates" ? "candidates" : "jobs"; const choose = (next: string) => setParams({ tab: next });
  return <AppShell title="Hiring"><div className="flex w-full rounded-xl border bg-[var(--color-surface)] p-1" role="tablist" aria-label="Hiring workspace"><button type="button" role="tab" aria-selected={tab === "jobs"} onClick={() => choose("jobs")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${tab === "jobs" ? "bg-[var(--color-navy)] text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-canvas)]"}`}>Jobs</button><button type="button" role="tab" aria-selected={tab === "candidates"} onClick={() => choose("candidates")} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold ${tab === "candidates" ? "bg-[var(--color-navy)] text-white" : "text-[var(--color-muted)] hover:bg-[var(--color-canvas)]"}`}>Candidates</button></div><section className="mt-6">{tab === "jobs" ? <JobsList /> : <CandidatesList />}</section></AppShell>;
}
