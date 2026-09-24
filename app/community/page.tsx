import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "Community",
  description: "Explore the student community, study groups, and peer support opportunities within NIPSA UNILESA.",
};

const communityAreas = [
  {
    title: "Study circles",
    paragraphs: [
      "Study circles are peer-led spaces where NIPSA students can learn together outside the formal classroom. They provide an opportunity to revise difficult pharmacology topics, compare notes, discuss concepts, ask questions, and test understanding through peer discussion.",
      "The focus is not simply on group study, but on collaborative learning and academic support. Students can work through challenging topics together, share useful study materials, explain concepts to one another, and build confidence before tests, examinations, presentations, and other academic activities.",
      "Study circles can also encourage consistency and accountability. Learning alongside peers makes it easier to identify areas that need more attention, exchange different approaches to understanding a topic, and maintain productive study habits throughout the semester.",
    ],
    ctaLabel: "Join the WhatsApp Community",
    href: "https://chat.whatsapp.com/Lr9o3E6iXpmItO0hB8moG7",
  },
  {
    title: "Mentorship",
    paragraphs: [
      "Mentorship provides students with an opportunity to seek guidance from more experienced members of the academic community. It can help students navigate university life, develop better academic habits, understand opportunities within pharmacology, and make more informed decisions about their academic and professional development.",
      "Mentorship can cover practical questions that are not always answered in the classroom—from managing academic demands and improving study approaches to exploring research interests, professional opportunities, and possible career pathways.",
      "The goal is to encourage guidance, knowledge-sharing, and personal development, while giving students a channel through which they can seek advice when they need it.",
    ],
    ctaLabel: "Connect with NIPSA",
    href: "/contact",
  },
  {
    title: "Campus updates",
    paragraphs: [
      "Campus Updates keeps students informed about the activities, announcements, and important information relevant to the NIPSA community.",
      "This includes updates about NIPSA activities, departmental events, student programmes, important notices, deadlines, and changes that students need to know about. Having these updates in one place makes it easier for students to stay aware of what is happening around the department and participate when opportunities arise.",
      "Students should regularly check the announcements channel for new information rather than relying solely on word of mouth or informal communication.",
    ],
    ctaLabel: "View Announcements",
    href: "/announcements",
  },
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
              <strong className="big-stat community-summary-stat">Peer learning</strong>
              <p>
                Study groups, mentorship, and timely updates help students stay connected, supported, and informed.
              </p>
            </aside>
          </div>
        </section>

        <section className="community-panel-grid" aria-label="Community programme areas">
          {communityAreas.map((group) => (
            <article className="community-panel" key={group.title}>
              <span className="card-tag">Community</span>
              <h3>{group.title}</h3>

              {group.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}

              <Link
                className="community-panel-link"
                href={group.href}
                target={group.href.startsWith("http") ? "_blank" : undefined}
                rel={group.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {group.ctaLabel} <Arrow />
              </Link>
            </article>
          ))}
        </section>
      </main>
      <Footer currentPath="/community" />
    </div>
  );
}
