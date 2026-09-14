import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "About NIPSA",
  description: "Learn about NIPSA UNILESA and the student-facing community for the Department of Pharmacology.",
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function AboutPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/about" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">About NIPSA</p>
              <h1 className="page-title">
                A community for <em>curious minds</em>
              </h1>
              <p className="page-subtitle">
                NIPSAUNILESA is presented here as a student-facing platform for shared learning,
                mentorship, and community engagement within the Department of Pharmacology.
              </p>
              <div className="page-cta-row">
                <Link className="button primary" href="/community">
                  Join the community <Arrow />
                </Link>
                <Link className="button secondary" href="/executives">
                  Meet the team <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">NIPSA value</span>
              <strong className="big-stat">01</strong>
              <p>
                We are building a supportive professional community where learning, leadership, and
                student wellbeing keep moving forward together.
              </p>
            </aside>
          </div>
        </section>

        <section className="route-grid">
          <article className="page-card">
            <span className="card-tag">Proposed focus</span>
            <h3>Student support and learning</h3>
            <p>
              This section presents draft community priorities for student support, academic access,
              and shared learning within the department. It should be treated as proposed wording
              pending institutional approval.
            </p>
            <Link className="card-link" href="/resources">
              Explore resources <span>↗</span>
            </Link>
          </article>
          <article className="page-card">
            <span className="card-tag">Current priorities</span>
            <h3>Shared progress</h3>
            <p>
              The current project framing emphasizes study groups, communication, and leadership
              opportunities as a practical student experience rather than a verified official policy.
            </p>
            <Link className="card-link" href="/events">
              Upcoming events <span>↗</span>
            </Link>
          </article>
          <article className="page-card">
            <span className="card-tag">Proposed direction</span>
            <h3>Healthy future</h3>
            <p>
              This wording reflects a draft aspiration for student development and professional growth.
              It is not presented here as an officially approved institutional vision statement.
            </p>
            <Link className="card-link" href="/contact">
              Get in touch <span>↗</span>
            </Link>
          </article>
        </section>

        <section className="site-footer-card">
          <div className="section-intro">
            <p className="eyebrow">
              <span>02</span> / Who we serve
            </p>
            <h2>
              Students, aspirants and <em>allies</em>
            </h2>
          </div>
          <div className="route-list">
            <div className="route-item">
              <h4>Departments and cohorts</h4>
              <p>Supporting students across academic stages with shared opportunities and updates.</p>
              <Link href="/community">
                Discover community <span>↗</span>
              </Link>
            </div>
            <div className="route-item">
              <h4>Leaders and volunteers</h4>
              <p>Encouraging mentorship, visibility, and active student leadership within NIPSA.</p>
              <Link href="/executives">
                Meet leadership <span>↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer currentPath="/about" />
    </div>
  );
}
