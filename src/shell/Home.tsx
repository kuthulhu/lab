import { useEffect } from "react";
import { Link } from "react-router";
import { components, preloadComponent } from "./componentsRegistry";
import { experiments, preloadExperiment } from "./registry";
import styles from "./Home.module.css";

export function Home() {
  useEffect(() => {
    document.title = "Lab · Kutlu Can Günay";
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Lab</h1>
        <p className={styles.lede}>
          Design engineering experiments: interface details built in code. Every piece here is live. Try it in
          Preview, then read the real source in Code.
        </p>
      </header>

      <div className={styles.groups}>
        <section className={styles.group}>
          <h2 className={styles.groupTitle}>Blocks</h2>
          <ul className={styles.list}>
            {experiments.map((e) => (
              <li key={e.slug} className={styles.item}>
                <h3 className={styles.itemTitle}>
                  <Link
                    to={`/${e.slug}`}
                    className={styles.itemLink}
                    onPointerEnter={() => preloadExperiment(e.slug)}
                    onFocus={() => preloadExperiment(e.slug)}
                  >
                    {e.title}
                  </Link>
                </h3>
                <p className={styles.itemDescription}>{e.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.group}>
          <h2 className={styles.groupTitle}>Components</h2>
          <ul className={styles.componentGrid}>
            {components.map((c) => (
              <li key={c.slug} className={styles.item}>
                <h3 className={styles.itemTitle}>
                  <Link
                    to={`/components/${c.slug}`}
                    className={styles.itemLink}
                    onPointerEnter={() => preloadComponent(c.slug)}
                    onFocus={() => preloadComponent(c.slug)}
                  >
                    {c.title}
                  </Link>
                </h3>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
