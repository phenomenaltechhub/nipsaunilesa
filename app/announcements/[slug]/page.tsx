import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { BreadcrumbStructuredData } from "../../components/seo-json-ld";
import SharePageButton from "../../components/share-page-button";
import { announcements, getAnnouncementBySlug } from "../data";
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
  });
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = getAnnouncementBySlug(slug);

  if (!announcement) {
    notFound();
  }

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
                <SharePageButton
                  title={announcement.title}
                  text={announcement.summary}
                  url={absoluteSiteUrl(`/announcements/${announcement.slug}`)}
                />
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Published</span>
              <strong className="big-stat">{announcement.date}</strong>
              <p>{announcement.category}</p>
            </aside>
          </div>
        </section>

        <section className="route-grid" style={{ marginTop: "36px" }}>
          <article className="page-card">
            <span className="card-tag">Announcement details</span>
            <h2 className="announcement-detail-title">{announcement.title}</h2>
            <p>{announcement.description}</p>
            {announcement.slug === "welcome-to-the-new-nipsa-student-resource-hub" && (
              <p>
                Browse the available <Link href="/resources">academic and student resources</Link>.
              </p>
            )}
            {announcement.slug === "departmental-orientation" && (
              <p>
                Use the <Link href="/resources">student orientation checklist</Link> for available
                onboarding guidance.
              </p>
            )}
            {announcement.slug === "meet-your-student-community" && (
              <p>
                Explore the wider <Link href="/community">NIPSA student community</Link> for
                study circles, mentorship, and campus updates.
              </p>
            )}
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
            <p>{announcement.date}</p>
          </article>

          <article className="page-card" style={{ gridColumn: "1 / -1" }}>
            <span className="card-tag">Notes</span>
            <h2 className="announcement-detail-title">Additional information</h2>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.7rem", color: "#355a4c" }}>
              {announcement.additionalInfo?.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        </section>
      </main>

      <Footer currentPath="/announcements" />
    </div>
  );
}