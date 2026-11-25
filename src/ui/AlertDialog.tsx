import { useEffect, type ReactNode } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import styles from "./AlertDialog.module.css";

export interface AlertDialogProps {
  title: string;
  description?: string;
  icon?: string;
  showIcon?: boolean;
  size?: "default" | "small";
  type?: "default" | "destructive" | "simple";
  primaryLabel?: string;
  primaryVariant?: "primary" | "destructive";
  secondaryLabel?: string | null;
  onPrimary?: () => void;
  onClose: () => void;
  children?: ReactNode;
}

export function AlertDialog({
  title,
  description,
  icon = "floppy-disk",
  showIcon = true,
  size = "default",
  type = "default",
  primaryLabel,
  primaryVariant,
  secondaryLabel = "Cancel",
  onPrimary,
  onClose,
  children,
}: AlertDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const resolvedPrimaryLabel = primaryLabel ?? (type === "destructive" ? "Delete" : "Continue");
  const resolvedPrimaryVariant = primaryVariant ?? (type === "destructive" ? "destructive" : "primary");
  const handlePrimaryClick = onPrimary ?? onClose;
  const isSimple = type === "simple";
  const isSmall = size === "small";

  return (
    <div
      className={styles.backdrop}
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.card} data-size={size} data-type={type}>
        <div className={styles.content} data-size={size} data-type={type}>
          {!isSimple && showIcon && (
            <div className={styles.iconBox} data-size={size} data-type={type} aria-hidden="true">
              <Icon name={icon} size={isSmall ? 20 : 24} />
            </div>
          )}
          <div className={styles.copyCol} data-size={size} data-type={type}>
            <h3 className={styles.title}>{title}</h3>
            {description && <p className={styles.desc}>{description}</p>}
            {children && <div className={styles.scrollBody}>{children}</div>}
          </div>
        </div>

        <div className={styles.footer} data-size={size} data-type={type}>
          {!isSimple && secondaryLabel !== null && (
            <Button variant="secondary" size="small" onClick={onClose}>
              {secondaryLabel}
            </Button>
          )}
          <Button variant={resolvedPrimaryVariant} size="small" onClick={handlePrimaryClick}>
            {resolvedPrimaryLabel}
          </Button>
          {isSimple && secondaryLabel !== null && (
            <Button variant={isSmall ? "ghost" : "secondary"} size="small" onClick={onClose}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
