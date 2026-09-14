import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "Community",
  description: "Explore the student community, study groups, and peer support opportunities within NIPSA UNILESA.",
};

const groups = [
  { title: "Study circles", body: "Peer-led spaces to revise together, exchange notes, and build confidence before assessments." },
  { title: "Mentorship", body: "Guidance for students seeking advice, encouragement, and ideas on how to navigate campus life." },
  { title: "Campus updates", body: "A shared channel for announcements, events and the practical community information students need." },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function CommunityPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/community" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Study groups & community</p>
              <h1 className="page-title">
                Your people are <em>here</em>
              </h1>
              <p className="page-subtitle">
                Learning does not have to happen alone. NIPSA supports a welcoming student culture
                where peers, mentors, and friends can learn and grow together.
              </p>
              <div className="page-cta-row">
                <Link className="button primary" href="/events">
                  Join an event <Arrow />
                </Link>
                <Link className="button secondary" href="/resources">
                  Access resources <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Community focus</span>
              <strong className="big-stat">500+</strong>
              <p>
                Study groups, peer support, and everyday encouragement strengthen the student journey.
              </p>
            </aside>
          </div>
        </section>

        <section className="route-grid">
          {groups.map((group) => (
            <article className="page-card" key={group.title}>
              <span className="card-tag">Community</span>
              <h3>{group.title}</h3>
              <p>{group.body}</p>
              <Link className="card-link" href="/events">
                Review upcoming activities <span>↗</span>
              </Link>
            </article>
          ))}
        </section>
      </main>
      <Footer currentPath="/community" />
    </div>
  );
}
