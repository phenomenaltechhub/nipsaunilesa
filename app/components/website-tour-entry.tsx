import Link from "next/link";
import styles from "./website-tour-entry.module.css";

function TourIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" /></svg>;
}

export default function WebsiteTourEntry({ placement }: { placement: "home" | "navigation" | "context" }) {
  if (placement === "navigation") return <Link className={styles.navigation} href="/website-tour"><TourIcon />Tour</Link>;
  if (placement === "context") return <p className={styles.context}>Need help finding your way? <Link href="/website-tour">Take the Website Tour <span aria-hidden="true">→</span></Link></p>;
  return <Link className={styles.home} href="/website-tour"><TourIcon /><span><strong>New here? Explore the website.</strong><small>Take the Website Tour or jump straight to a useful section.</small></span><span aria-hidden="true">→</span></Link>;
}
