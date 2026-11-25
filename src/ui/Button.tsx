import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./Button.module.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "ghost"
  | "secondary-ghost"
  | "accent-ghost"
  | "destructive-ghost";

export type ButtonSize = "default" | "small";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  accent: styles.accent,
  destructive: styles.destructive,
  ghost: styles.ghost,
  "secondary-ghost": styles.secondaryGhost,
  "accent-ghost": styles.accentGhost,
  "destructive-ghost": styles.destructiveGhost,
};

export function Button({
  variant = "primary",
  size = "default",
  iconOnly = false,
  fullWidth = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  type = "button",
  className,
  children,
  disabled,
  ref,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    variantClass[variant],
    size === "small" ? styles.sizeSmall : styles.sizeDefault,
    iconOnly && styles.iconOnly,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      data-loading={loading || undefined}
      aria-disabled={loading || disabled || undefined}
      {...rest}
    >
      <span className={styles.content}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
      {loading && <span className={styles.spinner} aria-label="Loading" />}
    </button>
  );
}
