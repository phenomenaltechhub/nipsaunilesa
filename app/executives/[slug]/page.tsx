import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { executives, getExecutiveBySlug, getExecutiveOfficeLabel } from "../data";

export async function generateStaticParams() {
  return executives.map((executive) => ({ slug: executive.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const executive = getExecutiveBySlug(slug);

  if (!executive) {
    return {
      title: "Executive not found",
      description: "The requested executive profile could not be found.",
    };
  }

  return {
    title: `${executive.name} | ${getExecutiveOfficeLabel(executive.role)}`,
    description: executive.intro,
    openGraph: {
      title: `${executive.name} | ${getExecutiveOfficeLabel(executive.role)}`,
      description: executive.intro,
      type: "profile",
    },
  };
}

function ExecutivePhoto({ executive }: { executive: (typeof executives)[number] }) {
  return executive.image ? (
    <span className={`homepage-executive-portrait ${executive.tone}`}>
      <img src={executive.image} alt={`Portrait of ${executive.name}, ${getExecutiveOfficeLabel(executive.role)}, NIPSA-UNILESA`} />
    </span>
  ) : (
    <span className={`homepage-executive-portrait homepage-executive-placeholder ${executive.tone}`} aria-label={`Photograph of ${executive.name} is to be confirmed`}>
      <span aria-hidden="true">{executive.initials}</span>
      <small>Profile placeholder</small>
    </span>
  );
}

export default async function ExecutiveProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const executive = getExecutiveBySlug(slug);

  if (!executive) {
    notFound();
  }

  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/executives" />
      <main className="page-main container">
        <div className="profile-back">
          <Link className="text-link" href="/executives">← Back to executives</Link>
        </div>

        <section className="executive-profile">
          <div className="homepage-executive-profile executive-profile-showcase">
            <Link className="homepage-executive-identity" href="/executives">
              <ExecutivePhoto executive={executive} />
              <span className="homepage-executive-name">{executive.name}</span>
              <span className="homepage-executive-role">{getExecutiveOfficeLabel(executive.role)}</span>
              <span className="homepage-executive-organization">NIPSA-UNILESA</span>
              <span className="homepage-executive-description">{executive.intro}</span>
            </Link>
            <dl className="homepage-executive-meta">
              <div><dt>Official email</dt><dd><a href={`mailto:${executive.email}`}>{executive.email}</a></dd></div>
              <div><dt>Assumed office date</dt><dd>{executive.assumedOffice}</dd></div>
              <div><dt>Tenure</dt><dd>{executive.tenure}</dd></div>
            </dl>
            <Link className="button primary homepage-executive-contact" href={`mailto:${executive.email}`}>
              Contact Office <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section className="profile-details" aria-label={`${executive.name} profile details`}>
          <article className="page-card">
            <span className="card-tag">Biography</span>
            <h2>About the office holder</h2>
            <p>{executive.biography}</p>
          </article>
          <article className="page-card">
            <span className="card-tag">Office</span>
            <h2>Office description</h2>
            <p>{executive.officeDescription}</p>
          </article>
          <article className="page-card profile-wide-card">
            <span className="card-tag">Responsibilities</span>
            <h2>Official duties</h2>
            <ul>
              {executive.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
            </ul>
          </article>
          <article className="page-card">
            <span className="card-tag">Tenure</span>
            <h2>Office details</h2>
            <p><strong>Date assumed office:</strong> {executive.assumedOffice}</p>
            <p><strong>Tenure:</strong> {executive.tenure}</p>
          </article>
          <article className="page-card">
            <span className="card-tag">Message</span>
            <h2>Official message</h2>
            <p>{executive.message ?? "Official message to be confirmed."}</p>
          </article>
        </section>
      </main>
      <Footer currentPath="/executives" />
    </div>
  );
}
