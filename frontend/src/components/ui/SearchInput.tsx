import { Search, X } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search…",
  ariaLabel = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="hc-form-control w-full pl-10 pr-10"
      />
      <Search aria-hidden="true" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          title="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
