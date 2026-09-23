import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { events, getEventBySlug, getEventTemporalStatus } from "../data";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export async function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);

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

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const temporalStatus = getEventTemporalStatus(event);

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
              <span className="mini-label">Event status</span>
              <strong className="big-stat">{temporalStatus}</strong>
              <p>{event.status ?? "Details to be confirmed"}</p>
            </aside>
          </div>
        </section>

        <section className="event-feature" aria-labelledby={`${event.slug}-feature-title`}>
          <div className="event-feature-article">
            <div className="event-feature-intro">
              <p className="eyebrow">Event details</p>
              <h2 id={`${event.slug}-feature-title`}>{event.title}</h2>
              <p>{event.description}</p>
            </div>

            <div className="event-feature-meta" aria-label={`${event.title} details`}>
              {event.details?.length ? (
                <dl className="event-detail-meta">
                  {event.details.map((detail) => (
                    <div key={detail.label}>
                      <dt>{detail.label}</dt>
                      <dd>{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <dl className="event-detail-meta">
                  <div><dt>Date</dt><dd>{event.date}</dd></div>
                  <div><dt>Time</dt><dd>{event.time ?? "Time to be confirmed"}</dd></div>
                  <div><dt>Venue</dt><dd>{event.venue ?? "Venue to be confirmed"}</dd></div>
                  <div><dt>Status</dt><dd>{event.status ?? "Details to be confirmed"}</dd></div>
                </dl>
              )}
            </div>

            {event.image ? (
              <div className="event-feature-image-wrap">
                <img src={event.image} alt={event.title} className="event-feature-image" />
              </div>
            ) : null}

            {event.sections?.map((section) => (
              <section key={section.heading} className="event-feature-section">
                <p className="event-feature-label">{section.heading}</p>
                <h3>{section.heading}</h3>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.list ? (
                  <ul className="event-detail-list event-detail-bullets">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {event.links?.length ? (
              <section className="event-feature-section">
                <p className="event-feature-label">Official links</p>
                <h3>Relevant official references</h3>
                <ul className="event-detail-list event-detail-bullets">
                  {event.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="event-feature-section event-feature-notes">
              <p className="event-feature-label">Additional notes</p>
              <h3>Additional information</h3>
              <ul className="event-detail-list event-detail-bullets">
                {event.additionalInfo?.length ? (
                  event.additionalInfo.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>Details for this event will be added as soon as official information is confirmed.</li>
                )}
              </ul>
            </section>
          </div>
        </section>
      </main>

      <Footer currentPath="/events" />
    </div>
  );
}
