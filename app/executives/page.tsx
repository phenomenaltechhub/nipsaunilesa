import type { Metadata } from "next";
import Link from "next/link";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import { executives } from "./data";
import { ExecutiveShowcase } from "./executive-showcase";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata({
  title: "Executives",
  description: "Meet the current executive leadership of the NIPSA University of Ilesa Chapter.",
  path: "/executives",
});

export default function ExecutivesPage() {
  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Executives", path: "/executives" }]} />
      <Header currentPath="/executives" />

      <main className="page-main container">
        <section className="executive-directory" aria-labelledby="executives-page-title">
          <div className="homepage-executive-heading">
            <p className="eyebrow">03 / OUR EXECUTIVE COUNCIL</p>
            <h1 id="executives-page-title">Meet the NIPSA Executive Council</h1>
            <p>
              A dedicated team of students working together to serve, represent, and create a better
              experience for every NIPSA member. <Link href="/about">Learn about NIPSA</Link>.
            </p>
          </div>
          <ExecutiveShowcase people={executives} />
        </section>
      </main>
      <Footer currentPath="/executives" />
    </div>
  );
}
