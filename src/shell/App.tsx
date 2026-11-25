import { useCallback, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Sidebar } from "./Sidebar";
import { Home } from "./Home";
import { ExperimentPage } from "./ExperimentPage";
import { ComponentPage } from "./ComponentPage";
import { MenuIcon } from "./icons";
import { experiments, preloadExperiment } from "./registry";
import { useMediaQuery } from "./useMediaQuery";
import styles from "./App.module.css";

export function App() {
  const location = useLocation();
  const isDrawer = useMediaQuery("(max-width: 860px)");
  const [navOpen, setNavOpen] = useState(false);
  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  // Warm heavy experiment chunks once the browser is idle so switching pages feels instant.
  useEffect(() => {
    const warm = () => {
      for (const e of experiments) preloadExperiment(e.slug);
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(warm);
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 300);
    return () => clearTimeout(id);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.layout}>
        <Sidebar isDrawer={isDrawer} open={isDrawer && navOpen} onOpen={openNav} onClose={closeNav} />
        <main className={styles.main} inert={isDrawer && navOpen}>
          {isDrawer && (
            <div className={styles.mobileBar}>
              <button type="button" className={styles.menuButton} onClick={openNav} aria-label="Open menu">
                <MenuIcon />
              </button>
              <Link to="/" className={styles.mobileTitle}>
                Lab
              </Link>
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              className={styles.routeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.28, ease: "easeOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
            >
              <Routes location={location}>
                <Route index element={<Home />} />
                <Route path="components/:slug" element={<ComponentPage />} />
                <Route path=":slug" element={<ExperimentPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}
