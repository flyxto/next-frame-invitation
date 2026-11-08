import Image from "next/image";
import Reveal from "./components/Reveal";
import { Art, TunerProvider } from "./components/Tuner";

/** Line break that only applies on wider screens, matching the poster's line wrapping. */
const Br = () => <br className="hidden sm:inline" />;

export default function Home() {
  return (
    <main className="poster-wrap">
      <TunerProvider>
        <div className="poster">
          {/* Decorative artwork (position/scale adjustable via the ⚙ panel) */}
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

          <div className="content">
            <Image
              src="/images/logo.png"
              alt="Next Frame"
              width={408}
              height={397}
              priority
              className="logo-enter mx-auto w-[17cqw]"
            />

            <Reveal delay={500}>
              <h1 className="title gold-shimmer">
                NEXT FRAME SHORT FILM
                <br />
                FESTIVAL 2026
              </h1>
            </Reveal>

            <Reveal delay={800}>
              <p className="body">
                The stage is set for “Next Frame Short Film Festival 2026,”
                <Br /> organized by the Film and Television Studies Students’
                Association,
                <Br /> Department of Drama, Cinema and Television,
                <Br /> University of Kelaniya.
              </p>
            </Reveal>

            <Reveal delay={100}>
              <p className="body" style={{ marginTop: "3cqw" }}>
                We warmly invite you,
              </p>
            </Reveal>

            <div className="rule divider-grow" />

            <Reveal>
              <p className="body">
                to join us as we celebrate 10 years of Film and Television
                Studies and
                <Br /> honor the extraordinary talent of emerging filmmakers.
                <Br /> Please note the date and schedule for the main events.
              </p>
            </Reveal>

            <Reveal>
              <h2 className="event-title">Red Carpet and Award Ceremony</h2>
              <p className="event-detail">
                20th November 2026
                <br />
                2:00 PM Onwards
                <br />
                FCT Auditorium, University of Kelaniya
              </p>
            </Reveal>

            <Reveal>
              <h2 className="event-title">Official Film Screening</h2>
              <p className="event-detail">
                17th November 2026
                <br />
                9:00 AM Onwards
                <br />
                FCT Auditorium, University of Kelaniya
              </p>
            </Reveal>

            <Reveal>
              <p className="body" style={{ marginTop: "4.4cqw" }}>
                If you’re available, we’d love for you to join us on November 17
                for the
                <Br /> official Film Screenings as well!
              </p>
            </Reveal>

            <Reveal>
              <p className="closing">We look forward to welcoming you!</p>
            </Reveal>
          </div>
        </div>
      </TunerProvider>
    </main>
  );
}
