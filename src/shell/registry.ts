import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { CATEGORIES, type Category, type ExperimentMeta } from "../experiments/types";

/*
 * Experiments are discovered from the filesystem. Adding a folder under
 * src/experiments/ with a meta.ts and an index.tsx is all it takes to
 * appear in the sidebar, the Code tab and the Playground.
 */

const metaModules = import.meta.glob<{ default: ExperimentMeta }>("../experiments/*/meta.ts", {
  eager: true,
});

const componentModules = import.meta.glob<{ default: ComponentType }>("../experiments/*/index.tsx");

const sourceModules = import.meta.glob<string>(
  ["../experiments/*/*.{tsx,ts,css}", "!../experiments/*/meta.ts"],
  { query: "?raw", import: "default" },
);

const notesModules = import.meta.glob<string>("../experiments/*/notes.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export interface Experiment extends ExperimentMeta {
  slug: string;
  Component: LazyExoticComponent<ComponentType>;
}

export interface SourceFile {
  name: string;
  code: string;
}

const slugOf = (path: string) => path.split("/")[2];

export const experiments: Experiment[] = Object.entries(metaModules)
  .map(([path, mod]) => {
    const slug = slugOf(path);
    const loader = componentModules[`../experiments/${slug}/index.tsx`];
    if (!loader) throw new Error(`Experiment "${slug}" is missing index.tsx`);
    return { ...mod.default, slug, Component: lazy(loader) };
  })
  .sort(
    (a, b) =>
      CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) ||
      a.title.localeCompare(b.title),
  );

export const experimentsByCategory = CATEGORIES.map((category) => ({
  category,
  items: experiments.filter((e) => e.category === category),
})).filter((group): group is { category: Category; items: Experiment[] } => group.items.length > 0);

export function getExperiment(slug: string | undefined) {
  return experiments.find((e) => e.slug === slug);
}

export function preloadExperiment(slug: string) {
  const load = componentModules[`../experiments/${slug}/index.tsx`];
  if (load) void load();
}

const sourceCache = new Map<string, Promise<SourceFile[]>>();

/** Source files for an experiment, entry file first, the rest alphabetical. */
export function loadSources(slug: string): Promise<SourceFile[]> {
  let pending = sourceCache.get(slug);
  if (!pending) {
    const prefix = `../experiments/${slug}/`;
    const entries = Object.entries(sourceModules).filter(([path]) => path.startsWith(prefix));
    pending = Promise.all(
      entries.map(async ([path, load]) => ({ name: path.slice(prefix.length), code: await load() })),
    ).then((files) =>
      files.sort((a, b) =>
        a.name === "index.tsx" ? -1 : b.name === "index.tsx" ? 1 : a.name.localeCompare(b.name),
      ),
    );
    sourceCache.set(slug, pending);
  }
  return pending;
}

export function getNotes(slug: string): string | null {
  return notesModules[`../experiments/${slug}/notes.md`] ?? null;
}
