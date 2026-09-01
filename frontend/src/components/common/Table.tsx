import type { ReactNode } from "react";

export type TableColumn = { label: string; className?: string };

export function Table<T>({ columns, items, rowKey, renderRow, empty, onRowClick }: { columns: TableColumn[]; items: T[]; rowKey: (item: T) => string; renderRow: (item: T) => ReactNode; empty: ReactNode; onRowClick?: (item: T) => void }) {
  if (!items.length) return <>{empty}</>;
  const openRow = (item: T, row: HTMLTableRowElement) => { if (onRowClick) onRowClick(item); else row.querySelector<HTMLAnchorElement>("a")?.click(); };
  return <div className="overflow-x-auto"><table className="hc-data-table w-full border-separate border-spacing-0 text-left"><thead><tr>{columns.map((column) => <th key={column.label} className={`border-b border-[var(--color-border)] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] ${column.className ?? ""}`}>{column.label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={rowKey(item)} onClick={(event) => { if (!(event.target as HTMLElement).closest("a, button")) openRow(item, event.currentTarget); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openRow(item, event.currentTarget); } }} tabIndex={0} className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)]">{renderRow(item)}</tr>)}</tbody></table></div>;
}
