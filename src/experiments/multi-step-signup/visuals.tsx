import type { SyntheticEvent } from "react";
import styles from "./signup.module.css";

function markImgLoaded(el: HTMLImageElement | null) {
  if (el && el.complete && el.naturalWidth > 0) el.setAttribute("data-loaded", "");
}

function onImgReady(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.setAttribute("data-loaded", "");
}

/** Editorial right-column hero card from Figma Signup - 1/2 (515:5686) & Sign In (557:744). */
export function HeroVisual({ variant = "signup" }: { variant?: "signup" | "signin" }) {
  const isSignIn = variant === "signin";

  return (
    <aside className={styles.heroCol} aria-label="Brand visual">
      <div className={styles.heroMedia}>
        <img
          ref={markImgLoaded}
          src="/multi-step-signup/hero-bird.webp"
          alt="Red bullfinch perched on a sunset branch"
          className={styles.heroBird}
          data-active={!isSignIn || undefined}
          onLoad={onImgReady}
          onError={onImgReady}
        />
        <img
          ref={markImgLoaded}
          src="/multi-step-signup/hero-bird-signin.webp"
          alt="Blue tit perched on a winter branch"
          className={styles.heroBirdSignin}
          data-active={isSignIn || undefined}
          onLoad={onImgReady}
          onError={onImgReady}
        />
        <div
          className={styles.heroNoiseScreen}
          style={{ backgroundImage: 'url("/multi-step-signup/noise-screen.webp")' }}
          aria-hidden="true"
        />
        <div className={styles.heroScrim} aria-hidden="true" />
        <div
          className={styles.heroNoiseGrain}
          style={{ backgroundImage: 'url("/multi-step-signup/noise-grain.webp")' }}
          aria-hidden="true"
        />
        <div className={styles.heroNoiseOverlayWrap} aria-hidden="true">
          <div className={styles.heroNoiseOverlayRot}>
            <img
              src="/multi-step-signup/noise-overlay.webp"
              alt=""
              className={styles.heroNoiseOverlayImg}
            />
          </div>
        </div>
      </div>

      <div className={styles.heroCaption} data-variant={variant}>
        {isSignIn ? (
          <>
            <h2 className={styles.heroTitle}>The quiet mechanics of modern money.</h2>
            <p className={styles.heroCopy}>
              Built for people who hate clutter, read the details, and expect their tools to stay out of the way.
            </p>
          </>
        ) : (
          <>
            <h2 className={styles.heroTitle}>
              <span>Capital, stripped of</span>
              <span>the ceremony.</span>
            </h2>
            <p className={styles.heroCopy}>
              Legacy banking runs on marble lobbies, friction, and fine print. We kept the regulation and deleted the rest.
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
