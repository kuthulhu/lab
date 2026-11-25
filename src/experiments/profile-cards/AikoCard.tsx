import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { AikoProfile } from "./people";
import styles from "./aiko.module.css";

const PIXEL_GAP = 6;
const PIXEL_SPEED = 0.035;
const CURSOR_SHIMMER_RADIUS = 56;
const PIXEL_COLORS = ["#ecfdf5", "#d1fae5", "#a7f3d0", "#6ee7b7", "#bbf7d0", "#fef9c3"];

const ORB_SIZE = 106;
const ORB_PAD = 12;
const ORB_CANVAS_SIZE = ORB_SIZE + ORB_PAD * 2;
const ORB_CENTER = ORB_CANVAS_SIZE / 2;
const ORB_RADIUS = ORB_SIZE / 2;
const GLITTER_COUNT = 360;
const WAKE_RADIUS = 28;
const GLITTER_COLORS = ["#ffffff", "#fae8ff", "#f5d0fe", "#f0abfc", "#e879f9", "#d946ef", "#c026d3"];

interface Point {
  x: number;
  y: number;
}

interface GlitterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  color: string;
  floater: boolean;
  restY: number;
}

class Pixel {
  private ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private color: string;
  private speed: number;
  private size = 0;
  private sizeStep: number;
  private minSize = 0.5;
  private maxSizeInteger = 2.4;
  private maxSize: number;
  private delay: number;
  private counter = 0;
  private counterStep: number;
  isIdle = true;
  private isReverse = false;
  private isShimmer = false;

  constructor(
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = (Math.random() * 0.8 + 0.1) * speed;
    this.sizeStep = Math.random() * 0.4 + 0.08;
    this.maxSize = Math.random() * (this.maxSizeInteger - this.minSize) + this.minSize;
    this.delay = delay;
    this.counterStep = Math.random() * 4 + (width + height) * 0.01;
  }

  setOrigin(originX: number, originY: number) {
    this.delay = Math.hypot(this.x - originX, this.y - originY) * 0.55;
    this.counter = 0;
  }

  private draw(boost = 0) {
    const drawSize = Math.min(PIXEL_GAP - 1.5, this.size + boost * 1.8);
    const centerOffset = this.maxSizeInteger * 0.5 - drawSize * 0.5;
    this.ctx.fillStyle = boost > 0.35 ? "#ffffff" : this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, drawSize, drawSize);
  }

  appear(pointer: Point | null) {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }

    let boost = 0;
    if (pointer) {
      const dist = Math.hypot(this.x - pointer.x, this.y - pointer.y);
      if (dist < CURSOR_SHIMMER_RADIUS) {
        const t = 1 - dist / CURSOR_SHIMMER_RADIUS;
        boost = t * t;
      }
    }

    if (this.isShimmer) {
      this.shimmer(boost);
    } else {
      this.size += this.sizeStep;
    }
    this.draw(boost);
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    }
    this.size = Math.max(0, this.size - 0.14);
    this.draw();
  }

  private shimmer(boost: number) {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    const step = this.speed * (1 + boost * 2.4);
    this.size += this.isReverse ? -step : step;
  }
}

function createGlitterParticles(): GlitterParticle[] {
  const list: GlitterParticle[] = [];
  for (let i = 0; i < GLITTER_COUNT; i += 1) {
    const floater = i < 42;
    let x: number;
    let y: number;

    if (floater) {
      // Sparse floating stardust across the upper/full sphere
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (ORB_RADIUS - 3);
      x = ORB_CENTER + Math.cos(a) * r;
      y = ORB_CENTER + Math.sin(a) * r;
    } else {
      // Dense settled glitter bed biased toward the bottom hemisphere
      const a = Math.random() * Math.PI * 1.15 - Math.PI * 0.075; // mostly bottom arc (0..PI)
      const r = (0.35 + Math.pow(Math.random(), 0.55) * 0.63) * (ORB_RADIUS - 2);
      x = ORB_CENTER + Math.cos(a) * r;
      y = ORB_CENTER + Math.sin(a) * r;
    }

    list.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: floater ? 0.9 + Math.random() * 0.8 : 0.9 + Math.random() * 1.25,
      baseAlpha: floater ? 0.55 + Math.random() * 0.45 : 0.5 + Math.random() * 0.5,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 2.5 + Math.random() * 4.5,
      color: floater
        ? GLITTER_COLORS[Math.floor(Math.random() * 3)]
        : GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
      floater,
      restY: ORB_CENTER + ORB_RADIUS * (0.28 + Math.random() * 0.68),
    });
  }
  return list;
}

function drawElectricRingStrand(
  ctx: CanvasRenderingContext2D,
  time: number,
  seed: number,
  amp: number,
  strokeStyle: string,
  lineWidth: number,
  shadowColor: string,
  shadowBlur: number,
  startAngle: number,
  progress: number,
) {
  if (progress <= 0.005) return;
  const fullSteps = 112;
  const closed = progress >= 0.995;
  const steps = Math.max(2, Math.round(fullSteps * progress));
  const sweep = closed ? Math.PI * 2 : progress * Math.PI * 2;

  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = startAngle + t * sweep;
    const wave =
      Math.sin(angle * 11 + time * 6.5 + seed) * 0.45 +
      Math.sin(angle * 23 - time * 10.5 + seed * 1.9) * 0.35 +
      Math.sin(angle * 37 + time * 14.0 + seed * 3.1) * 0.2;
    const r = ORB_RADIUS + wave * amp;
    const x = ORB_CENTER + Math.cos(angle) * r;
    const y = ORB_CENTER + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  if (closed) ctx.closePath();
  ctx.lineCap = "round";
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.stroke();
  ctx.restore();
}

export function AikoCard({ person }: { person: AikoProfile }) {
  const [following, setFollowing] = useState(false);

  const bannerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const rafRef = useRef<number | null>(null);
  const modeRef = useRef<"appear" | "disappear">("disappear");
  const pointerRef = useRef<Point | null>(null);
  const lastTimeRef = useRef(0);

  const avatarWrapRef = useRef<HTMLDivElement>(null);
  const orbCanvasRef = useRef<HTMLCanvasElement>(null);
  const orbRafRef = useRef<number | null>(null);
  const orbTargetRef = useRef(0);
  const orbOpacityRef = useRef(0);
  const orbSweepRef = useRef(0);
  const orbStartAngleRef = useRef(-Math.PI * 0.5);
  const orbLastNowRef = useRef(0);
  const orbPtrRef = useRef<Point | null>(null);
  const orbPrevPtrRef = useRef<Point | null>(null);
  const orbVelRef = useRef<Point>({ x: 0, y: 0 });
  const glitterRef = useRef<GlitterParticle[]>([]);

  // Banner pixel grid setup
  useEffect(() => {
    const banner = bannerRef.current;
    const canvas = canvasRef.current;
    if (!banner || !canvas) return;

    const initPixels = () => {
      const rect = banner.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const next: Pixel[] = [];

      for (let x = 0; x < width; x += PIXEL_GAP) {
        for (let y = 0; y < height; y += PIXEL_GAP) {
          const color = PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)];
          const dx = x - cx;
          const dy = y - cy;
          const delay = Math.hypot(dx, dy) * 0.7;
          next.push(new Pixel(width, height, ctx, x, y, color, PIXEL_SPEED, delay));
        }
      }

      pixelsRef.current = next;
    };

    initPixels();

    const observer = new ResizeObserver(() => initPixels());
    observer.observe(banner);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Crystalized Ball canvas setup
  useEffect(() => {
    const canvas = orbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = ORB_CANVAS_SIZE * dpr;
    canvas.height = ORB_CANVAS_SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    glitterRef.current = createGlitterParticles();

    return () => {
      if (orbRafRef.current !== null) cancelAnimationFrame(orbRafRef.current);
    };
  }, []);

  function startOrbLoop() {
    if (orbRafRef.current !== null) return;
    orbLastNowRef.current = performance.now();

    const tick = (now: number) => {
      const canvas = orbCanvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        orbRafRef.current = null;
        return;
      }

      const dt = Math.min(0.05, Math.max(0, (now - orbLastNowRef.current) / 1000));
      orbLastNowRef.current = now;

      const target = orbTargetRef.current;
      if (target > 0) {
        orbOpacityRef.current = Math.min(1, orbOpacityRef.current + dt / 0.68);
        orbSweepRef.current = Math.min(1, orbSweepRef.current + dt / 0.78);
      } else {
        // Simple fade out on leave — keep ring sweep intact until fully faded
        orbOpacityRef.current = Math.max(0, orbOpacityRef.current - dt / 0.34);
      }

      const oRaw = orbOpacityRef.current;
      const sRaw = orbSweepRef.current;
      // Smooth sine ease-in-out for an organic, unhurried trace
      const sweepEase = 0.5 - 0.5 * Math.cos(sRaw * Math.PI);
      const alphaCurve = oRaw * oRaw * (3 - 2 * oRaw);

      canvas.style.opacity = alphaCurve.toFixed(3);
      ctx.clearRect(0, 0, ORB_CANVAS_SIZE, ORB_CANVAS_SIZE);

      if (oRaw <= 0 && target === 0) {
        orbSweepRef.current = 0;
        orbRafRef.current = null;
        return;
      }

      const time = now * 0.001;
      const ptr = orbPtrRef.current;
      const vel = orbVelRef.current;
      // Decay cursor velocity smoothly between pointermove events
      vel.x *= 0.82;
      vel.y *= 0.82;

      // 1. Physics-simulated glitter dust clipped cleanly inside the sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(ORB_CENTER, ORB_CENTER, ORB_RADIUS - 0.5, 0, Math.PI * 2);
      ctx.clip();

      const particles = glitterRef.current;
      const innerLimit = ORB_RADIUS - 2;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        if (p.floater) {
          p.vx += Math.sin(time * 0.9 + p.twinklePhase) * 0.004;
          p.vy += Math.cos(time * 0.8 + p.twinklePhase) * 0.004;
        } else {
          if (p.y < p.restY) {
            p.vy += 0.032;
          } else {
            p.vy += (p.restY - p.y) * 0.008;
          }
          p.vx += Math.sin(time * 1.4 + p.twinklePhase) * 0.006;
        }

        if (ptr) {
          const dx = p.x - ptr.x;
          const dy = p.y - ptr.y;
          const dist = Math.hypot(dx, dy);
          if (dist < WAKE_RADIUS && dist > 0.001) {
            const falloff = 1 - dist / WAKE_RADIUS;
            const push = falloff * falloff * 1.35;
            p.vx += (dx / dist) * push + vel.x * falloff * 0.22;
            p.vy += (dy / dist) * push + vel.y * falloff * 0.22;
          }
        }

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;

        const rdx = p.x - ORB_CENTER;
        const rdy = p.y - ORB_CENTER;
        const rDist = Math.hypot(rdx, rdy);
        if (rDist > innerLimit) {
          const nx = rdx / rDist;
          const ny = rdy / rDist;
          p.x = ORB_CENTER + nx * innerLimit;
          p.y = ORB_CENTER + ny * innerLimit;
          const dot = p.vx * nx + p.vy * ny;
          if (dot > 0) {
            p.vx -= 1.25 * dot * nx;
            p.vy -= 1.25 * dot * ny;
          }
        }

        const twinkle = 0.55 + 0.45 * Math.sin(time * p.twinkleSpeed + p.twinklePhase);
        const alpha = p.baseAlpha * twinkle;
        if (alpha > 0.015) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
        }
      }

      ctx.globalAlpha = 1;
      ctx.restore();

      // 2. Intertwined neon magenta/white crackling electric rim with staggered strands
      const startAngle = orbStartAngleRef.current;
      const strand1 = sweepEase;
      const strand2 = sRaw >= 0.995 ? 1 : Math.max(0, Math.min(1, (sweepEase - 0.04) / 0.96));
      const strand3 = sRaw >= 0.995 ? 1 : Math.max(0, Math.min(1, (sweepEase - 0.09) / 0.91));
      drawElectricRingStrand(ctx, time, 0.0, 2.0, "rgba(217, 70, 239, 0.82)", 2.6, "#d946ef", 10, startAngle, strand1);
      drawElectricRingStrand(ctx, time * 1.15, 2.4, 1.6, "rgba(240, 171, 252, 0.9)", 1.35, "#e879f9", 5, startAngle, strand2);
      drawElectricRingStrand(ctx, time * 1.3, 5.1, 1.2, "rgba(255, 255, 255, 0.95)", 0.85, "#ffffff", 2, startAngle, strand3);

      orbRafRef.current = requestAnimationFrame(tick);
    };

    orbRafRef.current = requestAnimationFrame(tick);
  }

  function runAnimation(mode: "appear" | "disappear") {
    modeRef.current = mode;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const frameInterval = 1000 / 60;
    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);

      if (now - lastTimeRef.current < frameInterval) return;
      lastTimeRef.current = now - ((now - lastTimeRef.current) % frameInterval);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      let allIdle = true;
      const pixels = pixelsRef.current;
      const currentMode = modeRef.current;
      const pointer = pointerRef.current;

      for (let i = 0; i < pixels.length; i += 1) {
        const px = pixels[i];
        if (currentMode === "appear") {
          px.appear(pointer);
        } else {
          px.disappear();
        }
        if (!px.isIdle) allIdle = false;
      }

      if (allIdle && currentMode === "disappear") {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  function getBannerPoint(event: PointerEvent<HTMLElement>, clamp: boolean): Point | null {
    const banner = bannerRef.current;
    if (!banner) return null;
    const rect = banner.getBoundingClientRect();
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;
    if (!clamp && (rawX < 0 || rawX > rect.width || rawY < 0 || rawY > rect.height)) {
      return null;
    }
    return {
      x: Math.min(rect.width, Math.max(0, rawX)),
      y: Math.min(rect.height, Math.max(0, rawY)),
    };
  }

  function updateOrbPointer(event: PointerEvent<HTMLElement>) {
    const wrap = avatarWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = event.clientX - rect.left + ORB_PAD;
    const y = event.clientY - rect.top + ORB_PAD;
    const dist = Math.hypot(x - ORB_CENTER, y - ORB_CENTER);

    if (dist < ORB_RADIUS + WAKE_RADIUS) {
      const prev = orbPrevPtrRef.current;
      if (prev) {
        orbVelRef.current = {
          x: Math.max(-14, Math.min(14, x - prev.x)),
          y: Math.max(-14, Math.min(14, y - prev.y)),
        };
      }
      orbPrevPtrRef.current = { x, y };
      orbPtrRef.current = { x, y };
    } else {
      orbPtrRef.current = null;
      orbPrevPtrRef.current = null;
    }
  }

  function onCardPointerEnter(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const origin = getBannerPoint(event, true);
    pointerRef.current = getBannerPoint(event, false);
    if (origin) {
      const pixels = pixelsRef.current;
      for (let i = 0; i < pixels.length; i += 1) {
        pixels[i].setOrigin(origin.x, origin.y);
      }
    }

    runAnimation("appear");

    if (orbOpacityRef.current <= 0.05) {
      orbSweepRef.current = 0;
      const wrap = avatarWrapRef.current;
      if (wrap) {
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width * 0.5;
        const cy = rect.top + rect.height * 0.5;
        orbStartAngleRef.current = Math.atan2(event.clientY - cy, event.clientX - cx);
      }
    }
    orbPrevPtrRef.current = null;
    updateOrbPointer(event);
    orbTargetRef.current = 1;
    startOrbLoop();
  }

  function onCardPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    pointerRef.current = getBannerPoint(event, false);
    updateOrbPointer(event);
  }

  function onCardPointerLeave(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    pointerRef.current = null;
    orbPtrRef.current = null;
    orbPrevPtrRef.current = null;
    runAnimation("disappear");
    orbTargetRef.current = 0;
    startOrbLoop();
  }

  return (
    <article
      className={styles.card}
      onPointerEnter={onCardPointerEnter}
      onPointerMove={onCardPointerMove}
      onPointerLeave={onCardPointerLeave}
      aria-label={`${person.name}, ${person.role}`}
    >
      <div ref={bannerRef} className={styles.banner}>
        <div className={styles.bannerCenter}>
          <img
            ref={(el) => {
              if (el && el.complete && el.naturalWidth > 0) el.setAttribute("data-loaded", "");
            }}
            src={person.bannerSrc}
            alt=""
            className={styles.bannerImg}
            onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "")}
            onError={(e) => e.currentTarget.setAttribute("data-loaded", "")}
          />
        </div>
        <canvas ref={canvasRef} className={styles.pixelCanvas} aria-hidden="true" />
      </div>

      <div className={styles.sheet}>
        <div ref={avatarWrapRef} className={styles.avatarWrap}>
          <div className={styles.avatar}>
            <div className={styles.avatarCrop}>
              <img
                ref={(el) => {
                  if (el && el.complete && el.naturalWidth > 0) el.setAttribute("data-loaded", "");
                }}
                src={person.avatarSrc}
                alt={person.name}
                className={styles.avatarImg}
                onLoad={(e) => e.currentTarget.setAttribute("data-loaded", "")}
                onError={(e) => e.currentTarget.setAttribute("data-loaded", "")}
              />
            </div>
            <div className={styles.avatarShadow} aria-hidden="true" />
          </div>
          <canvas ref={orbCanvasRef} className={styles.crystalCanvas} aria-hidden="true" />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.messageBtn} aria-label={`Message ${person.name}`}>
            <i className={`ph ph-envelope-simple ${styles.envelopeIcon}`} style={{ fontSize: 20 }} aria-hidden="true" />
          </button>

          <button
            type="button"
            className={styles.followBtn}
            aria-pressed={following}
            onClick={() => setFollowing((f) => !f)}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>

        <div className={styles.identity}>
          <h4 className={styles.name}>{person.name}</h4>
          <p className={styles.role}>{person.role}</p>
        </div>

        <dl className={styles.stats}>
          {person.stats.map((stat) => (
            <div key={stat.label} className={styles.statTile}>
              <dd className={styles.statValue}>{stat.value}</dd>
              <dt className={styles.statLabel}>{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
