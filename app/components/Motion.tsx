"use client";

import { useEffect } from "react";
import { gsap } from "../lib/gsap";

/**
 * Page entrance + ambient loops, driven by GSAP. Renders nothing; it animates
 * elements inside `.poster` by class name:
 *   .arc-tl .arc-tl-inner .arc-bl   corner artwork
 *   .br-line                        the 12 bottom-right arcs (inlined SVG paths)
 *   .logo-enter                     logo
 *   .divider-grow                   horizontal rule (on scroll)
 *   .gold-shimmer                   title shimmer
 */
export default function Motion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".poster");
    if (!root) return;
    const q = gsap.utils.selector(root);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // --- Entrance -------------------------------------------------------
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        q(".arc-tl"),
        { autoAlpha: 0, xPercent: -12, yPercent: -12 },
        { autoAlpha: 1, xPercent: 0, yPercent: 0, duration: 2.2 },
        0,
      )
        .fromTo(
          q(".arc-tl-inner"),
          { autoAlpha: 0, xPercent: -12, yPercent: -12 },
          { autoAlpha: 1, xPercent: 0, yPercent: 0, duration: 2.6 },
          0.3,
        )
        .fromTo(
          q(".arc-bl"),
          { autoAlpha: 0, xPercent: -15, yPercent: 10 },
          { autoAlpha: 0.9, xPercent: 0, yPercent: 0, duration: 2.4 },
          0.5,
        )
        .fromTo(
          q(".br-line"),
          { autoAlpha: 0, xPercent: 14, yPercent: 14 },
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            duration: 1.8,
            stagger: 0.14,
          },
          0.5,
        )
        .fromTo(
          q(".logo-enter"),
          {
            autoAlpha: 0,
            scale: 0.6,
            y: 20,
            filter: "blur(8px) drop-shadow(0 0 0px rgba(240,195,106,0))",
          },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px) drop-shadow(0 0 10px rgba(240,195,106,0.25))",
            duration: 1.6,
          },
          0.2,
        );

      // --- Ambient loops (start once the entrance has settled) -------------
      // Slow breathing glow on the logo
      gsap.to(q(".logo-enter"), {
        filter: "blur(0px) drop-shadow(0 0 28px rgba(240,195,106,0.6))",
        duration: 2.25,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2,
      });

      // Inner arc drifts gently
      gsap.to(q(".arc-tl-inner"), {
        xPercent: 1.2,
        yPercent: 1.5,
        scale: 1.03,
        duration: 7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 3.2,
      });

      // A wave of light dims/brightens each bottom-right arc in turn
      gsap.to(q(".br-line"), {
        opacity: 0.3,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 4,
        stagger: 0.22,
      });

      // Title shimmer sweep
      gsap.to(q(".gold-shimmer"), {
        backgroundPosition: "-200% 0",
        duration: 6,
        ease: "none",
        repeat: -1,
      });

      // --- Divider grows out from the centre as it scrolls into view -------
      gsap.fromTo(
        q(".divider-grow"),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: q(".divider-grow")[0],
            start: "top 92%",
            once: true,
          },
        },
      );
    });

    return () => mm.revert();
  }, []);

  return null;
}
