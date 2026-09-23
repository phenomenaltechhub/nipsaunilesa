import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "Resources",
  description: "Academic resources and student support materials for Pharmacology students in the Department of Pharmacology.",
};

type Resource = {
  title: string;
  description: string;
  category: string;
  type: "Download" | "Guide" | "Checklist" | "Collection";
  href: string;
  actionLabel: string;
  audience?: string;
  format?: string;
};

const resources: Resource[] = [
  {
    title: "Study skills guide",
    description: "Practical study-planning and revision support for students looking to strengthen their academic routines and learning habits.",
    category: "Academic and study support",
    type: "Download",
    href: "/resources/study-skills-guide.txt",
    actionLabel: "Download study guide",
    audience: "Students",
    format: "TXT",
  },
  {
    title: "Orientation checklist",
    description: "An introductory checklist for new students covering key onboarding steps and department-facing guidance for early-year preparation.",
    category: "Departmental and onboarding materials",
    type: "Checklist",
    href: "/resources/department-orientation-checklist.txt",
    actionLabel: "Download orientation checklist",
    audience: "New students",
    format: "TXT",
  },
  {
    title: "Pharmacology handbook",
    description: "A student-facing academic guide covering department expectations, good practice, and relevant support information for Pharmacology students.",
    category: "Student-facing academic guides",
    type: "Guide",
    href: "/resources/Academic Resource Handbook.docx",
    actionLabel: "Download handbook",
    audience: "Students",
    format: "DOCX",
  },
  {
    title: "NIPSA UNILESA Resource Drive",
    description: "Access the central collection of NIPSA UNILESA academic and student-support materials, including study guidance, departmental resources, onboarding materials, and pharmacology-related student resources.",
    category: "Central collection",
    type: "Collection",
    href: "https://drive.google.com/drive/folders/1_ua5JRtKSouhX8b6ifkDlJx9D0Y_pwT9?usp=sharing",
    actionLabel: "Access Resource Drive",
    audience: "Students",
    format: "Collection",
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function ResourcesPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/resources" />

      <main className="page-main container">
        <section className="resource-intro page-hero" aria-labelledby="resources-page-title">
          <div className="page-hero-grid resource-intro-grid">
            <div>
              <p className="page-kicker">Academic resources</p>
              <h1 id="resources-page-title" className="page-title">
                Student <em>resources</em>
              </h1>
              <p className="page-subtitle">
                A central library of public academic, study, and department materials for Pharmacology students at the University of Ilesa.
                These resources support learning, onboarding, and student engagement within the Department of Pharmacology.
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
              <span className="mini-label">Resource scope</span>
              <strong className="big-stat">Public</strong>
              <p>
                Shared student-facing materials and department guidance for academic support and orientation.
              </p>
            </aside>
          </div>
        </section>

        <section className="resource-collection" aria-labelledby="resource-library-title">
          <div className="resource-library-header">
            <p className="eyebrow">Resource library</p>
            <h2 id="resource-library-title">Academic support and student guides</h2>
          </div>

          <div className="resource-grid" role="list" aria-label="Academic resources">
            {resources.map(({ category, title, description, href, actionLabel, audience, format, type }) => {
              const isDriveCollection = title === "NIPSA UNILESA Resource Drive";
              const actionClassName = isDriveCollection ? "resource-action resource-drive-action" : "resource-action";
              const cardClassName = isDriveCollection ? "resource-card resource-drive-card" : "resource-card";

              return (
                <article className={cardClassName} key={title} role="listitem" id={isDriveCollection ? "resource-drive" : undefined}>
                  <header className="resource-card-header">
                    <span className="resource-type">{type}</span>
                    <span className="resource-category">{category}</span>
                  </header>

                  <div className="resource-card-body">
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>

                  <div className="resource-card-meta" aria-label={`${title} metadata`}>
                    {audience ? <span>{audience}</span> : null}
                    {format ? <span>{format}</span> : null}
                  </div>

                  {href.startsWith("/resources/") ? (
                    <a className={actionClassName} href={href} download aria-label={actionLabel}>
                      {actionLabel}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : href.startsWith("http") ? (
                    <a className={actionClassName} href={href} target="_blank" rel="noopener noreferrer" aria-label={actionLabel}>
                      {actionLabel}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <Link className={actionClassName} href={href} aria-label={actionLabel}>
                      {actionLabel}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <Footer currentPath="/resources" />
    </div>
  );
}
