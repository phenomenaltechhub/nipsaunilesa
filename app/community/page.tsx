import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata({
  title: "Community",
  description: "Explore the student community, study groups, and peer support opportunities within NIPSA UNILESA.",
  path: "/community",
});

const communityAreas = [
  {
    title: "Study circles",
    description: "You can arrange informal study sessions with classmates to compare notes, work through difficult topics and keep revision on track.",
    action: "Browse study resources",
    href: "/resources",
  },
  {
    title: "Mentorship",
    description: "An experienced student can offer perspective on study routines, research interests and career choices. Contact NIPSA for guidance on where to seek advice.",
    action: "Contact NIPSA",
    href: "/contact",
  },
  {
    title: "Campus updates",
    description: "Check chapter announcements for departmental events, deadlines and changes. The NIPSA Telegram Notice Board carries public notices. Class groups are arranged separately.",
    action: "View announcements",
    href: "/announcements",
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function CommunityPage() {
  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Community", path: "/community" }]} />
      <Header currentPath="/community" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Study groups & community</p>
              <h1 className="page-title">
                A community for <em>Pharmacology students</em>
              </h1>
              <p className="page-subtitle">
                Find ideas for studying with peers, contacts for advice and updates from the chapter.
              </p>
              <div className="page-cta-row">
                <Link className="button primary" href="/events">
                  Browse events <Arrow />
                </Link>
                <Link className="button secondary" href="/resources">
                  Access resources <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Community focus</span>
              <strong className="big-stat community-summary-stat">Peer learning</strong>
              <p>
                Start with a classmate for informal revision or contact NIPSA for help finding support.
              </p>
            </aside>
          </div>
        </section>

        <section className="community-panel-grid" aria-label="Peer support and chapter updates">
          {communityAreas.map((group) => (
            <article className="community-panel" key={group.title}>
              <h2>{group.title}</h2>
              <p>{group.description}</p>
              <div className="community-panel-actions">
                <Link className="community-panel-link" href={group.href}>{group.action} <Arrow /></Link>
                {group.href === "/announcements" && (
                  <a className="community-panel-link" href="https://t.me/+FYZPQBrwE_U3N2Rk" target="_blank" rel="noopener noreferrer">
                    Open NIPSA Telegram Notice Board <Arrow />
                  </a>
                )}
              </div>
              {group.href === "/announcements" && (
                <p className="community-panel-support">
                  Trouble joining the notice board? Email{" "}
                  <a className="community-panel-support-link" href="mailto:admin@nipsaunilesa.com.ng">admin@nipsaunilesa.com.ng</a>.
                </p>
              )}
            </article>
          ))}
        </section>
      </main>
      <Footer currentPath="/community" />
    </div>
  );
}
