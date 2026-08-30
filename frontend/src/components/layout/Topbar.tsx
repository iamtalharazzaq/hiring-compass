
import { useOrganization } from "../../features/organizations/OrganizationProvider";

type TopbarProps = { title: string; };

export function Topbar({ title }: TopbarProps) {
  const { organization } = useOrganization();
  return (
    <header className="flex h-18 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {title}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Recruitment workspace
          </p>
        </div>
      </div>
      <div className="text-right"><p className="text-xs font-semibold text-[var(--color-ink)]">{organization?.organization.name ?? "Hiring Compass"}</p><p className="mt-0.5 text-[11px] text-[var(--color-muted)]">A focused space for thoughtful hiring.</p></div>
    </header>
  );
}
