import type { Metadata } from "next";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import AdsPageContent from "./ads-page-content";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata({
  title: "Student Ads",
  description:
    "Discover student-led businesses, services, creators, and ventures featured in the NIPSA UNILESA Student Ads directory.",
  path: "/ads",
});

export default function AdsPage() {
  return (
    <>
      <BreadcrumbStructuredData items={[{ name: "Home", path: "/" }, { name: "Student Ads", path: "/ads" }]} />
      <AdsPageContent />
    </>
  );
}
