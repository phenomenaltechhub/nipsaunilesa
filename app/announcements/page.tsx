import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { announcements } from "./data";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Departmental updates, academic notes, and community announcements from NIPSA UNILESA.",
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function AnnouncementsPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/announcements" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">NIPSA updates</p>
              <h1 className="page-title">
                Keep up with <em>what matters</em>
              </h1>
              <p className="page-subtitle">
                Explore departmental notes, academic updates, and community announcements shared
                with the NIPSA UNILESA community.
              </p>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">August 2026 archive</span>
              <strong className="big-stat">{String(announcements.length).padStart(2, "0")}</strong>
              <p>These dated announcements remain available for reference while newer information is confirmed.</p>
            </aside>
          </div>
        </section>

        <section className="announcement-track" style={{ marginTop: "36px" }} aria-label="Archived announcements">
          <div className="announcement-track-scroller">
            {announcements.map((announcement) => (
              <Link
                href={`/announcements/${announcement.slug}`}
                key={announcement.slug}
                className="announcement-card-link announcement-slide"
                aria-label={`Read ${announcement.title}`}
              >
                <article className={`announcement-card ${announcement.tone}`}>
                  <div className="card-meta">
                    <span>{announcement.category}</span>
                    <time>{announcement.date}</time>
                  </div>
                  <h2 className="announcement-card-title">{announcement.title}</h2>
                  <p>{announcement.summary}</p>
                  <span className="card-link">Read announcement <Arrow /></span>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer currentPath="/announcements" />
    </div>
  );
}