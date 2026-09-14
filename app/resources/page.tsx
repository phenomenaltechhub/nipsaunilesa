import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "Resources",
  description: "Explore public study, orientation, and academic support resources for students in the Department of Pharmacology.",
};

const resources = [
  { category: "NIPSAUNILESA Materials", icon: "▤", title: "Study skills guide", text: "Public study-planning and revision support distributed by NIPSAUNILESA for student learning routines.", href: "/resources/study-skills-guide.txt", label: "Download study guide" },
  { category: "Department Materials", icon: "⌁", title: "Orientation checklist", text: "Public onboarding and department-use checklist for new students and early-year planning.", href: "/resources/department-orientation-checklist.txt", label: "Download checklist" },
  { category: "Student-Produced Materials", icon: "✦", title: "Pharmacology handbook", text: "Public student-facing guide covering good practice, values, and participation in the department community.", href: "/resources/Academic Resource Handbook.docx", label: "Download handbook" },
  { category: "External/Open-Licensed Resources", icon: "↗", title: "Open academic support", text: "General academic support guidance is included only when it is public, authorized, and clearly attributed to the original source.", href: "/about", label: "Read guidance" },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function ResourcesPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/resources" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Academic resources</p>
              <h1 className="page-title">
                Find your <em>study flow</em>
              </h1>
              <p className="page-subtitle">
                This library contains public, authorized student materials and department-facing guidance only.
                Third-party copyrighted materials are not redistributed without appropriate authorization.
              </p>
              <div className="page-cta-row">
                <Link className="button primary" href="/portal">
                  Student portal <Arrow />
                </Link>
                <Link className="button secondary" href="/community">
                  Community support <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Resource notes</span>
              <strong className="big-stat">Public</strong>
              <p>
                Distributed by NIPSAUNILESA — Department of Pharmacology, University of Ilesa, where applicable.
              </p>
            </aside>
          </div>
        </section>

        <section className="route-grid">
          {resources.map(({ category, icon, title, text, href, label }) => (
            <article className="page-card" key={title}>
              <span className="card-tag">{category}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <a className="card-link" href={href} download>
                {label} <span>↗</span>
              </a>
            </article>
          ))}
        </section>
      </main>
      <Footer currentPath="/resources" />
    </div>
  );
}
