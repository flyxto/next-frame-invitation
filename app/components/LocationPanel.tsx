"use client";

import { useEffect, useState } from "react";

const MAP_URL = "https://maps.app.goo.gl/JhtqhZVpPUo7rbnX6?g_st=ac";

export default function LocationPanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="gold-btn btn-3d loc-fab"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Show event location"
      >
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
        </svg>
      </button>

      {open ? (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="rsvp modal-card loc-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="loc-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <div className="loc-head">
              <div className="loc-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                </svg>
              </div>
              <div>
                <p id="loc-title" className="loc-venue">
                  <strong>FCT Auditorium</strong>
                  <br />
                  University of Kelaniya
                </p>
              </div>
            </div>
            <a
              className="gold-btn btn-3d loc-link"
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7 9 4Z" />
                <path d="M9 4v13M15 7v13" />
              </svg>
              Open in Maps
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
