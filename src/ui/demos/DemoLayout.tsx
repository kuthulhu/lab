import type { ReactNode } from "react";
import styles from "./DemoLayout.module.css";

export function DemoStack({ children }: { children: ReactNode }) {
  return <div className={styles.stack}>{children}</div>;
}

export function DemoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{title}</h2>
      {children}
    </section>
  );
}

export function DemoRow({ children, align = "center" }: { children: ReactNode; align?: "center" | "start" | "stretch" }) {
  return (
    <div className={styles.row} data-align={align}>
      {children}
    </div>
  );
}

export function DemoGrid({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 | 3 }) {
  return (
    <div className={styles.grid} data-columns={columns}>
      {children}
    </div>
  );
}
