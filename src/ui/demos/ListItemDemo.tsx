import { useState } from "react";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import { ListItem } from "../ListItem";
import { DemoGrid, DemoSection, DemoStack } from "./DemoLayout";

const ITEMS = [
  { id: "tokens", title: "Color tokens", description: "Light and dark surface ramps", info: "32 vars", icon: "palette" },
  { id: "type", title: "Typography", description: "Inter Tight headings & Inter body", info: "8 styles", icon: "text-aa" },
  { id: "motion", title: "Motion curves", description: "Easing and drawer transitions", info: "4 curves", icon: "sparkle" },
  { id: "archive", title: "Legacy icons", description: "Deprecated SVG sprite sheet", info: "Archived", icon: "archive", muted: true },
];

export default function ListItemDemo() {
  const [activeId, setActiveId] = useState("tokens");

  return (
    <DemoStack>
      <DemoSection title="Interactive list">
        <DemoGrid columns={1}>
          {ITEMS.map((item) => (
            <ListItem
              key={item.id}
              title={item.title}
              description={item.description}
              info={item.info}
              active={activeId === item.id}
              muted={item.muted}
              leading={<Icon name={item.icon} size={18} />}
              trailing={<Icon name="caret-right" size={16} />}
              onClick={() => setActiveId(item.id)}
            />
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Static rows">
        <DemoGrid columns={1}>
          <ListItem
            title="Production deployment"
            description="main · 2 minutes ago"
            leading={<Icon name="rocket-launch" size={18} />}
            trailing={<Badge color="success">Live</Badge>}
          />
          <ListItem
            title="Preview build"
            description="feat/components-nav · 14 minutes ago"
            leading={<Icon name="git-branch" size={18} />}
            trailing={<Badge color="info">Ready</Badge>}
          />
        </DemoGrid>
      </DemoSection>
    </DemoStack>
  );
}
