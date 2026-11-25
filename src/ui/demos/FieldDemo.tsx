import { useState } from "react";
import { TextArea, TextField } from "../Field";
import { Icon } from "../Icon";
import { DemoGrid, DemoSection, DemoStack } from "./DemoLayout";

export default function FieldDemo() {
  const [name, setName] = useState("Kutlu Can Günay");
  const [email, setEmail] = useState("invalid-email");
  const [handle, setHandle] = useState("kuthulhu");
  const [bio, setBio] = useState("Design engineer building calm, tactile interfaces.");

  const emailError = email && !email.includes("@") ? "Enter a valid email address." : undefined;

  return (
    <DemoStack>
      <DemoSection title="Text fields">
        <DemoGrid columns={2}>
          <TextField
            label="Full name"
            name="full-name"
            value={name}
            onValueChange={setName}
            requiredMark
            placeholder="Ada Lovelace"
            hint="Used on invoices and certificates."
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            value={email}
            onValueChange={setEmail}
            requiredMark
            leading={<Icon name="envelope" size={20} />}
            error={emailError}
          />
          <TextField
            label="Handle"
            name="handle"
            value={handle}
            onValueChange={setHandle}
            optional
            leading={<Icon name="at" size={20} />}
            trailing={<Icon name="check-circle" weight="fill" size={20} />}
          />
          <TextField
            label="Workspace ID"
            name="workspace-id"
            value="ws_01j9x4m8q2"
            onValueChange={() => {}}
            disabled
            hint="Read-only identifier."
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Text area">
        <DemoGrid columns={2}>
          <TextArea
            label="Bio"
            name="bio"
            rows={3}
            value={bio}
            onValueChange={setBio}
            optional
            hint={`${bio.length} / 160 characters`}
          />
          <TextArea
            label="Release notes"
            name="release-notes"
            rows={3}
            value=""
            onValueChange={() => {}}
            showResizeHandle={false}
            placeholder="Summarize what changed…"
            error="Add at least one bullet point."
          />
        </DemoGrid>
      </DemoSection>
    </DemoStack>
  );
}
