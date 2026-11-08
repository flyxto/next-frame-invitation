"use client";

import { useEffect } from "react";
import { gsap } from "../lib/gsap";

/**
 * Entrance for the artwork, logo and rule, plus the ambient loops.
 * Waits for the gold foil to finish (`invitation-revealed` from GoldReveal).
 */
export default function Motion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".poster");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const q = gsap.utils.selector(root);
    const tweens: gsap.core.Animation[] = [];

    const play = () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tweens.push(tl);

      tl.fromTo(
        q(".arc-tl"),
        { autoAlpha: 0, xPercent: -8, yPercent: -8 },
        { autoAlpha: 1, xPercent: 0, yPercent: 0, duration: 1.6 },
        0,
      )
        .fromTo(
          q(".arc-tl-inner"),
          { autoAlpha: 0, xPercent: -10, yPercent: -10 },
          { autoAlpha: 1, xPercent: 0, yPercent: 0, duration: 1.8 },
          0.12,
        )
        .fromTo(
          q(".arc-bl"),
          { autoAlpha: 0, xPercent: -8, yPercent: 8 },
          { autoAlpha: 0.9, xPercent: 0, yPercent: 0, duration: 1.5 },
          0.16,
        )
        .fromTo(
          q(".br-line"),
          { autoAlpha: 0, xPercent: 12, yPercent: 12 },
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            duration: 1.25,
            stagger: 0.05,
          },
          0.12,
        )
        .fromTo(
          q(".logo-enter"),
          // No CSS filters on the PNG: animating them renders a white box on iOS Safari.
          { autoAlpha: 0, scale: 0.86, y: 18 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 1.35 },
          0,
        )
        .fromTo(
          q(".logo-glow"),
          { autoAlpha: 0, scale: 0.7 },
          { autoAlpha: 0.55, scale: 1, duration: 1.6 },
          0.1,
        )
        .fromTo(
          q("canvas"),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.4 },
          0,
        )
        .fromTo(
          q(".divider-grow"),
          { autoAlpha: 0, scaleX: 0 },
          {
            autoAlpha: 1,
            scaleX: 1,
            duration: 0.9,
            transformOrigin: "center center",
          },
          0.42,
        );

      tweens.push(
        // Breathing glow: opacity/scale on its own layer, never a filter
        gsap.to(q(".logo-glow"), {
          opacity: 1,
          scale: 1.12,
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 1.8,
        }),
        gsap.to(q(".arc-tl-inner"), {
          xPercent: 1.2,
          yPercent: 1.5,
          scale: 1.03,
          duration: 7,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 2.1,
        }),
        gsap.to(q(".br-line"), {
          opacity: 0.35,
          duration: 2.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 2.2,
          stagger: 0.22,
        }),
        gsap.to(q(".gold-shimmer"), {
          backgroundPosition: "-200% 0",
          duration: 6,
          ease: "none",
          repeat: -1,
          delay: 1.15,
        }),
      );
    };

    if (document.documentElement.dataset.revealed === "1") play();
    else window.addEventListener("invitation-revealed", play, { once: true });

    return () => {
      window.removeEventListener("invitation-revealed", play);
      tweens.forEach((tween) => tween.kill());
    };
  }, []);

  return null;
}
