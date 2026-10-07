import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata({
  title: "Campus Navigator",
  description:
    "A feature preview for the NIPSA UNILESA Campus Navigator, bringing campus mapping, search, and location guidance together in one accessible student tool.",
  path: "/campus-navigator",
});

const journeySteps = [
  "Search or explore",
  "Select a location",
  "View its information",
  "Navigate",
];

const explorationModes = [
  {
    title: "Campus Map",
    text:
      "A planned campus map could show verified locations in relation to one another. It will be added only after the location information has been collected and checked.",
  },
  {
    title: "Location Directory",
    text:
      "A planned directory could let students search or browse verified campus locations. No searchable location directory is available yet.",
  },
];

const facilityGroups = [
  {
    title: "Academic locations",
    description: "Faculties, departments, teaching spaces, laboratories, libraries and ICT facilities.",
    items: ["Faculties", "Departments", "Lecture halls", "Classrooms", "Laboratories", "Practical spaces", "Auditoriums", "Libraries", "ICT and computer facilities"],
  },
  {
    title: "Administrative and student services",
    description: "Administrative offices, student affairs, health and academic support points.",
    items: ["Administrative offices", "Student affairs facilities", "Academic support points", "Health facilities", "Student support services", "Other official service points"],
  },
  {
    title: "Campus facilities",
    description: "Food, sports, recreation, residential areas, parking, entrances and security points.",
    items: ["Cafeterias and food points", "Sports facilities", "Recreational areas", "Religious centres", "Hostels and residential areas", "Parking areas", "Campus entrances and gates", "Security points"],
  },
  {
    title: "Landmarks and useful destinations",
    description: "Campus landmarks, gateways, reference points and useful meeting places.",
    items: ["Landmarks", "Reference points", "Campus gateways", "Wayfinding anchors", "Useful student meeting points"],
  },
];

const locationFields = [
  { label: "Location name", description: "The official name of the facility or destination." },
  { label: "Category", description: "The type of location, such as a laboratory, lecture hall, office, health facility, or landmark." },
  { label: "Faculty or department", description: "Where relevant, the faculty or department associated with the location." },
  { label: "Description", description: "A short explanation of what the place is used for and why students may need it." },
  { label: "Photographs", description: "Images that help students recognise the building, entrance, or surrounding environment when they arrive." },
  { label: "Mapped position", description: "The location's position on the campus map." },
  { label: "Coordinates", description: "The geographical coordinates associated with the location." },
  { label: "Nearby landmarks", description: "Useful reference points that help students orient themselves." },
  { label: "Direction and orientation notes", description: "Helpful information about how to approach the place from nearby buildings or routes." },
  { label: "Alternative names", description: "Common or shortened names students may use when searching for the same place." },
  { label: "Navigation", description: "Access to available guidance or route support based on the mapped location." },
  { label: "Verification information", description: "Details used to keep the record accurate, current, and useful for students over time." },
];

const locationInformationGroups = [
  {
    title: "Essential location information",
    text: "Names, categories, a brief description, and faculty or department details where relevant.",
    fields: locationFields.slice(0, 4),
  },
  {
    title: "Photographs and visual references",
    text: "Images of buildings, entrances and surroundings to help you recognise the place.",
    fields: locationFields.slice(4, 5),
  },
  {
    title: "Mapped position and navigation",
    text: "A mapped position, coordinates and available route guidance.",
    fields: locationFields.slice(5, 7).concat(locationFields.slice(10, 11)),
  },
  {
    title: "Landmarks and orientation",
    text: "Nearby reference points, approach notes and familiar or alternative names.",
    fields: locationFields.slice(7, 10),
  },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function CampusNavigatorPage() {
  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Campus Navigator", path: "/campus-navigator" }]} />
      <Header currentPath="/campus-navigator" />

      <main className="page-main container campus-page">
        <section className="page-hero campus-hero" aria-labelledby="campus-navigator-title">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Campus navigator</p>
              <h1 id="campus-navigator-title" className="page-title">
                University of Ilesa <em>campus guide</em>
              </h1>
              <p className="page-subtitle">
                Preview the campus map and location directory being prepared for the University of Ilesa. The Navigator is not yet a live location lookup.
              </p>
              <div className="page-cta-row">
                <Link className="button secondary" href="/portal">
                  Visit student portal <Arrow />
                </Link>
              </div>
            </div>

            <aside className="page-hero-aside campus-status-panel">
              <span className="mini-label">Feature preview</span>
              <strong className="big-stat campus-summary-stat">Map + directory</strong>
              <p>
                Search for destinations, browse categories, and understand what each location is for before you set out.
              </p>
            </aside>
          </div>
        </section>

        <div className="campus-content">
          <section className="campus-section" aria-labelledby="navigator-overview-heading">
            <div className="campus-section-heading">
              <p className="eyebrow">01 · What is the Campus Navigator?</p>
              <h2 id="navigator-overview-heading">A digital guide for finding your way around campus.</h2>
            </div>

            <div className="campus-quote-grid">
              <div className="campus-quote-box">
                <p className="campus-quote-lead">“Where is this place?”</p>
                <p>
                  When location records are available, the Navigator is intended to pair a place with context that can help students recognise it.
                </p>
              </div>
              <div className="campus-quote-box">
                <p className="campus-quote-lead">“How do I know I have found the right place?”</p>
                <p>
                  Verified photographs, landmarks and orientation notes could help students identify a location.
                </p>
              </div>
            </div>
          </section>

          <section className="campus-section" aria-labelledby="navigator-journey-heading">
            <div className="campus-section-heading">
              <p className="eyebrow">02 · How it works</p>
              <h2 id="navigator-journey-heading">Simple steps for easier movement around campus.</h2>
            </div>

            <div className="campus-step-grid">
              {journeySteps.map((step, index) => (
                <article className="campus-card campus-step-card" key={step}>
                  <span className="campus-step-number">0{index + 1}</span>
                  <h3>{step}</h3>
                  <p>
                    {index === 0 && "When the verified directory is available, students will be able to search by name, browse by category, or use the campus map."}
                    {index === 1 && "Selecting a listed destination will open its record and any verified information available for that place."}
                    {index === 2 && "A location record may include a description, photographs, landmarks, or orientation notes where those details have been verified."}
                    {index === 3 && "Mapped positions and route guidance may be provided where accurate information is available."}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="campus-section campus-section--surface" aria-labelledby="navigator-explore-heading">
            <div className="campus-section-heading">
              <p className="eyebrow">03 · Two ways to explore</p>
              <h2 id="navigator-explore-heading">Search or browse the campus in the way that makes sense to you.</h2>
            </div>

            <div className="campus-feature-grid">
              {explorationModes.map((mode) => (
                <article className="campus-card campus-mode-card" key={mode.title}>
                  <span className="card-tag">Campus feature</span>
                  <h3>{mode.title}</h3>
                  <p>{mode.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="campus-section" aria-labelledby="navigator-coverage-heading">
            <div className="campus-section-heading">
              <p className="eyebrow">04 · What will you be able to find?</p>
              <h2 id="navigator-coverage-heading">A practical directory of the places students use most.</h2>
              <p>
                The categories below are examples of information a future directory could cover; they
                are not a verified list of University of Ilesa locations or facilities.
              </p>
            </div>

            <div className="campus-category-grid">
              {facilityGroups.map((group) => (
                <article className="campus-card campus-category-card" key={group.title}>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="campus-section" aria-labelledby="navigator-details-heading">
            <div className="campus-section-heading">
              <p className="eyebrow">05 · What information will each location provide?</p>
              <h2 id="navigator-details-heading">Location records can be more useful than a single point on a map.</h2>
            </div>

            <div className="campus-info-list">
              {locationInformationGroups.map((group) => (
                <div className="campus-info-item" key={group.title}>
                  <h3>{group.title}</h3>
                  <p>{group.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="campus-section" aria-labelledby="navigator-visual-heading">
            <div className="campus-visual-layout">
              <div className="campus-section-heading campus-visual-copy">
                <p className="eyebrow">06 · More than a map pin</p>
                <h2 id="navigator-visual-heading">Recognise the place when you arrive.</h2>
                <p>
                  A map can show that a building is nearby, but it does not always tell you what the building looks like, which entrance to use, or what landmarks to look out for. Where appropriate, location records can include photographs such as the exterior view, main entrance, approach route, nearby landmark, directional reference, or an interior view.
                </p>
              </div>

              <ul className="campus-feature-bullets">
                <li>Exterior or front view</li>
                <li>Main entrance</li>
                <li>Approach view</li>
                <li>Nearby landmark</li>
                <li>Useful directional reference</li>
                <li>Interior view where appropriate</li>
              </ul>
            </div>
          </section>

          <section className="campus-section campus-section--surface" aria-labelledby="navigator-campus-heading">
            <div className="campus-section-heading">
              <p className="eyebrow">07 · Built around the real campus</p>
              <h2 id="navigator-campus-heading">A system grounded in the actual student experience.</h2>
              <p>
                The Navigator will be based on actual campus locations rather than generic or estimated information. Locations will be documented with their relevant details, photographs, geographical coordinates, and surrounding references before being incorporated into the system. This allows the Navigator to represent the university as students actually experience it.
              </p>
            </div>
          </section>

          <section className="campus-section" aria-labelledby="navigator-audience-heading">
            <div className="campus-section-heading">
              <p className="eyebrow">08 · Who is it for?</p>
              <h2 id="navigator-audience-heading">A helpful guide for anyone finding their way around campus.</h2>
              <p className="campus-audience-summary">
                Once verified campus information is available, the Navigator is intended to help
                students, staff and visitors find their way around campus.
              </p>
            </div>
          </section>
        </div>

        <section className="campus-coming-section" aria-labelledby="campus-coming-heading">
          <div className="campus-coming-intro">
            <p className="campus-coming-label">COMING SOON</p>
            <h2 id="campus-coming-heading">The Campus Navigator is being prepared.</h2>
            <p>
              Campus locations, photographs, coordinates, landmarks, and supporting information are currently being collected and verified before the Navigator goes live.
            </p>
            <p>
              While the guide is being prepared, find available study and orientation materials in{" "}
              <Link href="/resources">Student Resources</Link>.
            </p>
          </div>
          <div className="campus-coming-preparation">
            <h3>What is being prepared</h3>
            <ul>
              <li>Campus locations</li>
              <li>Photographs</li>
              <li>Coordinates</li>
              <li>Landmarks</li>
              <li>Location descriptions</li>
              <li>Search and category information</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer currentPath="/campus-navigator" />
    </div>
  );
}
