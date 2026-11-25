import type { ReactNode } from "react";
import styles from "./ListItem.module.css";

export interface ListItemProps {
  title: string;
  description?: string;
  info?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  active?: boolean;
  muted?: boolean;
  onClick?: () => void;
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | "true" | "false";
  className?: string;
}

export function ListItem({
  title,
  description,
  info,
  leading,
  trailing,
  active = false,
  muted = false,
  onClick,
  "aria-current": ariaCurrent,
  className,
}: ListItemProps) {
  const content = (
    <>
      {leading && <span className={styles.lead}>{leading}</span>}
      <span className={styles.copy}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      {info && <span className={styles.info}>{info}</span>}
      {trailing && <span className={styles.trail}>{trailing}</span>}
    </>
  );

  const classes = [styles.item, onClick && styles.interactive, className].filter(Boolean).join(" ");

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        data-active={active || undefined}
        data-muted={muted || undefined}
        aria-current={ariaCurrent}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={classes}
      data-active={active || undefined}
      data-muted={muted || undefined}
      aria-current={ariaCurrent}
    >
      {content}
    </div>
  );
}
