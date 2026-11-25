import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { FieldError, FieldHelper, RequiredTooltip } from "./Field";
import { Icon } from "./Icon";
import fieldStyles from "./Field.module.css";
import styles from "./Dropdown.module.css";

export interface DropdownOption {
  value: string;
  label: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export interface DropdownProps {
  label: string;
  name: string;
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  searchable?: boolean;
  requiredMark?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  className?: string;
}

function getVisibleVerticalBounds(el: HTMLElement) {
  let top = 0;
  let bottom = window.innerHeight;
  let parent = el.parentElement;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "hidden" || overflowY === "clip") {
      const rect = parent.getBoundingClientRect();
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }
    parent = parent.parentElement;
  }
  return { top, bottom };
}

export function Dropdown({
  label,
  name,
  value,
  options,
  placeholder = "Select",
  searchable = false,
  requiredMark,
  disabled,
  onChange,
  error,
  hint,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [listMaxHeight, setListMaxHeight] = useState<number>(200);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function computePlacement() {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const triggerRect = trigger.getBoundingClientRect();
    const { top, bottom } = getVisibleVerticalBounds(trigger);
    const chromeHeight = 8;
    const desiredHeight = 200 + chromeHeight;
    const spaceBelow = bottom - triggerRect.bottom - 12;
    const spaceAbove = triggerRect.top - top - 12;

    const nextPlacement = spaceBelow < desiredHeight && spaceAbove > spaceBelow ? "top" : "bottom";
    const available = nextPlacement === "top" ? spaceAbove : spaceBelow;
    setPlacement(nextPlacement);
    setListMaxHeight(Math.max(112, Math.min(200, Math.floor(available - chromeHeight))));
  }

  useEffect(() => {
    if (!open) return;
    function handleReposition() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const triggerRect = trigger.getBoundingClientRect();
      const { top, bottom } = getVisibleVerticalBounds(trigger);
      const chromeHeight = 8;
      const desiredHeight = 200 + chromeHeight;
      const spaceBelow = bottom - triggerRect.bottom - 12;
      const spaceAbove = triggerRect.top - top - 12;

      const nextPlacement = spaceBelow < desiredHeight && spaceAbove > spaceBelow ? "top" : "bottom";
      const available = nextPlacement === "top" ? spaceAbove : spaceBelow;
      setPlacement(nextPlacement);
      setListMaxHeight(Math.max(112, Math.min(200, Math.floor(available - chromeHeight))));
    }
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  function openMenu() {
    if (disabled) return;
    computePlacement();
    setOpen(true);
    setQuery("");
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
  }

  function toggle() {
    if (disabled) return;
    if (open) {
      setOpen(false);
    } else {
      openMenu();
    }
  }

  return (
    <div className={`${fieldStyles.field}${className ? ` ${className}` : ""}`} ref={wrapRef}>
      <div className={fieldStyles.labelRow}>
        <label htmlFor={id} className={fieldStyles.label} data-invalid={error ? true : undefined}>
          {label}
        </label>
        {requiredMark && <RequiredTooltip />}
      </div>
      <div className={styles.wrap} ref={triggerRef}>
        {searchable && open ? (
          <div
            className={styles.trigger}
            data-open=""
            data-searchable=""
            data-invalid={error ? true : undefined}
          >
            {selected?.leading && <span className={styles.leading}>{selected.leading}</span>}
            <input
              ref={searchRef}
              id={id}
              name={name}
              type="text"
              role="combobox"
              aria-required={requiredMark || undefined}
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-invalid={error ? true : undefined}
              className={styles.comboboxInput}
              placeholder={selected ? selected.label : placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
                if (e.key === "Enter" && filtered[0]) {
                  e.preventDefault();
                  onChange(filtered[0].value);
                  setOpen(false);
                }
              }}
            />
            <button
              type="button"
              className={styles.caretButton}
              aria-label="Close options"
              tabIndex={-1}
              onClick={() => setOpen(false)}
            >
              <Icon name="caret-up" size={20} />
            </button>
          </div>
        ) : (
          <button
            id={id}
            name={name}
            type="button"
            role="combobox"
            disabled={disabled}
            aria-required={requiredMark || undefined}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-invalid={error ? true : undefined}
            data-open={open || undefined}
            data-searchable={searchable || undefined}
            data-invalid={error ? true : undefined}
            className={styles.trigger}
            onClick={toggle}
          >
            {selected?.leading && <span className={styles.leading}>{selected.leading}</span>}
            <span className={styles.label} data-placeholder={!selected || undefined}>
              {selected ? selected.label : placeholder}
            </span>
            <Icon name={open ? "caret-up" : "caret-down"} size={20} className={styles.caret} />
          </button>
        )}

        {open && (
          <div className={styles.menu} data-placement={placement} role="listbox" aria-label={label}>
            <ul className={styles.list} style={{ maxHeight: listMaxHeight }}>
              {filtered.length === 0 ? (
                <li className={styles.empty}>No matches found</li>
              ) : (
                filtered.map((opt) => {
                  const active = opt.value === value;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        data-selected={active || undefined}
                        className={styles.option}
                        onClick={() => {
                          onChange(opt.value);
                          setOpen(false);
                        }}
                      >
                        {opt.leading && <span className={styles.optionLeading}>{opt.leading}</span>}
                        <span className={styles.optionText}>{opt.label}</span>
                        {opt.trailing && <span className={styles.optionTrailing}>{opt.trailing}</span>}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
      <FieldError error={error} />
      {hint && <FieldHelper hint={hint} />}
    </div>
  );
}
