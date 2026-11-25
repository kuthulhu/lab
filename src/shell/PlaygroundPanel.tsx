import { use, useMemo } from "react";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackTheme,
} from "@codesandbox/sandpack-react";
import tokensCss from "../styles/tokens.css?raw";
import { loadSources, type Experiment } from "./registry";
import { useTheme, type ResolvedTheme } from "./theme";
import styles from "./Panels.module.css";

/*
 * The Playground mounts the experiment's real source files into a Sandpack
 * sandbox under /experiments/app/ and the shared design-system components under
 * /ui/, so `import { ... } from "../../ui"` resolves identically to Vite.
 */

const uiModules = import.meta.glob<string>("../ui/*.{tsx,ts,css}", {
  eager: true,
  query: "?raw",
  import: "default",
});

const appFile = `import Experiment from "./experiments/app";

export default function App() {
  return (
    <main className="stage">
      <Experiment />
    </main>
  );
}
`;

const fontImport =
  `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Inter+Tight:wght@400..600&family=Red+Hat+Mono:wght@400..700&display=swap");\n` +
  `@import url("https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/regular/style.css");\n` +
  `@import url("https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/fill/style.css");\n`;

const stageCss = `
body {
  background-color: var(--bg);
  background-image: radial-gradient(circle at 1px 1px, var(--border-strong) 1px, transparent 0);
  background-size: 20px 20px;
}

#root {
  display: flex;
  min-height: 100vh;
}

.stage {
  container-type: inline-size;
  container-name: stage;
  width: 100%;
  margin: auto;
  padding: 32px 20px;
}
`;

const entryFile = (theme: ResolvedTheme) => `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

document.documentElement.dataset.theme = "${theme}";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

export default function PlaygroundPanel({ experiment }: { experiment: Experiment }) {
  const sources = use(loadSources(experiment.slug));
  const { resolved } = useTheme();

  const files = useMemo(() => {
    const result: Record<string, { code: string; hidden?: boolean; active?: boolean }> = {
      "/index.tsx": { code: entryFile(resolved), hidden: true },
      "/styles.css": { code: fontImport + tokensCss + stageCss, hidden: true },
      "/App.tsx": { code: appFile, hidden: true },
    };
    for (const [path, code] of Object.entries(uiModules)) {
      const name = path.slice("../ui/".length);
      result[`/ui/${name}`] = { code, hidden: true };
    }
    for (const file of sources) {
      result[`/experiments/app/${file.name}`] = { code: file.code, active: file.name === "index.tsx" };
    }
    return result;
  }, [sources, resolved]);

  return (
    <div className={styles.playground}>
      <SandpackProvider
        // A theme change rebuilds the sandbox so the injected data-theme matches.
        key={resolved}
        template="react-ts"
        files={files}
        theme={resolved === "dark" ? darkTheme : lightTheme}
        customSetup={{
          dependencies: { react: "^19.0.0", "react-dom": "^19.0.0", ...experiment.dependencies },
        }}
        options={{ recompileMode: "delayed", recompileDelay: 400 }}
      >
        <SandpackLayout className={styles.sandpackLayout}>
          <SandpackCodeEditor showTabs showLineNumbers wrapContent={false} className={styles.sandpackPane} />
          <SandpackPreview showOpenInCodeSandbox showRefreshButton className={styles.sandpackPane} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

const font = {
  body: "var(--font-sans)",
  mono: "var(--font-mono)",
  size: "13px",
  lineHeight: "1.6",
};

// Mirrors tokens.css; Sandpack needs literal colors for its editor chrome.
const lightTheme: SandpackTheme = {
  colors: {
    surface1: "#fafafa",
    surface2: "#e4e4e7",
    surface3: "#f4f4f5",
    disabled: "#d4d4d8",
    base: "#71717a",
    clickable: "#a1a1aa",
    hover: "#0e0e0f",
    accent: "#e300ae",
    error: "#c83436",
    errorSurface: "#ffe9e6",
  },
  syntax: {
    plain: "#24292e",
    comment: { color: "#6a737d", fontStyle: "italic" },
    keyword: "#d73a49",
    tag: "#22863a",
    punctuation: "#24292e",
    definition: "#6f42c1",
    property: "#005cc5",
    static: "#005cc5",
    string: "#032f62",
  },
  font,
};

const darkTheme: SandpackTheme = {
  colors: {
    surface1: "#0e0e0f",
    surface2: "#27272a",
    surface3: "#18181b",
    disabled: "#3f3f46",
    base: "#a1a1aa",
    clickable: "#71717a",
    hover: "#fafafa",
    accent: "#f26bc4",
    error: "#ffcec9",
    errorSurface: "#77191b",
  },
  syntax: {
    plain: "#e1e4e8",
    comment: { color: "#6a737d", fontStyle: "italic" },
    keyword: "#f97583",
    tag: "#85e89d",
    punctuation: "#e1e4e8",
    definition: "#b392f0",
    property: "#79b8ff",
    static: "#79b8ff",
    string: "#9ecbff",
  },
  font,
};
