import { loadSources, type SourceFile } from "./registry";
import { loadComponentSources } from "./componentsRegistry";

type SupportedLang = "tsx" | "typescript" | "css";

const langFor = (name: string): SupportedLang =>
  name.endsWith(".tsx") ? "tsx" : name.endsWith(".ts") ? "typescript" : "css";

export interface HighlightedFile extends SourceFile {
  html: string;
  lines: number;
}

interface WorkerResponse {
  id: number;
  html?: string;
  error?: string;
}

const fileCache = new Map<string, HighlightedFile>();
const pendingFileCache = new Map<string, Promise<HighlightedFile>>();
const pendingRequests = new Map<number, { resolve: (html: string) => void; reject: (err: Error) => void }>();

let nextRequestId = 1;
let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./highlight.worker.ts", import.meta.url), { type: "module" });
    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      const { id, html, error } = event.data;
      const pending = pendingRequests.get(id);
      if (!pending) return;
      pendingRequests.delete(id);
      if (error || html === undefined) {
        pending.reject(new Error(error ?? "Syntax highlighting failed"));
      } else {
        pending.resolve(html);
      }
    });
    worker.addEventListener("error", (event) => {
      const err = new Error(event.message || "Syntax highlighter worker error");
      for (const pending of pendingRequests.values()) pending.reject(err);
      pendingRequests.clear();
      worker?.terminate();
      worker = null;
    });
  }
  return worker;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function plainCodeHtml(trimmed: string): string {
  const lines = trimmed
    .split("\n")
    .map((line) => `<span class="line">${escapeHtml(line)}</span>`)
    .join("\n");
  return `<pre class="shiki"><code>${lines}</code></pre>`;
}

function highlightInWorker(code: string, lang: SupportedLang): Promise<string> {
  if (typeof Worker === "undefined") {
    return Promise.resolve(plainCodeHtml(code));
  }
  const id = nextRequestId++;
  return new Promise<string>((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
    getWorker().postMessage({ id, code, lang });
  }).catch(() => plainCodeHtml(code));
}

function countLines(code: string): number {
  let count = 1;
  for (let i = 0; i < code.length; i++) {
    if (code.charCodeAt(i) === 10) count++;
  }
  return count;
}

export function getHighlightedFileSync(slug: string, file: SourceFile): HighlightedFile | undefined {
  return fileCache.get(`${slug}/${file.name}`);
}

export function highlightFile(slug: string, file: SourceFile): Promise<HighlightedFile> {
  const key = `${slug}/${file.name}`;
  const cached = fileCache.get(key);
  if (cached) return Promise.resolve(cached);

  let pending = pendingFileCache.get(key);
  if (!pending) {
    const trimmed = file.code.trimEnd();
    pending = highlightInWorker(trimmed, langFor(file.name)).then((html) => {
      const result: HighlightedFile = {
        ...file,
        lines: countLines(trimmed),
        html,
      };
      fileCache.set(key, result);
      pendingFileCache.delete(key);
      return result;
    });
    pendingFileCache.set(key, pending);
  }
  return pending;
}

/**
 * Preloads the worker + raw sources, highlights the entry file first,
 * then warms the remaining files one at a time during idle ticks.
 */
function warmHighlights(cacheKey: string, loadFiles: () => Promise<SourceFile[]>): void {
  if (typeof Worker !== "undefined") getWorker();
  void loadFiles().then((files) => {
    let index = 0;
    function next() {
      if (index >= files.length) return;
      const file = files[index++];
      void highlightFile(cacheKey, file).then(() => {
        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(() => next());
        } else {
          window.setTimeout(next, 16);
        }
      });
    }
    next();
  });
}

export function warmExperimentHighlights(slug: string): void {
  warmHighlights(slug, () => loadSources(slug));
}

export function warmComponentHighlights(slug: string): void {
  warmHighlights(`component:${slug}`, () => loadComponentSources(slug));
}
