import type { ComponentType, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

type Icon = ComponentType<{ size?: number; className?: string }>;

export function DetailPage({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-6xl">{children}</section>;
}

export function DetailBack({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-navy)]"><ArrowLeft size={16} aria-hidden="true"/>{children}</Link>;
}

export function DetailHeader({ icon: Icon, title, subtitle, badge, actions, children }: { icon: Icon; title: string; subtitle: string; badge?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return <header className="hc-detail-header mt-6 rounded-t-2xl border border-b-0 border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--color-elevated)] text-[var(--color-teal)]"><Icon size={21}/></span><h1 className="truncate text-3xl font-semibold">{title}</h1>{badge}</div>
        <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
    {children}
  </header>;
}

export function DetailMetaGrid({ items }: { items: { icon: Icon; label: string; value: ReactNode }[] }) {
  return <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(({ icon: Icon, label, value }) => <div key={label} className="flex min-w-0 items-center gap-3 rounded-xl bg-[var(--color-elevated)] px-4 py-3"><Icon size={17} className="shrink-0 text-[var(--color-teal)]"/><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</p><p className="mt-1 truncate text-sm font-medium">{value}</p></div></div>)}</div>;
}

export function DetailSection({ title, description, count, action, children, className = "", bare = false }: { title: string; description: string; count?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bare?: boolean }) {
  return <section className={"hc-detail-section mt-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:p-7 " + className}>
    {!bare && <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-xl font-semibold">{title}</h2>{count && <span className="rounded-full bg-[var(--color-sage)] px-2.5 py-1 text-xs font-semibold text-[var(--color-teal)]">{count}</span>}</div><p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p></div>{action}</div>}
    {children}
  </section>;
}
