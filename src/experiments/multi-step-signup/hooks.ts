import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { FlowStage, SignupData } from "./validation";

/** Countdown hook in seconds (used for OTP resend timer). */
export function useCountdown(initialSeconds: number, active: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (!active || seconds <= 0) return;
    const timer = window.setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active, seconds]);

  const reset = useCallback(
    (next = initialSeconds) => {
      setSeconds(next);
    },
    [initialSeconds],
  );

  return { seconds, reset };
}

/** Detects clicks outside an element (for dropdowns & popovers). */
export function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, onOutside: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [ref, onOutside, enabled]);
}

const STORAGE_KEY = "lab-kyc-signup-draft-v2";

export interface SavedDraft {
  stage: FlowStage;
  kycStep: number;
  data: SignupData;
  savedAt: string;
}

export function loadDraft(): SavedDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedDraft;
    if (!parsed || typeof parsed !== "object" || !parsed.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(draft: SavedDraft): boolean {
  try {
    const cleanData: SignupData = {
      ...draft.data,
      uploadedDocs: draft.data.uploadedDocs.map((d) => ({ ...d, previewUrl: undefined })),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, data: cleanData }));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

/** Focuses a heading element only when the step actually changes (StrictMode-safe). */
export function useStepFocus(depKey: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevKey = useRef(depKey);

  useEffect(() => {
    if (prevKey.current !== depKey) {
      prevKey.current = depKey;
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [depKey]);

  return headingRef;
}

/**
 * Choreographs centered success screens via compositor-threaded WAAPI:
 * 1. Check circle + title appear in the vertical center of the column.
 * 2. After a brief beat, they glide up into their header slot (--ease-in-out).
 * 3. Additional sections stagger in as the hero settles (--ease-out).
 * Under prefers-reduced-motion, elements gently fade in place without movement.
 */
export function useSuccessChoreography() {
  const columnRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const column = columnRef.current;
    const hero = heroRef.current;
    const circle = circleRef.current;
    const title = titleRef.current;
    if (!column || !hero || !circle || !title || typeof hero.animate !== "function") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = Array.from(column.querySelectorAll<HTMLElement>("[data-success-reveal]"));
    const animations: Animation[] = [];

    if (reduceMotion) {
      animations.push(
        hero.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200,
          easing: "ease",
          fill: "backwards",
        }),
      );
      reveals.forEach((el, i) => {
        animations.push(
          el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 200,
            delay: 60 + i * 35,
            easing: "ease",
            fill: "backwards",
          }),
        );
      });
      return () => animations.forEach((a) => a.cancel());
    }

    const colRect = column.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();
    const centerOffset = Math.round(colRect.top + colRect.height / 2 - (heroRect.top + heroRect.height / 2));

    const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
    const easeInOut = "cubic-bezier(0.77, 0, 0.175, 1)";

    animations.push(
      circle.animate(
        [
          { opacity: 0, transform: "scale(0.9)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 380, delay: 0, easing: easeOut, fill: "backwards" },
      ),
    );

    animations.push(
      title.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0px)" },
        ],
        { duration: 380, delay: 140, easing: easeOut, fill: "backwards" },
      ),
    );

    if (centerOffset > 0) {
      animations.push(
        hero.animate([{ transform: `translateY(${centerOffset}px)` }, { transform: "translateY(0px)" }], {
          duration: 560,
          delay: 1020,
          easing: easeInOut,
          fill: "backwards",
        }),
      );
    }

    let staggerIndex = 0;
    reveals.forEach((el) => {
      if (el.dataset.successReveal === "fade") {
        animations.push(
          el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 380,
            delay: 1360 + staggerIndex * 80,
            easing: easeOut,
            fill: "backwards",
          }),
        );
        return;
      }

      animations.push(
        el.animate(
          [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0px)" },
          ],
          {
            duration: 380,
            delay: 1360 + staggerIndex * 80,
            easing: easeOut,
            fill: "backwards",
          },
        ),
      );
      staggerIndex += 1;
    });

    return () => animations.forEach((a) => a.cancel());
  }, []);

  return { columnRef, heroRef, circleRef, titleRef };
}
