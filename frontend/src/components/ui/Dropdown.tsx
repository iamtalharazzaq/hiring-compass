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
    <div ref={ref} className="relative w-full">
      <label className="block text-sm font-medium">
        {label}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="mt-1 flex min-h-11 w-full items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm text-[var(--color-text)] transition hover:border-[var(--color-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]"
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
          className="absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-soft)]"
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
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${option.value === value ? "bg-[var(--color-sage)] text-[var(--color-teal)]" : "text-[var(--color-text)] hover:bg-[var(--color-canvas)]"}`}
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
