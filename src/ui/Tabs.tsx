import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Tabs.module.css";

export interface TabsProps {
  variant?: "segmented" | "line";
  orientation?: "horizontal" | "vertical";
  "aria-label"?: string;
  className?: string;
  children: ReactNode;
}

export function Tabs({
  variant = "segmented",
  orientation = "horizontal",
  "aria-label": ariaLabel,
  className,
  children,
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      data-variant={variant}
      data-orientation={orientation}
      className={`${styles.list}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  leadingIcon?: ReactNode;
}

export function TabTrigger({
  selected = false,
  leadingIcon,
  type = "button",
  className,
  children,
  ...rest
}: TabTriggerProps) {
  return (
    <button
      type={type}
      role="tab"
      aria-selected={selected}
      className={`${styles.trigger}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {leadingIcon}
      <span>{children}</span>
    </button>
  );
}
