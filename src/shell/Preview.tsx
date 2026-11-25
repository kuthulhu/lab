import { Component, Suspense, useState, type ComponentType, type ReactNode } from "react";
import type { Experiment } from "./registry";
import { ResetIcon } from "./icons";
import styles from "./ExperimentPage.module.css";

type PreviewProps = { experiment: Experiment } | { component: ComponentType };

export function Preview(props: PreviewProps) {
  const [runId, setRunId] = useState(0);
  const Target = "experiment" in props ? props.experiment.Component : props.component;

  return (
    <div className={styles.preview}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolButton} onClick={() => setRunId((n) => n + 1)}>
          <ResetIcon />
          Reset
        </button>
      </div>

      <div className={styles.canvas}>
        <div className={styles.scroller}>
          <div className={styles.frame}>
            <ErrorBoundary key={runId}>
              <Suspense fallback={null}>
                <div className={styles.previewContent}>
                  <Target />
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.error} role="alert">
          <strong>This experiment crashed.</strong>
          <code>{this.state.error.message}</code>
        </div>
      );
    }
    return this.props.children;
  }
}
