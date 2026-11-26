import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { BreadcrumbStructuredData } from "../../components/seo-json-ld";
import SharePageButton from "../../components/share-page-button";
import { announcements, formatPublishedDate, getAnnouncementBySlug } from "../data";
import { absoluteSiteUrl, createPageMetadata } from "../../seo";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export async function generateStaticParams() {
  return announcements.map((announcement) => ({ slug: announcement.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const announcement = getAnnouncementBySlug(slug);

  if (!announcement) {
    return {
      title: "Announcement not found",
      description: "The requested announcement could not be found.",
    };
  }

  return createPageMetadata({
    title: announcement.title,
    description: announcement.summary,
    path: `/announcements/${announcement.slug}`,
    type: "article",
    publishedTime: new Date(`${announcement.publishedAt}T00:00:00.000Z`).toISOString(),
  });
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = getAnnouncementBySlug(slug);

  if (!announcement) {
    notFound();
  }

  const hasEventDetails = Boolean(announcement.eventDate);

  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Announcements", path: "/announcements" },
          {
            name: announcement.title,
            path: `/announcements/${announcement.slug}`,
          },
        ]}
      />
      <Header currentPath="/announcements" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">{announcement.category}</p>
              <h1 className="page-title">{announcement.title}</h1>
              <p className="page-subtitle">{announcement.summary}</p>
              <div className="page-cta-row">
                <Link className="button primary" href="/announcements">
                  Back to announcements <Arrow />
                </Link>
                {hasEventDetails && (
                  <Link className="button secondary" href="/resources#orientation-checklist">
                    Orientation checklist <Arrow />
                  </Link>
                )}
                <SharePageButton
                  url={absoluteSiteUrl(`/announcements/${announcement.slug}`)}
                />
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Published</span>
              <time className="big-stat" dateTime={announcement.publishedAt}>
                {formatPublishedDate(announcement.publishedAt)}
              </time>
              <p>{announcement.category}</p>
            </aside>
          </div>
        </section>

        {hasEventDetails ? (
          <div className="orientation-content">
            <section className="orientation-details" aria-labelledby="orientation-details-title">
              <div className="orientation-section-heading">
                <p className="page-kicker">Event information</p>
                <h2 id="orientation-details-title">Orientation details</h2>
                <p>These arrangements will be updated when confirmed by the department.</p>
              </div>
              <dl className="orientation-detail-grid">
                <div><dt>Programme</dt><dd>{announcement.programme}</dd></div>
                <div><dt>Department</dt><dd>{announcement.department}</dd></div>
                <div><dt>Institution</dt><dd>{announcement.institution}</dd></div>
                <div><dt>Date</dt><dd>{announcement.eventDate}</dd></div>
                <div><dt>Time</dt><dd>{announcement.eventTime}</dd></div>
                <div><dt>Venue</dt><dd>{announcement.venue}</dd></div>
                <div className="orientation-detail-status"><dt>Status</dt><dd>{announcement.eventStatus}</dd></div>
              </dl>
            </section>

            <section className="orientation-copy-grid" aria-label="Orientation guidance">
              <article className="orientation-copy-card">
                <p className="orientation-section-label">About the orientation</p>
                <h2>Start your department journey informed</h2>
                <p>
                  Departmental orientation helps incoming students become familiar with their academic
                  environment, understand departmental expectations, discover available student
                  resources, and prepare for their studies. Specific programme activities will be
                  shared only after they are officially confirmed.
                </p>
              </article>
              <article className="orientation-copy-card orientation-preparation">
                <p className="orientation-section-label">Preparing for orientation</p>
                <h2>A few useful steps</h2>
                <ul>
                  <li>Review the existing student Orientation Checklist.</li>
                  <li>Explore available academic and departmental resources.</li>
                  <li>Follow official announcements for confirmed arrangements.</li>
                  <li>Prepare questions about academic expectations and student support.</li>
                </ul>
              </article>
            </section>

            <section className="orientation-resource-card" aria-labelledby="orientation-resource-title">
              <div>
                <p className="orientation-section-label">Orientation resources</p>
                <h2 id="orientation-resource-title">Get ready with the checklist</h2>
                <p>
                  Use the existing student checklist to explore practical guidance as you prepare
                  for your transition into the department.
                </p>
              </div>
              <div className="orientation-resource-actions">
                <Link className="button primary" href="/resources#orientation-checklist">
                  View orientation checklist <Arrow />
                </Link>
                <Link className="button secondary" href="/resources/department-orientation-checklist.pdf">
                  Open checklist PDF <Arrow />
                </Link>
              </div>
            </section>

            <section className="orientation-updates" aria-labelledby="orientation-updates-title">
              <div>
                <p className="orientation-section-label">Updates and enquiries</p>
                <h2 id="orientation-updates-title">Watch for official confirmation</h2>
                <p>
                  Confirmed date, time, and venue arrangements will be communicated through official
                  departmental channels. Please rely on official announcements for updates.
                </p>
              </div>
              {announcement.enquiries && (
                <p className="announcement-enquiries">
                  General enquiries:{" "}
                  <a href={`mailto:${announcement.enquiries.email}`}>{announcement.enquiries.email}</a>
                </p>
              )}
            </section>
          </div>
        ) : (
          <section className="route-grid" style={{ marginTop: "36px" }}>
            <article className="page-card">
              <span className="card-tag">Announcement details</span>
              <h2 className="announcement-detail-title">{announcement.title}</h2>
              <p>{announcement.description}</p>
              {announcement.contentSections?.map((section) => (
                <section className="announcement-content-section" key={section.heading}>
                  <h3>{section.heading}</h3>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.listItems && (
                    <ul>
                      {section.listItems.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </section>
              ))}
              {announcement.relatedLinks?.length ? (
                <nav className="announcement-related-links" aria-label="Related resources">
                  {announcement.relatedLinks.map((item) => {
                    const isExternal = /^(https?:|mailto:)/.test(item.href);
                    return isExternal ? (
                      <a key={item.href} href={item.href}>{item.label} <Arrow /></a>
                    ) : (
                      <Link key={item.href} href={item.href}>{item.label} <Arrow /></Link>
                    );
                  })}
                </nav>
              ) : null}
              {announcement.enquiries && (
                <p className="announcement-enquiries">
                  <strong>Enquiries:</strong>{" "}
                  <a href={`mailto:${announcement.enquiries.email}`}>{announcement.enquiries.email}</a>{" "}
                  ({announcement.enquiries.purpose}).
                </p>
              )}
            </article>

            <article className="page-card">
              <span className="card-tag">Date</span>
              <h2 className="announcement-detail-title">Published</h2>
              <p>{formatPublishedDate(announcement.publishedAt)}</p>
            </article>

            <article className="page-card" style={{ gridColumn: "1 / -1" }}>
              <span className="card-tag">Notes</span>
              <h2 className="announcement-detail-title">Additional information</h2>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.7rem", color: "#355a4c" }}>
                {announcement.additionalInfo?.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </section>
        )}
      </main>

      <Footer currentPath="/announcements" />
    </div>
  );
}
