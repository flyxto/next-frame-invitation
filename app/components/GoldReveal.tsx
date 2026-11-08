"use client";

import { useEffect, useRef } from "react";

/**
 * Gold foil drawn off toward the top-left corner, uncovering the invitation.
 * The sweep itself is CSS (it starts on first paint). This component only
 * locks scrolling, and lets a click or Escape finish early.
 */
export default function GoldReveal() {
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = veil.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sheet = root.querySelector<HTMLElement>(".gold-veil__sheet");
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    let finished = false;
    let contentStarted = false;
    let frame = 0;

    // Logo and text begin while the last of the foil is still leaving.
    const beginContent = () => {
      if (contentStarted) return;
      contentStarted = true;
      document.documentElement.dataset.revealed = "1";
      window.dispatchEvent(new Event("invitation-revealed"));
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      beginContent();
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      root.classList.add("is-done");
    };

    const onEnd = (event: AnimationEvent) => {
      if (event.target !== sheet) return;
      if (event.animationName !== "gold-retreat") return;
      finish();
    };

    const skip = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        event.key !== "Escape" &&
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }
      if (event instanceof KeyboardEvent) event.preventDefault();
      finish();
    };

    sheet?.addEventListener("animationend", onEnd);
    root.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    const retreat = sheet
      ?.getAnimations?.()
      .find((clip) => clip.animationName === "gold-retreat");
    if (retreat?.playState === "finished") finish();

    const watch = () => {
      if (contentStarted || finished) return;
      const progress = retreat?.effect?.getComputedTiming().progress;
      if (typeof progress === "number" && progress >= 0.68) {
        beginContent();
        return;
      }
      frame = window.requestAnimationFrame(watch);
    };
    frame = window.requestAnimationFrame(watch);

    const timer = window.setTimeout(finish, 4500);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      sheet?.removeEventListener("animationend", onEnd);
      root.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      if (!finished) {
        html.style.overflow = prevHtml;
        body.style.overflow = prevBody;
      }
    };
  }, []);

  return (
    <div ref={veil} className="gold-veil" aria-hidden="true">
      <div className="gold-veil__sheet">
        <div className="gold-veil__grain" />
      </div>
    </div>
  );
}
