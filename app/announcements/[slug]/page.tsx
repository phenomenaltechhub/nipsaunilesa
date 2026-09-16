import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { announcements, getAnnouncementBySlug } from "../data";

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

  return {
    title: announcement.title,
    description: announcement.summary,
    openGraph: {
      title: announcement.title,
      description: announcement.summary,
      type: "article",
    },
  };
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const announcement = getAnnouncementBySlug(slug);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="nipsa-site page-shell">
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
            <h3>{announcement.title}</h3>
            <p>{announcement.description}</p>
          </article>

          <article className="page-card">
            <span className="card-tag">Date</span>
            <h3>Published</h3>
            <p>{announcement.date}</p>
          </article>

          <article className="page-card" style={{ gridColumn: "1 / -1" }}>
            <span className="card-tag">Notes</span>
            <h3>Additional information</h3>
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