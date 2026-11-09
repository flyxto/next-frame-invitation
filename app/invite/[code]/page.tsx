import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import Invitation from "../../components/Invitation";
import { findGuestByCode } from "../../lib/guests";

export const metadata: Metadata = {
  title: "You're invited | Next Frame Short Film Festival 2026",
  description:
    "A personal invitation to Next Frame Short Film Festival 2026 at the University of Kelaniya.",
  robots: { index: false, follow: false },
};

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <Suspense fallback={<p className="pending-note">Opening your invitation…</p>}>
      <Invite params={params} />
    </Suspense>
  );
}

async function Invite({ params }: { params: Promise<{ code: string }> }) {
  await connection();
  const { code } = await params;

  if (!/^[A-Za-z0-9_-]{8,24}$/.test(code)) return <InviteMessage />;

  try {
    const guest = await findGuestByCode(code);
    if (!guest) return <InviteMessage />;
    return (
      <Invitation
        guest={{
          code: guest.code,
          displayName: guest.displayName,
          status: guest.status,
          companions: guest.companions,
        }}
      />
    );
  } catch {
    return <InviteMessage unavailable />;
  }
}

function InviteMessage({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <main className="gate">
      <section className="gate-card">
        <p className="dash-kicker">Next Frame Short Film Festival 2026</p>
        <h1>{unavailable ? "Invitation unavailable" : "Invitation not found"}</h1>
        <p>
          {unavailable
            ? "We could not open this invitation just now. Please try the link again in a moment."
            : "This link may be incomplete, or the invitation is no longer active."}
        </p>
      </section>
    </main>
  );
}
