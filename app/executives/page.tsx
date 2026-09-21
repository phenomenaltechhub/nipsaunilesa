import type { Metadata } from "next";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { executives } from "./data";
import { ExecutiveShowcase } from "./executive-showcase";

export const metadata: Metadata = {
  title: "Executives",
  description: "Meet the current members of the Central Executives Council of NIPSA UNILESA chapter.",
};

export default function ExecutivesPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/executives" />

      <main className="page-main container">
        <section className="executive-directory" aria-label="NIPSA executives">
          <div className="homepage-executive-heading">
            <p className="eyebrow">OUR EXECUTIVES</p>
            <h2>Meet Our Executive Team</h2>
            <p>A dedicated team of students working together to serve, represent, and create a better experience for every NIPSA member.</p>
          </div>
          <ExecutiveShowcase />
        </section>
      </main>
      <Footer currentPath="/executives" />
    </div>
  );
}
