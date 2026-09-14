import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Find official guidance, public support paths, and department contact information for NIPSA UNILESA.",
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function ContactPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/contact" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Contact</p>
              <h1 className="page-title">
                Reach out and <em>connect</em>
              </h1>
              <p className="page-subtitle">
                    This page is kept intentionally simple and public. Follow the department notices, student
                    resources, and community pages for general help and official updates.
                  </p>
                  <div className="page-cta-row">
                    <Link className="button primary" href="/portal">
                      Portal overview <Arrow />
                    </Link>
                    <Link className="button secondary" href="/resources">
                      Resource library <Arrow />
                    </Link>
                  </div>
                </div>
                <aside className="page-hero-aside">
                  <span className="mini-label">Help path</span>
                  <strong className="big-stat">Public</strong>
                  <p>
                    Use the department and student resources pages for general guidance until institutional contact details are confirmed.
                  </p>
                </aside>
          </div>
        </section>

        <section className="route-grid">
          <article className="page-card">
            <span className="card-tag">Department</span>
            <h3>General information</h3>
            <p>Use the department overview and public student information pages for official context and current guidance.</p>
            <Link className="card-link" href="/about">
              Visit department info <span>↗</span>
            </Link>
          </article>
          <article className="page-card">
            <span className="card-tag">Resources</span>
            <h3>Student support</h3>
            <p>Start with the public resources and portal pages for study, orientation, and student support materials.</p>
            <Link className="card-link" href="/resources">
              Open resource library <span>↗</span>
            </Link>
          </article>
          <article className="page-card">
            <span className="card-tag">Community</span>
            <h3>Peer guidance</h3>
            <p>For updates, community support, and student connection, use the community and events pages.</p>
            <Link className="card-link" href="/community">
              Explore community <span>↗</span>
            </Link>
          </article>
        </section>
      </main>
      <Footer currentPath="/contact" />
    </div>
  );
}
