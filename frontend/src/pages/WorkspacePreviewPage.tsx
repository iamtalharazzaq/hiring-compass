import { Bot, CheckCircle2, Workflow } from "lucide-react";

import { AppShell } from "../components/layout/AppShell";

const capabilities = [
  {
    title: "Structured hiring workflows",
    description: "Keep each stage clear, connected, and easy to move through.",
    icon: Workflow,
  },
  {
    title: "Evidence before decisions",
    description: "Bring the right context together before every important choice.",
    icon: CheckCircle2,
  },
  {
    title: "Human-approved AI assistance",
    description: "Use thoughtful assistance while people stay firmly in control.",
    icon: Bot,
  },
];

export function WorkspacePreviewPage() {
  return (
    <AppShell>
      <section aria-labelledby="workspace-heading" className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--color-teal)]">Hiring Compass</p>
        <h1 id="workspace-heading" className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          A clearer way to move hiring forward.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-muted)] sm:text-lg">
          Jobs, candidates, interviews, and decisions will come together here—giving every
          hiring team a calmer, more deliberate way to work.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              Your hiring workspace is ready to take shape.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
              The foundation is in place for a more consistent and human-centered hiring
              process.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--color-sage)] px-3 py-2 text-sm font-medium text-[var(--color-navy)]">
            <span aria-hidden="true" className="size-2 rounded-full bg-[var(--color-teal)]" />
            Workspace preview
          </span>
        </div>
      </section>

      <section aria-label="Future capabilities" className="mt-6 grid gap-4 lg:grid-cols-3">
        {capabilities.map(({ title, description, icon: Icon }) => (
          <article
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)]"
            key={title}
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--color-canvas)] text-[var(--color-teal)]">
              <Icon aria-hidden="true" size={20} />
            </span>
            <h2 className="mt-5 text-base font-semibold text-[var(--color-ink)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
