import type { SelectHTMLAttributes } from "react";

/** Consistent native select: native menus preserve mobile and keyboard accessibility. */
export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="hc-select">
      <select {...props} className={`hc-select-control ${className}`} />
    </span>
  );
}
