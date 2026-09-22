import type { Metadata } from "next";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { executives } from "./data";
import { ExecutiveShowcase } from "./executive-showcase";

export const metadata: Metadata = {
  title: "Executives",
  description: "Meet the current executive leadership of the NIPSA UNILESA University of Ilesa Chapter.",
};

export default function ExecutivesPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/executives" />

      <main className="page-main container">
        <section className="executive-directory" aria-labelledby="executives-page-title">
          <div className="homepage-executive-heading">
            <p className="eyebrow">03 / OUR EXECUTIVES</p>
            <h1 id="executives-page-title">Meet Our Executive Team</h1>
            <p>A dedicated team of students working together to serve, represent, and create a better experience for every NIPSA member.</p>
          </div>
          <ExecutiveShowcase people={executives} />
        </section>
      </main>
      <Footer currentPath="/executives" />
    </div>
  );
}
