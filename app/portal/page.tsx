import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "Student Portal",
  description: "Public access to NIPSA UNILESA student notices, resources, and community pages.",
};

const portalItems = [
  {
    title: "Academic updates",
    description: "Public department notices, student reminders, and support information published for the campus community.",
    href: "/about",
    label: "View updates",
  },
  {
    title: "Student resources",
    description: "Download public planning, study, and orientation materials that are intentionally non-confidential.",
    href: "/resources",
    label: "Open library",
  },
  {
    title: "Upcoming events",
    description: "Keep up with student-facing activities, discussions, and academic opportunities across the term.",
    href: "/events",
    label: "See events",
  },
  {
    title: "Community and leadership",
    description: "Learn more about peer support, leadership, and how NIPSAUNILESA supports the student community.",
    href: "/community",
    label: "Explore community",
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function PortalPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/portal" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Student portal</p>
              <h1 className="page-title">
                Public student <em>access</em>
              </h1>
              <p className="page-subtitle">
                This is a public student resource portal for notices, academic support, community updates,
                and shared learning materials. It does not collect, store, or expose confidential student
                information.
              </p>
              <div className="page-cta-row">
                <Link className="button primary" href="/resources">
                  Open resources <Arrow />
                </Link>
                <Link className="button secondary" href="/contact">
                  Contact and help <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Portal status</span>
              <strong className="big-stat">Public</strong>
              <p>
                Public information only. No accounts, personal student records, or confidential academic data are stored here.
              </p>
            </aside>
          </div>
        </section>

        <section className="route-grid">
          {portalItems.map((item) => (
            <article className="page-card" key={item.title}>
              <span className="card-tag">Portal</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link className="card-link" href={item.href}>
                {item.label} <span>↗</span>
              </Link>
            </article>
          ))}
        </section>
      </main>
      <Footer currentPath="/portal" />
    </div>
  );
}
