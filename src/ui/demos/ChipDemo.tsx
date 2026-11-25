import { useState } from "react";
import { Button } from "../Button";
import { Chip } from "../Chip";
import { Icon } from "../Icon";
import { DemoRow, DemoSection, DemoStack } from "./DemoLayout";

const TOPICS = [
  { id: "tokens", label: "Design tokens", icon: "swatches" },
  { id: "motion", label: "Motion", icon: "sparkle" },
  { id: "a11y", label: "Accessibility", icon: "wheelchair" },
  { id: "layout", label: "Layout", icon: "grid-four" },
  { id: "typography", label: "Typography", icon: "text-aa" },
];

const INITIAL_FILTERS = ["React 19", "CSS Modules", "TypeScript", "Dark mode"];

export default function ChipDemo() {
  const [selected, setSelected] = useState<string[]>(["tokens", "motion"]);
  const [filters, setFilters] = useState<string[]>(INITIAL_FILTERS);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  return (
    <DemoStack>
      <DemoSection title="Selectable chips">
        <DemoRow>
          {TOPICS.map((topic) => (
            <Chip
              key={topic.id}
              selected={selected.includes(topic.id)}
              leadingIcon={<Icon name={topic.icon} size={14} />}
              onClick={() => toggle(topic.id)}
            >
              {topic.label}
            </Chip>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Dismissible chips">
        <DemoRow>
          {filters.map((filter) => (
            <Chip
              key={filter}
              selected
              onDismiss={() => setFilters((prev) => prev.filter((item) => item !== filter))}
            >
              {filter}
            </Chip>
          ))}
          {filters.length < INITIAL_FILTERS.length && (
            <Button variant="ghost" size="small" onClick={() => setFilters(INITIAL_FILTERS)}>
              Restore all
            </Button>
          )}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Disabled">
        <DemoRow>
          <Chip disabled>Disabled unselected</Chip>
          <Chip selected disabled>
            Disabled selected
          </Chip>
        </DemoRow>
      </DemoSection>
    </DemoStack>
  );
}
