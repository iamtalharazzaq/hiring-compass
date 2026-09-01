import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";

const steps = [
  ["Create the job", "Open Hiring → Jobs → Create Job. Add the title and description, then save the draft."],
  ["Add requirements", "Open the job and add required and preferred requirements. Include at least one required requirement."],
  ["Get job approval", "Select Submit for Approval. A hiring manager or admin approves it, or returns it with changes. Candidates can only be added after approval."],
  ["Set the interview plan", "On the approved job, add the interview stages and default durations your team will use."],
  ["Add the candidate", "Open Hiring → Candidates → Add candidate, enter their details, and upload their PDF resume. Or create them directly from the job's Add Candidate action."],
  ["Add them to the role", "In the approved job's Candidates section, select Add Candidate, choose the profile, and confirm. Their application starts as New."],
  ["Review and shortlist", "Review the profile, resume, and requirements. Update the application to Shortlisted to begin interviews, or use On Hold or Rejected when appropriate."],
  ["Run interviews", "Schedule each stage from a shortlisted candidate's card. Assign interviewers, set scorecard criteria, collect submitted feedback, and mark the interview completed."],
  ["Approve the decision", "Record a clear recommendation with evidence, then submit it for review. A different authorized reviewer approves it in Approvals or returns it for changes."],
  ["Send the outcome", "On the candidate profile, create the offer, rejection, hold, or next-steps communication and submit it for approval. An offer requires an approved Proceed to Offer decision."],
  ["Hand off onboarding", "After offer acceptance, transfer the approved offer, start date, and employment details to your HRIS/onboarding owner for contracts, payroll, equipment, and access."],
] as const;

export function RecruiterGuidePage() {
  return <AppShell title="Recruiter guide"><section className="max-w-3xl"><Link to="/settings" className="text-sm font-semibold">← Back to Settings</Link><p className="mt-6 text-sm font-semibold text-[var(--color-teal)]">Recruiter guide</p><h1 className="mt-2 text-3xl font-semibold">From job setup to onboarding</h1><p className="mt-2 text-[var(--color-muted)]">Follow this flow for each hire.</p><ol className="mt-8 space-y-3">{steps.map(([title, description], index) => <li key={title} className="rounded-2xl border bg-[var(--color-surface)] p-5"><p className="text-sm font-semibold text-[var(--color-teal)]">Step {index + 1}</p><h2 className="mt-1 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p></li>)}</ol><p className="mt-6 rounded-2xl bg-[var(--color-sage)] p-5 text-sm text-[var(--color-teal)]">Hiring Compass ends at the onboarding handoff. Complete contracts, payroll, equipment, and access in your HRIS or onboarding process.</p></section></AppShell>;
}
