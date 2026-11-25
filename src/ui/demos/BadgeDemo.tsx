import { Badge, type BadgeColor, type BadgeVariant } from "../Badge";
import { Icon } from "../Icon";
import { DemoRow, DemoSection, DemoStack } from "./DemoLayout";

const BASE_VARIANTS: { label: string; variant: BadgeVariant }[] = [
  { label: "Solid", variant: "solid" },
  { label: "Secondary", variant: "secondary" },
  { label: "Destructive", variant: "destructive" },
  { label: "Outline", variant: "outline" },
];

const STATUS_COLORS: { label: string; color: BadgeColor }[] = [
  { label: "Accent", color: "accent" },
  { label: "Success", color: "success" },
  { label: "Warning", color: "warning" },
  { label: "Info", color: "info" },
];

export default function BadgeDemo() {
  return (
    <DemoStack>
      <DemoSection title="Default">
        <DemoRow>
          {BASE_VARIANTS.map(({ label, variant }) => (
            <Badge key={label} variant={variant} size="default">
              {label}
            </Badge>
          ))}
        </DemoRow>
        <DemoRow>
          {STATUS_COLORS.map(({ label, color }) => (
            <Badge key={label} variant="soft" color={color} size="default">
              {label}
            </Badge>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="Large">
        <DemoRow>
          {BASE_VARIANTS.map(({ label, variant }) => (
            <Badge key={label} variant={variant} size="large">
              {label}
            </Badge>
          ))}
        </DemoRow>
        <DemoRow>
          {STATUS_COLORS.map(({ label, color }) => (
            <Badge key={label} variant="soft" color={color} size="large">
              {label}
            </Badge>
          ))}
        </DemoRow>
      </DemoSection>

      <DemoSection title="With icons">
        <DemoRow>
          <Badge variant="solid" size="default" leadingIcon={<Icon name="bookmark-simple" size={14} />}>
            Default
          </Badge>
          <Badge variant="solid" size="large" trailingIcon={<Icon name="arrow-up-right" size={16} />}>
            Large
          </Badge>
          <Badge
            variant="soft"
            color="success"
            size="default"
            leadingIcon={<Icon name="check-circle" weight="fill" size={14} />}
          >
            Verified
          </Badge>
          <Badge variant="outline" size="large" trailingIcon={<Icon name="arrow-up-right" size={16} />}>
            v2.4
          </Badge>
        </DemoRow>
      </DemoSection>
    </DemoStack>
  );
}
