import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { events, getEventBySlug } from "../data";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export async function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const event = getEventBySlug(params.slug);

  if (!event) {
    return {
      title: "Event not found",
      description: "The requested event could not be found.",
    };
  }

  return {
    title: event.title,
    description: event.summary,
    openGraph: {
      title: event.title,
      description: event.summary,
      type: "article",
    },
  };
}

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/events" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">{event.category}</p>
              <h1 className="page-title">
                {event.title}
              </h1>
              <p className="page-subtitle">{event.summary}</p>
              <div className="page-cta-row">
                <Link className="button primary" href="/events">
                  Back to events <Arrow />
                </Link>
                <Link className="button secondary" href="/contact">
                  Ask a question <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Status</span>
              <strong className="big-stat">{event.status ?? "Public"}</strong>
              <p>{event.summary}</p>
            </aside>
          </div>
        </section>

        <section className="route-grid" style={{ marginTop: "36px" }}>
          <article className="page-card">
            <span className="card-tag">Event details</span>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
          </article>

          <article className="page-card">
            <span className="card-tag">Schedule</span>
            <h3>Date & time</h3>
            <p>
              <strong>Date:</strong> {event.date}
              <br />
              <strong>Time:</strong> {event.time ?? "Time to be confirmed"}
              <br />
              <strong>Venue:</strong> {event.venue ?? "Venue to be confirmed"}
            </p>
          </article>

          {event.image ? (
            <article className="page-card" style={{ gridColumn: "1 / -1" }}>
              <span className="card-tag">Image</span>
              <img src={event.image} alt={event.title} style={{ width: "100%", borderRadius: "12px", maxHeight: "360px", objectFit: "cover" }} />
            </article>
          ) : null}

          <article className="page-card" style={{ gridColumn: "1 / -1" }}>
            <span className="card-tag">Notes</span>
            <h3>Additional information</h3>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.7rem", color: "#355a4c" }}>
              {event.additionalInfo?.length ? (
                event.additionalInfo.map((item) => <li key={item}>{item}</li>)
              ) : (
                <li>Details for this event will be added as soon as official information is confirmed.</li>
              )}
            </ul>
          </article>
        </section>
      </main>

      <Footer currentPath="/events" />
    </div>
  );
}
