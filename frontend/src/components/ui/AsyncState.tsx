import type { ReactNode } from "react";

export function LoadingState({ label = "Loading…" }: { label?: string }) { return <p className="rounded-xl border border-[var(--color-border)] p-5 text-sm text-[var(--color-muted)]" role="status">{label}</p>; }
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) { return <p className="rounded-xl bg-red-50 p-4 text-sm text-[var(--color-red)]" role="alert">{message}{onRetry && <button type="button" onClick={onRetry} className="ml-2 font-semibold underline">Retry</button>}</p>; }
export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) { return <div className="rounded-xl border border-dashed border-[var(--color-border)] px-5 py-10 text-center"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-[var(--color-muted)]">{message}</p>{action && <div className="mt-4">{action}</div>}</div>; }
