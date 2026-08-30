import { Compass, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { useTheme } from "../../app/providers";

export function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--color-canvas)] px-5 py-8">
      <div aria-hidden="true" className="absolute -left-28 top-12 size-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-24 bottom-0 size-96 rounded-full bg-indigo-500/15 blur-3xl" />
      <section className="relative w-full max-w-md rounded-3xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] p-6 shadow-[var(--shadow-soft)] backdrop-blur sm:p-9">
        <div className="flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-xl bg-[var(--color-navy)] text-white">
            <Compass size={18} />
          </span>
          Hiring Compass
        </Link>
        <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid size-9 place-items-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]" aria-label={theme === "dark" ? "Use light theme" : "Use dark theme"} title={theme === "dark" ? "Use light theme" : "Use dark theme"}>{theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}</button></div>
        {children}
        <Link to="/" className="mt-7 inline-flex text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]">← Back to Hiring Compass</Link>
      </section>
    </main>
  );
}
