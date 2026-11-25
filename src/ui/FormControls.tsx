import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./FormControls.module.css";

/* ---------------- Radio Item (Figma 363:695) ---------------- */

export interface RadioItemProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  trailing?: ReactNode;
  variant?: "list" | "default";
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RadioItem({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  trailing,
  variant = "list",
  error,
  disabled,
  className,
}: RadioItemProps) {
  const isPlain = variant === "default";
  const iconClass = error && !checked ? styles.iconDanger : checked ? styles.iconAccent : styles.iconMuted;

  return (
    <label
      className={`${isPlain ? styles.plainRow : styles.optionRow}${className ? ` ${className}` : ""}`}
      data-checked={checked || undefined}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-invalid={error || undefined}
        onChange={onChange}
        className={styles.hiddenInput}
      />
      <span className={isPlain ? styles.plainControl : styles.controlIcon} aria-hidden="true">
        <Icon
          name={checked ? "radio-button" : "circle"}
          weight={checked ? "fill" : "regular"}
          size={20}
          className={iconClass}
        />
      </span>
      <span className={styles.optionCopy}>
        <span className={styles.optionTitle}>{title}</span>
        {description && <span className={styles.optionDesc}>{description}</span>}
      </span>
      {trailing}
    </label>
  );
}

/* ---------------- Radio Card (Figma 363:695 Type=Card) ---------------- */

export interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  icon,
  error,
  disabled,
  className,
}: RadioCardProps) {
  const iconClass = error && !checked ? styles.iconDanger : checked ? styles.iconAccent : styles.iconMuted;

  return (
    <label
      className={`${styles.radioCard}${className ? ` ${className}` : ""}`}
      data-checked={checked || undefined}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-invalid={error || undefined}
        onChange={onChange}
        className={styles.hiddenInput}
      />
      {icon && <span className={styles.cardIcon}>{icon}</span>}
      <span className={styles.optionCopy}>
        <span className={styles.optionTitle}>{title}</span>
        {description && <span className={styles.optionDesc}>{description}</span>}
      </span>
      <Icon
        name={checked ? "radio-button" : "circle"}
        weight={checked ? "fill" : "regular"}
        size={20}
        className={`${styles.radioCardDot} ${iconClass}`}
      />
    </label>
  );
}

/* ---------------- Checkbox Item (Figma 495:1383) ---------------- */

export interface CheckboxItemProps {
  name: string;
  value: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  title: string;
  description?: string;
  trailing?: ReactNode;
  variant?: "list" | "default";
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CheckboxItem({
  name,
  value,
  checked,
  indeterminate = false,
  onChange,
  title,
  description,
  trailing,
  variant = "list",
  error,
  disabled,
  className,
}: CheckboxItemProps) {
  const isPlain = variant === "default";
  const isActive = checked || indeterminate;
  const iconName = indeterminate ? "minus-square" : checked ? "check-square" : "square";
  const iconClass = error && !isActive ? styles.iconDanger : isActive ? styles.iconAccent : styles.iconMuted;

  return (
    <label
      className={`${isPlain ? styles.plainRow : styles.optionRow}${className ? ` ${className}` : ""}`}
      data-checked={isActive || undefined}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-checked={indeterminate ? "mixed" : checked}
        aria-invalid={error || undefined}
        onChange={onChange}
        className={styles.hiddenInput}
      />
      <span className={isPlain ? styles.plainControl : styles.controlIcon} aria-hidden="true">
        <Icon name={iconName} weight={isActive ? "fill" : "regular"} size={20} className={iconClass} />
      </span>
      <span className={styles.optionCopy}>
        <span className={styles.optionTitle}>{title}</span>
        {description && <span className={styles.optionDesc}>{description}</span>}
      </span>
      {trailing}
    </label>
  );
}

/* ---------------- Toggle Switch (Figma 497:2650) ---------------- */

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  position?: "left" | "right";
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  position = "left",
  error,
  disabled,
  className,
}: ToggleProps) {
  const track = (
    <span className={styles.toggleFrame}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-invalid={error || undefined}
        disabled={disabled}
        className={styles.toggleTrack}
        data-checked={checked || undefined}
        data-error={error || undefined}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleThumb} aria-hidden="true" />
      </button>
    </span>
  );

  return (
    <label
      className={`${styles.toggleRow}${className ? ` ${className}` : ""}`}
      data-position={position}
      data-error={error || undefined}
      data-disabled={disabled || undefined}
    >
      {position === "left" && track}
      {(label || description) && (
        <span className={styles.optionCopy}>
          {label && <span className={styles.optionTitle}>{label}</span>}
          {description && <span className={styles.optionDesc}>{description}</span>}
        </span>
      )}
      {position === "right" && track}
    </label>
  );
}

/* ---------------- Toggle Group (Figma 500:3442) ---------------- */

export function ToggleGroup({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={`${styles.toggleGroup}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

export interface ToggleGroupItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function ToggleGroupItem({
  active = false,
  type = "button",
  className,
  children,
  ...rest
}: ToggleGroupItemProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      data-active={active || undefined}
      className={`${styles.toggleGroupItem}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </button>
  );
}
