import { useState } from "react";
import { Attachment, FileUploadDropzone } from "../Upload";
import { DemoGrid, DemoRow, DemoSection, DemoStack } from "./DemoLayout";

interface DemoFile {
  id: string;
  name: string;
  info?: string;
  state: "done" | "idle" | "uploading" | "processing" | "error";
  progress?: number;
}

const INITIAL_FILES: DemoFile[] = [
  { id: "1", name: "design-system.pdf", info: "PDF · 2.4 MB", state: "done" },
  { id: "2", name: "tokens-export.json", state: "idle" },
  { id: "3", name: "brand-guidelines.pdf", state: "uploading", progress: 64 },
  { id: "4", name: "verification-scan.pdf", state: "processing" },
  { id: "5", name: "oversized-export.png", state: "error" },
];

export default function UploadDemo() {
  const [files, setFiles] = useState<DemoFile[]>(INITIAL_FILES);

  function handleFiles(list: FileList) {
    const added: DemoFile[] = Array.from(list).map((file, i) => ({
      id: `${Date.now()}-${i}`,
      name: file.name,
      info: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      state: "done",
    }));
    setFiles((prev) => [...added, ...prev]);
  }

  function retryFile(id: string) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, state: "uploading", progress: 40, info: undefined } : f)));
  }

  return (
    <DemoStack>
      <DemoSection title="Dropzone (default)">
        <FileUploadDropzone onFiles={handleFiles} />
      </DemoSection>

      <DemoSection title="Dropzone (compact & error)">
        <DemoGrid columns={1}>
          <FileUploadDropzone size="compact" onFiles={handleFiles} />
          <FileUploadDropzone
            size="compact"
            onFiles={handleFiles}
            error="File is too large. Choose a file under 10 MB."
          />
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Attachments (states)">
        <DemoGrid columns={1}>
          {files.map((file) => (
            <Attachment
              key={file.id}
              filename={file.name}
              fileInfo={file.info}
              state={file.state}
              progress={file.progress}
              onRetry={file.state === "error" ? () => retryFile(file.id) : undefined}
              onRemove={() => setFiles((prev) => prev.filter((item) => item.id !== file.id))}
            />
          ))}
        </DemoGrid>
      </DemoSection>

      <DemoSection title="Attachment sizes & vertical">
        <DemoRow align="start">
          <Attachment filename="avatar.png" fileInfo="PNG · 128 KB" size="small" state="done" onRemove={() => {}} />
          <Attachment filename="icon.svg" size="xs" state="done" onRemove={() => {}} />
        </DemoRow>
        <DemoGrid columns={3}>
          <Attachment
            filename="design-system.pdf"
            fileInfo="PDF · 2.4 MB"
            orientation="vertical"
            state="done"
            onRemove={() => {}}
          />
          <Attachment
            filename="brand-guidelines.pdf"
            orientation="vertical"
            state="uploading"
            progress={64}
            onRemove={() => {}}
          />
          <Attachment
            filename="oversized-export.png"
            orientation="vertical"
            state="error"
            onRetry={() => {}}
            onRemove={() => {}}
          />
        </DemoGrid>
      </DemoSection>
    </DemoStack>
  );
}
