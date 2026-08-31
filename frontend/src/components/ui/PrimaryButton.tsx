import type { ButtonHTMLAttributes } from "react";
export function PrimaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`hc-primary-action rounded-full ${className}`}
    />
  );
}
