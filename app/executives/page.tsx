import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { executives } from "./data";

export const metadata: Metadata = {
  title: "Executives",
  description: "Meet the current members of the Central Executives Council of NIPSA UNILESA chapter.",
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ExecutivePhoto({ person }: { person: (typeof executives)[number] }) {
  return person.image ? (
    <div className="executive-photo-wrap">
      <img className="executive-photo" src={person.image} alt={`Portrait of ${person.name}, ${person.role}, NIPSA-UNILESA`} />
    </div>
  ) : (
    <div className={`placeholder-photo executive-placeholder ${person.tone}`} aria-label={`Photograph of ${person.name} is to be confirmed`}>
      <span>{person.initials}</span>
      <small>Profile placeholder</small>
      <b aria-hidden="true">✦</b>
    </div>
  );
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

        <section className="executive-list" aria-label="NIPSA executives">
          {executives.map((person) => (
            <article className={`executive-card ${person.tone}`} key={person.slug}>
              <ExecutivePhoto person={person} />
              <div className="executive-card-info">
                <p className="card-tag">{person.role}</p>
                <h2>{person.name}</h2>
                <p className="executive-intro">
                  {person.intro}
                </p>
                {person.email ? <p className="executive-email">{person.email}</p> : null}
                <Link className="button primary" href={`/executives/${person.slug}`} aria-label={`Contact the office about ${person.name}`}>
                  Contact Office <Arrow />
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
