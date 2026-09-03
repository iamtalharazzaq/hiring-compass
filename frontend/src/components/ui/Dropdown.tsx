import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type DropdownOption = { value: string; label: string };

export function Dropdown({
  label,
  value,
  options,
  placeholder = "Select",
  onChange,
}: {
  label?: string;
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const selected = options.find((option) => option.value === value);
  return (
    <div ref={ref} className="hc-dropdown relative w-full" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); (event.currentTarget.querySelector("button") as HTMLButtonElement | null)?.focus(); } }}>
      <label className="block text-sm font-medium">
        {label}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="mt-1 flex min-h-11 w-full items-center justify-between rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-surface)] px-4 py-2 text-left text-sm text-[var(--color-ink)] transition hover:border-[var(--color-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"
        >
          <span className={selected ? "" : "text-[var(--color-muted)]"}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </label>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-1 max-h-64 overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]"
        >
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`hc-dropdown-option flex w-full items-center justify-between rounded-none px-4 py-2.5 text-left text-sm transition ${option.value === value ? "bg-[#292929] font-bold text-white" : "text-[var(--color-ink)] hover:bg-[var(--color-elevated)]"}`}
            >
              {option.label}
              {option.value === value && <Check size={15} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
