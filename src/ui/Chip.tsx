import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Chip.module.css";

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  leadingIcon?: ReactNode;
  onDismiss?: () => void;
}

export function Chip({
  selected = false,
  leadingIcon,
  onDismiss,
  type = "button",
  disabled,
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${styles.chip}${className ? ` ${className}` : ""}`}
      data-selected={selected || undefined}
      aria-pressed={selected}
      {...rest}
    >
      {leadingIcon}
      <span className={styles.label}>{children}</span>
      {onDismiss && (
        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={styles.dismiss}
          aria-label="Remove"
          aria-disabled={disabled || undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onDismiss();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              if (!disabled) onDismiss();
            }
          }}
        >
          <Icon name="x" size={14} />
        </span>
      )}
    </button>
  );
}
