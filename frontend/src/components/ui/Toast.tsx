export function Toast({
  message,
  tone = "success",
  onClose,
}: {
  message: string;
  tone?: "success" | "error";
  onClose?: () => void;
}) {
  return (
    <div
      role="status"
      className={`fixed bottom-5 right-5 z-[60] rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${tone === "error" ? "bg-[var(--color-red)]" : "bg-[var(--color-teal)]"}`}
    >
      {message}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="ml-3 opacity-80 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
