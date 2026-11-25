import { Alert } from "../Alert";
import { DemoGrid, DemoSection, DemoStack } from "./DemoLayout";

export default function AlertDemo() {
  return (
    <DemoStack>
      <DemoSection title="Default">
        <DemoGrid columns={1}>
          <Alert
            status="neutral"
            title="Scheduled maintenance"
            description="Deployments will pause for 15 minutes on Sunday at 02:00 UTC."
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Status">
        <DemoGrid columns={1}>
          <Alert
            status="info"
            title="New API version available"
            description="Version 2.4 adds webhook signature rotation and batch endpoints."
          />
          <Alert
            status="success"
            title="Workspace verified"
            description="Your custom domain and TLS certificate are active."
          />
          <Alert
            status="warning"
            title="Approaching storage limit"
            description="You have used 88% of your included 10 GB attachment quota."
          />
          <Alert
            status="danger"
            title="Payment failed"
            description="Update your billing method within 48 hours to avoid service interruption."
          />
        </DemoGrid>
      </DemoSection>
    </DemoStack>
  );
}
