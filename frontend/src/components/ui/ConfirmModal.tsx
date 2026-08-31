import { Modal } from "./Modal";

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  pending = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      labelledBy="confirm-modal-title"
    >
      <p className="mt-2 text-sm text-[var(--color-muted)]">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="hc-primary-action"
        >
          {pending ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
