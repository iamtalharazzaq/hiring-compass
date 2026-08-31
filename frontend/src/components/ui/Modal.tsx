import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
  labelledBy = "modal-title",
  size = "md",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  labelledBy?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`w-full ${widths[size]} rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={labelledBy} className="text-xl font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-2 py-1 text-lg leading-none text-[var(--color-muted)] hover:bg-[var(--color-canvas)]"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
