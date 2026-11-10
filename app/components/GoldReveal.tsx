"use client";

import { useEffect, useRef } from "react";

/**
 * Gold foil drawn off toward the top-left corner, uncovering the invitation.
 * The foil waits closed behind an "Open Invitation" button; clicking it starts
 * the CSS sweep. Scrolling stays locked until the foil has left.
 */
export default function GoldReveal() {
  const veil = useRef<HTMLDivElement>(null);
  const openRef = useRef<(() => void) | null>(null);

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

    let timer = 0;
    let opened = false;

    // Once opened, a tap or Escape lets the foil finish early.
    const skip = (event: Event) => {
      if (!opened) return;
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      finish();
    };

    const watch = () => {
      if (contentStarted || finished) return;
      const retreat = sheet?.getAnimations?.().find((clip): clip is CSSAnimation => {
        return clip instanceof CSSAnimation && clip.animationName === "gold-retreat";
      });
      const progress = retreat?.effect?.getComputedTiming().progress;
      if (typeof progress === "number" && progress >= 0.68) {
        beginContent();
        return;
      }
      frame = window.requestAnimationFrame(watch);
    };

    // Background music starts on the click (browsers only allow audio after a gesture).
    let audio: HTMLAudioElement | undefined;
    let fade = 0;
    const TARGET_VOLUME = 0.6;

    const startMusic = () => {
      audio = new Audio("/audio/background-music.wav");
      audio.loop = true;
      audio.volume = 0;
      audio.play().catch(() => {});
      fade = window.setInterval(() => {
        if (!audio) return;
        audio.volume = Math.min(TARGET_VOLUME, audio.volume + 0.04);
        if (audio.volume >= TARGET_VOLUME) window.clearInterval(fade);
      }, 100);
    };

    const open = () => {
      if (opened) return;
      opened = true;
      startMusic();
      root.classList.add("is-opening");
      frame = window.requestAnimationFrame(watch);
      timer = window.setTimeout(finish, 4500);
    };

    openRef.current = open;
    sheet?.addEventListener("animationend", onEnd);
    root.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    return () => {
      openRef.current = null;
      window.clearInterval(fade);
      audio?.pause();
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
    <div ref={veil} className="gold-veil">
      <div className="gold-veil__sheet" aria-hidden="true">
        <div className="gold-veil__grain" />
      </div>
      <div className="gold-veil__seal">
        <button
          type="button"
          className="open-btn"
          onClick={() => openRef.current?.()}
        >
          <span>Open Invitation</span>
        </button>
      </div>
    </div>
  );
}
