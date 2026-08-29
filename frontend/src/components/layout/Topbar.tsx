import { Menu } from "lucide-react";
import { useOrganization } from "../../features/organizations/OrganizationProvider";
import { useAuth } from "../../features/auth/AuthProvider";

type TopbarProps = {
  onMenuToggle: () => void;
  title: string;
};

const roleLabel = (role: string) => role.split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
export function Topbar({ onMenuToggle, title }: TopbarProps) {
  const { organization } = useOrganization();
  const { user } = useAuth();
  const initials = user?.display_name.split(" ").map((name) => name[0]).slice(0, 2).join("").toUpperCase() ?? "HC";
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
        <div><p className="text-sm font-semibold text-[var(--color-ink)]">{title}</p><p className="text-xs text-[var(--color-muted)]">Recruitment workspace</p></div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs font-medium text-[var(--color-muted)] sm:inline">
          {organization ? `${organization.organization.name} · ${roleLabel(organization.role)}` : "Workspace"}
        </span>
        <span
          aria-label={user ? `${user.display_name}'s profile` : "Hiring Compass workspace"}
          className="grid size-9 place-items-center rounded-full bg-[var(--color-sage)] text-xs font-semibold text-[var(--color-navy)]"
        >
          {initials}
        </span>
      </div>
    </header>
  );
}
