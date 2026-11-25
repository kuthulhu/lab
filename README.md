# Lab

Design engineering experiments by Kutlu Can Günay, published at [lab.kutlucangunay.com](https://lab.kutlucangunay.com).

Every experiment is live, not a mockup. Each one has these views:

- **Preview** renders the component natively, with a Reset button that remounts it.
- **Code** shows the experiment's real source files, highlighted with Shiki.
- **Playground** loads the same files into an editable Sandpack sandbox. *Hidden for now*: set `SHOW_PLAYGROUND` to `true` in `src/shell/ExperimentPage.tsx` to bring it back.
- **Notes** is a short write-up of the decisions that matter.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build into dist/
npm run lint
```

## Add an experiment

Create a folder in `src/experiments/`. It's picked up automatically by the sidebar, the routes, the Code tab and the Playground.

```
src/experiments/my-thing/
  meta.ts           # title, category, description, date, tags, dependencies
  index.tsx         # default export: the component
  *.tsx, *.ts       # any supporting files (all shown in Code)
  *.module.css      # styles (CSS Modules)
  notes.md          # optional write-up for the Notes tab
```

Rules that keep every experiment portable to the Playground:

- Import only from the experiment's own folder, the shared design-system components in `src/ui/` (`../../ui`), `react`, `react-dom`, and packages listed in `meta.dependencies`. Never import from `src/shell`.
- Use the shared UI components in `src/ui/` (`Button`, `Badge`, `Chip`, `TextField`, `TextArea`, `Dropdown`, `RadioItem`, `CheckboxItem`, `Toggle`, `Tabs`, `ListItem`, `Alert`, `AlertDialog`, `FileUploadDropzone`, `Attachment`, `Icon`, …) rather than re-implementing design-system primitives locally. They're injected into the Playground sandbox automatically.
- Style with the tokens in `src/styles/tokens.css` (`var(--accent)`, `var(--surface)`, `var(--radius-lg)`, `var(--space-2)`, …). They're injected into the sandbox too.
- The tokens come from the [Labs Figma design system](https://www.figma.com/design/oggZUVC4YuShzMLOcdlHDu/Labs) (variables in light and dark, text styles, effect styles). Raised things (cards, inputs, secondary buttons) sit on `--bg` with a `--border` and a shadow; `--surface` to `--surface-4` are hover, press and fill layers. When the Figma variables change, update `tokens.css` and the Sandpack theme objects in `src/shell/PlaygroundPanel.tsx` to match.
- Build responsive layouts with container queries: `@container (min-width: …)`. Preview and Playground both wrap the experiment in an inline-size container, so it responds to the space it's given rather than the window.
- Respect `prefers-reduced-motion`.

## Deploy

GitHub Pages, via [.github/workflows/deploy.yml](.github/workflows/deploy.yml). Every push to `main` lints, builds and deploys.

GitHub Pages can't rewrite routes, so after `vite build` the [scripts/spa-routes.mjs](scripts/spa-routes.mjs) script writes `dist/<slug>.html` for each experiment, which Pages serves at `/<slug>`. It also writes `dist/404.html`, so unknown paths still load the app and show its not-found page. `public/CNAME` sets the custom domain.

One-time setup:

1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. At your DNS provider, add a `CNAME` record from `lab` to `<your-github-username>.github.io`.
4. Back in **Settings → Pages**, confirm the custom domain shows `lab.kutlucangunay.com`. Tick **Enforce HTTPS** once the certificate is issued, which can take a few minutes after DNS resolves.
