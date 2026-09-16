import type { Metadata } from "next";
import Link from "next/link";
import Header from "./components/site-header";
import Footer from "./components/site-footer";
import { announcements as homeAnnouncements } from "./announcements/data";
import { events as homeEvents } from "./events/data";

export const metadata: Metadata = {
  title: "Home",
  description: "NIPSA UNILESA student community, events, and academic resources for the Department of Pharmacology.",
};

const stats = [
  { value: "700+", label: "Students" },
  { value: "500+", label: "Study groups" },
  { value: "08", label: "Events this term" },
  { value: "1000+", label: "Shared resources" },
];

const executives = [
  { initials: "OM", name: "ONIFADE MICHEAL", role: "NIPSA President", tone: "teal" },
  { initials: "JE", name: "JOHN-EDWARD SEED'IVINE", role: "Vice President", tone: "cyan" },
  { initials: "EJ", name: "EDDIDIONG UDOM JOHN", role: "General Secretary", tone: "lime" },
  { initials: "E", name: "EMMANUEL", role: "Assistant General Secretary", tone: "lime" }
];

const resources = [
  ["▤", "Lecture Materials", "A home for notes and class materials shared by the community."],
  ["⌁", "Past Questions", "Practice with a growing collection of revision prompts."],
  ["✦", "Study Resources", "Useful references to support your next focused study session."],
  ["↗", "Academic Guides", "Clear, practical signposts for navigating student academic life."],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function SectionIntro({ number, eyebrow, title, accent }: { number: string; eyebrow: string; title: string; accent: string }) {
  return <div className="section-intro"><p className="eyebrow"><span>{number}</span> / {eyebrow}</p><h2>{title} <em>{accent}</em></h2></div>;
}

export default function Home() {
  return (
    <div className="nipsa-site">
      <Header currentPath="/" />

      <main id="home">
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> NIGERIA PHARMACOLOGY STUDENTS ASSOCIATION</p>
            <h1>Learn boldly.<br /><em>Lead</em> brilliantly.</h1>
            <p className="hero-subtitle">A place for departmental students, aspirants and the wider community to connect, learn and share information.</p>
            <p className="institution">Department of Pharmacology <span>·</span> University of Ilesa</p>
            <div className="hero-actions"><Link className="button primary" href="/about">Explore NIPSA <Arrow /></Link><Link className="button secondary" href="/portal">Student Portal <span>→</span></Link></div>
            <div className="hero-trust"><div className="mini-avatars"><i>NP</i><i>HD</i><i>ST</i></div><span><strong>Students, aspirants and allies</strong><br />growing a healthier tomorrow</span></div>
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

        <section className="about section container" id="about"><SectionIntro number="01" eyebrow="ABOUT NIPSA" title="A community for" accent="the curious." /><div className="about-content"><div className="about-lead"><p>NIPSAUNILESA has a student-centred platform for learning, connection and shared progress within the Department of Pharmacology.</p></div><div className="about-detail"><p>We bring together students, aspirants and the wider community around the questions, conversations and resources that make pharmacology feel more accessible.</p><p>Explore at your own pace, find your people and keep building your path.</p><Link className="text-link" href="/community">Discover the community <Arrow /></Link></div></div></section>

        <section className="people section" id="executives"><div className="container"><SectionIntro number="02" eyebrow="FACES OF THE DEPARTMENT" title="People who" accent="make it happen." /><div className="people-grid">{executives.map((person) => <article className={`person-card ${person.tone}`} key={person.role}><div className="placeholder-photo"><span>{person.initials}</span><small>Profile placeholder</small><b>✦</b></div><div className="person-info"><h3>{person.name}</h3><p>{person.role}</p><Link href="/executives" aria-label={`View profile for ${person.name}`}>View Profile <Arrow /></Link></div></article>)}</div></div></section>

        <section className="updates section container"><div className="section-heading"><SectionIntro number="03" eyebrow="STAY IN THE LOOP" title="What’s happening" accent="around NIPSA." /><Link className="text-link" href="/announcements">View all announcements <Arrow /></Link></div><div className="announcement-grid">{homeAnnouncements.map((item) => <article className={`announcement-card ${item.tone}`} key={item.slug}><div className="card-meta"><span>{item.category}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.summary}</p></article>)}</div></section>

        <section className="events section" id="events"><div className="container"><div className="section-heading"><SectionIntro number="04" eyebrow="UPCOMING EVENTS" title="Make room for" accent="something new." /><Link className="text-link" href="/events">View all events <Arrow /></Link></div><div className="events-grid">{homeEvents.map((event) => {
          const [day, month] = event.date.split(" ");
          return (
            <article className={`event-card ${event.tone}`} key={event.slug}>
              <div className="event-date"><strong>{day}</strong><span>{month}</span></div>
              <div>
                <p className="event-label">{event.category}</p>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
              </div>
            </article>
          );
        })}</div></div></section>

        <section className="resources section container" id="resources"><div className="resource-intro"><SectionIntro number="05" eyebrow="ACADEMIC RESOURCES" title="Find your" accent="flow." /><p>Thoughtful starting points for classes, revision and the learning moments in between.</p><Link className="button dark" href="/resources">Explore resources <Arrow /></Link></div><div className="resource-grid">{resources.map(([icon, title, text]) => <Link className="resource-card" href="/resources" key={title}><span className="resource-icon">{icon}</span><h3>{title}</h3><p>{text}</p><b><Arrow /></b></Link>)}</div></section>

        <section className="community section" id="community"><div className="container community-inner"><div><SectionIntro number="06" eyebrow="STUDY GROUPS & COMMUNITY" title="Your people" accent="are here." /></div><div><p className="community-lead">Learning does not have to happen alone. NIPSA study groups are a place to focus together, exchange ideas and build supportive student connections.</p><p className="community-note">Join and get the community experience.</p><Link className="button primary" href="/community">Find your community <Arrow /></Link></div></div></section>

        <section className="gallery-strip container" id="gallery"><div><p className="eyebrow"><span>07</span> / GALLERY PREVIEW</p><h2>Moments in<br /><em>the making.</em></h2></div><div className="gallery-collage"><div className="gallery-tile tile-a">NIPSA<br /><b>TOGETHER</b></div><div className="gallery-tile tile-b">LEARN<br /><b>BRAVELY</b></div><div className="gallery-tile tile-c">✦</div></div></section>
      </main>

      <Footer currentPath="/" />
    </div>
  );
}
