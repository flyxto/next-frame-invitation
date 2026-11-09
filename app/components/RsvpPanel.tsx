"use client";

import { useActionState, useEffect, useState } from "react";
import { submitRsvp } from "../actions";
import type { InviteGuest } from "../lib/guest";

export default function RsvpPanel({ guest }: { guest: InviteGuest }) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<"yes" | "no" | "">(
    guest.status === "pending" ? "" : guest.status,
  );
  const [companions, setCompanions] = useState(guest.companions);
  const [state, formAction, pending] = useActionState(
    submitRsvp.bind(null, guest.code),
    null,
  );

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

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

  const saved = guest.status !== "pending";

  return (
    <>
      <button
        type="button"
        className="gold-btn btn-3d reply-fab"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {saved ? "Change registration" : "Register"}
      </button>

      {open ? (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="rsvp modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rsvp-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <h3 id="rsvp-title">Will you join us?</h3>
            <form action={formAction}>
              <div className="rsvp-choices">
                <label className={`rsvp-choice${choice === "yes" ? " is-on" : ""}`}>
                  <input
                    type="radio"
                    name="status"
                    value="yes"
                    checked={choice === "yes"}
                    onChange={() => setChoice("yes")}
                  />
                  Yes, I will come
                </label>
                <label className={`rsvp-choice${choice === "no" ? " is-on" : ""}`}>
                  <input
                    type="radio"
                    name="status"
                    value="no"
                    checked={choice === "no"}
                    onChange={() => setChoice("no")}
                  />
                  I cannot attend
                </label>
              </div>

              {choice === "yes" ? (
                <div className="rsvp-count">
                  <label htmlFor="companions">How many guests are coming with you?</label>
                  <p className="rsvp-hint">Do not count yourself.</p>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => setCompanions((count) => Math.max(0, count - 1))}
                      aria-label="Fewer guests"
                    >
                      −
                    </button>
                    <input
                      id="companions"
                      name="companions"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={15}
                      value={companions}
                      onChange={(event) => {
                        const next = Number.parseInt(event.target.value, 10);
                        setCompanions(
                          Number.isNaN(next) ? 0 : Math.min(15, Math.max(0, next)),
                        );
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setCompanions((count) => Math.min(15, count + 1))}
                      aria-label="More guests"
                    >
                      +
                    </button>
                  </div>
                  <p className="rsvp-total">
                    {companions === 0
                      ? "1 person, just you."
                      : `${companions + 1} people, including you.`}
                  </p>
                </div>
              ) : null}

              {state?.error ? (
                <p className="form-error" role="alert">
                  {state.error}
                </p>
              ) : null}

              <button type="submit" className="gold-btn btn-3d" disabled={pending || !choice}>
                {pending ? "Sending…" : "Register"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
