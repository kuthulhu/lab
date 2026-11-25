import { lazy, Suspense, useEffect, useId, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { getComponent, type DesignComponent } from "./componentsRegistry";
import { Preview } from "./Preview";
import { CodePanelSkeleton, PanelFallback } from "./PanelFallback";
import styles from "./ExperimentPage.module.css";

const loadCodePanel = () => import("./CodePanel");
const warmCodeHighlights = (slug: string) =>
  import("./highlight").then((m) => m.warmComponentHighlights(slug));

const CodePanel = lazy(loadCodePanel);

const TABS = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function parseTab(value: string | null): TabId {
  return TABS.find((t) => t.id === value)?.id ?? "preview";
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ComponentPage() {
  const { slug } = useParams();
  const component = getComponent(slug);
  const [params, setParams] = useSearchParams();
  const tab = parseTab(params.get("tab"));

  useEffect(() => {
    document.title = component ? `${component.title} · Components · Lab` : "Component not found · Lab";
  }, [component]);

  if (!component) return <NotFound />;

  const setTab = (id: TabId) =>
    setParams(id === "preview" ? {} : { tab: id }, { replace: true, preventScrollReset: true });

  return <ComponentStage key={component.slug} component={component} tab={tab} onTabChange={setTab} />;
}

interface ComponentStageProps {
  component: DesignComponent;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
}

function ComponentStage({ component, tab, onTabChange }: ComponentStageProps) {
  const id = useId();
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const activeTab = useRef(tab);
  const placed = useRef(false);

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
    <div className={styles.stage} data-fit={tab === "preview" || undefined}>
      <header className={styles.header}>
        <p className={styles.category}>Components</p>
        <h1 className={styles.title}>{component.title}</h1>
        <p className={styles.description}>{component.description}</p>
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
                if (t.id === "code") {
                  void loadCodePanel();
                  void warmCodeHighlights(component.slug);
                }
              }}
              onFocus={() => {
                if (t.id === "code") {
                  void loadCodePanel();
                  void warmCodeHighlights(component.slug);
                }
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
        <Suspense key={tab} fallback={tab === "code" ? <CodePanelSkeleton /> : <PanelFallback />}>
          {tab === "preview" && <Preview component={component.Demo} />}
          {tab === "code" && <CodePanel slug={component.slug} scope="component" />}
        </Suspense>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className={styles.stage}>
      <header className={styles.header}>
        <h1 className={styles.title}>The component you’re looking for doesn’t exist.</h1>
        <p className={styles.notFoundLink}>
          <Link to="/" className="link">
            Back to the lab
          </Link>
        </p>
      </header>
    </div>
  );
}
