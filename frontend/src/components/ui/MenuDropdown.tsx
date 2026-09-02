import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type MenuDropdownItem = { label: string; href: string };

export function MenuDropdown({ label, items, className = "" }: { label: string; items: MenuDropdownItem[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const focusItem = (index: number) => root.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]')[index]?.focus();
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const menuItems = root.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? [];
    const current = Array.from(menuItems).indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    if (event.key === "ArrowDown") { event.preventDefault(); if (!open) { setOpen(true); requestAnimationFrame(() => focusItem(0)); } else focusItem(Math.min(current + 1, menuItems.length - 1)); }
    if (event.key === "ArrowUp" && open) { event.preventDefault(); focusItem(Math.max(current - 1, 0)); }
    if (event.key === "Home" && open) { event.preventDefault(); focusItem(0); }
    if (event.key === "End" && open) { event.preventDefault(); focusItem(menuItems.length - 1); }
  };

  return <div ref={root} className={`hc2-menu-dropdown ${className}`} onKeyDown={onKeyDown}>
    <button ref={trigger} type="button" className={`hc2-nav-link hc2-company-trigger${open ? " is-open" : ""}`} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      {label}<ChevronDown size={14} aria-hidden="true" />
    </button>
    {open && <div className="hc2-company-menu" role="menu">
      {items.map((item) => <a key={item.label} href={item.href} role="menuitem" className="hc2-company-menu-item" onClick={(event) => {
        setOpen(false);
        const target = item.href.startsWith("#") && document.getElementById(item.href.slice(1));
        if (target) { event.preventDefault(); target.scrollIntoView({ behavior: "smooth", block: "start" }); }
      }}>{item.label}</a>)}
    </div>}
  </div>;
}
