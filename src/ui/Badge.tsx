import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant = "soft" | "solid" | "secondary" | "destructive" | "outline";
export type BadgeColor = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
export type BadgeSize = "default" | "large";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Badge({
  variant = "soft",
  color = "neutral",
  size = "default",
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: BadgeProps) {
  const classes = [
    styles.badge,
    size === "large" ? styles.sizeLarge : styles.sizeDefault,
    styles[variant],
    styles[color],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {leadingIcon}
      <span className={styles.label}>{children}</span>
      {trailingIcon}
    </span>
  );
}
