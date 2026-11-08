"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "../lib/gsap";

type Props = {
  children: ReactNode;
  /** Extra delay in ms after the gold foil has left, for blocks already on screen. */
  delay?: number;
  className?: string;
};

/** Rises into view once the gold foil has left, or when scrolled up from below. */
export default function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tween: gsap.core.Tween | undefined;

    const play = () => {
      const inView = el.getBoundingClientRect().top <= window.innerHeight * 0.92;
      tween = gsap.fromTo(
        el,
        { autoAlpha: 0, y: 24, filter: "blur(6px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.15,
          delay: inView ? delay / 1000 : 0,
          ease: "power3.out",
          clearProps: "filter,transform",
          scrollTrigger: inView
            ? undefined
            : { trigger: el, start: "top 92%", once: true },
        },
      );
    };

    if (document.documentElement.dataset.revealed === "1") play();
    else window.addEventListener("invitation-revealed", play, { once: true });

    return () => {
      window.removeEventListener("invitation-revealed", play);
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
