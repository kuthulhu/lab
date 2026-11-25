// GitHub Pages has no rewrite rules, so a deep link like /gallery would 404.
// Pages serves /gallery from gallery.html, so write the app shell once per
// experiment (real 200 responses), plus 404.html so unknown paths still boot
// the app and show its own not-found view.
import { copyFile, mkdir, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const experimentsDir = path.join(root, "src/experiments");
const componentsRegistryPath = path.join(root, "src/shell/componentsRegistry.ts");
const shell = path.join(dist, "index.html");

const entries = await readdir(experimentsDir, { withFileTypes: true });
const slugs = [];
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const hasMeta = await stat(path.join(experimentsDir, entry.name, "meta.ts")).then(
    () => true,
    () => false,
  );
  if (hasMeta) slugs.push(entry.name);
}

const registrySource = await readFile(componentsRegistryPath, "utf8");
const componentSlugs = [...registrySource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

await mkdir(path.join(dist, "components"), { recursive: true });

await Promise.all([
  ...slugs.map((slug) => copyFile(shell, path.join(dist, `${slug}.html`))),
  ...componentSlugs.map((slug) => copyFile(shell, path.join(dist, "components", `${slug}.html`))),
  copyFile(shell, path.join(dist, "404.html")),
]);

console.log(
  `spa-routes: wrote ${slugs.length} experiment routes + ${componentSlugs.length} component routes + 404.html`,
);
