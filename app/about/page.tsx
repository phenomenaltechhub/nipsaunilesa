import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "About NIPSA",
  description:
    "Learn about the Nigerian Pharmacology Students Association, University of Ilesa Chapter, its purpose, vision, mission, and objectives.",
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

const purposeAreas = [
  {
    title: "Representation",
    text: "Serving as the unified voice for Pharmacology students in academic boards, faculty committees, and national student assemblies, while promoting constructive engagement with the Department and wider university community.",
  },
  {
    title: "Academic Development",
    text: "Providing structured peer mentorship, study resources, academic support, and introductory laboratory research opportunities to optimize student success and strengthen practical understanding of pharmacology.",
  },
  {
    title: "Student Engagement",
    text: "Organizing departmental seminars, health campaigns, scientific activities, and networking opportunities to cultivate an active, informed, and academically engaged student body.",
  },
  {
    title: "Community",
    text: "Fostering a welcoming and collaborative environment that connects foundational students, senior peers, departmental staff, alumni, and other members of the university community around shared academic and professional interests.",
  },
];

const missionPoints = [
  {
    statement: "Cultivating basic laboratory research skills among undergraduate members",
    context: "through exposure to scientific inquiry, research practices, and practical learning opportunities.",
  },
  {
    statement: "Facilitating access to professional industrial training programs",
    context: "and other career-development opportunities that connect undergraduate learning with professional practice.",
  },
  {
    statement: "Spearheading public health awareness campaigns on drug safety within Osun State",
    context: "while promoting responsible medicine use and greater understanding of pharmacological principles within the community.",
  },
  {
    statement: "Upholding academic integrity and excellent performance metrics across all levels",
    context: "by encouraging disciplined study, peer support, academic collaboration, and a culture of continuous improvement.",
  },
  {
    statement: "Promoting student participation in academic and professional activities",
    context: "that broaden members' understanding of pharmacology and its applications across healthcare, research, industry, and related fields.",
  },
  {
    statement: "Encouraging research interest and scientific collaboration among students",
    context: "by creating opportunities for knowledge sharing, mentorship, seminars, and engagement with relevant academic and professional networks.",
  },
];

const objectives = [
  {
    number: "01",
    title: "Academic Support",
    text: "To establish sustainable peer-to-peer tutoring systems, academic resource archives, study groups, and other support structures for core pharmacology courses, helping students strengthen their understanding and improve academic performance.",
  },
  {
    number: "02",
    title: "Career Positioning",
    text: "To close the gap between undergraduate study and professional practice by facilitating career-development opportunities, industrial exposure, career fairs, scientific symposiums, professional interactions, and mentorship.",
  },
  {
    number: "03",
    title: "Research Development",
    text: "To promote research interest among undergraduate members by encouraging participation in scientific activities, research discussions, laboratory learning, mentorship, and opportunities for exposure to current developments in pharmacology and related disciplines.",
  },
  {
    number: "04",
    title: "Professional Development",
    text: "To equip students with relevant professional knowledge, communication skills, collaborative abilities, and practical exposure necessary for continued development within pharmacology, healthcare, pharmaceutical industries, research, academia, and related fields.",
  },
  {
    number: "05",
    title: "Public Health Engagement",
    text: "To promote public understanding of medicines, drug safety, responsible medicine use, and other relevant health issues through appropriate awareness campaigns and community-oriented initiatives.",
  },
  {
    number: "06",
    title: "Student Representation",
    text: "To represent the interests of Pharmacology students within appropriate academic and institutional structures while maintaining constructive communication with the Department, University, and relevant professional bodies.",
  },
  {
    number: "07",
    title: "Community Development",
    text: "To foster an inclusive and collaborative student community that encourages mentorship, knowledge sharing, leadership development, participation, and meaningful relationships among students, departmental stakeholders, alumni, and professional networks.",
  },
];

export default function AboutPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/about" />

      <main className="page-main container">
        <section className="page-hero">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">About NIPSA UNILESA Chapter</p>
              <h1 className="page-title">
                Nigerian Pharmacology Students Association <em>— University of Ilesa Chapter</em>
              </h1>
              <p className="page-subtitle">
                NIPSA UNILESA is the official student representative body for undergraduates studying
                Pharmacology at the University of Ilesa. <br/> The chapter serves as a vital link between
                students, the Department of Pharmacology, the wider university community, and the
                professional and academic networks associated with pharmacology. <br/> It provides a platform
                for academic development, research interests, professional engagement, student
                representation, and meaningful participation within the university community.
              </p>
              <div className="page-cta-row">
                <Link className="button primary" href="/community">
                  Explore our community <Arrow />
                </Link>
                <Link className="button secondary" href="/executives">
                  Meet the team <Arrow />
                </Link>
              </div>
            </div>
            <aside className="page-hero-aside">
              <span className="mini-label">Chapter vision</span>
              <strong className="big-stat">UNILESA</strong>
              <p>
                To be a premier student research community driving excellence in drug discovery and
                therapeutic innovation for global health improvement.
              </p>
            </aside>
          </div>
        </section>

        <section className="about-content about-institutional-section">
          <div className="about-lead">
            <p className="eyebrow">WHO WE ARE</p>
            <h2>Connected by <em>pharmacology</em></h2>
          </div>
          <div className="about-detail">
            <p>
              The Nigerian Pharmacology Students Association (NIPSA) is the national umbrella body
              for students dedicated to the study of pharmacology, therapeutics, and toxicology across
              Nigerian tertiary institutions.
            </p>
            <p>
              The UNILESA chapter functions as a localized division established within the Department
              of Pharmacology at the University of Ilesa. Our membership comprises all duly registered
              undergraduates pursuing a degree in Pharmacology at the institution, while our activities
              and engagements extend into the wider university community through academic, professional,
              and health-related initiatives.
            </p>
            <p>
              As a student-led academic community, we operate in alignment with institutional guidelines
              to foster research interests, provide essential peer support, encourage academic excellence,
              and prepare our members for future careers across the global health, pharmaceutical,
              research, and related industries.
            </p>
          </div>
        </section>

        <section className="about-purpose-section">
          <div className="section-intro">
            <p className="eyebrow">OUR PURPOSE</p>
            <h2>What we <em>do</em></h2>
          </div>
          <div className="route-grid about-purpose-grid">
            {purposeAreas.map((area) => (
              <article className="page-card" key={area.title}>
                <h3 className="card-tag">{area.title}</h3>
                <p>{area.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-vision-section">
          <div className="page-card about-vision-card">
            <span className="card-tag">Vision</span>
            <h2>A distinguished <em>chapter</em></h2>
            <p>
              To be a premier student research community driving excellence in drug discovery and
              therapeutic innovation for global health improvement.
            </p>
          </div>
        </section>

        <section className="about-mission-section">
          <div className="section-intro">
            <p className="eyebrow">MISSION</p>
            <h2>From goals to <em>opportunity</em></h2>
            <p className="about-section-intro">
              Our mission is to translate our foundational goals into practical opportunities and
              measurable development for our members by:
            </p>
          </div>
          <ol className="about-mission-list">
            {missionPoints.map((point) => (
              <li className="page-card" key={point.statement}>
                <strong>{point.statement}</strong> {point.context}
              </li>
            ))}
          </ol>
        </section>

        <section className="about-objectives-section">
          <div className="section-intro">
            <p className="eyebrow">OUR OBJECTIVES</p>
            <h2>Guided by structural <em>benchmarks</em></h2>
            <p className="about-section-intro">
              Our day-to-day operations and programming are guided by our official structural benchmarks:
            </p>
          </div>
          <div className="route-list about-objectives-list">
            {objectives.map((objective) => (
              <article className="route-item" key={objective.number}>
                <h3>{objective.number} — {objective.title}</h3>
                <p>{objective.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer currentPath="/about" />
    </div>
  );
}
