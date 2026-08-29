import {
  Activity,
  CheckSquare,
  Compass,
  LayoutDashboard,
  Settings,
  UsersRound,
  BriefcaseBusiness,
  CalendarDays,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "../../lib/utils";
import { useAuth } from "../../features/auth/AuthProvider";
import { useOrganization } from "../../features/organizations/OrganizationProvider";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigation = [
  { label: "Overview", icon: LayoutDashboard, href: "/" },
  { label: "Jobs", icon: BriefcaseBusiness, href: "/jobs" },
  { label: "Candidates", icon: UsersRound, href: "/candidates" },
  { label: "Interviews", icon: CalendarDays },
  { label: "Approvals", icon: CheckSquare },
  { label: "Activity", icon: Activity },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const { organization } = useOrganization();
  return (
    <>
      {isOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-[var(--color-ink)]/20 lg:hidden"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 shadow-[var(--shadow-soft)] transition-transform duration-200 lg:translate-x-0 lg:shadow-none",
          isOpen && "translate-x-0",
        )}
      >
        <div className="flex items-start justify-between px-3 pb-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--color-navy)] text-white">
              <Compass aria-hidden="true" size={21} strokeWidth={2.25} />
            </span>
            <div>
              <p className="font-semibold tracking-tight text-[var(--color-ink)]">
                Hiring Compass
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                Recruitment workspace
              </p>
            </div>
          </div>
          <button
            aria-label="Close navigation"
            className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-canvas)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>

        <nav aria-label="Workspace navigation">
          <ul className="space-y-1">
            {navigation.filter(({ label }) => label !== "Candidates" || ["admin", "recruiter", "hiring_manager"].includes(organization?.role ?? "")).map(({ label, icon: Icon, href }) => (
              <li key={label}>
                {href ? (
                  <Link
                    to={href}
                    onClick={onClose}
                    aria-current={pathname === href ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]",
                      pathname === href
                        ? "bg-[var(--color-navy)] text-white"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-canvas)]",
                    )}
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    {label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-muted)]/65"
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    {label}
                    <span className="ml-auto text-[10px] uppercase tracking-wide">
                      Soon
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto border-t border-[var(--color-border)] px-3 pt-4">
          <p className="truncate text-sm font-medium">
            {organization?.organization.name ?? "Your workspace"}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            A focused space for thoughtful hiring.
          </p>
          <button
            onClick={() => void logout()}
            className="mt-4 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
