import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "Executives",
  description: "Meet the current members of the Central Executives Council of NIPSA UNILESA chapter.",
};

type Executive = {
  initials: string;
  name: string;
  role: string;
  tone: string;
  image?: string;
};

const leadership: Executive[] = [
  { initials: "OM", name: "ONIFADE MICHAEL", role: "President", tone: "mint" },
  { initials: "JS", name: "JOHN-EDWARD SEED'IVINE", role: "Vice President", tone: "teal", image: "/Vive President.jpg" },
  { initials: "EJ", name: "UDOM EDIDIONG JOHN", role: "General Secretary", tone: "cyan" },
  { initials: "E", name: "EMMANUEL", role: "Assistant General Secretary", tone: "lime" },
  { initials: "AP", name: "AJAYI PRECIOUS OLUWABUSOLA", role: "Financial Secretary", tone: "mint" },
  { initials: "OR", name: "OLORUNTOLA OLUWANIFEMI ROONEY", role: "Public Relations Officer", tone: "teal", image: "/Public Relations Officer.jpg" },
  { initials: "IV", name: "IDOWU VICTORIA OPEYEMI", role: "Social Director", tone: "cyan" },
  { initials: "OM", name: "OLAMIDE", role: "Sports Director", tone: "cyan" },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function ExecutivesPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/executives" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Leadership</p>
              <h1 className="page-title">
                The people behind <em>the momentum</em>
              </h1>
              <p className="page-subtitle">
                Meet the executives supporting engagement, advocacy, and community
                support within NIPSA UNILESA chapter.
              </p>
              <div className="page-cta-row">
                <Link className="button primary" href="/contact">
                  Contact the team <Arrow />
                </Link>
                <Link className="button secondary" href="/community">
                  Explore the community <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Executive focus</span>
              <strong className="big-stat">GOAL</strong>
              <p>
                Student leadership, communication, and collaboration remain at the center of the
                NIPSA experience.
              </p>
            </aside>
          </div>
        </section>

        <section className="people-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", marginTop: "36px" }}>
          {leadership.map((person) => (
            <article className={`person-card ${person.tone}`} key={person.role}>
              {person.image ? (
                <img className="person-photo" src={person.image} alt={`${person.name}, ${person.role}`} />
              ) : (
                <div className="placeholder-photo" aria-hidden="true">
                  <span>{person.initials}</span>
                  <b>✦</b>
                </div>
              )}
              <div className="person-info">
                <h3>{person.name}</h3>
                <p>{person.role}</p>
                <Link href="/contact" aria-label={`Contact the office about ${person.name}`}>
                  Contact office <Arrow />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer currentPath="/executives" />
    </div>
  );
}
