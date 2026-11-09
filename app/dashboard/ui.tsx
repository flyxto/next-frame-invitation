"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createGuest, deleteGuest, loginDashboard } from "../actions";
import {
  attendanceLabel,
  TITLES,
  type GuestView,
  type RsvpStatus,
} from "../lib/guest";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginDashboard, null);

  return (
    <main className="gate">
      <form className="gate-card" action={formAction}>
        <p className="dash-kicker">Next Frame Short Film Festival 2026</p>
        <h1>Guest book</h1>
        <p>Sign in to create invitation links and see who is coming.</p>
        <label className="sr-only" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          required
        />
        {state?.error ? (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" className="gold-btn" disabled={pending}>
          {pending ? "Signing in…" : "Enter"}
        </button>
      </form>
    </main>
  );
}

export function CreateGuestForm() {
  const [state, formAction, pending] = useActionState(createGuest, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <section className="dash-panel">
      <h2>New invitation</h2>
      <p>Choose how to address them. Their name is printed on a private link.</p>
      <form ref={formRef} className="create-row" action={formAction}>
        <label className="sr-only" htmlFor="title">
          Title
        </label>
        <select id="title" name="title" defaultValue="Mr">
          {TITLES.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="guest-name">
          Guest name
        </label>
        <input
          id="guest-name"
          name="name"
          type="text"
          placeholder="Full name"
          autoComplete="name"
          maxLength={80}
          required
        />
        <button type="submit" className="gold-btn" disabled={pending}>
          {pending ? "Creating…" : "Create link"}
        </button>
      </form>
      {state?.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok && state.code && state.displayName ? (
        <div className="create-success">
          <span>
            Link ready for <span translate="no">{state.displayName}</span>.
          </span>
          <CopyLink code={state.code} />
        </div>
      ) : null}
    </section>
  );
}

export function GuestList({ guests }: { guests: GuestView[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | RsvpStatus>("all");
  const needle = query.trim().toLowerCase();
  const shown = guests.filter((guest) => {
    const matchesTab = tab === "all" || guest.status === tab;
    const haystack = `${guest.displayName} ${guest.name}`.toLowerCase();
    return matchesTab && haystack.includes(needle);
  });

  const counts = {
    all: guests.length,
    pending: guests.filter((guest) => guest.status === "pending").length,
    yes: guests.filter((guest) => guest.status === "yes").length,
    no: guests.filter((guest) => guest.status === "no").length,
  };

  return (
    <section className="dash-panel">
      <div className="list-head">
        <h2>Invitations</h2>
        <label className="sr-only" htmlFor="guest-search">
          Search guests
        </label>
        <input
          id="guest-search"
          type="search"
          placeholder="Search by name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="filter-row" aria-label="Filter by reply">
        <FilterButton current={tab} value="all" count={counts.all} onSelect={setTab}>
          All
        </FilterButton>
        <FilterButton current={tab} value="yes" count={counts.yes} onSelect={setTab}>
          Attending
        </FilterButton>
        <FilterButton current={tab} value="no" count={counts.no} onSelect={setTab}>
          Declined
        </FilterButton>
        <FilterButton
          current={tab}
          value="pending"
          count={counts.pending}
          onSelect={setTab}
        >
          Waiting
        </FilterButton>
      </div>

      {guests.length === 0 ? (
        <p className="empty-note">No invitations yet. Add a guest above to create their link.</p>
      ) : shown.length === 0 ? (
        <p className="empty-note">No guests match that search.</p>
      ) : (
        <ul className="guest-list">
          {shown.map((guest) => (
            <li key={guest.id} className="guest-card" data-status={guest.status}>
              <div>
                <p className="guest-card-name" translate="no">
                  {guest.displayName}
                </p>
                <p className="guest-card-status">{attendanceLabel(guest.status, guest.companions)}</p>
                <p className="guest-card-meta">
                  Invited {guest.createdLabel}
                  {guest.respondedLabel ? ` · Replied ${guest.respondedLabel}` : ""}
                </p>
              </div>
              <div className="guest-actions">
                <CopyLink code={guest.code} />
                <a href={`/invite/${guest.code}`} target="_blank" rel="noreferrer">
                  Open
                </a>
                <RemoveGuest id={guest.id} name={guest.displayName} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FilterButton({
  current,
  value,
  count,
  onSelect,
  children,
}: {
  current: "all" | RsvpStatus;
  value: "all" | RsvpStatus;
  count: number;
  onSelect: (value: "all" | RsvpStatus) => void;
  children: string;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={selected ? "is-on" : ""}
      onClick={() => onSelect(value)}
    >
      {children}
      <span>{count}</span>
    </button>
  );
}

function CopyLink({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState<string | null>(null);

  return (
    <span className="copy-link">
      <button
        type="button"
        className="ghost-btn"
        onClick={async () => {
          const url = `${window.location.origin}/invite/${code}`;
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setFullUrl(null);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            setFullUrl(url);
          }
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      {fullUrl ? <input readOnly value={fullUrl} aria-label="Invitation link" /> : null}
    </span>
  );
}

function RemoveGuest({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      className="ghost-btn danger"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Remove ${name}'s invitation? Their link will stop working.`)) {
          return;
        }
        start(async () => {
          const result = await deleteGuest(id);
          if (result?.error) window.alert(result.error);
        });
      }}
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
