import {
  Activity,
  CheckSquare,
  Compass,
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  LogOut,
  Moon,
  Sun,
  Settings2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "../../lib/utils";
import { useAuth } from "../../features/auth/AuthProvider";
import { useTheme } from "../../app/providers";
import { useNavigate } from "react-router-dom";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
};

const navigation = [
  { label: "Overview", icon: LayoutDashboard, href: "/app" },
  { label: "Hiring", icon: BriefcaseBusiness, href: "/hiring" },
  { label: "Interviews", icon: CalendarDays, href: "/interviews" },
  { label: "Approvals", icon: CheckSquare, href: "/approvals" },
  { label: "Activity", icon: Activity },
];

export function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const hiringActive = pathname === "/hiring" || pathname.startsWith("/hiring") || pathname.startsWith("/jobs") || pathname.startsWith("/candidates");
  const closeOnNavigate = () => {
    if (window.innerWidth < 1024) onClose();
  };
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
          isOpen ? "w-64 translate-x-0 px-4" : "w-20 translate-x-0 px-2",
        )}
      >
        <div className={`flex items-start px-3 pb-8 ${isOpen ? "justify-between" : "justify-center"}`}>
          <button type="button" onClick={onToggle} aria-label={isOpen ? "Collapse navigation" : "Expand navigation"} className={cn("flex items-center rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2", isOpen ? "gap-3" : "justify-center")}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--color-navy)] text-white shadow-[var(--shadow-card)]">
              <Compass aria-hidden="true" size={21} strokeWidth={2.25} />
            </span>
            {isOpen && <span>
              <p className="font-semibold tracking-tight text-[var(--color-ink)]">
                Hiring Compass
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                Recruitment workspace
              </p>
            </span>}
          </button>
        </div>

        <nav aria-label="Workspace navigation">
          <ul className="space-y-1">
            {navigation.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                {href ? (
                  <Link
                    to={href}
                    onClick={closeOnNavigate}
                    aria-current={pathname === href || (href === "/hiring" && hiringActive) ? "page" : undefined}
                    title={label}
                    className={cn(
                      "flex items-center rounded-xl py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]",
                      isOpen ? "gap-3 px-3" : "justify-center px-2",
                      pathname === href || (href === "/hiring" && hiringActive) || (href === "/settings" && pathname.startsWith("/settings"))
                        ? "bg-[var(--color-navy)] text-white shadow-[0_0_18px_color-mix(in_srgb,var(--color-navy)_24%,transparent)]"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-elevated)]",
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

        <div className="mt-auto border-t border-[var(--color-border)] px-2 pt-4">
          {isOpen && <div className="mb-3 px-1"><p className="truncate text-sm font-semibold">{user?.display_name ?? "Account"}</p><p className="truncate text-xs text-[var(--color-muted)]">{user?.email ?? "Signed-in user"}</p></div>}
          <div className={cn("flex items-center gap-2", isOpen ? "justify-end" : "flex-col")}>
            <button type="button" onClick={() => { closeOnNavigate(); navigate("/settings"); }} title="Settings" aria-label="Settings" className="grid size-9 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"><Settings2 size={16} aria-hidden="true" /></button>
            <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title={theme === "dark" ? "Use light theme" : "Use dark theme"} aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"} className="grid size-9 place-items-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]">{theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}</button>
            <button type="button" onClick={() => { void logout().then(() => navigate("/login", { replace: true })); }} title="Sign out" aria-label="Sign out" className="grid size-10 shrink-0 place-items-center rounded-full border border-transparent bg-[var(--color-navy)] text-white ring-2 ring-[var(--color-surface)] transition-colors hover:border-[var(--color-navy)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"><LogOut size={17} aria-hidden="true" /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
