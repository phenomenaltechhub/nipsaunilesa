import type { Metadata } from "next";
import AdsPageContent from "./ads-page-content";

export const metadata: Metadata = {
  title: "Student Ads",
  description:
    "Discover student-led businesses, services, creators, and ventures featured in the NIPSA UNILESA Student Ads directory.",
};

export default function AdsPage() {
  return <AdsPageContent />;
}
