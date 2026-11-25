import { useEffect } from "react";
import { Link } from "react-router";
import { components, preloadComponent } from "./componentsRegistry";
import { experimentsByCategory, preloadExperiment } from "./registry";
import { ArrowUpRightIcon } from "./icons";
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
        <p className={styles.back}>
          <a className="link" href="https://kutlucangunay.com">
            kutlucangunay.com
            <ArrowUpRightIcon width="0.875em" height="0.875em" className={styles.arrow} />
          </a>
        </p>
      </header>

      <div className={styles.groups}>
        {experimentsByCategory.map((group) => (
          <section key={group.category} className={styles.group}>
            <h2 className={styles.groupTitle}>{group.category}</h2>
            <ul className={styles.list}>
              {group.items.map((e) => (
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
        ))}

        <section className={styles.group}>
          <h2 className={styles.groupTitle}>Components</h2>
          <ul className={styles.list}>
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
                <p className={styles.itemDescription}>{c.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
