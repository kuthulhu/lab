import { useEffect, useRef, type CSSProperties, type PointerEvent, type SyntheticEvent } from "react";
import type { JonasProfile } from "./people";
import styles from "./jonas.module.css";

function markImgLoaded(el: HTMLImageElement | null) {
  if (el && el.complete && el.naturalWidth > 0) el.setAttribute("data-loaded", "");
}

function onImgReady(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.setAttribute("data-loaded", "");
}

const MAX_TILT = 12; // degrees
const LERP_ACTIVE = 0.16;
const LERP_SETTLE = 0.09;

/** Exact staggered 56x56 Dribbble icon positions from Figma node 569:2470. */
const DRIBBBLE_TILES = [
  { left: 48, top: 0 },
  { left: 155, top: 0 },
  { left: 262, top: 0 },
  { left: 0, top: 79 },
  { left: 107, top: 79 },
  { left: 214, top: 79 },
  { left: 48, top: 158 },
  { left: 155, top: 158 },
  { left: 262, top: 158 },
  { left: 0, top: 237 },
  { left: 107, top: 237 },
  { left: 214, top: 237 },
] as const;

export function JonasCard({ person }: { person: JonasProfile }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const currentRef = useRef({ x: 0.5, y: 0.5, opacity: 0 });
  const targetRef = useRef({ x: 0.5, y: 0.5, opacity: 0 });

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function applyFrame(x: number, y: number, opacity: number) {
    const card = cardRef.current;
    const scene = sceneRef.current;
    if (!card || !scene) return;

    const px = x * 100;
    const py = y * 100;
    const dx = x - 0.5;
    const dy = y - 0.5;
    const rx = -dy * MAX_TILT * 2 * opacity;
    const ry = dx * MAX_TILT * 2 * opacity;

    // Background shift for iridescent foil (mirrors React Bits sunpillar travel)
    const bgX = 50 + dx * 60;
    const bgY = 50 + dy * 60;

    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    card.style.setProperty("--px", `${px.toFixed(2)}%`);
    card.style.setProperty("--py", `${py.toFixed(2)}%`);
    card.style.setProperty("--mx", `${(x * 300).toFixed(1)}px`);
    card.style.setProperty("--my", `${(y * 356 - 18).toFixed(1)}px`);
    card.style.setProperty("--bg-x", `${bgX.toFixed(2)}%`);
    card.style.setProperty("--bg-y", `${bgY.toFixed(2)}%`);
    card.style.setProperty("--holo-shift-x", `${(dx * 180).toFixed(1)}px`);
    card.style.setProperty("--holo-shift-y", `${(dy * 180).toFixed(1)}px`);
    card.style.setProperty("--holo", opacity.toFixed(3));
    scene.style.setProperty("--holo", opacity.toFixed(3));
    scene.style.setProperty("--px", `${px.toFixed(2)}%`);
    scene.style.setProperty("--py", `${py.toFixed(2)}%`);
  }

  function startLoop() {
    if (rafRef.current !== null) return;

    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      const factor = activeRef.current ? LERP_ACTIVE : LERP_SETTLE;

      cur.x += (tgt.x - cur.x) * factor;
      cur.y += (tgt.y - cur.y) * factor;
      cur.opacity += (tgt.opacity - cur.opacity) * factor;

      const settled =
        !activeRef.current &&
        Math.abs(tgt.x - cur.x) < 0.001 &&
        Math.abs(tgt.y - cur.y) < 0.001 &&
        cur.opacity < 0.002;

      if (settled) {
        cur.x = 0.5;
        cur.y = 0.5;
        cur.opacity = 0;
        applyFrame(0.5, 0.5, 0);
        rafRef.current = null;
        return;
      }

      applyFrame(cur.x, cur.y, cur.opacity);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

    activeRef.current = true;
    targetRef.current = { x, y, opacity: 1 };
    startLoop();
  }

  function onPointerLeave() {
    activeRef.current = false;
    targetRef.current = { x: 0.5, y: 0.5, opacity: 0 };
    startLoop();
  }

  return (
    <div ref={sceneRef} className={styles.scene}>
      <div className={styles.behindGlow} aria-hidden="true" />
      <article
        ref={cardRef}
        className={styles.card}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        aria-label={`${person.name}, ${person.role}`}
      >
        <div className={styles.skyBackdrop} aria-hidden="true" />

        {/* Figma 569:2470 staggered Dribbble icon grid with holographic foil */}
        <div className={styles.patternLayer} aria-hidden="true">
          <div className={styles.patternSpotlight}>
            {DRIBBBLE_TILES.map((tile) => (
              <div
                key={`${tile.left}-${tile.top}`}
                className={styles.dribbbleTile}
                style={
                  {
                    left: tile.left,
                    top: tile.top,
                    "--tile-x": `${tile.left}px`,
                    "--tile-y": `${tile.top}px`,
                  } as CSSProperties
                }
              >
                <img
                  src="/profile-cards/jonas-dribbble.svg"
                  alt=""
                  width={56}
                  height={56}
                  className={styles.dribbbleBase}
                />
                <div className={styles.dribbbleHolo} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.glowPos} aria-hidden="true">
          <div className={styles.glowInner}>
            <img src="/profile-cards/jonas-glow.svg" alt="" className={styles.fillImg} />
          </div>
        </div>

        <div className={styles.maskWrap} aria-hidden="true">
          <div className={styles.maskBox}>
            <div className={styles.portraitInner}>
              <img
                ref={markImgLoaded}
                src={person.portraitSrc}
                alt={person.name}
                className={styles.portraitImg}
                onLoad={onImgReady}
                onError={onImgReady}
              />
            </div>
          </div>
        </div>

        <div className={styles.scrim} aria-hidden="true" />
        <div className={styles.holoSheen} aria-hidden="true" />
        <div className={styles.glare} aria-hidden="true" />

        <div className={styles.identity}>
          <h4 className={styles.name}>{person.name}</h4>
          <p className={styles.role}>{person.role}</p>
        </div>

        <p className={styles.bio}>{person.bio}</p>

        <div className={styles.insetShadow} aria-hidden="true" />
      </article>
    </div>
  );
}
