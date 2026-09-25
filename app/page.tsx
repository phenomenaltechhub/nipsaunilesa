import type { Metadata } from "next";
import Link from "next/link";
import Header from "./components/site-header";
import Footer from "./components/site-footer";
import { announcements as homeAnnouncements } from "./announcements/data";
import { events as homeEvents, getEventTemporalStatus } from "./events/data";
import { executives } from "./executives/data";
import { ExecutiveShowcase } from "./executives/executive-showcase";
import { galleryCollections } from "./gallery/data";
import GalleryImageViewer from "./gallery/gallery-image-viewer";

export const metadata: Metadata = {
  title: "Home",
  description: "Nigerian Pharmacology Students Association, University of Ilesa Chapter: student representation, academic and research development, professional growth, and university community engagement.",
};

const stats = [
  { value: "UNILESA", label: "University of Ilesa Chapter" },
  { value: "PHARM", label: "Department of Pharmacology" },
  { value: "ACADEMIC", label: "Student-led academic community" },
  { value: "RESEARCH", label: "Research & professional development" },
];

const resources = [
  { title: "Study skills guide", description: "Practical study-planning and revision support for better academic routines and focus." },
  { title: "Orientation checklist", description: "A quick reference for key onboarding steps and early-year preparation guidance." },
  { title: "Pharmacology handbook", description: "Student-facing guidance covering department expectations and academic support resources." },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function SectionIntro({ number, eyebrow, title, accent }: { number: string; eyebrow: string; title: string; accent: string }) {
  return <div className="section-intro"><p className="eyebrow">{number ? <><span>{number}</span> / </> : null}{eyebrow}</p><h2>{title} <em>{accent}</em></h2></div>;
}

export default function Home() {
  return (
    <div className="nipsa-site">
      <Header currentPath="/" />

      <main id="home">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> NIGERIAN PHARMACOLOGY STUDENTS ASSOCIATION</p>
            <h1>Learn boldly.<br /><em>Lead</em> brilliantly.</h1>
            <p className="hero-subtitle">The official student representative body for undergraduates studying Pharmacology at the University of Ilesa, connecting students with academic development, research opportunities, professional networks, student representation, and the wider university community.</p>
            <p className="institution">Department of Pharmacology <span>·</span> University of Ilesa</p>
            <div className="hero-actions"><Link className="button primary" href="/about">Explore NIPSA <Arrow /></Link><Link className="button secondary" href="/portal">Student Portal <span>→</span></Link></div>
            <div className="hero-trust"><div className="mini-avatars"><i>NP</i><i>HD</i><i>ST</i></div><span><strong>University of Ilesa Chapter</strong><br />Department of Pharmacology</span></div>
          </div>
          <div className="hero-visual" aria-label="Pharmacological research visual">
            <div className="hero-image-wrap">
              <img
                className="homepage-hero-image"
                src="/homepage-image.png"
                alt="Pharmacological research scene with a microscope and green lab samples"
              />
            </div>
          </div>
        </section>

        <section className="stats container" aria-label="NIPSA statistics">{stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</section>

        <section className="about section container" id="about"><SectionIntro number="01" eyebrow="ABOUT NIPSA" title="A chapter for" accent="pharmacology." /><div className="about-content"><div className="about-lead"><p>NIPSA UNILESA is the University of Ilesa Chapter of the Nigerian Pharmacology Students Association, operating within the Department of Pharmacology.</p></div><div className="about-detail"><p>We represent duly registered undergraduate Pharmacology students and serve as a bridge between students, academic resources, professional networks, and health research opportunities.</p><p>As a student-led academic community, we operate in alignment with institutional guidelines and connect our chapter with the wider University of Ilesa community.</p><Link className="text-link" href="/about">About NIPSA <Arrow /></Link></div></div></section>

        <section className="purpose section container" id="purpose"><div className="section-heading"><SectionIntro number="02" eyebrow="PURPOSE & VISION" title="Built for" accent="shared progress." /><Link className="text-link" href="/about">Full mission & objectives <Arrow /></Link></div><div className="purpose-grid">{[
          ["Representation", "Serving as the unified voice for Pharmacology students in academic boards, faculty committees, and national student assemblies."],
          ["Academic Development", "Supporting peer mentorship, study resources, and introductory laboratory research opportunities."],
          ["Student Engagement", "Organizing departmental seminars, health campaigns, and networking activities."],
          ["Community", "Fostering collaboration between foundational students, senior peers, and departmental alumni."],
        ].map(([title, text]) => <article className="purpose-card" key={title}><h3 className="card-tag">{title}</h3><p>{text}</p></article>)}</div><div className="vision-callout"><h3 className="card-tag">Chapter vision</h3><p>To be a premier student research community driving excellence in drug discovery and therapeutic innovation for global health improvement.</p></div></section>

        <section className="people section" id="executives">
          <div className="container">
            <div className="homepage-executive-heading">
              <p className="eyebrow">03 / OUR EXECUTIVES</p>
              <h2>Meet Our Executive Team</h2>
              <p>A dedicated team of students working together to serve, represent, and create a better experience for every NIPSA member.</p>
            </div>
            <ExecutiveShowcase people={executives.slice(0, 4)} />
            <div className="homepage-section-cta"><Link className="button secondary" href="/executives">View All Executives <Arrow /></Link></div>
          </div>
        </section>

        <section className="updates section container"><div className="section-heading"><SectionIntro number="" eyebrow="ARCHIVED ANNOUNCEMENTS" title="What was shared" accent="with NIPSA." /><Link className="text-link" href="/announcements">View all announcements <Arrow /></Link></div><p className="announcement-archive-note">These announcements were published in August 2026 and remain available as dated reference notes.</p><div className="announcement-track"><div className="announcement-track-scroller">{homeAnnouncements.map((item) => <Link className={`announcement-card ${item.tone} announcement-slide`} key={item.slug} href={`/announcements/${item.slug}`}><div className="card-meta"><span>{item.category}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.summary}</p>{item.additionalInfo?.length ? <span className="announcement-status">{item.additionalInfo[0]}</span> : null}</Link>)}</div></div></section>

        <section className="events section" id="events"><div className="container"><div className="section-heading"><SectionIntro number="04" eyebrow="EVENTS" title="Make room for" accent="something new." /><Link className="text-link" href="/events">View all events <Arrow /></Link></div><div className="events-grid">{homeEvents.map((event) => {
          const parts = event.date.split(" ");
          const day = parts[0] ?? event.date;
          const month = parts[1] ?? "";
          return (
            <Link className={`event-card ${event.tone}`} key={event.slug} href={`/events/${event.slug}`}>
              <div className="event-date"><strong>{day}</strong><span>{month}</span></div>
              <div>
                <p className="event-label">{event.category} · {getEventTemporalStatus(event)}</p>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
              </div>
            </Link>
          );
        })}</div></div></section>

        <section className="resources section container" id="resources">
          <div className="resource-intro">
            <SectionIntro number="05" eyebrow="ACADEMIC RESOURCES" title="Find your" accent="flow." />
            <p>Preview the public academic and study materials available to students. Visit the full resource hub for the complete collection.</p>
            <Link className="button primary" href="/resources">Explore Academic Resources <Arrow /></Link>
          </div>
          <div className="resource-grid home-resource-grid">
            {resources.map(({ title, description }) => (
              <div className="resource-card resource-preview-card" key={title}>
                <span className="resource-type resource-preview-tag">Preview</span>
                <div className="resource-card-body">
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="community section" id="community"><div className="container community-inner"><div><SectionIntro number="06" eyebrow="STUDY GROUPS & COMMUNITY" title="Your people" accent="are here." /></div><div><p className="community-lead">NIPSA fosters peer support and collaboration between foundational students, senior peers, departmental staff, alumni, and the wider university community.</p><p className="community-note">Explore the chapter&apos;s student-development and community-building work.</p><Link className="button primary" href="/community">Find your community <Arrow /></Link></div></div></section>

        <section className="gallery-preview section container" id="gallery" aria-label="Gallery preview">
          <div className="section-heading">
            <SectionIntro number="07" eyebrow="GALLERY PREVIEW" title="Moments in" accent="the making." />
            <Link className="text-link" href="/gallery">View Gallery <Arrow /></Link>
          </div>
          <p className="gallery-preview-intro">A small preview of practical learning moments from the Department of Pharmacology. Visit the gallery for the complete archive.</p>
          <div className="gallery-preview-grid">
            {galleryCollections.flatMap((collection) => collection.images).filter((image) => [
              "/gallery/100-level-physics-practical-01.jpg",
              "/gallery/100-level-physics-practical-02.jpg",
              "/gallery/chubenz.jpg",
            ].includes(image.src)).map((image) => (
              <GalleryImageViewer
                key={image.src}
                src={image.src}
                alt={image.alt}
                className="gallery-preview-image gallery-viewer-trigger"
                thumbnailClassName="gallery-preview-thumbnail"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            ))}
          </div>
        </section>
      </main>

      <Footer currentPath="/" />
    </div>
  );
}
