import { CheckCircle2, CircleDashed } from "lucide-react";
const items = [
  ["Account", "Ready", true],
  ["Organization", "Ready", true],
  ["Team access", "Ready", true],
  ["Hiring workflow", "Begins with your first job", false],
] as const;
export function ReadinessCard() {
  return (
    <section
      aria-labelledby="readiness-title"
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
    >
      <div>
        <p className="text-sm font-semibold text-[var(--color-teal)]">
          Workspace readiness
        </p>
        <h2 id="readiness-title" className="mt-1 text-xl font-semibold">
          The foundations are in place
        </h2>
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {items.map(([label, state, ready]) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl bg-[var(--color-canvas)] p-3"
          >
            <span
              className={ready ? "text-[var(--color-teal)]" : "text-[#a67528]"}
            >
              {ready ? (
                <CheckCircle2 aria-hidden="true" size={20} />
              ) : (
                <CircleDashed aria-hidden="true" size={20} />
              )}
            </span>
            <div>
              <dt className="text-sm font-medium">{label}</dt>
              <dd className="text-xs text-[var(--color-muted)]">{state}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
