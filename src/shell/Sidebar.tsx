import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { components, preloadComponent } from "./componentsRegistry";
import { experiments, preloadExperiment } from "./registry";
import { useTheme, type ThemePreference } from "./theme";
import {
  ArrowUpRightIcon,
  ChevronRightIcon,
  CloseIcon,
  MonitorIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "./icons";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isDrawer: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function Sidebar({ isDrawer, open, onOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const isOnComponentRoute = location.pathname.startsWith("/components/");
  const [query, setQuery] = useState("");
  const [componentsOpen, setComponentsOpen] = useState(isOnComponentRoute);
  const [prevOnComponentRoute, setPrevOnComponentRoute] = useState(isOnComponentRoute);
  const componentsListId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  if (isOnComponentRoute !== prevOnComponentRoute) {
    setPrevOnComponentRoute(isOnComponentRoute);
    if (isOnComponentRoute) setComponentsOpen(true);
  }

  const trimmedQuery = query.trim().toLowerCase();

  // A flat list; categories aren't shown but still count as search terms.
  const results = useMemo(() => {
    if (!trimmedQuery) return experiments;
    return experiments.filter((e) =>
      [e.title, e.category, e.description, ...(e.tags ?? [])].some((s) => s.toLowerCase().includes(trimmedQuery)),
    );
  }, [trimmedQuery]);

  const componentResults = useMemo(() => {
    if (!trimmedQuery) return components;
    return components.filter((c) =>
      [c.title, "components", c.description, ...(c.tags ?? [])].some((s) => s.toLowerCase().includes(trimmedQuery)),
    );
  }, [trimmedQuery]);

  const isComponentsExpanded = trimmedQuery ? componentResults.length > 0 : componentsOpen;
  const hasAnyResults = results.length > 0 || componentResults.length > 0;

  // ⌘K / Ctrl+K jumps to search from anywhere; Escape closes the mobile drawer.
  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
        requestAnimationFrame(() => searchRef.current?.select());
      } else if (event.key === "Escape" && isDrawer && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDrawer, open, onOpen, onClose]);

  useEffect(() => {
    if (isDrawer && open) searchRef.current?.focus({ preventScroll: true });
  }, [isDrawer, open]);

  const links = () =>
    Array.from(navRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []).filter(
      (a) => !a.closest("[inert]"),
    );

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      links()[0]?.focus();
    } else if (event.key === "Enter") {
      const firstExperiment = results[0];
      const firstComponent = componentResults[0];
      if (firstExperiment) {
        navigate(`/${firstExperiment.slug}`);
        setQuery("");
        onClose();
      } else if (firstComponent) {
        navigate(`/components/${firstComponent.slug}`);
        setQuery("");
        onClose();
      }
    } else if (event.key === "Escape" && query) {
      event.stopPropagation();
      setQuery("");
    }
  }

  function onNavKeyDown(event: KeyboardEvent<HTMLElement>) {
    const all = links();
    const index = all.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    const target =
      event.key === "ArrowDown"
        ? all[index + 1]
        : event.key === "ArrowUp"
          ? (all[index - 1] ?? searchRef.current)
          : event.key === "Home"
            ? all[0]
            : event.key === "End"
              ? all.at(-1)
              : undefined;
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }

  return (
    <>
      {isDrawer && (
        <div className={styles.backdrop} data-open={open || undefined} onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={styles.sidebar}
        data-drawer={isDrawer || undefined}
        data-open={open || undefined}
        inert={isDrawer && !open}
        aria-label="Experiments"
      >
        <header className={styles.header}>
          <div className={styles.identity}>
            <Link to="/" className={styles.brand} onClick={onClose}>
              Lab
            </Link>
            <a className={`link ${styles.home}`} href="https://kutlucangunay.com">
              by Kutlu Can Günay
              <ArrowUpRightIcon width="0.875em" height="0.875em" />
            </a>
          </div>
          {isDrawer && (
            <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close menu">
              <CloseIcon />
            </button>
          )}
        </header>

        <div className={styles.search}>
          <SearchIcon className={styles.searchIcon} />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKeyDown}
            placeholder="Search"
            aria-label="Search experiments"
            spellCheck={false}
          />
          {!query && <kbd className={styles.kbd}>{isMac ? "⌘K" : "Ctrl K"}</kbd>}
        </div>

        <nav ref={navRef} className={styles.nav} onKeyDown={onNavKeyDown}>
          {results.length > 0 && (
            <ul>
              {results.map((e) => (
                <li key={e.slug}>
                  <NavLink
                    to={`/${e.slug}`}
                    className={styles.link}
                    onPointerEnter={() => preloadExperiment(e.slug)}
                    onFocus={() => preloadExperiment(e.slug)}
                    onClick={onClose}
                  >
                    {e.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}

          {(!trimmedQuery || componentResults.length > 0) && (
            <div className={styles.group}>
              <button
                type="button"
                className={styles.groupToggle}
                aria-expanded={isComponentsExpanded}
                aria-controls={componentsListId}
                onClick={() => setComponentsOpen((v) => !v)}
              >
                <ChevronRightIcon
                  width={14}
                  height={14}
                  className={styles.chevron}
                  data-open={isComponentsExpanded || undefined}
                />
                <span>Components</span>
                <span className={styles.groupCount}>{componentResults.length}</span>
              </button>

              <div
                id={componentsListId}
                className={styles.collapsible}
                data-open={isComponentsExpanded || undefined}
                inert={!isComponentsExpanded}
              >
                <div className={styles.collapsibleInner}>
                  <ul className={styles.subList}>
                    {componentResults.map((c) => (
                      <li key={c.slug}>
                        <NavLink
                          to={`/components/${c.slug}`}
                          className={styles.link}
                          onPointerEnter={() => preloadComponent(c.slug)}
                          onFocus={() => preloadComponent(c.slug)}
                          onClick={onClose}
                        >
                          {c.title}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!hasAnyResults && <p className={styles.empty}>Nothing matches “{query}”.</p>}
        </nav>

        <footer className={styles.footer}>
          <span className={styles.count}>
            {experiments.length} experiment{experiments.length === 1 ? "" : "s"} · {components.length} components
          </span>
          <ThemeSwitcher />
        </footer>
      </aside>
    </>
  );
}

const themeOptions: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: "system", label: "System theme", Icon: MonitorIcon },
  { value: "light", label: "Light theme", Icon: SunIcon },
  { value: "dark", label: "Dark theme", Icon: MoonIcon },
];

function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();
  return (
    <div className={styles.themes} role="group" aria-label="Theme">
      {themeOptions.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={preference === value}
          aria-label={label}
          title={label}
          className={styles.themeButton}
          onClick={() => setPreference(value)}
        >
          <Icon width={14} height={14} />
        </button>
      ))}
    </div>
  );
}
