import Link from "next/link";
import { navItems } from "../config/navigation";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function BrandLink() {
  return (
    <Link className="brand" href="/">
      <span className="brand-logos" aria-label="NIPSA and University of Ilesa branding">
        <img className="brand-logo brand-logo--crest" src="/unilesa-logo.png" alt="University of Ilesa crest" />
        <img className="brand-logo brand-logo--nipsa" src="/nipsa-logo.png" alt="NIPSA logo" />
      </span>
      <span className="brand-copy">
        <span className="brand-name">NIPSA UNILESA</span>
        <span className="brand-subtitle">UNILESA – Department of Pharmacology</span>
      </span>
    </Link>
  );
}

export default function Header({ currentPath = "/" }: { currentPath?: string }) {
  return (
    <header className="site-header">
      <nav className="nav container" aria-label="Main navigation">
        <BrandLink />
        <div className="nav-links" aria-label="Main navigation links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.href === currentPath ? "active" : undefined}
              aria-current={item.href === currentPath ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link className="mobile-portal-link" href="/portal">
            Student Portal <Arrow />
          </Link>
        </div>
        <Link className="portal-button" href="/portal">
          Student Portal <Arrow />
        </Link>
      </nav>
    </header>
  );
}
