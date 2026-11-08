"use client";

import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";

type Fly = {
  x: number;
  y: number;
  r: number; // core radius
  heading: number; // wandering direction
  turn: number; // how quickly the heading drifts
  speed: number;
  phase: number; // glow pulse phase
  pulse: number; // glow pulse speed
};

/** Faint golden fireflies that wander slowly behind the content. */
export default function Fireflies() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let w = 0;
    let h = 0;
    let flies: Fly[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(28, Math.max(12, (w * h) / 40000)));
      flies = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1 + 0.7,
        heading: Math.random() * Math.PI * 2,
        turn: (Math.random() - 0.5) * 0.02,
        speed: Math.random() * 0.22 + 0.08,
        phase: Math.random() * Math.PI * 2,
        pulse: Math.random() * 0.012 + 0.006,
      }));
    };

    const frame = (_time?: number, deltaTime = 16.7) => {
      const k = Math.min(deltaTime, 50) / 16.7; // frame-rate independent
      ctx.clearRect(0, 0, w, h);
      for (const f of flies) {
        if (!reduce) {
          f.heading += (f.turn + (Math.random() - 0.5) * 0.05) * k;
          f.x += Math.cos(f.heading) * f.speed * k;
          f.y += (Math.sin(f.heading) * f.speed - 0.04) * k; // slight upward drift
          f.phase += f.pulse * k;
        }
        // wrap softly around the edges
        if (f.x < -20) f.x = w + 20;
        if (f.x > w + 20) f.x = -20;
        if (f.y < -20) f.y = h + 20;
        if (f.y > h + 20) f.y = -20;

        // slow pulse: mostly dim, occasionally brighter (kept low overall)
        const glow = Math.pow(0.5 + 0.5 * Math.sin(f.phase), 2);
        const a = 0.06 + glow * 0.3;
        const rad = f.r * 7;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
        g.addColorStop(0, `rgba(255, 214, 130, ${a})`);
        g.addColorStop(0.25, `rgba(240, 180, 80, ${a * 0.35})`);
        g.addColorStop(1, "rgba(240, 180, 80, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    frame();
    if (!reduce) gsap.ticker.add(frame);
    window.addEventListener("resize", resize);
    return () => {
      gsap.ticker.remove(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    />
  );
}
