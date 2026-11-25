import styles from "./Icon.module.css";

export interface IconProps {
  /** Phosphor icon name without the `ph-` prefix (e.g. `"check"`, `"caret-left"`, `"camera"`). */
  name: string;
  weight?: "regular" | "fill";
  size?: number;
  className?: string;
}

/** Phosphor icon rendered via the CDN webfont loaded in index.html & Playground. */
export function Icon({ name, weight = "regular", size = 20, className }: IconProps) {
  const prefix = weight === "fill" ? "ph-fill" : "ph";
  return (
    <i
      className={`${prefix} ph-${name} ${styles.icon}${className ? ` ${className}` : ""}`}
      style={{ fontSize: size }}
      aria-hidden="true"
    />
  );
}
