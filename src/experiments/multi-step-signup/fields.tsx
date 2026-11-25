import {
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import {
  Dropdown,
  FieldError,
  Icon,
  TextField,
  type DropdownOption,
  type TextFieldProps,
} from "../../ui";
import { COUNTRIES, type CountryOption } from "./data";
import { passwordRules, passwordScore } from "./validation";
import styles from "./signup.module.css";

/* ---------------- Password Field (TextField + strength meter) ---------------- */

const strengthLabels = ["Too short", "Weak", "Fair", "Strong", "Excellent"];

export function PasswordField({
  showStrength = true,
  autoComplete = "new-password",
  ...props
}: Omit<TextFieldProps, "type" | "trailing" | "hint"> & { showStrength?: boolean }) {
  const [visible, setVisible] = useState(false);
  const score = passwordScore(props.value);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          className={styles.trailingIconBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <Icon name={visible ? "eye" : "eye-slash"} size={20} />
        </button>
      }
      hint={
        showStrength && props.value ? (
          <div className={styles.strength}>
            <div className={styles.meter} data-score={score} aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} data-on={score >= n || undefined} />
              ))}
            </div>
            <div className={styles.strengthRow}>
              <ul className={styles.rules}>
                {passwordRules.map((rule) => {
                  const met = rule.test(props.value);
                  return (
                    <li key={rule.label} data-met={met || undefined}>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
              <span className={styles.strengthLabel} aria-live="polite">
                {strengthLabels[score]}
              </span>
            </div>
          </div>
        ) : undefined
      }
    />
  );
}

/* ---------------- 6-digit Segmented OTP (Signup - 2) ---------------- */

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onComplete?: (code: string) => void;
}

export function OtpInput({ value, onChange, error, onComplete }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function updateAt(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    const next = [...digits];
    let cursor = index;
    for (const ch of cleaned) {
      if (cursor >= 6) break;
      next[cursor] = ch;
      cursor++;
    }
    const joined = next.join("");
    onChange(joined);

    if (cursor < 6) {
      inputsRef.current[cursor]?.focus();
    } else {
      inputsRef.current[5]?.focus();
      if (joined.length === 6) onComplete?.(joined);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        onChange(next.join(""));
        inputsRef.current[index - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) onComplete?.(pasted);
  }

  return (
    <div className={styles.field}>
      <div className={styles.otpRow} role="group" aria-label="6-digit verification code">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            name={i === 0 ? "otp" : `otp-${i}`}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={6}
            value={digit}
            aria-label={`Digit ${i + 1} of 6`}
            aria-invalid={error ? true : undefined}
            data-invalid={error ? true : undefined}
            className={styles.otpCell}
            onChange={(e) => updateAt(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.currentTarget.select()}
          />
        ))}
      </div>
      <FieldError error={error} />
    </div>
  );
}

/* ---------------- Country Dropdown (Dropdown + flag artwork) ---------------- */

function renderCountryFlag(country: CountryOption) {
  if (country.flagImg) {
    return <img src={country.flagImg} alt="" width={20} height={20} className={styles.flagImg} />;
  }
  return (
    <span className={styles.flagEmoji} aria-hidden="true">
      {country.flag}
    </span>
  );
}

export function CountryDropdown({
  label,
  name,
  value,
  requiredMark,
  onChange,
  error,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  requiredMark?: boolean;
  onChange: (country: CountryOption) => void;
  error?: string;
  hint?: string;
}) {
  const options = useMemo<DropdownOption[]>(
    () =>
      COUNTRIES.map((c) => ({
        value: c.name,
        label: c.name,
        leading: renderCountryFlag(c),
      })),
    [],
  );

  return (
    <Dropdown
      label={label}
      name={name}
      value={value}
      options={options}
      placeholder="Select country"
      searchable
      requiredMark={requiredMark}
      error={error}
      hint={hint}
      onChange={(nextName) => {
        const found = COUNTRIES.find((c) => c.name === nextName);
        if (found) onChange(found);
      }}
    />
  );
}
