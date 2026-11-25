import { useState } from "react";
import { Icon } from "../Icon";
import { Tabs, TabTrigger } from "../Tabs";
import { DemoRow, DemoSection, DemoStack } from "./DemoLayout";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: "squares-four" },
  { id: "tokens", label: "Tokens", icon: "swatches" },
  { id: "usage", label: "Usage", icon: "code" },
  { id: "changelog", label: "Changelog", icon: "clock-counter-clockwise" },
];

export default function TabsDemo() {
  const [segmented, setSegmented] = useState("overview");
  const [line, setLine] = useState("tokens");
  const [verticalSegmented, setVerticalSegmented] = useState("overview");
  const [verticalLine, setVerticalLine] = useState("tokens");

  return (
    <DemoStack>
      <DemoSection title="Segmented (horizontal)">
        <DemoRow>
          <Tabs variant="segmented" aria-label="Segmented tabs">
            {SECTIONS.map((s) => (
              <TabTrigger
                key={s.id}
                selected={segmented === s.id}
                leadingIcon={<Icon name={s.icon} size={16} />}
                onClick={() => setSegmented(s.id)}
              >
                {s.label}
              </TabTrigger>
            ))}
          </Tabs>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Line (horizontal)">
        <DemoRow>
          <Tabs variant="line" aria-label="Line tabs">
            {SECTIONS.map((s) => (
              <TabTrigger key={s.id} selected={line === s.id} onClick={() => setLine(s.id)}>
                {s.label}
              </TabTrigger>
            ))}
          </Tabs>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Vertical orientation">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 32 }}>
          <Tabs variant="segmented" orientation="vertical" aria-label="Vertical segmented tabs">
            {SECTIONS.map((s) => (
              <TabTrigger
                key={s.id}
                selected={verticalSegmented === s.id}
                leadingIcon={<Icon name={s.icon} size={16} />}
                onClick={() => setVerticalSegmented(s.id)}
              >
                {s.label}
              </TabTrigger>
            ))}
          </Tabs>

          <Tabs variant="line" orientation="vertical" aria-label="Vertical line tabs">
            {SECTIONS.map((s) => (
              <TabTrigger key={s.id} selected={verticalLine === s.id} onClick={() => setVerticalLine(s.id)}>
                {s.label}
              </TabTrigger>
            ))}
          </Tabs>
        </div>
      </DemoSection>
    </DemoStack>
  );
}
