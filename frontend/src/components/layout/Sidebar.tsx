import {
  Activity,
  CheckSquare,
  Compass,
  LayoutDashboard,
  UsersRound,
  BriefcaseBusiness,
  CalendarDays,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "../../lib/utils";
import { useOrganization } from "../../features/organizations/OrganizationProvider";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

const navigation = [
  { label: "Overview", icon: LayoutDashboard, href: "/app" },
  { label: "Jobs", icon: BriefcaseBusiness, href: "/jobs" },
  { label: "Candidates", icon: UsersRound, href: "/candidates" },
  { label: "Interviews", icon: CalendarDays, href: "/interviews" },
  { label: "Approvals", icon: CheckSquare, href: "/approvals" },
  { label: "Activity", icon: Activity },
];

export function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const { pathname } = useLocation();
  const { organization } = useOrganization();
  const closeOnMobile = () => { if (window.innerWidth < 1024) onClose(); };
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
          "fixed inset-y-0 left-0 z-40 flex -translate-x-full flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] py-5 shadow-[var(--shadow-soft)] transition-[transform,width,padding] duration-200",
          isOpen ? "w-72 translate-x-0 px-4" : "w-20 translate-x-0 px-2",
        )}
      >
        <div className={`flex items-start px-3 pb-8 ${isOpen ? "justify-between" : "justify-center"}`}>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onToggle} aria-label={isOpen ? "Collapse navigation" : "Expand navigation"} className="grid size-10 place-items-center rounded-xl bg-[var(--color-navy)] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2">
              <Compass aria-hidden="true" size={21} strokeWidth={2.25} />
            </button>
            {isOpen && <div>
              <p className="font-semibold tracking-tight text-[var(--color-ink)]">
                Hiring Compass
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                Recruitment workspace
              </p>
            </div>}
          </div>
        </div>

        <nav aria-label="Workspace navigation">
          <ul className="space-y-1">
            {navigation.filter(({ label }) => label !== "Candidates" || ["admin", "recruiter", "hiring_manager"].includes(organization?.role ?? "")).map(({ label, icon: Icon, href }) => (
              <li key={label}>
                {href ? (
                  <Link
                    to={href}
                    onClick={closeOnMobile}
                    aria-current={pathname === href ? "page" : undefined}
                    title={label}
                    className={cn(
                      "flex items-center rounded-xl py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]",
                      isOpen ? "gap-3 px-3" : "justify-center px-2",
                      pathname === href
                        ? "bg-[var(--color-navy)] text-white"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-canvas)]",
                    )}
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    {isOpen && label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    title={label}
                    className={cn("flex cursor-not-allowed items-center rounded-xl py-2.5 text-sm font-medium text-[var(--color-muted)]/65", isOpen ? "gap-3 px-3" : "justify-center px-2")}
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    {isOpen && label}
                    {isOpen && <span className="ml-auto text-[10px] uppercase tracking-wide">
                      Soon
                    </span>}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {isOpen && <div className="mt-auto border-t border-[var(--color-border)] px-3 pt-4">
          <p className="truncate text-sm font-medium">
            {organization?.organization.name ?? "Your workspace"}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            A focused space for thoughtful hiring.
          </p>
        </div>}
      </aside>
    </>
  );
}
