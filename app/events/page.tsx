import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import { events, getEventTemporalStatus } from "./data";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata({
  title: "Events",
  description: "Explore student events, community activities, and learning opportunities for NIPSA UNILESA.",
  path: "/events",
});

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function EventsPage() {
  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Events", path: "/events" }]} />
      <Header currentPath="/events" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Student events</p>
              <h1 className="page-title">
                NIPSA <em>student events</em>
              </h1>
              <p className="page-subtitle">
                Browse Pharmacology student activities and wider NIPSA events. Dates and chapter
                logistics are listed below and updated as details are confirmed.
              </p>
              <div className="page-cta-row">
                <Link className="button primary" href="/community">
                  Join a session <Arrow />
                </Link>
                <Link className="button secondary" href="/contact">
                  Ask a question <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <p>
                Official event dates are listed below, with further logistics added as they are
                confirmed.
              </p>
            </aside>
          </div>
        </section>

        <section className="events-grid" style={{ marginTop: "36px" }}>
          {events.map((event) => {
            const parts = event.date.split(" ");
            const day = parts[0] ?? event.date;
            const month = parts[1] ?? "";
            const temporalStatus = getEventTemporalStatus(event);
            return (
              <Link href={`/events/${event.slug}`} key={event.slug} className="event-card-link" aria-label={`View details for ${event.title}`}>
                <article className={`event-card ${event.tone}`}>
                  <div className="event-date">
                    <strong>{day}</strong>
                    <span>{month}</span>
                  </div>
                  <div>
                    <p className="event-label">{event.category} · {temporalStatus}</p>
                    <h3>{event.title}</h3>
                    <p>{event.summary}</p>
                    <span className="card-link">
                      View event details <span>↗</span>
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </section>
      </main>
      <Footer currentPath="/events" />
    </div>
  );
}
