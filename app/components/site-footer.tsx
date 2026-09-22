import Link from "next/link";

export default function Footer({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-top">
        <div>
          <div className="brand footer-brand">
            <span className="brand-logos" aria-label="NIPSA and University of Ilesa branding">
              <img className="brand-logo brand-logo--crest" src="/unilesa-logo.png" alt="University of Ilesa crest" />
              <img className="brand-logo brand-logo--nipsa" src="/nipsa-logo.png" alt="NIPSA logo" />
            </span>
            <span className="brand-copy">
              <span className="brand-name">NIPSA UNILESA</span>
              <span className="brand-subtitle">UNILESA – Department of Pharmacology</span>
            </span>
          </div>
          <p>CONSERVING HEALTH THROUGH RESEARCH.</p>
          <small>
            Nigerian Pharmacology Students Association
            <br />
            University of Ilesa Chapter
            <br />
            Department of Pharmacology, University of Ilesa, Ilesa, Osun State.
          </small>
        </div>
        <div className="footer-column">
          <b>Explore</b>
          <Link href="/about" aria-current={currentPath === "/about" ? "page" : undefined}>About NIPSA</Link>
          <Link href="/executives" aria-current={currentPath === "/executives" ? "page" : undefined}>Executives</Link>
          <Link href="/events" aria-current={currentPath === "/events" ? "page" : undefined}>Events</Link>
          <Link href="/announcements" aria-current={currentPath === "/announcements" ? "page" : undefined}>Announcements</Link>
          <Link href="/resources" aria-current={currentPath === "/resources" ? "page" : undefined}>Resources</Link>
        </div>
        <div className="footer-column">
          <b>Pharmily Connect</b>
          <Link href="/community" aria-current={currentPath === "/community" ? "page" : undefined}>Community</Link>
          <Link href="/contact" aria-current={currentPath === "/contact" ? "page" : undefined}>Contact</Link>
          <Link href="/resources" aria-current={currentPath === "/resources" ? "page" : undefined}>Resource library</Link>
          <Link href="/portal" aria-current={currentPath === "/portal" ? "page" : undefined}>Student Portal</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Nigerian Pharmacology Students Association, UNILESA Chapter. All Rights Reserved.</span>
        <span>Designed and Built by PHENOMENAL TECH HUB for curious minds</span>
      </div>
    </footer>
  );
}
