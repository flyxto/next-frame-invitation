import Image from "next/image";
import type { InviteGuest } from "../lib/guest";
import Art from "./Art";
import Fireflies from "./Fireflies";
import GoldReveal from "./GoldReveal";
import LocationPanel from "./LocationPanel";
import Motion from "./Motion";
import Reveal from "./Reveal";
import RsvpPanel from "./RsvpPanel";

/** Line break that only applies on wider screens, matching the poster's line wrapping. */
const Br = () => <br className="hidden sm:inline" />;

export default function Invitation({ guest }: { guest?: InviteGuest | null }) {
  return (
    <main className="poster-wrap">
      <GoldReveal />
      <div className="poster">
        <Fireflies />
        <Motion />
        <Art
          id="outer"
          src="/images/top-left-outer-arc.png"
          width={1398}
          height={1090}
          className="arc-tl"
        />
        <Art
          id="inner"
          src="/images/top-left-inner-arc.png"
          width={831}
          height={648}
          className="arc-tl-inner"
        />
        <Art
          id="bottomLeft"
          src="/images/bottom-left-arc.png"
          width={648}
          height={832}
          className="arc-bl"
        />
        <Art id="lines" className="lines-br" />

        <div className="content-col">
          <div className="content">
            <div className="logo-wrap mx-auto w-[17cqw]">
              <div className="logo-glow" aria-hidden />
              <Image
                src="/images/logo.png"
                alt="Next Frame"
                width={408}
                height={397}
                priority
                className="logo-enter relative w-full"
              />
            </div>

            <Reveal delay={80}>
              <h1 className="title gold-shimmer">
                NEXT FRAME SHORT FILM
                <br />
                FESTIVAL 2026
              </h1>
            </Reveal>

            <Reveal delay={220}>
              <p className="body">
                The stage is set for “Next Frame Short Film Festival 2026,”
                <Br /> organized by the Film and Television Studies Students’
                Association,
                <Br /> Department of Drama, Cinema and Television,
                <Br /> University of Kelaniya.
              </p>
            </Reveal>

            <Reveal delay={360}>
              <p className="body">We warmly invite you,</p>
            </Reveal>

            {guest ? (
              <Reveal delay={430}>
                <p className="guest-name" translate="no">
                  {guest.displayName}
                </p>
              </Reveal>
            ) : null}

            <div className="rule divider-grow" />

            <Reveal delay={500}>
              <p className="body">
                to join us as we celebrate 10 years of Film and Television
                Studies and
                <Br /> honor the extraordinary talent of emerging filmmakers.
                <Br /> It would be our honor to welcome you on the following dates
              </p>
            </Reveal>

            <Reveal delay={660}>
              <h2 className="event-title">Official Film Screening</h2>
              <p className="event-detail">
                17th November 2026
                <br />
                9:00 AM Onwards
                <br />
                FCT Auditorium, University of Kelaniya
              </p>
            </Reveal>

            <Reveal delay={820}>
              <h2 className="event-title">Red Carpet and Award Ceremony</h2>
              <p className="event-detail">
                20th November 2026
                <br />
                2:00 PM Onwards
                <br />
                FCT Auditorium, University of Kelaniya
              </p>
            </Reveal>

            <Reveal delay={980}>
              <p className="body" style={{ marginTop: "4.4cqw" }}>
                Your esteemed presence would be greatly valued at both occasions
              </p>
            </Reveal>

            <Reveal delay={1120}>
              <p className="closing">We look forward to welcoming you!</p>
            </Reveal>
          </div>
        </div>
      </div>
      <div className="fab-bar">
        {guest ? <RsvpPanel guest={guest} /> : null}
        <LocationPanel />
      </div>
      <footer className="credit footer-credit">
        <span>POWERED BY</span>
        <a href="https://www.flyxto.com" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/flyxto-logo.png" alt="Flyxto" width={581} height={212} />
        </a>
      </footer>
    </main>
  );
}
