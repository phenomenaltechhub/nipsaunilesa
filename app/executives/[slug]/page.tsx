import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { executives, getExecutiveBySlug } from "../data";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

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
    title: `${executive.name} | ${executive.role}`,
    description: executive.intro ?? `${executive.role} profile for NIPSA UNILESA.`,
    openGraph: {
      title: `${executive.name} | ${executive.role}`,
      description: executive.intro ?? `${executive.role} profile for NIPSA UNILESA.`,
      type: "profile",
    },
  };
}

function ExecutivePhoto({ executive }: { executive: (typeof executives)[number] }) {
  return executive.image ? (
    <div className="profile-photo-wrap">
      <img className="profile-photo" src={executive.image} alt={`Portrait of ${executive.name}, ${executive.role}, NIPSA-UNILESA`} />
    </div>
  ) : (
    <div className={`placeholder-photo profile-placeholder ${executive.tone}`} aria-label={`Photograph of ${executive.name} is to be confirmed`}>
      <span>{executive.initials}</span>
      <small>Profile placeholder</small>
      <b aria-hidden="true">✦</b>
    </div>
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
          <ExecutivePhoto executive={executive} />
          <div className="executive-profile-heading">
            <p className="page-kicker">{executive.role}</p>
            <h1 className="page-title">{executive.name}</h1>
            <p className="profile-email"><a href={`mailto:${executive.email}`}>{executive.email}</a></p>
            <p className="page-subtitle">{executive.intro}</p>
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
            <p><strong>Tenure:</strong> until graduation</p>
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
