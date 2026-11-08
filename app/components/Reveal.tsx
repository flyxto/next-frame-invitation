"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "../lib/gsap";

type Props = {
  children: ReactNode;
  /** Extra delay in ms once the block scrolls into view. */
  delay?: number;
  className?: string;
};

/** Fades, lifts and un-blurs its children (GSAP + ScrollTrigger) when scrolled into view. */
export default function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion is handled in CSS (content simply shows).
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 28, filter: "blur(6px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.2,
          delay: delay / 1000,
          ease: "power3.out",
          clearProps: "filter,transform",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        },
      );
    });
    return () => mm.revert();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
