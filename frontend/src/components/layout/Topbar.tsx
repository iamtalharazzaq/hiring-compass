import { LogOut, Menu, Settings2, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../../features/organizations/OrganizationProvider";
import { useAuth } from "../../features/auth/AuthProvider";
import { useTheme } from "../../app/providers";

type TopbarProps = {
  onMenuToggle: () => void;
  title: string;
};

const roleLabel = (role: string) =>
  role
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
export function Topbar({ onMenuToggle, title }: TopbarProps) {
  const { organization } = useOrganization();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const initials =
    user?.display_name
      .split(" ")
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "HC";
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const signOut = async () => { setOpen(false); await logout(); navigate("/login", { replace: true }); };
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
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {title}
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            Recruitment workspace
          </p>
        </div>
      </div>
      <div className="relative flex items-center gap-3" ref={menuRef}>
        <span className="hidden text-xs font-medium text-[var(--color-muted)] sm:inline">
          {organization
            ? `${organization.organization.name} · ${roleLabel(organization.role)}`
            : "Workspace"}
        </span>
        <button ref={triggerRef} type="button" aria-label="Open account menu" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} className="grid size-10 place-items-center rounded-full bg-[var(--color-sage)] text-xs font-semibold text-[var(--color-navy)] transition-shadow hover:shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]">
          {initials}
        </button>
        {open && <motion.div initial={reduced ? false : { opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.14, ease: "easeOut" }} role="menu" aria-label="Account menu" className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-ink)] shadow-[var(--shadow-soft)]">
          <div className="border-b border-[var(--color-border)] px-3 py-3">
            <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--color-sage)] text-xs font-semibold text-[var(--color-navy)]">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.display_name || "Account"}</p><p className="truncate text-xs text-[var(--color-muted)]">{user?.email || "Signed-in account"}</p></div></div>
            <p className="mt-3 truncate text-xs text-[var(--color-muted)]">{organization?.organization.name || "Your workspace"}</p>
            <p className="mt-1 text-xs font-medium text-[var(--color-muted)]">{organization ? roleLabel(organization.role) : "Member"}</p>
          </div>
          <div className="px-1 py-1.5"><p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-muted)]">Appearance</p><div className="flex gap-1 rounded-lg bg-[var(--color-canvas)] p-0.5" role="group" aria-label="Choose color theme">{(["light", "dark", "system"] as const).map((option) => <button key={option} type="button" aria-pressed={theme === option} onClick={() => setTheme(option)} className={`flex min-h-8 flex-1 items-center justify-center gap-1 rounded-md px-1.5 text-[11px] font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] ${theme === option ? "bg-[var(--color-navy)] !text-white shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"}`}>{option === "light" ? <Sun size={12} aria-hidden="true" /> : option === "dark" ? <Moon size={12} aria-hidden="true" /> : null}{option}</button>)}</div></div>
          <button role="menuitem" type="button" onClick={() => { setOpen(false); navigate("/settings"); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm hover:bg-[var(--color-canvas)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"><Settings2 size={17} aria-hidden="true" />Settings</button>
          <div className="my-1 border-t border-[var(--color-border)]" />
          <button role="menuitem" type="button" onClick={() => void signOut()} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[var(--color-muted)] hover:bg-[var(--color-red)]/10 hover:text-[var(--color-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"><LogOut size={17} aria-hidden="true" />Sign out</button>
        </motion.div>}
      </div>
    </header>
  );
}
