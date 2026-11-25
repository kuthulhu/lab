import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { Button } from "./Button";
import { FieldError } from "./Field";
import { Icon } from "./Icon";
import styles from "./Upload.module.css";

/* ---------------- File Upload Dropzone (Figma 523:1396) ---------------- */

export interface FileUploadDropzoneProps {
  onFiles: (files: FileList) => void;
  error?: string;
  size?: "default" | "compact";
  prompt?: string;
  dropPrompt?: string;
  fileRequirements?: string;
  showIcon?: boolean;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FileUploadDropzone({
  onFiles,
  error,
  size = "default",
  prompt = "Drag and drop files here",
  dropPrompt = "Drop files to upload",
  fileRequirements = "PDF, PNG or JPG · Max 10 MB per file",
  showIcon = true,
  accept = "image/*,.pdf",
  multiple = true,
  disabled = false,
  className,
}: FileUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (!disabled && e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  }

  return (
    <div className={`${styles.wrap}${className ? ` ${className}` : ""}`}>
      <div
        className={styles.dropzone}
        data-size={size}
        data-dragging={dragging || undefined}
        data-invalid={error ? true : undefined}
        data-disabled={disabled || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className={styles.srOnly}
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {showIcon && (
          <div
            className={styles.dropIconBox}
            data-size={size}
            data-dragging={dragging || undefined}
            data-invalid={error ? true : undefined}
            aria-hidden="true"
          >
            <Icon name="upload-simple" size={size === "compact" ? 20 : 24} />
          </div>
        )}
        <div className={styles.dropText}>
          <p className={styles.dropPrompt} data-dragging={dragging || undefined}>
            {dragging ? dropPrompt : prompt}
          </p>
          <p className={styles.dropMeta}>{fileRequirements}</p>
        </div>
        <Button
          variant="secondary"
          size="small"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </Button>
      </div>
      <FieldError error={error} />
    </div>
  );
}

/* ---------------- Attachment (Figma 522:1651) ---------------- */

export interface AttachmentProps {
  filename: string;
  fileInfo?: string;
  previewUrl?: string;
  fileIcon?: ReactNode;
  size?: "default" | "small" | "xs";
  orientation?: "horizontal" | "vertical";
  state?: "done" | "idle" | "uploading" | "processing" | "error";
  progress?: number;
  onRetry?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function Attachment({
  filename,
  fileInfo,
  previewUrl,
  fileIcon,
  size = "default",
  orientation = "horizontal",
  state = "done",
  progress = 64,
  onRetry,
  onRemove,
  className,
}: AttachmentProps) {
  const iconSize = orientation === "vertical" ? (size === "xs" ? 18 : size === "small" ? 20 : 24) : size === "xs" ? 14 : size === "small" ? 16 : 20;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const statusText =
    fileInfo ??
    (state === "uploading"
      ? `Uploading · ${clampedProgress}%`
      : state === "processing"
        ? "Processing document"
        : state === "idle"
          ? "Ready to upload"
          : state === "error"
            ? "Upload failed"
            : undefined);

  const media = (
    <div className={styles.attachmentMedia} data-size={size} data-orientation={orientation} data-state={state}>
      {previewUrl ? (
        <img src={previewUrl} alt="" className={styles.attachmentThumb} />
      ) : (
        fileIcon ?? <Icon name="file-text" size={iconSize} />
      )}
    </div>
  );

  const infoRow = statusText && !(size === "xs" && state === "done" && !fileInfo) && (
    <span className={styles.attachmentInfo} data-state={state}>
      {(state === "uploading" || state === "processing") && (
        <Icon name="circle-notch" size={12} className={styles.attachmentSpinner} />
      )}
      {state === "error" && <Icon name="warning-circle" size={12} className={styles.attachmentErrorIcon} />}
      <span>{statusText}</span>
    </span>
  );

  const actions = (
    <div className={styles.attachmentActions}>
      {state === "done" && size !== "xs" && (
        <Icon name="check-circle" weight="fill" size={16} className={styles.attachmentDoneIcon} />
      )}
      {state === "error" && onRetry && (
        <button
          type="button"
          className={styles.attachmentIconBtn}
          onClick={onRetry}
          aria-label={`Retry ${filename}`}
        >
          <Icon name="arrows-clockwise" size={16} />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          className={styles.attachmentIconBtn}
          onClick={onRemove}
          aria-label={`Remove ${filename}`}
        >
          <Icon name="x" size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div
      className={`${styles.attachment}${className ? ` ${className}` : ""}`}
      data-size={size}
      data-orientation={orientation}
      data-state={state}
    >
      {orientation === "vertical" ? (
        <>
          {media}
          <div className={styles.attachmentBody}>
            <div className={styles.attachmentContent}>
              <span className={styles.attachmentName}>{filename}</span>
              {infoRow}
            </div>
            {actions}
          </div>
        </>
      ) : (
        <div className={styles.attachmentBody}>
          {media}
          <div className={styles.attachmentContent}>
            <span className={styles.attachmentName}>{filename}</span>
            {infoRow}
          </div>
          {actions}
        </div>
      )}

      {state === "uploading" && orientation === "horizontal" && (
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.progressFill} style={{ width: `${clampedProgress}%` }} />
        </div>
      )}
    </div>
  );
}
