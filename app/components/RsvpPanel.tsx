"use client";

import { useActionState, useEffect, useState } from "react";
import { submitRsvp } from "../actions";
import type { InviteGuest } from "../lib/guest";

export default function RsvpPanel({ guest }: { guest: InviteGuest }) {
  const [editing, setEditing] = useState(false);
  const [choice, setChoice] = useState<"yes" | "no" | "">(
    guest.status === "pending" ? "" : guest.status,
  );
  const [companions, setCompanions] = useState(guest.companions);
  const [state, formAction, pending] = useActionState(
    submitRsvp.bind(null, guest.code),
    null,
  );

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  const saved = guest.status !== "pending";
  if (saved && !editing) {
    const total = guest.status === "yes" ? 1 + guest.companions : 0;
    return (
      <section className="rsvp" aria-live="polite">
        <h3>Your reply is saved</h3>
        {guest.status === "yes" ? (
          <p>
            {total === 1
              ? `${guest.displayName}, we have you down for 1 person.`
              : `${guest.displayName}, we have you down for ${total} people, including you.`}
          </p>
        ) : (
          <p>{guest.displayName}, thank you for letting us know.</p>
        )}
        <button type="button" className="ghost-btn" onClick={() => setEditing(true)}>
          Change reply
        </button>
      </section>
    );
  }

  return (
    <section className="rsvp">
      <h3>Kindly reply</h3>
      <p>Will you join us? If you are coming, tell us how many guests are with you.</p>
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
            <p className="rsvp-hint">Do not count yourself. You can add up to 15.</p>
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

        <button type="submit" className="gold-btn" disabled={pending}>
          {pending ? "Saving…" : "Send my reply"}
        </button>
      </form>
    </section>
  );
}
