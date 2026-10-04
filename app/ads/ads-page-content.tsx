"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { advertisementCategories, advertisements, type Advertisement } from "./data";

const allCategories = ["All Ads", ...advertisementCategories] as const;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function SocialIcon({ label }: { label: "Instagram" | "Facebook" }) {
  if (label === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className="ads-social-icon__dot" cx="17.5" cy="6.8" r="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M13.8 21v-8.2h2.8l.4-3.2h-3.2v-2c0-.9.3-1.5 1.6-1.5h1.7V3.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.3H7.6v3.2h2.8V21z" />
    </svg>
  );
}

function AdCard({ ad }: { ad: Advertisement }) {
  return (
    <article className="ads-card" aria-label={`${ad.businessName} advertisement`}>
      <div className="ads-card__media-wrap">
        <img className="ads-card__image" src={ad.image} alt={`${ad.businessName} logo or placeholder`} />
      </div>

      <div className="ads-card__content">
        <div className="ads-card__header-row">
          <span className="ads-card__category">{ad.category}</span>
          <div className="ads-card__top-actions">
            {ad.featured ? <span className="ads-card__feature-badge">Featured</span> : null}
            {ad.listingLabel ? <span className="ads-card__demo-badge">{ad.listingLabel}</span> : null}
          </div>
        </div>

        <div className="ads-card__title-wrap">
          <h3>{ad.businessName}</h3>
        </div>

        <p className="ads-card__description">{ad.description}</p>

        {ad.services?.length ? (
          <div className="ads-card__services">
            <span className="ads-card__detail-label">PRODUCTS &amp; SERVICES</span>
            <ul>
              {ad.services.map((service) => <li key={service}>{service}</li>)}
            </ul>
          </div>
        ) : null}

        <div className="ads-card__detail-block">
          <span className="ads-card__detail-label">WHAT MAKES US DIFFERENT</span>
          <p>{ad.differentiator}</p>
        </div>

        <div className="ads-card__meta">
          {ad.location ? <span>{ad.location}</span> : null}
          {ad.deliveryInfo ? <span>{ad.deliveryInfo}</span> : null}
        </div>

        {(ad.phone || ad.email) ? (
          <div className="ads-card__support-links" aria-label={`${ad.businessName} contact details`}>
            {ad.phone ? (
              <a className="ads-card__support-link" href={`tel:${ad.phone.replace(/\s+/g, "")}`}>
                {ad.phone}
              </a>
            ) : null}
            {ad.email ? (
              <a className="ads-card__support-link" href={`mailto:${ad.email}`}>
                {ad.email}
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="ads-card__actions">
          <a
            className="ads-card__button"
            href={ad.contactHref}
            target={ad.socialLinks ? "_blank" : undefined}
            rel={ad.socialLinks ? "noopener noreferrer" : undefined}
          >
            {ad.contactLabel}
            <Arrow />
          </a>
          {ad.socialLinks?.length ? (
            <div className="ads-card__social-links" aria-label={`${ad.businessName} social media`}>
              {ad.socialLinks.map(({ label, href }) => (
                <a
                  key={label}
                  className="ads-card__social-button"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${ad.businessName} on ${label}`}
                  title={label}
                >
                  <SocialIcon label={label} />
                </a>
              ))}
            </div>
          ) : null}
          {ad.socialHref ? (
            <a className="ads-card__secondary-link" href={ad.socialHref}>
              {ad.socialLabel ?? "Business link"}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function AdsPageContent() {
  const [activeCategory, setActiveCategory] = useState<(typeof allCategories)[number]>("All Ads");

  const filteredAds = useMemo(() => {
    if (activeCategory === "All Ads") {
      return advertisements;
    }

    return advertisements.filter((ad) => ad.category === activeCategory);
  }, [activeCategory]);

  const featuredAds = advertisements.filter((ad) => ad.featured);

  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/ads" />

      <main className="page-main ads-page container">
        <section className="page-hero ads-hero">
          <div className="page-hero-grid ads-hero-grid">
            <div>
              <p className="page-kicker ads-kicker">Student Marketplace</p>
              <h1 className="page-title ads-title">
                Discover what students are building.
              </h1>
              <p className="page-subtitle ads-subtitle">
                Student Ads gives businesses, services, creators, and student entrepreneurs within the
                NIPSA UNILESA community a place to showcase what they offer.
              </p>
              <div className="page-cta-row ads-page-cta-row">
                <a className="button primary" href="#all-ads">
                  Browse ads <Arrow />
                </a>
                <a className="button secondary" href="#post-an-ad">
                  Submit Your Ad <Arrow />
                </a>
              </div>
            </div>
            <aside className="page-hero-aside ads-side-panel">
              <span className="mini-label">Community directory</span>
              <strong className="big-stat">Business listings</strong>
              <p>
                A local discovery space for student-led businesses, services, and creative ventures.
              </p>
            </aside>
          </div>
        </section>

        <section aria-label="Featured ads" className="ads-section">
          <div className="section-intro ads-section-intro">
            <p className="eyebrow">FEATURED ADS</p>
            <h2>
              Student ventures worth a <em>look</em>
            </h2>
          </div>

          <div className="ads-feature-grid">
            {featuredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </section>

        <section aria-label="Browse by category" className="ads-section ads-section--soft">
          <div className="section-intro ads-section-intro">
            <p className="eyebrow">BROWSE BY CATEGORY</p>
            <h2>
              Find the right <em>fit</em>
            </h2>
          </div>

          <div className="ads-category-filter" role="tablist" aria-label="Filter ads by category">
            {allCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`ads-category-button${activeCategory === category ? " is-active" : ""}`}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section id="all-ads" aria-label="All ads" className="ads-section">
          <div className="section-intro ads-section-intro ads-section-intro--split">
            <div>
              <p className="eyebrow">ALL ADS</p>
              <h2>
                Explore the full <em>directory</em>
              </h2>
            </div>
            <p className="ads-section-copy">{activeCategory === "All Ads" ? "All available listings." : `${activeCategory} listings.`}</p>
          </div>

          <div className="ads-grid">
            {filteredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        </section>

        <section id="post-an-ad" className="ads-section ads-section--compact">
          <div className="ads-post-card">
            <span className="card-tag">Post an Ad</span>
            <h2>Share a student-led venture with the community.</h2>
            <p>
              Got a student business, service, or creative venture to share? Contact NIPSA with
              your business details and we can review it for inclusion in Student Ads.
            </p>
            <a className="ads-card__button ads-card__button--compact" href="mailto:admin@nipsaunilesa.com.ng?subject=Student%20Ads%20Submission">
              Submit Your Ad
              <Arrow />
            </a>
          </div>
        </section>

        <section className="ads-section ads-section--compact" aria-label="Advertising guidelines">
          <div className="section-intro ads-section-intro">
            <p className="eyebrow">ADVERTISING GUIDELINES</p>
            <h2>
              Keep your Ad info useful and <em>credible</em>
            </h2>
          </div>

          <div className="ads-guidelines">
            <ul className="ads-guidelines-list">
              <li>Information should be accurate and kept reasonably up to date.</li>
              <li>Offers and descriptions should be clear and not misleading.</li>
              <li>Images should be appropriate and relevant.</li>
              <li>Respect the university environment and NIPSA community.</li>
              <li>Advertisements should be relevant to the purpose of Student Ads.</li>
              <li>NIPSA may review submitted listings before publication.</li>
            </ul>
          </div>
        </section>

        <section className="ads-section ads-section--compact" aria-label="Future sustainability">
          <div className="ads-sustainability">
            <span className="card-tag">Future potential</span>
            <h2>A space that can grow with the community</h2>
            <p>
              Student Ads can eventually become a sustainable part of the NIPSA platform, with options
              such as featured placements or sponsored listings helping support future student-focused
              initiatives.
            </p>
          </div>
        </section>
      </main>

      <Footer currentPath="/ads" />
    </div>
  );
}
