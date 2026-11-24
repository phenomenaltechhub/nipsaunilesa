import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { BreadcrumbStructuredData } from "../../components/seo-json-ld";
import { createPageMetadata } from "../../seo";
import StudyTools from "./study-tools";

export const metadata: Metadata = createPageMetadata({
  title: "Study Tools",
  description: "Private, browser-based GPA planning, study timetables, and daily study recommendations for Pharmacology students.",
  path: "/portal/tools",
});

export default function StudyToolsPage() {
  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Student Portal", path: "/portal" },
          { name: "Study Tools", path: "/portal/tools" },
        ]}
      />
      <Header currentPath="/portal" />
      <main className="page-main container academic-tools-page">
        <section className="page-hero academic-tools-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Student academic toolkit</p>
              <h1 className="page-title">Plan your studies with <em>clarity.</em></h1>
              <p className="page-subtitle">
                Use these private, browser-based tools to estimate grades, organise study time,
                and decide what to revise next.
              </p>
              <p className="academic-tools-privacy">
                Your entries stay in this browser on this device. They are not official academic
                records and may be lost if browser storage is cleared.
              </p>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Study tools</span>
              <strong className="big-stat">On-device</strong>
              <p>No student account or backend is required.</p>
              <Link className="portal-inline-link" href="/portal">Back to Student Portal</Link>
            </aside>
          </div>
        </section>
        <StudyTools />
      </main>
      <Footer currentPath="/portal" />
    </div>
  );
}
