import { useEffect, useMemo, useRef, useState } from "react";
import {
  Attachment,
  Badge,
  Button,
  CheckboxItem,
  Dropdown,
  FieldError,
  FileUploadDropzone,
  Icon,
  RadioCard,
  RadioItem,
  Tabs,
  TabTrigger,
  TextField,
  type DropdownOption,
} from "../../ui";
import {
  COUNTRIES,
  EMPLOYMENT_OPTIONS,
  SOURCE_OF_FUNDS_OPTIONS,
  findCountryByName,
} from "./data";
import { useSuccessChoreography } from "./hooks";
import { CountryDropdown, OtpInput, PasswordField } from "./fields";
import {
  formatDobInput,
  formatDocType,
  requiredDocCount,
  type DocumentType,
  type Errors,
  type SignupData,
  type UploadedDoc,
} from "./validation";
import styles from "./signup.module.css";

export interface StepProps {
  data: SignupData;
  errors: Errors;
  update: <K extends keyof SignupData>(key: K, value: SignupData[K]) => void;
}

/* ---------------- Phase 1.1: Account Credentials (Signup - 1) ---------------- */

export function AccountCredentialsStep({ data, errors, update }: StepProps) {
  return (
    <>
      <TextField
        label="Full Name"
        name="fullName"
        requiredMark
        autoComplete="name"
        placeholder="John Doe"
        value={data.fullName}
        onValueChange={(v) => update("fullName", v)}
        error={errors.fullName}
      />

      <TextField
        label="Email Address"
        name="email"
        requiredMark
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@company.com"
        value={data.email}
        onValueChange={(v) => update("email", v)}
        error={errors.email}
      />

      <PasswordField
        label="Password"
        name="password"
        requiredMark
        placeholder="Create a strong password"
        value={data.password}
        onValueChange={(v) => update("password", v)}
        error={errors.password}
      />
    </>
  );
}

/* ---------------- Sign In (node 557:725) ---------------- */

export function SignInStep({ data, errors, update }: StepProps) {
  return (
    <>
      <TextField
        label="Email Address"
        name="email"
        requiredMark
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="Enter your email"
        value={data.email}
        onValueChange={(v) => update("email", v)}
        error={errors.email}
      />

      <PasswordField
        label="Password"
        name="password"
        requiredMark
        showStrength={false}
        autoComplete="current-password"
        placeholder="Enter your password"
        value={data.password}
        onValueChange={(v) => update("password", v)}
        error={errors.password}
      />
    </>
  );
}

/* ---------------- Phase 1.2: Email Verification (Signup - 2) ---------------- */

export function EmailVerificationStep({
  data,
  errors,
  update,
  countdown,
  resentNotice,
  onResend,
  onChangeEmail,
  onVerifyCode,
}: StepProps & {
  countdown: number;
  resentNotice: boolean;
  onResend: () => void;
  onChangeEmail: () => void;
  onVerifyCode: (code: string) => void;
}) {
  return (
    <>
      <div className={styles.emailBanner}>
        <p className={styles.emailBannerLine}>
          Code sent to <strong>{data.email || "you@company.com"}</strong>
        </p>
        <p className={styles.emailBannerLine}>
          Wrong email?{" "}
          <button type="button" className={styles.accentLink} onClick={onChangeEmail}>
            Change it
          </button>
        </p>
      </div>

      <div className={styles.otpSection}>
        <OtpInput
          value={data.otp}
          onChange={(code) => update("otp", code)}
          error={errors.otp}
          onComplete={(code) => onVerifyCode(code)}
        />
        <div className={styles.resendRow}>
          {countdown > 0 ? (
            <span className={styles.resendTimer}>Resend code in {countdown}s</span>
          ) : (
            <button type="button" className={styles.accentLink} onClick={onResend}>
              Resend code
            </button>
          )}
          {resentNotice && (
            <span className={styles.resentStatus} role="status">
              New code sent
            </span>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------------- Interstitial: Email Verified (Signup - 3) ---------------- */

export function KycIntroStep({
  onStart,
  onSaveLater,
}: {
  onStart: () => void;
  onSaveLater: () => void;
}) {
  const { columnRef, heroRef, circleRef, titleRef } = useSuccessChoreography();

  return (
    <div className={styles.centeredWrap}>
      <div ref={columnRef} className={styles.centeredColumn}>
        <div className={styles.centeredHeader}>
          <div ref={heroRef} className={styles.successHero}>
            <div ref={circleRef} className={styles.successCircle} aria-hidden="true">
              <Icon name="check" size={32} className={styles.iconSuccess} />
            </div>
            <h2 ref={titleRef} className={styles.successTitle}>
              Email verified
            </h2>
          </div>
          <p className={styles.centeredSubtitle} data-success-reveal="">
            Before unlocking your account, regulations require a quick identity check. Most people finish in under 2 minutes.
          </p>
        </div>

        <ul className={styles.prepList}>
          <li className={styles.prepItem} data-success-reveal="">
            <span className={styles.prepIconBox} aria-hidden="true">
              <Icon name="files" size={24} />
            </span>
            <div className={styles.prepCopy}>
              <p className={styles.prepTitle}>Personal details and address</p>
              <p className={styles.prepDesc}>Match your legal name and residential address to your records.</p>
            </div>
          </li>
          <li className={styles.prepItem} data-success-reveal="">
            <span className={styles.prepIconBox} aria-hidden="true">
              <Icon name="identification-card" size={24} />
            </span>
            <div className={styles.prepCopy}>
              <p className={styles.prepTitle}>Government-issued photo ID</p>
              <p className={styles.prepDesc}>Have a valid Passport, National ID card, or Driver’s License nearby.</p>
            </div>
          </li>
          <li className={styles.prepItem} data-success-reveal="">
            <span className={styles.prepIconBox} aria-hidden="true">
              <Icon name="camera" size={24} />
            </span>
            <div className={styles.prepCopy}>
              <p className={styles.prepTitle}>Quick selfie and compliance profile</p>
              <p className={styles.prepDesc}>Use your webcam or hand off seamlessly to your phone via QR code.</p>
            </div>
          </li>
        </ul>

        <div className={styles.actionStack} data-success-reveal="">
          <Button variant="primary" fullWidth onClick={onStart}>
            Start Verification
          </Button>
          <Button
            variant="ghost"
            fullWidth
            leadingIcon={<Icon name="bookmark-simple" size={20} />}
            onClick={onSaveLater}
          >
            Save and Finish Later
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Phase 2 Step 1: Personal Details & Address (KYC - 1) ---------------- */

const MAX_DOB_ISO = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
})();

export function PersonalDetailsStep({ data, errors, update }: StepProps) {
  const nativeDateRef = useRef<HTMLInputElement>(null);

  const cityOptions = useMemo<DropdownOption[]>(() => {
    const country = findCountryByName(data.countryOfResidence) ?? COUNTRIES[0];
    const base = country.cities;
    const withCurrent = data.city && !base.includes(data.city) ? [data.city, ...base] : base;
    return withCurrent.map((c) => ({ value: c, label: c }));
  }, [data.countryOfResidence, data.city]);

  function openDatePicker() {
    const picker = nativeDateRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") {
      try {
        picker.showPicker();
      } catch {
        picker.focus();
      }
    } else {
      picker.focus();
    }
  }

  function handleNativeDateChange(iso: string) {
    // Convert YYYY-MM-DD -> DD/MM/YYYY
    const parts = iso.split("-");
    if (parts.length === 3) {
      update("dob", `${parts[2]}/${parts[1]}/${parts[0]}`);
    }
  }

  return (
    <>
      <TextField
        label="Legal First Name"
        name="firstName"
        autoComplete="given-name"
        placeholder=""
        value={data.firstName}
        onValueChange={(v) => update("firstName", v)}
        error={errors.firstName}
      />

      <TextField
        label="Legal Last Name"
        name="lastName"
        autoComplete="family-name"
        placeholder=""
        value={data.lastName}
        onValueChange={(v) => update("lastName", v)}
        error={errors.lastName}
      />

      <div className={styles.dateFieldWrap}>
        <TextField
          label="Date of Birth"
          name="dob"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          value={data.dob}
          onValueChange={(v) => update("dob", formatDobInput(v))}
          error={errors.dob}
          trailing={
            <button
              type="button"
              className={styles.trailingIconBtn}
              onClick={openDatePicker}
              aria-label="Open calendar date picker"
            >
              <Icon name="calendar-blank" size={20} />
            </button>
          }
        />
        <input
          ref={nativeDateRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          className={styles.hiddenDateInput}
          max={MAX_DOB_ISO}
          onChange={(e) => handleNativeDateChange(e.target.value)}
        />
      </div>

      <CountryDropdown
        label="Nationality"
        name="nationality"
        value={data.nationality}
        error={errors.nationality}
        onChange={(country) => {
          update("nationality", country.name);
          if (!data.phoneNumber) update("phoneNumber", `${country.dial} `);
        }}
      />

      <TextField
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="+1"
        value={data.phoneNumber}
        onValueChange={(v) => update("phoneNumber", v.replace(/[^\d+\s()-]/g, ""))}
        error={errors.phoneNumber}
      />

      <TextField
        label="Address Line"
        name="addressLine"
        autoComplete="street-address"
        placeholder=""
        value={data.addressLine}
        onValueChange={(v) => update("addressLine", v)}
        error={errors.addressLine}
      />

      <TextField
        label="Address Line 2"
        name="addressLine2"
        optional
        autoComplete="address-line2"
        placeholder=""
        value={data.addressLine2}
        onValueChange={(v) => update("addressLine2", v)}
      />

      <div className={styles.twoCol}>
        <Dropdown
          label="City"
          name="city"
          value={data.city}
          options={cityOptions}
          placeholder="Select"
          searchable
          error={errors.city}
          onChange={(v) => update("city", v)}
        />
        <TextField
          label="Zip Code"
          name="zipCode"
          autoComplete="postal-code"
          placeholder=""
          value={data.zipCode}
          onValueChange={(v) => update("zipCode", v)}
          error={errors.zipCode}
        />
      </div>

      <CountryDropdown
        label="Country of Residence"
        name="countryOfResidence"
        value={data.countryOfResidence}
        error={errors.countryOfResidence}
        onChange={(country) => {
          update("countryOfResidence", country.name);
          if (data.city && !country.cities.includes(data.city)) {
            update("city", "");
          }
        }}
      />
    </>
  );
}

/* ---------------- Phase 2 Step 2: Identity Document (KYC - 2) ---------------- */

const DOC_OPTIONS: { id: DocumentType; title: string; subtitle: string; icon: string }[] = [
  {
    id: "passport",
    title: "Passport",
    subtitle: "Photo page only",
    icon: "identification-badge",
  },
  {
    id: "national_id",
    title: "National ID",
    subtitle: "Front and back",
    icon: "identification-card",
  },
  {
    id: "drivers_license",
    title: "Driver’s License",
    subtitle: "Front and back",
    icon: "subtitles",
  },
];

export function IdentityDocumentStep({ data, errors, update }: StepProps) {
  const needed = requiredDocCount(data.documentType);

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleFiles(list: FileList) {
    const incoming: UploadedDoc[] = Array.from(list)
      .slice(0, needed)
      .map((file, idx) => {
        const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        return {
          id: `${Date.now()}-${idx}`,
          name: file.name,
          info: `${ext} · ${formatBytes(file.size)}`,
          previewUrl,
        };
      });

    const merged = [...data.uploadedDocs, ...incoming].slice(0, needed);
    update("uploadedDocs", merged);
  }

  function attachSampleDocs() {
    if (data.documentType === "passport") {
      update("uploadedDocs", [
        { id: "sample-passport", name: "passport-photo-page.jpg", info: "JPG · 1.8 MB" },
      ]);
      return;
    }
    const prefix = data.documentType === "national_id" ? "national_id" : "drivers_license";
    update("uploadedDocs", [
      { id: `${prefix}-front`, name: `${prefix}-front.jpg`, info: "JPG · 1.4 MB" },
      { id: `${prefix}-back`, name: `${prefix}-back.jpg`, info: "JPG · 1.3 MB" },
    ]);
  }

  function removeDoc(id: string) {
    update(
      "uploadedDocs",
      data.uploadedDocs.filter((d) => d.id !== id),
    );
  }

  return (
    <>
      <CountryDropdown
        label="Issuing Country"
        name="issuingCountry"
        value={data.issuingCountry}
        error={errors.issuingCountry}
        hint="Pre-filled from your profile. Change if your ID was issued elsewhere."
        onChange={(c) => update("issuingCountry", c.name)}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Document Type</legend>
        <div className={styles.radioList}>
          {DOC_OPTIONS.map((opt) => (
            <RadioItem
              key={opt.id}
              name="documentType"
              value={opt.id}
              checked={data.documentType === opt.id}
              title={opt.title}
              description={opt.subtitle}
              trailing={<Icon name={opt.icon} size={32} />}
              onChange={() => {
                update("documentType", opt.id);
                if (opt.id === "passport" && data.uploadedDocs.length > 1) {
                  update("uploadedDocs", data.uploadedDocs.slice(0, 1));
                }
              }}
            />
          ))}
        </div>
      </fieldset>

      <div className={styles.uploadStack}>
        {data.uploadedDocs.length < needed && (
          <FileUploadDropzone
            onFiles={handleFiles}
            error={errors.uploadedDocs}
            prompt={
              needed === 2 && data.uploadedDocs.length === 1
                ? "Upload back side of document"
                : "Drag and drop files here"
            }
          />
        )}

        {data.uploadedDocs.length > 0 && (
          <div className={styles.attachmentList}>
            {data.uploadedDocs.map((doc) => (
              <Attachment
                key={doc.id}
                filename={doc.name}
                fileInfo={doc.info}
                previewUrl={doc.previewUrl}
                onRemove={() => removeDoc(doc.id)}
              />
            ))}
          </div>
        )}

        {data.uploadedDocs.length < needed && (
          <div className={styles.sampleHelper}>
            <button type="button" className={styles.accentLink} onClick={attachSampleDocs}>
              Use sample {data.documentType === "passport" ? "passport scan" : "front & back scans"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- Phase 2 Step 3: Liveness Check (KYC - 3-1 & 3-2) ---------------- */

type LivenessState = "Default" | "Starting" | "Loading" | "Complete";

function waitForVideoFrame(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 && video.videoWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener("loadeddata", done);
      video.removeEventListener("playing", done);
      window.clearTimeout(fallback);
      resolve();
    };
    video.addEventListener("loadeddata", done, { once: true });
    video.addEventListener("playing", done, { once: true });
    const fallback = window.setTimeout(done, 1200);
  });
}

export function LivenessCheckStep({ data, errors, update }: StepProps) {
  const [tab, setTab] = useState<"webcam" | "phone">(data.livenessMethod === "phone" ? "phone" : "webcam");
  const [scanState, setScanState] = useState<LivenessState>(data.selfieVerified ? "Complete" : "Default");
  const [promptText, setPromptText] = useState(
    data.selfieVerified ? "Liveness check complete" : "Position your face inside the oval guide",
  );
  const [streamActive, setStreamActive] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timersRef = useRef<number[]>([]);
  const runIdRef = useRef(0);

  function captureSnapshot(): string | null {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Mirror horizontally to match the live selfie preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      return canvas.toDataURL("image/jpeg", 0.85);
    } catch {
      return null;
    }
  }

  function stopCamera() {
    runIdRef.current += 1;
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamActive(false);
  }

  useEffect(() => () => stopCamera(), []);

  async function startLivenessCheck() {
    stopCamera();
    const runId = runIdRef.current;
    setSnapshotUrl(null);
    setScanState("Starting");
    setPromptText("Starting camera…");

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (runIdRef.current !== runId) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          await waitForVideoFrame(videoRef.current);
        }
        if (runIdRef.current !== runId) return;
        setStreamActive(true);
      } catch {
        if (runIdRef.current !== runId) return;
        setStreamActive(false);
      }
    }

    if (runIdRef.current !== runId) return;

    setScanState("Loading");
    setPromptText("Center your face in the frame…");

    timersRef.current.push(
      window.setTimeout(() => setPromptText("Turn your head slightly…"), 1000),
      window.setTimeout(() => setPromptText("Hold still — verifying…"), 2100),
      window.setTimeout(() => {
        const snap = captureSnapshot();
        if (snap) setSnapshotUrl(snap);
        setScanState("Complete");
        setPromptText("Liveness check complete");
        update("selfieVerified", true);
        update("livenessMethod", "webcam");
        streamRef.current?.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setStreamActive(false);
      }, 3000),
    );
  }

  function simulatePhoneComplete() {
    stopCamera();
    setSnapshotUrl(null);
    setScanState("Complete");
    setPromptText("Verified via phone handoff");
    update("selfieVerified", true);
    update("livenessMethod", "phone");
  }

  return (
    <>
      <Tabs variant="segmented" aria-label="Liveness verification method">
        <TabTrigger
          selected={tab === "webcam"}
          leadingIcon={<Icon name="camera" size={16} />}
          onClick={() => setTab("webcam")}
        >
          Use Webcam
        </TabTrigger>

        <TabTrigger
          selected={tab === "phone"}
          leadingIcon={<Icon name="device-mobile" size={16} />}
          onClick={() => {
            stopCamera();
            setTab("phone");
          }}
        >
          Use Phone
        </TabTrigger>
      </Tabs>

      {tab === "webcam" ? (
        <div className={styles.livenessCard}>
          <p className={styles.livenessPrompt} aria-live="polite">
            {promptText}
          </p>

          <div className={styles.livenessFrame}>
            <div className={styles.livenessOval} data-state={scanState}>
              <video
                ref={videoRef}
                muted
                playsInline
                className={styles.livenessVideo}
                data-visible={streamActive || undefined}
              />

              {scanState !== "Complete" && !streamActive && (
                <div className={styles.livenessGuide} data-scanning={scanState === "Loading" || undefined} aria-hidden="true">
                  <Icon name="user-focus" size={40} className={styles.livenessGuideIcon} />
                  {scanState === "Loading" && <div className={styles.livenessScanBeam} />}
                </div>
              )}

              {scanState === "Complete" && (
                <div className={styles.livenessCompleteFill} aria-hidden="true">
                  {snapshotUrl && (
                    <img src={snapshotUrl} alt="" className={styles.livenessSnapshot} />
                  )}
                  <div className={styles.livenessVerifiedBadge}>
                    <Icon name="check" size={22} className={styles.iconSuccess} />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.livenessRingMask} aria-hidden="true">
              <div className={styles.livenessRingTrack} />
              {scanState === "Loading" && <div className={styles.livenessProgressFill} />}
              {scanState === "Complete" && <div className={styles.livenessRingComplete} />}
            </div>
          </div>

          <Button
            variant="secondary"
            size="small"
            disabled={scanState === "Starting" || scanState === "Loading"}
            leadingIcon={<Icon name="camera" size={16} />}
            onClick={startLivenessCheck}
          >
            {scanState === "Starting"
              ? "Starting camera…"
              : scanState === "Loading"
                ? "Scanning…"
                : scanState === "Complete"
                  ? "Retake Liveness Check"
                  : "Start Liveness Check"}
          </Button>
        </div>
      ) : (
        <div className={styles.phoneCard}>
          <p className={styles.phoneTitle}>Better camera on your phone?</p>
          <p className={styles.phoneSubtitle}>
            This screen updates automatically when you complete your selfie on mobile.
          </p>
          <div className={styles.phoneBody}>
            <button
              type="button"
              className={styles.qrBox}
              onClick={simulatePhoneComplete}
              title="Click to simulate completing mobile selfie verification"
              aria-label="QR code to continue on phone (click to simulate completion)"
            >
              <QrCodeSvg />
            </button>
            <div className={styles.qrStepsCol}>
              <ol className={styles.qrSteps}>
                <li>Open your phone’s camera app</li>
                <li>Point it at the QR code to open the link</li>
                <li>Follow the guided selfie check</li>
              </ol>
              {data.selfieVerified && data.livenessMethod === "phone" ? (
                <span className={styles.phoneDoneTag}>Verified on phone</span>
              ) : (
                <button type="button" className={styles.accentLink} onClick={simulatePhoneComplete}>
                  Simulate phone completion
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <FieldError error={errors.selfieVerified} />
    </>
  );
}

function QrCodeSvg() {
  const cells = [
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0],
    [0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    [0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  ];

  return (
    <svg width="124" height="124" viewBox="0 0 21 21" shapeRendering="crispEdges" aria-hidden="true">
      <rect width="21" height="21" fill="white" />
      {cells.map((row, y) =>
        row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0e0e0f" /> : null)),
      )}
    </svg>
  );
}

/* ---------------- Phase 2 Step 4: Regulatory & Financial Profile (KYC - 4) ---------------- */

export function FinancialProfileStep({ data, errors, update }: StepProps) {
  const employmentOptions = useMemo<DropdownOption[]>(
    () => EMPLOYMENT_OPTIONS.map((o) => ({ value: o, label: o })),
    [],
  );

  function toggleSource(source: string) {
    const exists = data.sourceOfFunds.includes(source);
    const next = exists ? data.sourceOfFunds.filter((s) => s !== source) : [...data.sourceOfFunds, source];
    update("sourceOfFunds", next);
  }

  return (
    <>
      <Dropdown
        label="Employment Status"
        name="employmentStatus"
        value={data.employmentStatus}
        options={employmentOptions}
        placeholder="Select"
        error={errors.employmentStatus}
        onChange={(v) => update("employmentStatus", v)}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Source of Funds</legend>
        <p className={styles.fieldsetSub}>Select all that apply.</p>
        <div className={styles.checkboxList}>
          {SOURCE_OF_FUNDS_OPTIONS.map((source) => (
            <CheckboxItem
              key={source}
              name="sourceOfFunds"
              value={source}
              checked={data.sourceOfFunds.includes(source)}
              title={source}
              onChange={() => toggleSource(source)}
            />
          ))}
        </div>
        <FieldError error={errors.sourceOfFunds} />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Politically Exposed Person (PEP) Check</legend>
        <p className={styles.fieldsetSub}>
          Are you, or an immediate family member, currently or formerly entrusted with a prominent public function?
        </p>
        <div className={styles.pepGrid}>
          <RadioCard
            name="pepStatus"
            value="no"
            checked={data.pepStatus === "no"}
            title="No"
            description="I am not a PEP"
            onChange={() => update("pepStatus", "no")}
          />

          <RadioCard
            name="pepStatus"
            value="yes"
            checked={data.pepStatus === "yes"}
            title="Yes"
            description="Declare public role"
            onChange={() => update("pepStatus", "yes")}
          />
        </div>
        <FieldError error={errors.pepStatus} />
      </fieldset>

      {data.pepStatus === "yes" && (
        <TextField
          label="Role & Jurisdiction"
          name="pepDetails"
          optional
          placeholder="e.g. Municipal Council Member"
          value={data.pepDetails}
          onValueChange={(v) => update("pepDetails", v)}
        />
      )}
    </>
  );
}

/* ---------------- Phase 2 Step 5: Review and Submit (KYC - 5) ---------------- */

export function ReviewStep({ data, onEdit }: { data: SignupData; onEdit: (kycStep: number) => void }) {
  const fullName = `${data.firstName} ${data.lastName}`.trim() || "—";
  const addressText = data.addressLine2 ? `${data.addressLine}, ${data.addressLine2}` : data.addressLine || "—";
  const cityPostal = [data.city, data.zipCode].filter(Boolean).join(" ") || "—";
  const issuingCode = findCountryByName(data.issuingCountry)?.code ?? data.issuingCountry;

  return (
    <div className={styles.reviewStack}>
      <section className={styles.reviewGroup}>
        <div className={styles.reviewGroupHead}>
          <span>Personal Details</span>
          <button type="button" className={styles.reviewEditBtn} onClick={() => onEdit(0)}>
            Edit
          </button>
        </div>
        <dl className={styles.reviewBox}>
          <div className={styles.reviewRow}>
            <dt>Legal Name</dt>
            <dd>{fullName}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Date of Birth</dt>
            <dd>{data.dob || "—"}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Nationality</dt>
            <dd>{data.nationality || "—"}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Phone</dt>
            <dd>{data.phoneNumber || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.reviewGroup}>
        <div className={styles.reviewGroupHead}>
          <span>Residential Address</span>
          <button type="button" className={styles.reviewEditBtn} onClick={() => onEdit(0)}>
            Edit
          </button>
        </div>
        <dl className={styles.reviewBox}>
          <div className={styles.reviewRow}>
            <dt>Address</dt>
            <dd>{addressText}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>City &amp; Postal</dt>
            <dd>{cityPostal}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Country</dt>
            <dd>{data.countryOfResidence || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.reviewGroup}>
        <div className={styles.reviewGroupHead}>
          <span>Identity and Liveness</span>
          <button type="button" className={styles.reviewEditBtn} onClick={() => onEdit(1)}>
            Edit
          </button>
        </div>
        <dl className={styles.reviewBox}>
          <div className={styles.reviewRow}>
            <dt>Document</dt>
            <dd>
              {formatDocType(data.documentType)} ({issuingCode || "—"})
            </dd>
          </div>
          <div className={styles.reviewRowTop}>
            <dt>Files</dt>
            <dd className={styles.reviewFiles}>
              {data.uploadedDocs.length > 0 ? (
                data.uploadedDocs.map((f) => <span key={f.id}>{f.name}</span>)
              ) : (
                <span>—</span>
              )}
            </dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Liveness</dt>
            <dd>{data.livenessMethod === "phone" ? "Verified via Phone Handoff" : "Verified via Webcam"}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.reviewGroup}>
        <div className={styles.reviewGroupHead}>
          <span>Regulatory Profile</span>
          <button type="button" className={styles.reviewEditBtn} onClick={() => onEdit(3)}>
            Edit
          </button>
        </div>
        <dl className={styles.reviewBox}>
          <div className={styles.reviewRow}>
            <dt>Employment</dt>
            <dd>{data.employmentStatus || "—"}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>Source of Funds</dt>
            <dd>{data.sourceOfFunds.join(", ") || "—"}</dd>
          </div>
          <div className={styles.reviewRow}>
            <dt>PEP Status</dt>
            <dd>
              {data.pepStatus === "yes" ? `Yes${data.pepDetails ? ` (${data.pepDetails})` : ""}` : "No"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

/* ---------------- Verification Submitted (KYC - Success) ---------------- */

const PENDING_TIMELINE_STEPS = [
  "Account and email verified",
  "Government-issued photo ID",
  "Compliance and sanctions screening",
] as const;

type TimelineStepStatus = "hidden" | "spinning" | "done";

export function PendingStatusView({
  data,
  onRestart,
}: {
  data: SignupData;
  onRestart: () => void;
}) {
  const displayName = data.firstName || data.fullName.split(" ")[0] || "there";
  const { columnRef, heroRef, circleRef, titleRef } = useSuccessChoreography();
  const [stepStatuses, setStepStatuses] = useState<TimelineStepStatus[]>([
    "hidden",
    "hidden",
    "hidden",
  ]);
  const [showStartOver, setShowStartOver] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const base = reduce ? 300 : 1520;
    const timers = [
      window.setTimeout(() => setStepStatuses(["spinning", "hidden", "hidden"]), base),
      window.setTimeout(() => setStepStatuses(["done", "hidden", "hidden"]), base + 850),
      window.setTimeout(() => setStepStatuses(["done", "spinning", "hidden"]), base + 1100),
      window.setTimeout(() => setStepStatuses(["done", "done", "hidden"]), base + 1950),
      window.setTimeout(() => setStepStatuses(["done", "done", "spinning"]), base + 2200),
      window.setTimeout(() => setShowStartOver(true), base + 3200),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className={styles.centeredWrap}>
      <div ref={columnRef} className={styles.centeredColumn}>
        <div className={styles.centeredHeader}>
          <div ref={heroRef} className={styles.successHero}>
            <div ref={circleRef} className={styles.successCircle} aria-hidden="true">
              <Icon name="check" size={32} className={styles.iconSuccess} />
            </div>
            <h2 ref={titleRef} className={styles.successTitle}>
              Verification Submitted
            </h2>
          </div>
          <Badge
            color="warning"
            size="large"
            role="status"
            data-success-reveal=""
            leadingIcon={<Icon name="warning" weight="fill" size={16} />}
          >
            Under Review
          </Badge>
          <p className={styles.centeredSubtitle} data-success-reveal="">
            Thanks, {displayName}. Your application is in our automated verification queue. Usually takes 2–5 minutes.
          </p>
        </div>

        <ul className={styles.timeline} aria-live="polite">
          {PENDING_TIMELINE_STEPS.map((label, idx) => {
            const status = stepStatuses[idx] ?? "hidden";
            const visible = status !== "hidden";
            return (
              <li
                key={label}
                className={styles.timelineItem}
                data-visible={visible || undefined}
              >
                <span
                  className={
                    status === "done" ? styles.timelineIconDone : styles.timelineIconSpin
                  }
                  aria-hidden="true"
                >
                  {status === "done" ? (
                    <Icon
                      name="check"
                      size={18}
                      className={`${styles.iconSuccess} ${styles.timelineCheckIcon}`}
                    />
                  ) : (
                    <Icon name="spinner" size={18} className={styles.spinnerImg} />
                  )}
                </span>
                <span className={styles.timelineText}>{label}</span>
              </li>
            );
          })}
        </ul>

        <div className={styles.pendingActionWrap} data-visible={showStartOver || undefined}>
          <Button variant="secondary" fullWidth onClick={onRestart}>
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Save & Finish Later Screen ---------------- */

export function SavedStateView({
  email,
  stepSummary,
  onResume,
  onRestart,
}: {
  email: string;
  stepSummary: string;
  onResume: () => void;
  onRestart: () => void;
}) {
  const { columnRef, heroRef, circleRef, titleRef } = useSuccessChoreography();

  return (
    <div className={styles.centeredWrap}>
      <div ref={columnRef} className={styles.centeredColumn}>
        <div className={styles.centeredHeader}>
          <div ref={heroRef} className={styles.successHero}>
            <div ref={circleRef} className={styles.successCircle} aria-hidden="true">
              <Icon name="check" size={32} className={styles.iconSuccess} />
            </div>
            <h2 ref={titleRef} className={styles.successTitle}>
              Progress saved
            </h2>
          </div>
          <p className={styles.centeredSubtitle} data-success-reveal="">
            Your draft is saved at <strong>{stepSummary}</strong>
            {email ? ` and a secure resume link was sent to ${email}` : ""}.
          </p>
        </div>

        <div className={styles.actionStack} data-success-reveal="">
          <Button variant="primary" fullWidth onClick={onResume}>
            Resume Verification
          </Button>
          <Button variant="ghost" fullWidth onClick={onRestart}>
            Discard and Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}
