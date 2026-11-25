import { useState } from "react";
import { AlertDialog } from "../AlertDialog";
import { Button } from "../Button";
import { DemoRow, DemoSection, DemoStack } from "./DemoLayout";

type DialogKind = "default" | "destructive" | "simple" | "small" | null;

export default function AlertDialogDemo() {
  const [open, setOpen] = useState<DialogKind>(null);
  const close = () => setOpen(null);

  return (
    <DemoStack>
      <DemoSection title="Default">
        <DemoRow>
          <Button variant="primary" onClick={() => setOpen("default")}>
            Show Dialog
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Destructive">
        <DemoRow>
          <Button variant="destructive" onClick={() => setOpen("destructive")}>
            Show Dialog
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Simple">
        <DemoRow>
          <Button variant="secondary" onClick={() => setOpen("simple")}>
            Show Dialog
          </Button>
        </DemoRow>
      </DemoSection>

      <DemoSection title="Small">
        <DemoRow>
          <Button variant="secondary" onClick={() => setOpen("small")}>
            Show Dialog
          </Button>
        </DemoRow>
      </DemoSection>

      {open === "default" && (
        <AlertDialog
          title="Save changes before leaving?"
          description="Your edits to the typography scale haven’t been published yet."
          icon="floppy-disk"
          primaryLabel="Save changes"
          onPrimary={close}
          onClose={close}
        />
      )}

      {open === "destructive" && (
        <AlertDialog
          type="destructive"
          title="Delete project permanently?"
          description="This removes all tokens, snapshots, and team invitations. This action cannot be undone."
          icon="trash"
          primaryLabel="Delete project"
          onPrimary={close}
          onClose={close}
        />
      )}

      {open === "simple" && (
        <AlertDialog
          type="simple"
          title="Export design tokens"
          description="Download CSS custom properties and JSON tokens for both light and dark modes."
          primaryLabel="Download archive"
          secondaryLabel="Not now"
          onPrimary={close}
          onClose={close}
        />
      )}

      {open === "small" && (
        <AlertDialog
          size="small"
          title="Reset workspace?"
          description="All unsaved playground edits will revert to defaults."
          icon="arrow-counter-clockwise"
          primaryLabel="Reset"
          onPrimary={close}
          onClose={close}
        />
      )}
    </DemoStack>
  );
}
