import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import { createPageMetadata } from "../seo";
import { tourDescription, tourMedia, tourPathways } from "./content";
import TourPlayer from "./tour-player";
import TourDirectory from "./tour-directory";
import styles from "./tour.module.css";

export const metadata = createPageMetadata({ title: "Website Tour", description: tourDescription, path: "/website-tour", image: "/media/website-tour/poster.webp", imageAlt: "The NIPSA UNILESA website walkthrough" });

export default function WebsiteTourPage() {
  const updated = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(`${tourMedia.verifiedOn}T12:00:00Z`));
  return <div className="nipsa-site page-shell">
    <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Website Tour", path: "/website-tour" }]} />
    <Header currentPath="/website-tour" />
    <main className={`page-main container ${styles.page}`}>
      <TourPlayer />
      <TourDirectory />
      <section className={styles.pathways} aria-labelledby="tour-pathways-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Start with what you need</p><h2 id="tour-pathways-title">What brings you here?</h2></div><p>Choose a useful starting point. No onboarding is required.</p></div><div className={styles.pathwayGrid}>{tourPathways.map((pathway, index) => <details key={pathway.href} className={styles.pathway}><summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{pathway.title}</strong><span aria-hidden="true">＋</span></summary><div><p>{pathway.description}</p><Link href={pathway.href}>{pathway.label}<span aria-hidden="true">→</span></Link></div></details>)}</div></section>
      <section className={styles.guidance} aria-labelledby="tour-guidance-title"><div><p className={styles.eyebrow}>A clear picture of the website</p><h2 id="tour-guidance-title">Useful today.<br />Honest about tomorrow.</h2></div><dl><div><dt>Personal study tools</dt><dd>GPA figures are estimates using a sample, editable scale. Confirm your grading rules. Saved plans stay in this browser, so export a backup before clearing data.</dd></div><div><dt>Campus Navigator · Interactive Preview</dt><dd>Search, filters and record details work. Candidate entries await verification; building coordinates, full coverage and route directions are not available.</dd></div><div><dt>PHARMAIDEIA · Coming Soon</dt><dd>A separate upcoming application. Student activation, protected academic services and its in-app community are not offered through this public website.</dd></div></dl></section>
      <section className={styles.help} aria-labelledby="tour-help-title"><div><p className={styles.eyebrow}>Reach the right office</p><h2 id="tour-help-title">Need a hand?</h2><p>For outdated information or a broken link, include the page URL and a short explanation in your email.</p></div><div className={styles.helpActions}><Link href="/contact">Open the contact directory <span aria-hidden="true">→</span></Link><a href="mailto:info@nipsaunilesa.com.ng?subject=Website%20feedback">info@nipsaunilesa.com.ng</a></div></section>
      <div className={styles.version}><p>Walkthrough updated <time dateTime={tourMedia.verifiedOn}>{updated}</time>.</p><p>The website may change. Check each linked page for current information, availability and event details.</p></div>
    </main>
    <Footer currentPath="/website-tour" />
  </div>;
}
