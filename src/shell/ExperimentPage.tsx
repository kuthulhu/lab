import { lazy, Suspense, useEffect, useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { getExperiment, type Experiment } from "./registry";
import { Preview } from "./Preview";
import NotesPanel from "./NotesPanel";
import { CodePanelSkeleton, PanelFallback } from "./PanelFallback";
import styles from "./ExperimentPage.module.css";

// Each panel's chunk starts loading when its tab is hovered or focused, so the
// click itself rarely has to wait (a lazy chunk would otherwise hold the tab switch).
const panelLoaders = {
  code: () => import("./CodePanel"),
  playground: () => import("./PlaygroundPanel"),
};

const warmCodeHighlights = (slug: string) =>
  import("./highlight").then((m) => m.warmExperimentHighlights(slug));

const CodePanel = lazy(panelLoaders.code);
const PlaygroundPanel = lazy(panelLoaders.playground);

// Playground is hidden for now; set to true to bring the tab back.
const SHOW_PLAYGROUND = false;

const ALL_TABS = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
  { id: "playground", label: "Playground" },
  { id: "notes", label: "Notes" },
] as const;

type TabId = (typeof ALL_TABS)[number]["id"];

// A ?tab=playground link falls back to Preview while the tab is hidden.
const TABS = ALL_TABS.filter((t) => SHOW_PLAYGROUND || t.id !== "playground");

function parseTab(value: string | null): TabId {
  return TABS.find((t) => t.id === value)?.id ?? "preview";
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ExperimentPage() {
  const { slug } = useParams();
  const experiment = getExperiment(slug);
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get("tab"));

  useEffect(() => {
    document.title = experiment ? `${experiment.title} · Lab` : "Page not found · Lab";
  }, [experiment]);

  if (!experiment) return <NotFound />;

  const setTab = (id: TabId) =>
    setParams(id === "preview" ? {} : { tab: id }, { replace: true, preventScrollReset: true });

  return <Stage key={experiment.slug} experiment={experiment} tab={tab} onTabChange={setTab} />;
}

interface StageProps {
  experiment: Experiment;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
}

function Stage({ experiment, tab, onTabChange }: StageProps) {
  const id = useId();
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const activeTab = useRef(tab);
  const placed = useRef(false);

  // The underline glides when a tab is picked, as on kutlucangunay.com,
  // but is placed without motion on first render and whenever a tab resizes.
  function placeIndicator(glide: boolean) {
    const el = tabRefs.current[activeTab.current];
    const indicator = indicatorRef.current;
    if (!el || !indicator) return;
    indicator.toggleAttribute("data-animate", glide && !reducedMotion());
    indicator.style.setProperty("--tab-x", `${el.offsetLeft}px`);
    indicator.style.setProperty("--tab-width", `${el.offsetWidth}px`);
  }

  useLayoutEffect(() => {
    activeTab.current = tab;
    placeIndicator(placed.current);
    placed.current = true;
  }, [tab]);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => placeIndicator(false));
    for (const el of Object.values(tabRefs.current)) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function onTabsKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = TABS.findIndex((t) => t.id === tab);
    const next =
      event.key === "ArrowRight"
        ? TABS[(index + 1) % TABS.length]
        : event.key === "ArrowLeft"
          ? TABS[(index - 1 + TABS.length) % TABS.length]
          : event.key === "Home"
            ? TABS[0]
            : event.key === "End"
              ? TABS[TABS.length - 1]
              : undefined;
    if (next) {
      event.preventDefault();
      onTabChange(next.id);
      tabRefs.current[next.id]?.focus();
    }
  }

  return (
    // On Preview the page fits the window and the canvas scrolls its own content;
    // Code and Notes scroll as a normal page.
    <div className={styles.stage} data-fit={tab === "preview" || undefined}>
      <header className={styles.header}>
        <p className={styles.category}>{experiment.category}</p>
        <h1 className={styles.title}>{experiment.title}</h1>
        <p className={styles.description}>{experiment.description}</p>
      </header>

      <div className={styles.tabsScroller}>
        <div className={styles.tabs} role="tablist" aria-label="View" onKeyDown={onTabsKeyDown}>
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`${id}-panel`}
              tabIndex={tab === t.id ? 0 : -1}
              className={styles.tab}
              onPointerEnter={() => {
                if (t.id === "code" || t.id === "playground") void panelLoaders[t.id]();
                if (t.id === "code") void warmCodeHighlights(experiment.slug);
              }}
              onFocus={() => {
                if (t.id === "code" || t.id === "playground") void panelLoaders[t.id]();
                if (t.id === "code") void warmCodeHighlights(experiment.slug);
              }}
              onClick={() => onTabChange(t.id)}
            >
              {t.label}
            </button>
          ))}
          <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.panel} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`}>
        {tab === "notes" ? (
          <NotesPanel experiment={experiment} />
        ) : (
          <Suspense key={tab} fallback={tab === "code" ? <CodePanelSkeleton /> : <PanelFallback />}>
            {tab === "preview" && <Preview experiment={experiment} />}
            {tab === "code" && <CodePanel slug={experiment.slug} />}
            {tab === "playground" && <PlaygroundPanel experiment={experiment} />}
          </Suspense>
        )}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className={styles.stage}>
      <header className={styles.header}>
        <h1 className={styles.title}>The experiment you’re looking for doesn’t exist.</h1>
        <p className={styles.notFoundLink}>
          <Link to="/" className="link">
            Back to the lab
          </Link>
        </p>
      </header>
    </div>
  );
}
