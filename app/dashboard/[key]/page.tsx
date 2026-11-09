import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { logoutDashboard } from "../../actions";
import { CreateGuestForm, GuestList, LoginForm } from "../ui";
import { dashboardKeyMatches, dashboardPassword, isDashboardAuthed } from "../../lib/dashboard-auth";
import { peopleCount, type GuestView } from "../../lib/guest";
import { listGuests } from "../../lib/guests";
import { databaseErrorMessage } from "../../lib/mongodb";

export const metadata: Metadata = {
  title: "Guest book | Next Frame Short Film Festival 2026",
  robots: { index: false, follow: false },
};

export default function DashboardPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  return (
    <Suspense fallback={<p className="pending-note">Please wait…</p>}>
      <DashboardGate params={params} />
    </Suspense>
  );
}

async function DashboardGate({ params }: { params: Promise<{ key: string }> }) {
  await connection();
  const { key } = await params;
  if (!dashboardKeyMatches(key)) notFound();

  if (!dashboardPassword() || !process.env.MONGODB_URI) {
    return <SetupNotice />;
  }
  if (!(await isDashboardAuthed())) return <LoginForm />;

  let guests: GuestView[] = [];
  let error: string | null = null;
  try {
    guests = await listGuests();
  } catch (caught) {
    error = databaseErrorMessage(caught);
  }

  const attending = guests.filter((guest) => guest.status === "yes");
  const people = attending.reduce(
    (sum, guest) => sum + peopleCount(guest.status, guest.companions),
    0,
  );

  return (
    <main className="dash">
      <div className="dash-shell">
        <header className="dash-top">
          <div>
            <p className="dash-kicker">Next Frame Short Film Festival 2026</p>
            <h1>Guest book</h1>
            <p>Red Carpet and Award Ceremony · 20 November 2026</p>
          </div>
          <form action={logoutDashboard}>
            <button type="submit" className="ghost-btn">
              Log out
            </button>
          </form>
        </header>

        <section className="stat-grid" aria-label="Reply totals">
          <Stat label="Invitations" value={guests.length} />
          <Stat label="Attending" value={attending.length} />
          <Stat
            label="Declined"
            value={guests.filter((guest) => guest.status === "no").length}
          />
          <Stat
            label="Waiting"
            value={guests.filter((guest) => guest.status === "pending").length}
          />
          <Stat label="People coming" value={people} emphasis />
        </section>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <CreateGuestForm />
        {error ? null : <GuestList guests={guests} />}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <article className={emphasis ? "stat stat-people" : "stat"}>
      <b>{value}</b>
      <span>{label}</span>
    </article>
  );
}

function SetupNotice() {
  return (
    <main className="gate">
      <section className="gate-card">
        <p className="dash-kicker">Next Frame Short Film Festival 2026</p>
        <h1>Guest book</h1>
        <p>
          Add this to <code>.env.local</code> in the project folder, then restart{" "}
          <code>npm run dev</code>.
        </p>
        <pre>{`MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=nextframe
DASHBOARD_PASSWORD=choose-a-password
DASHBOARD_KEY=choose-a-secret-path`}</pre>
      </section>
    </main>
  );
}
