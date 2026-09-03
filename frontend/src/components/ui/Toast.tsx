import { useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";

const TOAST_DURATION = 5000;

export function Toast({
  message,
  tone = "success",
  onClose,
}: {
  message: string;
  tone?: "success" | "error";
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!onClose) return;
    const timeout = window.setTimeout(onClose, TOAST_DURATION);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  const toast = (
    <div
      role="status"
      className={`hc-toast hc-toast--${tone}`}
      style={{ "--hc-toast-duration": `${TOAST_DURATION}ms` } as CSSProperties}
    >
      <div className="hc-toast-copy">
        <strong>{tone === "success" ? "Success!" : "Something went wrong."}</strong>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="hc-toast-close"
        >
          ×
        </button>
      )}
    </div>
  );

  return createPortal(toast, document.body);
}
