import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";

export const metadata: Metadata = {
  title: "Campus Navigator",
  description:
    "A feature preview for the NIPSA UNILESA Campus Navigator, bringing campus mapping, search, and location guidance together in one accessible student tool.",
};

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
      "The campus map provides a visual representation of important locations around the university. It helps students see how facilities are positioned relative to one another and understand the layout of the campus.",
  },
  {
    title: "Location Directory",
    text:
      "The location directory provides a searchable and organised collection of campus locations. Students can search by name or browse by category, making it easier to find a destination even when they are not sure where it is located.",
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
      <Header currentPath="/campus-navigator" />

      <main className="page-main container campus-page">
        <section className="page-hero campus-hero" aria-labelledby="campus-navigator-title">
          <div className="page-hero-grid">
            <div>
              <p className="page-kicker">Campus navigator</p>
              <h1 id="campus-navigator-title" className="page-title">
                Find your way around <em>campus</em>.
              </h1>
              <p className="page-subtitle">
                Find your way around campus with locations, landmarks, photographs and useful information collected for students.
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
                  More than a map, the Navigator helps you understand what a place is and recognise it when you arrive.
                </p>
              </div>
              <div className="campus-quote-box">
                <p className="campus-quote-lead">“How do I know I have found the right place?”</p>
                <p>
                  Photos, landmarks and useful context make campus locations easier to identify.
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
                    {index === 0 && "Search for a specific place by name, discover by category, or browse the campus map to begin."}
                    {index === 1 && "Select a destination and open its record to view the associated information for that place."}
                    {index === 2 && "Explore its description, photographs, landmarks and orientation notes to confirm you have the right location."}
                    {index === 3 && "Use the mapped position and navigation support to help you get there with more confidence."}
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
                Whether you are a student, staff member or visitor, the Navigator can help you find
                your way—with useful context for first-time visitors and familiar guidance for
                returning campus users.
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
