import { Menu } from "lucide-react";
import { useOrganization } from "../../features/organizations/OrganizationProvider";

type TopbarProps = {
  onMenuToggle: () => void;
};

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { organization } = useOrganization();
  return (
    <header className="flex h-18 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open navigation"
          className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-canvas)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] lg:hidden"
          onClick={onMenuToggle}
          type="button"
        >
          <Menu aria-hidden="true" size={20} />
        </button>
        <p className="text-sm font-semibold text-[var(--color-ink)]">Overview</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs font-medium text-[var(--color-muted)] sm:inline">
          {organization ? `${organization.organization.name} · ${organization.role.replace("_", " ")}` : "Workspace"}
        </span>
        <span
          aria-label="Hiring Compass workspace"
          className="grid size-9 place-items-center rounded-full bg-[var(--color-sage)] text-xs font-semibold text-[var(--color-navy)]"
        >
          HC
        </span>
      </div>
    </header>
  );
}
