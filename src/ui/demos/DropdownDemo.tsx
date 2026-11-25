import { useState } from "react";
import { Dropdown, type DropdownOption } from "../Dropdown";
import { Icon } from "../Icon";
import { DemoGrid, DemoSection, DemoStack } from "./DemoLayout";

const ROLE_OPTIONS: DropdownOption[] = [
  { value: "design-eng", label: "Design Engineer", leading: <Icon name="compass-tool" size={20} />, trailing: "14" },
  { value: "product-design", label: "Product Designer", leading: <Icon name="pen-nib" size={20} />, trailing: "8" },
  { value: "frontend", label: "Frontend Engineer", leading: <Icon name="code" size={20} />, trailing: "22" },
  { value: "systems", label: "Design Systems Lead", leading: <Icon name="stack" size={20} />, trailing: "4" },
];

const TIMEZONE_OPTIONS: DropdownOption[] = [
  { value: "utc", label: "UTC (Coordinated Universal Time)" },
  { value: "est", label: "America/New_York (UTC-5)" },
  { value: "pst", label: "America/Los_Angeles (UTC-8)" },
  { value: "cet", label: "Europe/Berlin (UTC+1)" },
  { value: "trt", label: "Europe/Istanbul (UTC+3)" },
  { value: "jst", label: "Asia/Tokyo (UTC+9)" },
];

export default function DropdownDemo() {
  const [role, setRole] = useState("design-eng");
  const [timezone, setTimezone] = useState("");
  const [invalidValue, setInvalidValue] = useState("");

  return (
    <DemoStack>
      <DemoSection title="Default & searchable">
        <DemoGrid columns={2}>
          <Dropdown
            label="Role"
            name="role"
            value={role}
            options={ROLE_OPTIONS}
            requiredMark
            onChange={setRole}
            hint="Displayed on your team profile."
          />
          <Dropdown
            label="Timezone"
            name="timezone"
            value={timezone}
            options={TIMEZONE_OPTIONS}
            placeholder="Search timezones…"
            searchable
            onChange={setTimezone}
            hint="Type to filter the list."
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Validation & disabled">
        <DemoGrid columns={2}>
          <Dropdown
            label="Region"
            name="region"
            value={invalidValue}
            options={TIMEZONE_OPTIONS}
            requiredMark
            error={invalidValue ? undefined : "Select a region to continue."}
            onChange={setInvalidValue}
          />
          <Dropdown
            label="Billing plan"
            name="plan"
            value="systems"
            options={ROLE_OPTIONS}
            disabled
            onChange={() => {}}
            hint="Managed by workspace administrator."
          />
        </DemoGrid>
      </DemoSection>
    </DemoStack>
  );
}
