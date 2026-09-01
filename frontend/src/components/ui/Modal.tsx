import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

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
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => { if (!open) return; const previous = document.activeElement as HTMLElement | null; const scrollY = window.scrollY; document.body.style.overflow = "hidden"; dialog.current?.focus(); return () => { document.body.style.overflow = ""; window.scrollTo({ top: scrollY }); previous?.focus(); }; }, [open]);
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };
  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`max-h-[90vh] w-full overflow-y-auto ${widths[size]} rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl`}
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
  , document.body);
}
