import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BriefcaseBusiness, Users } from "lucide-react";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { CandidatesList } from "./CandidatesPage";
import { JobsList } from "./JobsPage";

const tabs = [{ id: "jobs", label: "Jobs", icon: BriefcaseBusiness }, { id: "candidates", label: "Candidates", icon: Users }] as const;

export function HiringPage() {
  const [params, setParams] = useSearchParams(); const tab = params.get("tab") === "candidates" ? "candidates" : "jobs"; const reduced = useReducedMotion(); const previous = useRef(tab); const direction = tab === previous.current ? 0 : tab === "candidates" ? 1 : -1; previous.current = tab;
  const choose = (next: "jobs" | "candidates") => setParams({ tab: next });
  const keyDown = (event: React.KeyboardEvent<HTMLDivElement>) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const current = tabs.findIndex((item) => item.id === tab); const index = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length; choose(tabs[index].id); };
  return <AppShell title="Hiring"><div className="hc-workspace-switcher relative inline-flex rounded-full border border-[var(--color-tab-border)] bg-[var(--color-tab-track)] p-1 shadow-[var(--shadow-card)]" role="tablist" aria-label="Hiring workspace" onKeyDown={keyDown}>{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} onClick={() => choose(id)} className={`relative z-10 inline-flex min-w-30 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-tab-active)] focus-visible:ring-offset-2 ${tab === id ? "text-white" : "text-[var(--color-tab-text)] hover:text-[var(--color-ink)]"}`}>{tab === id && <motion.span layoutId="hiring-active-tab" transition={{ type: "spring", stiffness: 440, damping: 34 }} className="absolute inset-0 z-0 rounded-full bg-[var(--color-tab-active)] shadow-sm"/>}<span className="relative z-10 inline-flex items-center gap-2"><Icon size={16} aria-hidden="true"/>{label}</span></button>)}</div><AnimatePresence mode="wait" initial={false}><motion.section key={tab} initial={reduced ? { opacity: 0 } : { opacity: 0, x: direction * 18, scale: .99 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, x: direction * -12, scale: .99 }} transition={{ duration: .18, ease: "easeOut" }} className="mt-6">{tab === "jobs" ? <JobsList/> : <CandidatesList/>}</motion.section></AnimatePresence></AppShell>;
}
