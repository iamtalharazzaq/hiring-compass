import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export type ActionMenuItem = { label: string; onSelect: () => void; tone?: "danger" | "default" };

export function ActionMenu({ label = "Row actions", items }: { label?: string; items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (event.key === "Escape") { setOpen(false); root.current?.querySelector("button")?.focus(); } if (event.key === "ArrowDown" && open) { event.preventDefault(); (root.current?.querySelector('[role="menuitem"]') as HTMLButtonElement | null)?.focus(); } };
  const visibleItems = items.filter((item) => item.label !== "View");
  if (!visibleItems.length) return null;
  return <div ref={root} className="relative inline-block" onKeyDown={keyDown}><button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }} className="grid size-9 place-items-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-elevated)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"><MoreHorizontal size={18}/></button>{open && <div role="menu" className="absolute right-0 z-30 mt-1 min-w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-soft)]">{visibleItems.map((item) => <button key={item.label} type="button" role="menuitem" onClick={(event) => { event.stopPropagation(); setOpen(false); item.onSelect(); }} className={`block w-full whitespace-nowrap rounded-sm px-3 py-2 text-left text-sm font-medium outline-none transition hover:bg-[color-mix(in_srgb,var(--color-navy)_16%,var(--color-elevated))] hover:text-[var(--color-navy)] focus-visible:bg-[color-mix(in_srgb,var(--color-navy)_16%,var(--color-elevated))] focus-visible:text-[var(--color-navy)] focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] ${item.tone === "danger" ? "text-[var(--color-red)]" : ""}`}>{item.label === "Edit candidate" ? "Edit" : item.label}</button>)}</div>}</div>;
}
