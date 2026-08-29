import { AppShell } from "../components/layout/AppShell";
import { ReadinessCard } from "../components/dashboard/ReadinessCard";
import { WorkspaceEmptyState } from "../components/dashboard/WorkspaceEmptyState";
import { WorkspacePrinciples } from "../components/dashboard/WorkspacePrinciples";
import { useAuth } from "../features/auth/AuthProvider";
import { useOrganization } from "../features/organizations/OrganizationProvider";
const guidance: Record<string, string> = { admin: "You can manage organization members in Settings.", recruiter: "Your job workflow will be available soon.", hiring_manager: "Candidate review tools will be available later.", interviewer: "Interview feedback tools will be available later." };
export function OverviewPage() {
  const { user } = useAuth(); const { organization } = useOrganization(); const role = organization?.role ?? "interviewer";
  return (
    <AppShell title="Overview">
      <section aria-labelledby="workspace-heading" className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--color-teal)]">Hiring Compass</p>
        <h1 id="workspace-heading" className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Welcome back, {user?.display_name}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
          Everything for {organization?.organization.name} is in one place. Your hiring workspace is ready when you are.
        </p>
      </section>
      <p className="mt-6 rounded-xl bg-[var(--color-amber)]/60 px-4 py-3 text-sm text-[var(--color-ink)]">{guidance[role]}</p>
      <div className="mt-8"><ReadinessCard /><WorkspaceEmptyState admin={role === "admin"} /><WorkspacePrinciples /></div>
    </AppShell>
  );
}
