import { useRef } from "react";

export function FileDropzone({
  accept = "application/pdf,.pdf",
  label = "Drop a file here or click to choose",
  disabled = false,
  onFile,
}: {
  accept?: string;
  label?: string;
  disabled?: boolean;
  onFile: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " "))
          input.current?.click();
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (!disabled && event.dataTransfer.files[0])
          onFile(event.dataTransfer.files[0]);
      }}
      onDragOver={(event) => event.preventDefault()}
      className="cursor-pointer rounded-xl border-2 border-dashed p-5 text-center text-sm text-[var(--color-muted)]"
    >
      {label}
      <input
        ref={input}
        type="file"
        accept={accept}
        disabled={disabled}
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.[0]) onFile(event.target.files[0]);
        }}
      />
    </div>
  );
}
