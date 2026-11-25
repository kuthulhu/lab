import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { AlertDialog, Button, Icon, ListItem } from "../../ui";
import { KYC_STEPS, LEGAL_DOCS } from "./data";
import { clearDraft, loadDraft, saveDraft, useCountdown, useStepFocus } from "./hooks";
import {
  AccountCredentialsStep,
  EmailVerificationStep,
  FinancialProfileStep,
  IdentityDocumentStep,
  KycIntroStep,
  LivenessCheckStep,
  PendingStatusView,
  PersonalDetailsStep,
  ReviewStep,
  SavedStateView,
  SignInStep,
} from "./steps";
import {
  initialData,
  validateAccountStep,
  validateKycStep,
  validateOtpStep,
  type ErrorKey,
  type Errors,
  type FlowStage,
  type SignupData,
} from "./validation";
import { HeroVisual } from "./visuals";
import styles from "./signup.module.css";

const easeOutCurve = [0.23, 1, 0.32, 1] as const;

const slide = {
  enter: (direction: number) => ({
    transform: `translateX(${direction * 20}px)`,
    opacity: 0,
    filter: "blur(2px)",
  }),
  center: {
    transform: "translateX(0px)",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.24, ease: easeOutCurve },
  },
  exit: (direction: number) => ({
    transform: `translateX(${direction * -20}px)`,
    opacity: 0,
    filter: "blur(2px)",
    transition: { duration: 0.15, ease: easeOutCurve },
  }),
};

const centeredFade = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.18, ease: easeOutCurve } },
  exit: { opacity: 0, transition: { duration: 0.14, ease: easeOutCurve } },
};

const FLOW_SCREENS: { stage: FlowStage; kycStep: number; label: string }[] = [
  { stage: "account", kycStep: 0, label: "Create Account" },
  { stage: "verify-email", kycStep: 0, label: "Verify Email" },
  { stage: "kyc-intro", kycStep: 0, label: "Email Verified" },
  ...KYC_STEPS.map((s, idx) => ({ stage: "kyc" as const, kycStep: idx, label: s.sidebarLabel })),
  { stage: "pending", kycStep: KYC_STEPS.length, label: "Submitted" },
  { stage: "saved", kycStep: 0, label: "Progress Saved" },
  { stage: "sign-in", kycStep: 0, label: "Sign In" },
];

export default function MultiStepSignup() {
  const [stage, setStage] = useState<FlowStage>("account");
  const [kycStep, setKycStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<SignupData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | "forgot" | "signin-error" | null>(null);
  const [resentNotice, setResentNotice] = useState(false);
  const [savedOrigin, setSavedOrigin] = useState<{ stage: FlowStage; kycStep: number }>({
    stage: "kyc",
    kycStep: 0,
  });
  const [resumeBanner, setResumeBanner] = useState(() => {
    const existing = loadDraft();
    return Boolean(existing && existing.stage !== "account");
  });

  const formRef = useRef<HTMLFormElement>(null);
  const scrollPaneRef = useRef<HTMLDivElement>(null);
  const focusKey = stage === "kyc" ? `kyc-${kycStep}` : stage;
  const headingRef = useStepFocus(focusKey);

  const { seconds: resendSeconds, reset: resetCountdown } = useCountdown(56, stage === "verify-email");

  function update<K extends keyof SignupData>(key: K, value: SignupData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    const errKey = key as ErrorKey;
    if (errors[errKey]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[errKey];
        return next;
      });
    }
  }

  function transition(nextStage: FlowStage, nextKycStep = kycStep, dir = 1) {
    // Auto-split full name into legal first/last name on entering KYC Step 1 if empty
    if (nextStage === "kyc" && nextKycStep === 0) {
      setData((d) => {
        if (d.firstName || d.lastName || !d.fullName.trim()) return d;
        const parts = d.fullName.trim().split(/\s+/);
        return {
          ...d,
          firstName: parts[0] ?? "",
          lastName: parts.slice(1).join(" "),
        };
      });
    }
    // Pre-fill Issuing Country on ID Proof step from Nationality or Country of Residence
    if (nextStage === "kyc" && nextKycStep === 1) {
      setData((d) => {
        const prefill = d.nationality || d.countryOfResidence;
        if (!d.issuingCountry && prefill) return { ...d, issuingCountry: prefill };
        return d;
      });
    }

    setDirection(dir);
    setErrors({});
    setStage(nextStage);
    setKycStep(nextKycStep);
    requestAnimationFrame(() => {
      scrollPaneRef.current?.scrollTo({ top: 0, behavior: "instant" });
    });
  }

  function focusFirstError(found: Errors) {
    const first = Object.keys(found)[0];
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function verifyOtp(code: string) {
    if (submitting) return;
    const found = validateOtpStep(code);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusFirstError(found);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 550));
    setSubmitting(false);
    transition("kyc-intro", 0, 1);
  }

  async function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    if (stage === "sign-in") {
      setLegalModal("signin-error");
      return;
    }

    if (stage === "account") {
      const found = validateAccountStep(data);
      if (Object.keys(found).length > 0) {
        setErrors(found);
        focusFirstError(found);
        return;
      }
      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 550));
      setSubmitting(false);
      resetCountdown(56);
      setResentNotice(false);
      transition("verify-email", 0, 1);
      return;
    }

    if (stage === "verify-email") {
      await verifyOtp(data.otp);
      return;
    }

    if (stage === "kyc") {
      const found = validateKycStep(kycStep, data);
      if (Object.keys(found).length > 0) {
        setErrors(found);
        focusFirstError(found);
        return;
      }

      if (kycStep < KYC_STEPS.length - 1) {
        transition("kyc", kycStep + 1, 1);
        return;
      }

      setSubmitting(true);
      await new Promise((r) => setTimeout(r, 950));
      setSubmitting(false);
      clearDraft();
      setResumeBanner(false);
      transition("pending", KYC_STEPS.length, 1);
    }
  }

  function handleResendOtp() {
    resetCountdown(56);
    setResentNotice(true);
    window.setTimeout(() => setResentNotice(false), 3200);
  }

  function handleSaveLater() {
    const targetStage: FlowStage = stage === "saved" ? savedOrigin.stage : stage;
    const targetStep = stage === "saved" ? savedOrigin.kycStep : kycStep;
    saveDraft({
      stage: targetStage,
      kycStep: targetStep,
      data,
      savedAt: new Date().toISOString(),
    });
    setSavedOrigin({ stage: targetStage, kycStep: targetStep });
    transition("saved", targetStep, 1);
  }

  function handleResumeFromStorage() {
    const draft = loadDraft();
    if (!draft) return;
    setData(draft.data);
    setResumeBanner(false);
    transition(draft.stage === "saved" ? "kyc" : draft.stage, draft.kycStep, 1);
  }

  function restart() {
    clearDraft();
    setResumeBanner(false);
    setData(initialData);
    setErrors({});
    setSubmitting(false);
    transition("account", 0, -1);
  }

  const isPhase1 = stage === "account" || stage === "sign-in" || stage === "verify-email";
  const isCentered = stage === "kyc-intro" || stage === "pending" || stage === "saved";
  const isKyc = stage === "kyc";

  const stepHeader = getHeaderMeta(stage, kycStep);
  const showBackButton = isKyc && (kycStep === 1 || kycStep === 2);
  const primaryLabel =
    stage === "account"
      ? "Create Account"
      : stage === "sign-in"
        ? "Sign In"
        : stage === "verify-email"
          ? "Verify Email"
          : isKyc && kycStep === KYC_STEPS.length - 1
            ? "Continue"
            : "Continue";

  const savedStepSummary =
    savedOrigin.stage === "kyc"
      ? `Step ${savedOrigin.kycStep + 1} (${KYC_STEPS[savedOrigin.kycStep]?.sidebarLabel})`
      : "Email verified";

  const currentFlowIndex = FLOW_SCREENS.findIndex((s) =>
    stage === "kyc" ? s.stage === "kyc" && s.kycStep === kycStep : s.stage === stage,
  );
  const prevScreen = currentFlowIndex > 0 ? FLOW_SCREENS[currentFlowIndex - 1] : null;
  const nextScreen =
    currentFlowIndex >= 0 && currentFlowIndex < FLOW_SCREENS.length - 1
      ? FLOW_SCREENS[currentFlowIndex + 1]
      : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className={styles.root}>
        <div
          className={styles.frame}
          data-layout={isPhase1 ? "split" : isKyc ? "sidebar" : "centered"}
        >
          {/* Phase 1: Two-Column Split (Form left + Bird Hero right) */}
          {isPhase1 && (
            <>
              <div className={styles.phase1Left}>
                <div className={styles.phase1Inner} data-stage={stage}>
                  {resumeBanner && stage === "account" && (
                    <div className={styles.resumeBanner}>
                      <span>Saved draft available.</span>
                      <div className={styles.resumeActions}>
                        <button type="button" className={styles.accentLink} onClick={handleResumeFromStorage}>
                          Resume
                        </button>
                        <button
                          type="button"
                          className={styles.mutedLink}
                          onClick={() => {
                            clearDraft();
                            setResumeBanner(false);
                          }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.form
                      key={focusKey}
                      ref={formRef}
                      className={styles.phase1Form}
                      custom={direction}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      onSubmit={handleFormSubmit}
                      noValidate
                      aria-labelledby="signup-step-title"
                    >
                      <div className={styles.phase1TopGroup}>
                        <header className={styles.stepHeader}>
                          <p className={styles.stepEyebrow}>{stepHeader.eyebrow}</p>
                          <h2 id="signup-step-title" ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
                            {stepHeader.title}
                          </h2>
                          <p className={styles.stepSubtitle}>{stepHeader.subtitle}</p>
                        </header>

                        <div className={styles.fields}>
                          {stage === "account" && (
                            <AccountCredentialsStep data={data} errors={errors} update={update} />
                          )}
                          {stage === "sign-in" && (
                            <SignInStep data={data} errors={errors} update={update} />
                          )}
                          {stage === "verify-email" && (
                            <EmailVerificationStep
                              data={data}
                              errors={errors}
                              update={update}
                              countdown={resendSeconds}
                              resentNotice={resentNotice}
                              onResend={handleResendOtp}
                              onChangeEmail={() => transition("account", 0, -1)}
                              onVerifyCode={(code) => void verifyOtp(code)}
                            />
                          )}
                        </div>

                        <div className={styles.actionStack}>
                          <Button type="submit" variant="primary" fullWidth loading={submitting}>
                            {primaryLabel}
                          </Button>

                          {(stage === "account" || stage === "sign-in") && (
                            <Button
                              variant="ghost"
                              fullWidth
                              onClick={() => setLegalModal("forgot")}
                            >
                              Forgot Password?
                            </Button>
                          )}
                        </div>
                      </div>

                      {stage === "account" && (
                        <footer className={styles.accountFooter}>
                          <p className={styles.legalCopy}>
                            By signing up, I agree to{" "}
                            <button type="button" className={styles.accentLink} onClick={() => setLegalModal("terms")}>
                              Terms of Service
                            </button>{" "}
                            and{" "}
                            <button type="button" className={styles.accentLink} onClick={() => setLegalModal("privacy")}>
                              Privacy Policy
                            </button>
                            .
                          </p>
                          <hr className={styles.divider} />
                          <p className={styles.signinCopy}>
                            Already have an account?{" "}
                            <button
                              type="button"
                              className={styles.accentLink}
                              onClick={() => transition("sign-in", 0, 1)}
                            >
                              Sign in
                            </button>
                          </p>
                        </footer>
                      )}

                      {stage === "sign-in" && (
                        <footer className={styles.accountFooter}>
                          <p className={styles.signinCopy}>
                            Don’t have an account?{" "}
                            <button
                              type="button"
                              className={styles.accentLink}
                              onClick={() => transition("account", 0, -1)}
                            >
                              Sign up
                            </button>
                          </p>
                        </footer>
                      )}
                    </motion.form>
                  </AnimatePresence>
                </div>
              </div>

              <HeroVisual variant={stage === "sign-in" ? "signin" : "signup"} />
            </>
          )}

          {/* Centered Screens: Signup-3 (Email Verified), KYC-Success, Saved Draft */}
          {isCentered && (
            <div className={styles.centeredPane}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={stage}
                  className={styles.centeredMotion}
                  variants={centeredFade}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {stage === "kyc-intro" && (
                    <KycIntroStep
                      onStart={() => transition("kyc", 0, 1)}
                      onSaveLater={handleSaveLater}
                    />
                  )}
                  {stage === "pending" && <PendingStatusView data={data} onRestart={restart} />}
                  {stage === "saved" && (
                    <SavedStateView
                      email={data.email}
                      stepSummary={savedStepSummary}
                      onResume={() => transition(savedOrigin.stage, savedOrigin.kycStep, -1)}
                      onRestart={restart}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Phase 2 KYC: Left 248px Sidebar + Right 824px Scrollable Form Pane */}
          {isKyc && (
            <>
              <KycSidebar
                currentStep={kycStep}
                onSelect={(idx) => transition("kyc", idx, idx > kycStep ? 1 : -1)}
                onSaveLater={handleSaveLater}
              />

              <div className={styles.kycMain} ref={scrollPaneRef}>
                <div className={styles.kycColumn}>
                  <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.form
                      key={focusKey}
                      ref={formRef}
                      className={styles.kycForm}
                      custom={direction}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      onSubmit={handleFormSubmit}
                      noValidate
                      aria-labelledby="signup-step-title"
                    >
                      <header className={styles.stepHeader}>
                        <p className={styles.stepEyebrow}>{stepHeader.eyebrow}</p>
                        <h2 id="signup-step-title" ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
                          {stepHeader.title}
                        </h2>
                        <p className={styles.stepSubtitle}>{stepHeader.subtitle}</p>
                      </header>

                      <div className={styles.fields}>
                        {kycStep === 0 && <PersonalDetailsStep data={data} errors={errors} update={update} />}
                        {kycStep === 1 && <IdentityDocumentStep data={data} errors={errors} update={update} />}
                        {kycStep === 2 && <LivenessCheckStep data={data} errors={errors} update={update} />}
                        {kycStep === 3 && <FinancialProfileStep data={data} errors={errors} update={update} />}
                        {kycStep === 4 && (
                          <ReviewStep
                            data={data}
                            onEdit={(targetStep) => transition("kyc", targetStep, -1)}
                          />
                        )}
                      </div>

                      <div className={showBackButton ? styles.kycFooterRow : styles.actionStack}>
                        {showBackButton && (
                          <Button
                            variant="secondary"
                            leadingIcon={<Icon name="caret-left" size={20} />}
                            onClick={() => transition("kyc", kycStep - 1, -1)}
                          >
                            Back
                          </Button>
                        )}
                        <Button
                          type="submit"
                          variant="primary"
                          fullWidth={!showBackButton}
                          className={showBackButton ? styles.flexGrow : undefined}
                          loading={submitting}
                        >
                          {primaryLabel}
                        </Button>
                      </div>
                    </motion.form>
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Compact step switcher for quick testing across all screens */}
        <div className={styles.devNavBar} role="navigation" aria-label="Preview step switcher">
          <div className={styles.devNavPill}>
            <button
              type="button"
              className={styles.devNavBtn}
              disabled={!prevScreen}
              onClick={() => prevScreen && transition(prevScreen.stage, prevScreen.kycStep, -1)}
              aria-label={prevScreen ? `Previous step: ${prevScreen.label}` : "Previous step"}
              title={prevScreen ? `Previous: ${prevScreen.label}` : undefined}
            >
              <Icon name="caret-left" size={12} />
            </button>
            <span className={styles.devNavLabel}>
              {currentFlowIndex + 1}/{FLOW_SCREENS.length} · {FLOW_SCREENS[currentFlowIndex]?.label}
            </span>
            <button
              type="button"
              className={styles.devNavBtn}
              disabled={!nextScreen}
              onClick={() => nextScreen && transition(nextScreen.stage, nextScreen.kycStep, 1)}
              aria-label={nextScreen ? `Next step: ${nextScreen.label}` : "Next step"}
              title={nextScreen ? `Next: ${nextScreen.label}` : undefined}
            >
              <Icon name="caret-right" size={12} />
            </button>
          </div>
        </div>

        {/* Modals (Figma alert-dialog 453:710) */}
        {(legalModal === "terms" || legalModal === "privacy") && (
          <AlertDialog
            title={LEGAL_DOCS[legalModal].title}
            description={LEGAL_DOCS[legalModal].updated}
            icon="file-text"
            primaryLabel="Continue"
            onClose={() => setLegalModal(null)}
          >
            {LEGAL_DOCS[legalModal].sections.map((sec) => (
              <div key={sec.heading} className={styles.legalSection}>
                <h4>{sec.heading}</h4>
                <p>{sec.body}</p>
              </div>
            ))}
          </AlertDialog>
        )}

        {legalModal === "forgot" && (
          <AlertDialog
            title="Reset your password?"
            description="We’ll send a one-time recovery link to the email address associated with your account."
            icon="key"
            primaryLabel="Continue"
            onClose={() => setLegalModal(null)}
          />
        )}

        {legalModal === "signin-error" && (
          <AlertDialog
            title="Sign in is not available"
            description="Sign in for existing accounts isn’t available right now. Please try again later or create a new account to continue."
            type="destructive"
            icon="warning"
            primaryLabel="Create Account"
            primaryVariant="primary"
            onPrimary={() => {
              setLegalModal(null);
              transition("account", 0, -1);
            }}
            onClose={() => setLegalModal(null)}
          />
        )}
      </div>
    </MotionConfig>
  );
}

/* ---------------- Phase 2 Left Sidebar Navigation ---------------- */

function KycSidebar({
  currentStep,
  onSelect,
  onSaveLater,
}: {
  currentStep: number;
  onSelect: (step: number) => void;
  onSaveLater: () => void;
}) {
  return (
    <aside className={styles.sidebar} aria-label="KYC verification steps">
      <div className={styles.sidebarTop}>
        <p className={styles.sidebarTitle}>KYC Verification</p>
        <hr className={styles.divider} />
        <nav className={styles.sidebarNav}>
          {KYC_STEPS.map((step, i) => {
            const state = i < currentStep ? "complete" : i === currentStep ? "current" : "upcoming";
            return (
              <div key={step.id} className={styles.sidebarEntry}>
                {step.dividerBefore && <hr className={styles.dividerNav} />}
                <ListItem
                  title={step.sidebarLabel}
                  leading={<Icon name={step.icon} size={20} />}
                  trailing={
                    state === "current" ? (
                      <Icon name="caret-right" size={20} />
                    ) : state === "complete" ? (
                      <Icon name="check-circle" size={20} />
                    ) : undefined
                  }
                  active={state === "current"}
                  muted={state === "upcoming"}
                  aria-current={state === "current" ? "step" : undefined}
                  onClick={state === "complete" ? () => onSelect(i) : undefined}
                />
              </div>
            );
          })}
        </nav>
      </div>

      <Button
        variant="secondary"
        fullWidth
        leadingIcon={<Icon name="bookmark-simple" size={20} />}
        onClick={onSaveLater}
      >
        Save and Finish Later
      </Button>
    </aside>
  );
}

function getHeaderMeta(stage: FlowStage, kycStep: number) {
  if (stage === "account") {
    return {
      eyebrow: "Step 1 of 2",
      title: "Create your account",
      subtitle: "Get started with your email and password.",
    };
  }
  if (stage === "sign-in") {
    return {
      eyebrow: "",
      title: "Sign In",
      subtitle: "Get started with your email and password.",
    };
  }
  if (stage === "verify-email") {
    return {
      eyebrow: "Step 2 of 2",
      title: "Verify your email",
      subtitle: "Enter the 6-digit code we just sent to your email.",
    };
  }
  const current = KYC_STEPS[kycStep] ?? KYC_STEPS[0];
  return {
    eyebrow: `Step ${kycStep + 1} of ${KYC_STEPS.length}`,
    title: current.title,
    subtitle: current.subtitle,
  };
}
