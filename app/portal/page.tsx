import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata({
  title: "Student Portal",
  description: "Academic information, study support, learning materials, and student tools for Pharmacology students.",
  path: "/portal",
});

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Status({ status }: { status: "Available" | "Coming Soon" }) {
  return <span className={`portal-status portal-status--${status === "Available" ? "available" : "soon"}`}>{status}</span>;
}

export default function PortalPage() {
  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Student Portal", path: "/portal" }]} />
      <Header currentPath="/portal" />

      <main className="page-main container portal-page">
        <section className="page-hero portal-hero" aria-labelledby="portal-title">
          <div className="page-hero-grid portal-hero-grid">
            <div>
              <p className="page-kicker">Student portal</p>
              <h1 id="portal-title" className="page-title">A practical hub for <em>Pharmacology students</em></h1>
              <p className="page-subtitle">
                Find public academic information, learning resources, and student support from NIPSA UNILESA in one place.
              </p>
            </div>
          </div>
        </section>

        <section className="portal-pharmaideia" aria-labelledby="pharmaideia-title">
          <div className="portal-pharmaideia-brand">
            <Image
              src="/brand/pharmaideia/pharmaideia-logo-stacked.png"
              alt="PHARMAIDEIA, NIPSA UNILESA"
              width={311}
              height={236}
              priority
            />
            <span className="portal-pharmaideia-status">Coming Soon</span>
          </div>
          <div className="portal-pharmaideia-copy">
            <p className="eyebrow">A separate student academic application</p>
            <h2 id="pharmaideia-title">Introducing PHARMAIDEIA</h2>
            <p>
              PHARMAIDEIA is an upcoming NIPSA UNILESA academic application planned to bring
              course-based resources, learning and revision support, practice and assessment
              tools, academic planning, and student-focused community features together.
            </p>
            <p className="portal-pharmaideia-note">
              More info will be shared when available.
            </p>
          </div>
        </section>

        <div className="portal-content">
          <section className="portal-section" aria-labelledby="academic-support">
            <div className="portal-section-heading">
              <p className="eyebrow">01 · Academic support</p>
              <h2 id="academic-support">Study with more direction</h2>
              <p>University can get demanding when you are dealing with several courses, tests, assignments and examinations at the same time. These practical starting points can help you study effectively and make better use of the support around you.</p>
            </div>
            <div className="portal-support-grid">
              <article className="portal-feature">
                <div className="portal-feature-heading"><h3>Study Tips</h3><Status status="Available" /></div>
                <p>Practical tips for studying smarter, remembering what you learn, revising effectively and preparing for tests and examinations.</p>
              </article>
              <article className="portal-feature">
                <div className="portal-feature-heading"><h3>Study Circles</h3><Status status="Available" /></div>
                <p>You do not always have to figure everything out alone. Study circles give students a chance to revise together, discuss difficult topics, compare notes and prepare for academic activities as a group.</p>
                <a className="portal-inline-link" href="https://chat.whatsapp.com/Lr9o3E6iXpmItO0hB8moG7" target="_blank" rel="noopener noreferrer">Join the WhatsApp Community <Arrow /></a>
                <Link className="portal-secondary-link" href="/community">Learn about the wider community</Link>
              </article>
              <article className="portal-feature">
                <div className="portal-feature-heading"><h3>Academic Support</h3><Status status="Available" /></div>
                <p>When you are stuck on a difficult topic or unsure where to find something, NIPSA can help point you towards the right academic resources and support.</p>
                <a className="portal-inline-link" href="mailto:academics@nipsaunilesa.com.ng">Email academic support <Arrow /></a>
                <Link className="portal-secondary-link" href="/contact">Find broader assistance</Link>
              </article>
            </div>
          </section>

          <section className="portal-section portal-section--surface" aria-labelledby="academic-toolkit">
            <div className="portal-section-heading">
              <p className="eyebrow">02 · Student academic toolkit</p>
              <h2 id="academic-toolkit">Resources that grow with you</h2>
              <p>This is where the Portal will gradually become more useful as more materials are added. Public materials already available through NIPSA are linked directly; planned resources are clearly marked.</p>
            </div>
            <div className="portal-toolkit">
              <div className="portal-toolkit-row portal-toolkit-row--available">
                <div><h3>Academic Resources</h3><p>Public study, departmental, orientation and student-support materials already made available through NIPSA.</p></div>
                <Status status="Available" />
                <Link className="portal-inline-link" href="/resources">Open Resources <Arrow /></Link>
              </div>
              <div className="portal-toolkit-row portal-toolkit-row--available">
                <div><h3>Academic Announcements</h3><p>Important academic notices, reminders and updates published through the website&apos;s Announcements section.</p></div>
                <Status status="Available" />
                <Link className="portal-inline-link" href="/announcements">View Announcements <Arrow /></Link>
              </div>
              <div className="portal-coming-grid">
                {["Study Guides", "Past Questions", "Recommended Textbooks", "Revision Resources"].map((title) => (
                  <div className="portal-coming-item" key={title}><div><h3>{title}</h3><p>{title === "Study Guides" ? "Simple guides for particular topics, courses, revision and examinations." : title === "Past Questions" ? "Past questions and revision materials where they are available." : title === "Recommended Textbooks" ? "Useful pharmacology and related textbooks for coursework and wider reading." : "Summaries, practice materials and other useful study aids."}</p></div><Status status="Coming Soon" /></div>
                ))}
              </div>
            </div>
          </section>

          <section className="portal-section portal-reading-section" aria-labelledby="semester-guide">
            <div className="portal-section-heading">
              <p className="eyebrow">03 · Getting through the semester</p>
              <h2 id="semester-guide">Build habits before pressure builds</h2>
            </div>
            <div className="portal-reading">
              <p>Good preparation is usually easier than trying to catch up when examinations are already close. Organise your notes and coursework, plan revision, keep track of tests and assignments, build a study routine, prepare deliberately for examinations and make time for activities outside academics.</p>
              <p>The Portal will also share ideas for making better use of study circles and other forms of peer support. The goal is not to prescribe one perfect routine, but to help you find practical habits that work through the semester.</p>
            </div>
          </section>

          <section className="portal-section portal-section--surface" aria-labelledby="pharmacology-guide">
            <div className="portal-section-heading">
              <p className="eyebrow">04 · Pharmacology student guide</p>
              <h2 id="pharmacology-guide">Understand more than drug names</h2>
              <p>Pharmacology is much more than memorising drug names. Understanding how drugs work, why they are used, what they affect and how they are applied in practice is an important part of becoming a good pharmacology student.</p>
            </div>
            <div className="portal-coming-grid portal-coming-grid--three">
              <div className="portal-coming-item"><div><h3>Important Pharmacology Concepts</h3><p>Important concepts explained in a straightforward way, covering ideas students are likely to encounter throughout their studies.</p></div><Status status="Coming Soon" /></div>
              <div className="portal-coming-item"><div><h3>Pharmacology Glossary</h3><p>A quick reference for pharmacological terms, abbreviations and definitions from lectures, textbooks and learning materials.</p></div><Status status="Coming Soon" /></div>
              <div className="portal-coming-item"><div><h3>Research and Scientific Thinking</h3><p>More content will help students explore research, drug discovery, pharmacotherapy and science beyond the classroom.</p></div><Status status="Coming Soon" /></div>
            </div>
          </section>

          <section className="portal-section" aria-labelledby="opportunities">
            <div className="portal-section-heading">
              <p className="eyebrow">05 · Student opportunities</p>
              <h2 id="opportunities">Stay connected to what is happening</h2>
              <p>This section will keep students connected to NIPSA activities, academic events, seminars, workshops, research opportunities, peer learning, leadership and other opportunities to get involved. Whenever there is something students can participate in, the relevant information will be shared through the appropriate section of the website.</p>
            </div>
            <div className="portal-link-row">
              <Link className="portal-inline-link" href="/events">See Events <Arrow /></Link>
              <Link className="portal-inline-link" href="/community">Explore Community <Arrow /></Link>
            </div>
          </section>

          <section className="portal-section portal-section--surface" aria-labelledby="student-tools">
            <div className="portal-section-heading">
              <p className="eyebrow">06 · Student tools</p>
              <h2 id="student-tools">Tools you can use privately</h2>
              <p>Estimate grade averages, organise a weekly routine, and plan revision with tools that save your work only in this browser.</p>
            </div>
            <div className="portal-tools-links">
              <Link href="/portal/tools#gpa-calculator"><span className="portal-tools-number">01</span><span><strong>GPA and CGPA</strong><small>Calculate weighted estimates using a grading scale you can review and edit.</small></span><Arrow /></Link>
              <Link href="/portal/tools#study-timetable"><span className="portal-tools-number">02</span><span><strong>Study timetable</strong><small>Arrange weekly study sessions and recorded lectures without overlap.</small></span><Arrow /></Link>
              <Link href="/portal/tools#study-planner"><span className="portal-tools-number">03</span><span><strong>What should I study today?</strong><small>Build a transparent, adjustable plan from your topics and available time.</small></span><Arrow /></Link>
            </div>
          </section>

          <section className="portal-section portal-now" aria-labelledby="what-you-can-use">
            <div className="portal-section-heading">
              <p className="eyebrow">What you can use now</p>
              <h2 id="what-you-can-use">Start with what is already available</h2>
              <p>The Portal is already connected to resources available across the website, including Study Tips, Study Circles, public academic resources, academic announcements, NIPSA activities, community information and student support channels.</p>
            </div>
            <p className="portal-note">More will be added over time. Anything marked <strong>Coming Soon</strong> is something we intend to make available, but it is not available yet.</p>
          </section>

          <section className="portal-section portal-help" aria-labelledby="need-help">
            <div className="portal-section-heading">
              <p className="eyebrow">Need help?</p>
              <h2 id="need-help">Not sure who to contact?</h2>
            </div>
            <div className="portal-contact-grid">
              <div><h3>Academic matters</h3><p>For academic questions and academic support.</p><a href="mailto:academics@nipsaunilesa.com.ng">academics@nipsaunilesa.com.ng</a></div>
              <div><h3>General enquiries</h3><p>For information, feedback, suggestions, concerns or help finding the right office.</p><a href="mailto:info@nipsaunilesa.com.ng">info@nipsaunilesa.com.ng</a></div>
              <div><h3>Administrative matters</h3><p>For general administrative enquiries.</p><a href="mailto:admin@nipsaunilesa.com.ng">admin@nipsaunilesa.com.ng</a></div>
              <div><h3>Community matters</h3><p>For study circles, peer support and student community activities.</p><a href="https://chat.whatsapp.com/Lr9o3E6iXpmItO0hB8moG7" target="_blank" rel="noopener noreferrer">WhatsApp Community <Arrow /></a><Link href="/community">Community page</Link></div>
              <div><h3>Other contact routes</h3><p>Sports, social and public-facing matters can use the relevant additional contact addresses.</p><a href="mailto:sports@nipsaunilesa.com.ng">Sports</a><a href="mailto:social@nipsaunilesa.com.ng">Social</a><a href="mailto:publicrelations@nipsaunilesa.com.ng">Public relations</a></div>
            </div>
            <Link className="button secondary portal-directory-link" href="/contact">Contact Directory <Arrow /></Link>
          </section>

          <section className="portal-section portal-closing" aria-labelledby="more-to-come">
            <p className="eyebrow">More to come</p>
            <h2 id="more-to-come">Make it easier to find what you need.</h2>
            <p>The Student Portal will grow as more useful resources and tools are developed. The idea is simple: make it easier for NIPSA students to find what they need, learn more effectively and get the support they need when they need it.</p>
          </section>
        </div>
      </main>
      <Footer currentPath="/portal" />
    </div>
  );
}
