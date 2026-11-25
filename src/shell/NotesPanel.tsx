import { useMemo } from "react";
import { marked } from "marked";
import { getNotes, type Experiment } from "./registry";
import styles from "./Panels.module.css";

const dateFormat = new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" });

export default function NotesPanel({ experiment }: { experiment: Experiment }) {
  const markdown = getNotes(experiment.slug);
  const html = useMemo(() => (markdown ? marked.parse(markdown, { async: false }) : null), [markdown]);
  const dependencies = Object.entries(experiment.dependencies ?? {});

  return (
    <article className={styles.notes}>
      <dl className={styles.meta}>
        <div>
          <dt>Published</dt>
          <dd>
            <time dateTime={experiment.date}>{dateFormat.format(new Date(experiment.date))}</time>
          </dd>
        </div>
        {experiment.tags && (
          <div>
            <dt>Techniques</dt>
            <dd>{experiment.tags.join(", ")}</dd>
          </div>
        )}
        <div>
          <dt>Dependencies</dt>
          <dd>{dependencies.length ? dependencies.map(([name]) => name).join(", ") : "None, just React"}</dd>
        </div>
      </dl>
      {html ? (
        // Notes are markdown files from this repo, not user input.
        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className={styles.empty}>No notes for this one yet.</p>
      )}
    </article>
  );
}
