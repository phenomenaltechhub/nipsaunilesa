import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { events } from "./data";

export const metadata: Metadata = {
  title: "Events",
  description: "See upcoming student events, community activities, and learning opportunities for NIPSA UNILESA.",
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function EventsPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/events" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Upcoming events</p>
              <h1 className="page-title">
                Make room for <em>new ideas</em>
              </h1>
              <p className="page-subtitle">
                Explore the upcoming events that bring students, leaders, and the wider community
                together for learning, discovery, and support.
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
              <span className="mini-label">This term</span>
              <strong className="big-stat">08</strong>
              <p>
                A growing slate of events designed to spark collaboration, learning, and campus
                community connection.
              </p>
            </aside>
          </div>
        </section>

        <section className="events-grid" style={{ marginTop: "36px" }}>
          {events.map((event) => {
            
            const [day, month] = event.date.split(" ");
            return (
              <Link href={`/events/${event.slug}`} key={event.slug} className="event-card-link" aria-label={`View details for ${event.title}`}>
                <article className={`event-card ${event.tone}`}>
                  <div className="event-date">
                    <strong>{day}</strong>
                    <span>{month}</span>
                  </div>
                  <div>
                    <p className="event-label">{event.category}</p>
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
