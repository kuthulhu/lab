import { use, useEffect, useMemo, useState } from "react";
import {
  getHighlightedFileSync,
  highlightFile,
  warmComponentHighlights,
  warmExperimentHighlights,
  type HighlightedFile,
} from "./highlight";
import { CheckIcon, CopyIcon } from "./icons";
import { loadComponentSources } from "./componentsRegistry";
import { CodeSourceSkeleton } from "./PanelFallback";
import { loadSources } from "./registry";
import styles from "./Panels.module.css";

export default function CodePanel({
  slug,
  scope = "experiment",
}: {
  slug: string;
  scope?: "experiment" | "component";
}) {
  const cacheKey = scope === "component" ? `component:${slug}` : slug;
  const files = use(scope === "component" ? loadComponentSources(slug) : loadSources(slug));
  const [activeName, setActiveName] = useState(files[0]?.name);
  const active = files.find((f) => f.name === activeName) ?? files[0];

  const syncHighlighted = active ? getHighlightedFileSync(cacheKey, active) : undefined;
  const [asyncHighlighted, setAsyncHighlighted] = useState<HighlightedFile | null>(null);

  useEffect(() => {
    if (scope === "component") {
      warmComponentHighlights(slug);
    } else {
      warmExperimentHighlights(slug);
    }
  }, [slug, scope]);

  useEffect(() => {
    if (!active || getHighlightedFileSync(cacheKey, active)) return;
    let cancelled = false;
    void highlightFile(cacheKey, active).then((res) => {
      if (!cancelled) setAsyncHighlighted(res);
    });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, active]);

  const activeLineCount = useMemo(() => {
    if (!active) return 0;
    if (syncHighlighted) return syncHighlighted.lines;
    return active.code.trimEnd().split("\n").length;
  }, [active, syncHighlighted]);

  if (!active) return <p className={styles.empty}>No source files.</p>;

  const highlighted =
    syncHighlighted ?? (asyncHighlighted?.name === active.name ? asyncHighlighted : undefined);

  return (
    <div>
      <div className={styles.fileBar}>
        <div className={styles.files} role="group" aria-label="Files">
          {files.map((file) => (
            <button
              key={file.name}
              type="button"
              aria-pressed={file.name === active.name}
              className={styles.file}
              onPointerEnter={() => void highlightFile(cacheKey, file)}
              onFocus={() => void highlightFile(cacheKey, file)}
              onClick={() => setActiveName(file.name)}
            >
              {file.name}
            </button>
          ))}
        </div>
        <span className={styles.lineCount}>{activeLineCount} lines</span>
        <CopyButton text={active.code} />
      </div>
      {highlighted ? (
        <div
          key={active.name}
          className={styles.source}
          // Shiki output is generated at runtime from this repo's own source files.
          dangerouslySetInnerHTML={{ __html: highlighted.html }}
        />
      ) : (
        <CodeSourceSkeleton />
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard can be denied (insecure context, permissions); the code is still selectable.
    }
  }

  return (
    <button type="button" className={styles.copy} onClick={copy} data-copied={copied || undefined}>
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
