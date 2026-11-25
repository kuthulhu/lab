import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Alert.module.css";

export type AlertStatus = "neutral" | "info" | "success" | "warning" | "danger" | "destructive";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  status?: AlertStatus;
  title: string;
  description?: ReactNode;
  icon?: string;
}

const defaultIcons: Record<AlertStatus, string> = {
  neutral: "info",
  info: "info",
  success: "check-circle",
  warning: "warning",
  danger: "warning-circle",
  destructive: "warning-circle",
};

export function Alert({
  status = "neutral",
  title,
  description,
  icon,
  className,
  ...rest
}: AlertProps) {
  return (
    <div
      role={status === "danger" || status === "destructive" ? "alert" : "status"}
      className={`${styles.alert} ${styles[status]}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        <Icon name={icon ?? defaultIcons[status]} weight="fill" size={20} />
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {description && <div className={styles.description}>{description}</div>}
      </div>
    </div>
  );
}
