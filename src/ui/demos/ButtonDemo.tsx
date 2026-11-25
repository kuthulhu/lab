import { useState } from "react";
import { Button, type ButtonVariant } from "../Button";
import { Icon } from "../Icon";
import { DemoRow, DemoSection, DemoStack } from "./DemoLayout";

const VARIANTS: { label: string; variant: ButtonVariant }[] = [
  { label: "Primary", variant: "primary" },
  { label: "Secondary", variant: "secondary" },
  { label: "Accent", variant: "accent" },
  { label: "Destructive", variant: "destructive" },
];

export default function ButtonDemo() {
  const [loading, setLoading] = useState(false);

  function triggerLoading() {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1400);
  }

  return (
    <DemoStack>
      <DemoSection title="Primary">
        <DemoRow>
          <Button variant="primary">Button</Button>
          <Button variant="primary" iconOnly aria-label="Add">
            <Icon name="plus" size={18} />
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Sizes">
        <DemoRow>
          <Button variant="secondary" size="default">
            Default
          </Button>
          <Button variant="secondary" size="default" iconOnly aria-label="Default icon button">
            <Icon name="plus" size={18} />
          </Button>
        </DemoRow>
        <DemoRow>
          <Button variant="secondary" size="small">
            Small
          </Button>
          <Button variant="secondary" size="small" iconOnly aria-label="Small icon button">
            <Icon name="plus" size={16} />
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection title="With Icon">
        <DemoRow>
          <Button variant="secondary" leadingIcon={<Icon name="plus" size={16} />}>
            Left icon
          </Button>
          <Button variant="secondary" trailingIcon={<Icon name="arrow-right" size={16} />}>
            Right icon
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Variants">
        <DemoRow>
          {VARIANTS.map(({ label, variant }) => (
            <Button key={variant} variant={variant}>
              {label}
            </Button>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="States">
        <DemoRow>
          <Button variant="primary" loading={loading} onClick={triggerLoading}>
            {loading ? "Saving" : "Click to load"}
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </DemoRow>
      </DemoSection>
    </DemoStack>
  );
}
