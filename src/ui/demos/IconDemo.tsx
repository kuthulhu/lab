import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../FormControls";
import { Icon } from "../Icon";
import { DemoRow, DemoSection, DemoStack } from "./DemoLayout";

const SPECIMEN_ICONS = [
  "sparkle",
  "check-circle",
  "warning",
  "warning-circle",
  "info",
  "magnifying-glass",
  "plus",
  "x",
  "arrow-right",
  "arrow-up-right",
  "caret-down",
  "caret-right",
  "copy",
  "trash",
  "gear",
  "floppy-disk",
  "upload-simple",
  "file-text",
  "folder",
  "envelope",
  "bell",
  "user",
  "lock",
  "sun",
];

export default function IconDemo() {
  const [weight, setWeight] = useState<"regular" | "fill">("regular");

  return (
    <DemoStack>
      <DemoSection title="Weight">
        <DemoRow>
          <ToggleGroup aria-label="Icon weight">
            <ToggleGroupItem active={weight === "regular"} onClick={() => setWeight("regular")}>
              Regular
            </ToggleGroupItem>
            <ToggleGroupItem active={weight === "fill"} onClick={() => setWeight("fill")}>
              Fill
            </ToggleGroupItem>
          </ToggleGroup>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Specimen">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
            gap: 8,
          }}
        >
          {SPECIMEN_ICONS.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 8px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                background: "var(--bg)",
              }}
            >
              <Icon name={name} weight={weight} size={20} />
              <span
                style={{
                  font: "var(--weight-medium) var(--text-body-xs) var(--font-mono)",
                  color: "var(--text-3)",
                  textAlign: "center",
                  wordBreak: "break-word",
                }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </DemoSection>
    </DemoStack>
  );
}
