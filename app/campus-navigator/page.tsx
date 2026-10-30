import type { Metadata } from "next";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import { createPageMetadata } from "../seo";
import Navigator from "./navigator";
import "leaflet/dist/leaflet.css";
import styles from "./navigator.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Campus Navigator — Interactive Preview",
  description: "Search university directory records and review their verification status. Precise campus mapping is being prepared for the University of Ilesa.",
  path: "/campus-navigator",
});

export default function CampusNavigatorPage() {
  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Campus Navigator", path: "/campus-navigator" }]} />
      <Header currentPath="/campus-navigator" />
      <main className={`page-main container ${styles.page}`}>
        <section className={styles.hero} aria-labelledby="campus-navigator-title">
          <div><p className={styles.previewBadge}><span /> Campus Navigator — Interactive Preview</p><h1 id="campus-navigator-title">Find your way.<br /><em>Know your campus.</em></h1><p className={styles.lead}>Explore the Campus Navigator preview through a searchable directory and source-linked record profiles. Campus locations and map features will be added only as official information and precise destinations are verified.</p><p className={styles.heroNote}>University of Ilesa <span aria-hidden="true">/</span> Public preview · under development</p></div>
          <aside className={styles.heroAside}><span aria-hidden="true">↗</span><strong>Start with what<br />we can verify.</strong><p>A directory record is not a building pin. Precise positions appear only after geographical verification.</p></aside>
        </section>
        <Navigator />
      </main>
      <Footer currentPath="/campus-navigator" />
    </div>
  );
}
