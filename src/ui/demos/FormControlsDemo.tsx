import { useState } from "react";
import { Badge } from "../Badge";
import { CheckboxItem, RadioCard, RadioItem, Toggle, ToggleGroup, ToggleGroupItem } from "../FormControls";
import { Icon } from "../Icon";
import { DemoGrid, DemoRow, DemoSection, DemoStack } from "./DemoLayout";

export default function FormControlsDemo() {
  const [plainRadio, setPlainRadio] = useState("a");
  const [plan, setPlan] = useState("pro");
  const [billing, setBilling] = useState("annual");
  const [plainChecks, setPlainChecks] = useState<string[]>(["email"]);
  const [notifications, setNotifications] = useState<string[]>(["releases", "mentions"]);
  const [autoSave, setAutoSave] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [alignment, setAlignment] = useState("left");

  function toggleItem(list: string[], key: string, setList: (next: string[]) => void) {
    setList(list.includes(key) ? list.filter((item) => item !== key) : [...list, key]);
  }

  return (
    <DemoStack>
      <DemoSection title="Radio (default)">
        <DemoGrid columns={2}>
          <RadioItem
            variant="default"
            name="plain-radio"
            value="a"
            checked={plainRadio === "a"}
            onChange={() => setPlainRadio("a")}
            title="Public"
            description="Visible to everyone in the workspace."
          />
          <RadioItem
            variant="default"
            name="plain-radio"
            value="b"
            checked={plainRadio === "b"}
            onChange={() => setPlainRadio("b")}
            title="Private"
            description="Only invited collaborators can view."
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Radio (list & card)">
        <DemoGrid columns={1}>
          <RadioItem
            name="plan"
            value="starter"
            checked={plan === "starter"}
            onChange={() => setPlan("starter")}
            title="Starter"
            description="Up to 3 projects and community support."
            trailing={<Badge variant="secondary">Free</Badge>}
          />
          <RadioItem
            name="plan"
            value="pro"
            checked={plan === "pro"}
            onChange={() => setPlan("pro")}
            title="Pro"
            description="Unlimited projects, custom domains, and team seats."
            trailing={<Badge color="accent">$18/mo</Badge>}
          />
          <RadioItem
            name="plan"
            value="enterprise"
            checked={plan === "enterprise"}
            onChange={() => setPlan("enterprise")}
            title="Enterprise"
            description="Dedicated SSO, audit logs, and SLA."
            disabled
          />
        </DemoGrid>

        <DemoGrid columns={2}>
          <RadioCard
            name="billing"
            value="monthly"
            checked={billing === "monthly"}
            onChange={() => setBilling("monthly")}
            icon={<Icon name="calendar-blank" size={28} />}
            title="Monthly billing"
            description="Pay month-to-month, cancel anytime."
          />
          <RadioCard
            name="billing"
            value="annual"
            checked={billing === "annual"}
            onChange={() => setBilling("annual")}
            icon={<Icon name="sparkle" size={28} />}
            title="Annual billing"
            description="Save 20% with a yearly commitment."
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Checkbox">
        <DemoGrid columns={2}>
          <CheckboxItem
            variant="default"
            name="plain-check"
            value="email"
            checked={plainChecks.includes("email")}
            onChange={() => toggleItem(plainChecks, "email", setPlainChecks)}
            title="Email digest"
            description="Weekly summary of workspace activity."
          />
          <CheckboxItem
            variant="default"
            name="plain-check"
            value="partial"
            checked={false}
            indeterminate
            onChange={() => {}}
            title="Partial selection"
            description="Indeterminate group state."
          />
        </DemoGrid>

        <DemoGrid columns={1}>
          <CheckboxItem
            name="notifications"
            value="releases"
            checked={notifications.includes("releases")}
            onChange={() => toggleItem(notifications, "releases", setNotifications)}
            title="Product releases"
            description="Monthly summaries of new design tokens and components."
          />
          <CheckboxItem
            name="notifications"
            value="mentions"
            checked={notifications.includes("mentions")}
            onChange={() => toggleItem(notifications, "mentions", setNotifications)}
            title="Direct mentions"
            description="Notify immediately when someone tags you in a comment."
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Toggle switches">
        <DemoGrid columns={1}>
          <Toggle
            checked={autoSave}
            onChange={setAutoSave}
            label="Auto-save drafts"
            description="Persist changes locally while you edit."
          />
          <Toggle
            position="right"
            checked={reducedMotion}
            onChange={setReducedMotion}
            label="Reduce motion"
            description="Replace spring transitions with subtle fades."
          />
          <Toggle
            checked
            onChange={() => {}}
            disabled
            label="Hardware acceleration"
            description="Managed by browser preferences."
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Toggle group">
        <DemoRow>
          <ToggleGroup aria-label="Text alignment">
            <ToggleGroupItem active={alignment === "left"} onClick={() => setAlignment("left")} aria-label="Align left">
              <Icon name="text-align-left" size={20} />
              Left
            </ToggleGroupItem>
            <ToggleGroupItem
              active={alignment === "center"}
              onClick={() => setAlignment("center")}
              aria-label="Align center"
            >
              <Icon name="text-align-center" size={20} />
              Center
            </ToggleGroupItem>
            <ToggleGroupItem
              active={alignment === "right"}
              onClick={() => setAlignment("right")}
              aria-label="Align right"
            >
              <Icon name="text-align-right" size={20} />
              Right
            </ToggleGroupItem>
          </ToggleGroup>
        </DemoRow>
      </DemoSection>
    </DemoStack>
  );
}
