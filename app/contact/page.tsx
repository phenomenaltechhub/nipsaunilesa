import type { Metadata } from "next";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { SocialLinkGroup } from "../components/social-links";

export const metadata: Metadata = {
  title: "Contact",
  description: "Official NIPSA UNILESA contact channels for administrative and executive correspondence.",
};

const officialMailboxes = [
  {
    role: "President",
    email: "president@nipsaunilesa.com.ng",
    description: "Executive leadership, official representation, and matters requiring the President's office.",
  },
  {
    role: "Vice President",
    email: "vicepresident@nipsaunilesa.com.ng",
    description: "Executive support, student affairs, coordination, and matters within the Vice President's office.",
  },
  {
    role: "Secretary General",
    email: "secretarygeneral@nipsaunilesa.com.ng",
    description: "Official correspondence, notices, documentation, records, meetings, and administrative coordination.",
  },
  {
    role: "Assistant Secretary General",
    email: "assistantsecretarygeneral@nipsaunilesa.com.ng",
    description: "Administrative support, correspondence, documentation, and coordination delegated through the General Secretary's office.",
  },
  {
    role: "Public Relations Officer",
    email: "publicrelations@nipsaunilesa.com.ng",
    description: "Public communications, information requests, announcements, media and public-facing communication, and official outreach.",
  },
  {
    role: "Social Director",
    email: "socialdirector@nipsaunilesa.com.ng",
    description: "Social activities, student engagement, event coordination, and related association activities.",
  },
  {
    role: "Academic Director",
    email: "academicdirector@nipsaunilesa.com.ng",
    description: "Academic programmes, study support, academic initiatives, learning activities, and academic enquiries.",
  },
  {
    role: "Sports Director",
    email: "sportsdirector@nipsaunilesa.com.ng",
    description: "Sports activities, team coordination, competitions, and sports-related enquiries.",
  },
  {
    role: "Financial Secretary",
    email: "financialsecretary@nipsaunilesa.com.ng",
    description: "Official financial correspondence and matters relating to association financial administration.",
  },
  {
    role: "NIPSA UNILESA Administration",
    email: "admin@nipsaunilesa.com.ng",
    description: "General official correspondence, administrative enquiries, association matters, coordination, and enquiries that do not clearly belong to another office.",
  },
];

const quickContactAddresses = [
  {
    email: "info@nipsaunilesa.com.ng",
    purpose: "General information, official enquiries, feedback, suggestions, concerns, and guidance about NIPSA UNILESA, its activities, services, and the appropriate office to contact.",
  },
  {
    email: "support@nipsaunilesa.com.ng",
    purpose: "General student support and assistance for enquiries requiring administrative guidance or help from NIPSA UNILESA.",
  },
  {
    email: "academics@nipsaunilesa.com.ng",
    purpose: "Academic enquiries and support matters, including academic initiatives, study support, learning activities, and related student questions.",
  },
  {
    email: "sports@nipsaunilesa.com.ng",
    purpose: "Sports-related enquiries and activities, including team coordination, competitions, and participation.",
  },
  {
    email: "social@nipsaunilesa.com.ng",
    purpose: "Social activities and student engagement, including association social programmes and related coordination.",
  },
  {
    email: "publicrelations@nipsaunilesa.com.ng",
    purpose: "Public relations, official communications, information requests, and external-facing enquiries.",
  },
];

function ContactEmailLink({ email }: { email: string }) {
  return (
    <a className="quick-contact-email" href={`mailto:${email}`}>
      {email}
    </a>
  );
}

export default function ContactPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/contact" />

      <main className="page-main container">
        <section className="page-hero contact-hero">
          <div className="page-hero-grid contact-hero-grid">
            <div className="contact-hero-copy">
              <p className="page-kicker">Contact</p>
              <h1 className="page-title">Reach the right office</h1>
              <p className="page-subtitle">
                Official NIPSA UNILESA contacts for administrative, executive, and association correspondence.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-directory" aria-labelledby="official-offices">
          <div className="contact-directory-header">
            <p className="eyebrow">Official offices</p>
            <h2 id="official-offices">Official NIPSA Mailboxes</h2>
          </div>

          <div className="contact-list" aria-label="Official NIPSA UNILESA organisational email mailboxes">
            {officialMailboxes.map((contact) => (
              <article className="contact-item" key={contact.email}>
                <div className="contact-item-copy">
                  <p className="contact-role">{contact.role}</p>
                  <a className="contact-email" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                  <p className="contact-description">{contact.description}</p>
                </div>
                <a className="button secondary contact-action" href={`mailto:${contact.email}`}>
                  Email
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="quick-contact-section" aria-labelledby="quick-contact-addresses">
          <div className="contact-directory-header">
            <p className="eyebrow">Other official contact addresses</p>
            <h2 id="quick-contact-addresses">Other official contact addresses</h2>
          </div>

          <div className="quick-contact-list" aria-label="Other official NIPSA UNILESA contact addresses">
            {quickContactAddresses.map((alias) => (
              <article className="quick-contact-item" key={alias.email}>
                <p className="quick-contact-address">
                  <ContactEmailLink email={alias.email} />
                </p>
                <p className="quick-contact-purpose">{alias.purpose}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="social-directory" aria-labelledby="social-channels">
          <div className="contact-directory-header">
            <p className="eyebrow">Connect with NIPSA</p>
            <h2 id="social-channels">Stay connected</h2>
          </div>

          <div className="social-directory-panel">
            <p className="social-intro">
              Follow official updates, announcements, and association activities through the channels listed below.
            </p>
            <SocialLinkGroup />
          </div>
        </section>
      </main>
      <Footer currentPath="/contact" />
    </div>
  );
}
