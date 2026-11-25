import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Icon } from "./Icon";
import styles from "./Field.module.css";

export function RequiredTooltip() {
  return (
    <span className={styles.requiredDot} aria-hidden="true">
      <Icon name="asterisk" size={7} />
      <span className={styles.requiredTooltip}>Required</span>
    </span>
  );
}

export function FieldError({ id, error }: { id?: string; error?: string }) {
  return (
    <div className={styles.message} data-show={error ? true : undefined}>
      <div id={error ? id : undefined} role="alert" className={styles.errorRow}>
        {error && (
          <>
            <span className={styles.errorIconWrap} aria-hidden="true">
              <Icon name="warning" weight="fill" size={12} />
            </span>
            <span>{error}</span>
          </>
        )}
      </div>
    </div>
  );
}

export function FieldHelper({ id, hint }: { id?: string; hint: ReactNode }) {
  return (
    <div id={id} className={styles.hint}>
      {hint}
    </div>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  requiredMark?: boolean;
  optional?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  hint?: ReactNode;
}

export function TextField({
  label,
  error,
  requiredMark,
  optional,
  leading,
  trailing,
  hint,
  onValueChange,
  disabled,
  className,
  ...input
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`${styles.field}${className ? ` ${className}` : ""}`}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label} data-invalid={error ? true : undefined}>
          {label}
          {optional && <span className={styles.optional}> Optional</span>}
        </label>
        {requiredMark && <RequiredTooltip />}
      </div>
      <div
        className={styles.control}
        data-invalid={error ? true : undefined}
        data-disabled={disabled ? true : undefined}
      >
        {leading}
        <input
          id={id}
          className={styles.input}
          disabled={disabled}
          aria-required={requiredMark || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onValueChange(e.target.value)}
          {...input}
        />
        {trailing}
      </div>
      <FieldError id={errorId} error={error} />
      {hint && <FieldHelper id={hintId} hint={hint} />}
    </div>
  );
}

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label: string;
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  requiredMark?: boolean;
  optional?: boolean;
  hint?: ReactNode;
  showResizeHandle?: boolean;
}

export function TextArea({
  label,
  error,
  requiredMark,
  optional,
  hint,
  onValueChange,
  disabled,
  showResizeHandle = true,
  className,
  ...textarea
}: TextAreaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`${styles.field}${className ? ` ${className}` : ""}`}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label} data-invalid={error ? true : undefined}>
          {label}
          {optional && <span className={styles.optional}> Optional</span>}
        </label>
        {requiredMark && <RequiredTooltip />}
      </div>
      <div
        className={`${styles.control} ${styles.textareaControl}`}
        data-invalid={error ? true : undefined}
        data-disabled={disabled ? true : undefined}
      >
        <textarea
          id={id}
          className={`${styles.textarea}${!showResizeHandle ? ` ${styles.textareaNoResize}` : ""}`}
          disabled={disabled}
          aria-required={requiredMark || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onValueChange(e.target.value)}
          {...textarea}
        />
      </div>
      <FieldError id={errorId} error={error} />
      {hint && <FieldHelper id={hintId} hint={hint} />}
    </div>
  );
}
