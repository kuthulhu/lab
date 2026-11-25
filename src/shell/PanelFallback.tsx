import styles from "./ExperimentPage.module.css";
import panelStyles from "./Panels.module.css";

const SKELETON_FILES = ["68px", "54px", "62px", "86px"];
const SKELETON_LINES = ["38%", "64%", "52%", "78%", "44%", "26%", "70%", "58%", "84%", "48%", "62%", "34%", "74%", "42%"];

export function PanelFallback({ label = "Loading" }: { label?: string }) {
  return (
    <div className={styles.fallback} role="status" aria-label={label}>
      <span className={styles.fallbackSpinner} aria-hidden="true" />
    </div>
  );
}

export function CodeSourceSkeleton({ label = "Highlighting source code" }: { label?: string | null }) {
  return (
    <div
      className={`${panelStyles.source} ${panelStyles.skeletonSource}`}
      role={label ? "status" : undefined}
      aria-label={label ?? undefined}
    >
      {SKELETON_LINES.map((width, idx) => (
        <div key={idx} className={panelStyles.skeletonRow}>
          <span className={panelStyles.skeletonNum} />
          <span className={panelStyles.skeletonLine} style={{ width }} />
        </div>
      ))}
    </div>
  );
}

export function CodePanelSkeleton() {
  return (
    <div role="status" aria-label="Loading source code">
      <div className={panelStyles.fileBar}>
        <div className={panelStyles.files}>
          {SKELETON_FILES.map((width, idx) => (
            <span key={idx} className={panelStyles.skeletonPill} style={{ width }} />
          ))}
        </div>
      </div>
      <CodeSourceSkeleton label={null} />
    </div>
  );
}
