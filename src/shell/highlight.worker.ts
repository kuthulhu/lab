import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

type SupportedLang = "tsx" | "typescript" | "css";

interface HighlightRequest {
  id: number;
  code: string;
  lang: SupportedLang;
}

interface HighlightResponse {
  id: number;
  html?: string;
  error?: string;
}

interface WorkerScope {
  addEventListener(type: "message", listener: (event: MessageEvent<HighlightRequest>) => void): void;
  postMessage(message: HighlightResponse): void;
}

const workerScope = globalThis as unknown as WorkerScope;

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [import("@shikijs/themes/github-light"), import("@shikijs/themes/github-dark")],
    langs: [import("@shikijs/langs/tsx"), import("@shikijs/langs/typescript"), import("@shikijs/langs/css")],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

workerScope.addEventListener("message", async (event) => {
  const { id, code, lang } = event.data;
  try {
    const h = await getHighlighter();
    const html = h.codeToHtml(code, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
    workerScope.postMessage({ id, html });
  } catch (err) {
    workerScope.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
});
