import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SourceFile } from "./registry";

export interface DesignComponent {
  slug: string;
  title: string;
  description: string;
  files: string[];
  tags?: string[];
  Demo: LazyExoticComponent<ComponentType>;
}

const demoLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  alert: () => import("../ui/demos/AlertDemo"),
  "alert-dialog": () => import("../ui/demos/AlertDialogDemo"),
  badge: () => import("../ui/demos/BadgeDemo"),
  button: () => import("../ui/demos/ButtonDemo"),
  chip: () => import("../ui/demos/ChipDemo"),
  dropdown: () => import("../ui/demos/DropdownDemo"),
  field: () => import("../ui/demos/FieldDemo"),
  "form-controls": () => import("../ui/demos/FormControlsDemo"),
  icon: () => import("../ui/demos/IconDemo"),
  "list-item": () => import("../ui/demos/ListItemDemo"),
  tabs: () => import("../ui/demos/TabsDemo"),
  upload: () => import("../ui/demos/UploadDemo"),
};

const uiSourceModules = import.meta.glob<string>("../ui/*.{tsx,ts,css}", {
  query: "?raw",
  import: "default",
});

export const components: DesignComponent[] = [
  {
    slug: "alert",
    title: "Alert",
    description: "Inline status banners for neutral, info, success, warning, and destructive feedback.",
    files: ["Alert.tsx", "Alert.module.css"],
    tags: ["status", "banner", "feedback"],
    Demo: lazy(demoLoaders.alert),
  },
  {
    slug: "alert-dialog",
    title: "Alert Dialog",
    description: "Modal confirmation dialogs in default, destructive, and simple layouts with keyboard dismissal.",
    files: ["AlertDialog.tsx", "AlertDialog.module.css"],
    tags: ["modal", "dialog", "confirmation"],
    Demo: lazy(demoLoaders["alert-dialog"]),
  },
  {
    slug: "badge",
    title: "Badge",
    description: "Compact pill badges in solid, secondary, destructive, outline, and soft status styles across two sizes.",
    files: ["Badge.tsx", "Badge.module.css"],
    tags: ["pill", "tag", "status"],
    Demo: lazy(demoLoaders.badge),
  },
  {
    slug: "button",
    title: "Button",
    description: "Action buttons across eight variants, two sizes, icon-only mode, and inline loading states.",
    files: ["Button.tsx", "Button.module.css"],
    tags: ["action", "cta", "loading"],
    Demo: lazy(demoLoaders.button),
  },
  {
    slug: "chip",
    title: "Chip",
    description: "Selectable and dismissible filter chips with optional leading icons.",
    files: ["Chip.tsx", "Chip.module.css"],
    tags: ["filter", "tag", "toggle"],
    Demo: lazy(demoLoaders.chip),
  },
  {
    slug: "dropdown",
    title: "Dropdown",
    description: "Accessible select menu with optional search filtering, leading visuals, and viewport-aware placement.",
    files: ["Dropdown.tsx", "Dropdown.module.css"],
    tags: ["select", "combobox", "menu"],
    Demo: lazy(demoLoaders.dropdown),
  },
  {
    slug: "field",
    title: "Field",
    description: "Text inputs and textareas with required tooltips, hints, leading/trailing slots, and inline errors.",
    files: ["Field.tsx", "Field.module.css"],
    tags: ["input", "textarea", "form"],
    Demo: lazy(demoLoaders.field),
  },
  {
    slug: "form-controls",
    title: "Form Controls",
    description: "Radio items, radio cards, checkboxes, toggle switches, and segmented toggle groups.",
    files: ["FormControls.tsx", "FormControls.module.css"],
    tags: ["radio", "checkbox", "switch", "toggle"],
    Demo: lazy(demoLoaders["form-controls"]),
  },
  {
    slug: "icon",
    title: "Icon",
    description: "Phosphor icon wrapper supporting regular and filled weights at any pixel size.",
    files: ["Icon.tsx", "Icon.module.css"],
    tags: ["phosphor", "glyph", "vector"],
    Demo: lazy(demoLoaders.icon),
  },
  {
    slug: "list-item",
    title: "List Item",
    description: "Structured rows with leading media, descriptions, metadata, and interactive selection states.",
    files: ["ListItem.tsx", "ListItem.module.css"],
    tags: ["row", "menu", "list"],
    Demo: lazy(demoLoaders["list-item"]),
  },
  {
    slug: "tabs",
    title: "Tabs",
    description: "Segmented and line tab lists supporting horizontal and vertical orientations.",
    files: ["Tabs.tsx", "Tabs.module.css"],
    tags: ["navigation", "segmented", "tablist"],
    Demo: lazy(demoLoaders.tabs),
  },
  {
    slug: "upload",
    title: "Upload",
    description: "Drag-and-drop file dropzone paired with attachment cards across sizes and upload states.",
    files: ["Upload.tsx", "Upload.module.css"],
    tags: ["dropzone", "file", "attachment"],
    Demo: lazy(demoLoaders.upload),
  },
];

export function getComponent(slug: string | undefined): DesignComponent | undefined {
  return components.find((c) => c.slug === slug);
}

export function preloadComponent(slug: string) {
  const load = demoLoaders[slug];
  if (load) void load();
}

const sourceCache = new Map<string, Promise<SourceFile[]>>();

export function loadComponentSources(slug: string): Promise<SourceFile[]> {
  let pending = sourceCache.get(slug);
  if (!pending) {
    const entry = getComponent(slug);
    if (!entry) return Promise.resolve([]);
    pending = Promise.all(
      entry.files.map(async (name) => {
        const load = uiSourceModules[`../ui/${name}`];
        return { name, code: load ? await load() : "" };
      }),
    );
    sourceCache.set(slug, pending);
  }
  return pending;
}
