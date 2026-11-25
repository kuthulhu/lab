export const CATEGORIES = [
  "Forms & input",
  "Feedback & motion",
  "Media & layout",
  "Cards & surfaces",
  "Navigation & overlays",
  "Data & interaction",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ExperimentMeta {
  title: string;
  category: Category;
  /** One sentence, under ~100 characters: the page header reserves two lines for it (three on phones). */
  description: string;
  /** ISO date, used for ordering and the "new" badge. */
  date: string;
  /** Short technique labels shown in the header, e.g. "@property", "layoutId". */
  tags?: string[];
  /** npm packages the Playground sandbox needs beyond react/react-dom. */
  dependencies?: Record<string, string>;
}
