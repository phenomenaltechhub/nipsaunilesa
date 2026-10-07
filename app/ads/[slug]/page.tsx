import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../components/site-header";
import Footer from "../../components/site-footer";
import { BreadcrumbStructuredData } from "../../components/seo-json-ld";
import { AdActionLinks } from "../ad-action-links";
import AdShareButton from "../ad-share-button";
import { createPageMetadata, siteUrl } from "../../seo";
import {
  advertisements,
  getAdSummary,
  getAdvertisementBySlug,
  getSanitizedAdImage,
  hasDedicatedAdPage,
  sanitizePublicAdCopy,
} from "../data";
const noEligibleAdPageSlug = "__no-premium-listings__";

export const dynamicParams = false;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export async function generateStaticParams() {
  const eligibleAds = advertisements
    .filter(hasDedicatedAdPage)
    .map((ad) => ({ slug: ad.slug }));
  // Static export requires one generated dynamic path; this placeholder resolves to not-found.
  return eligibleAds.length ? eligibleAds : [{ slug: noEligibleAdPageSlug }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ad = getAdvertisementBySlug(slug);

  if (!ad || !hasDedicatedAdPage(ad)) {
    return {
      title: "Advertisement not found",
      description: "The requested advertisement could not be found.",
    };
  }

  const title = `${ad.businessName} | ${ad.category}`;
  const description = getAdSummary(ad);
  const imageUrl = getSanitizedAdImage(ad);

  return createPageMetadata({
    title,
    description,
    path: `/ads/${ad.slug}`,
    image: imageUrl,
    imageAlt: `${ad.businessName} advertisement`,
  });
}

export default async function AdvertisementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ad = getAdvertisementBySlug(slug);

  if (!ad || !hasDedicatedAdPage(ad)) {
    notFound();
  }

  const imageUrl = getSanitizedAdImage(ad);

  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", path: "/" },
          { name: "Student Ads", path: "/ads" },
          { name: ad.businessName, path: `/ads/${ad.slug}` },
        ]}
      />
      <Header currentPath="/ads" />

      <main className="page-main container ads-detail-page">
        <section className="ads-detail-hero">
          <div className="ads-detail-hero__content">
            <p className="page-kicker">Student marketplace</p>
            <h1 className="page-title ads-detail-title">{ad.businessName}</h1>
            <div className="ads-detail__meta-row">
              <span className="ads-card__category">
                {ad.category}{ad.subcategory ? ` · ${ad.subcategory}` : ""}
              </span>
            </div>
            <p className="page-subtitle ads-detail-subtitle">
              {sanitizePublicAdCopy(ad.description)}
            </p>

            <div className="ads-detail__actions" aria-label={`${ad.businessName} actions`}>
              <AdActionLinks ad={ad} />
              <AdShareButton
                businessName={ad.businessName}
                description={`${ad.category}. ${getAdSummary(ad)}`}
                url={`${siteUrl}/ads/${ad.slug}`}
              />
              <Link className="ads-detail__action ads-detail__action--secondary" href="/ads">
                Back to ads
                <Arrow />
              </Link>
            </div>
          </div>

          <div className={`ads-detail-visual ads-detail-visual--${ad.visualMode ?? "standard"}`}>
            <Image
              src={imageUrl}
              alt={`${ad.businessName} visual`}
              className="ads-detail-visual__image"
              width={1200}
              height={800}
              unoptimized
            />
            {ad.visualMode === "logo-primary" ? <div className="ads-detail-visual__watermark">{ad.businessName}</div> : null}
          </div>
        </section>

        <section className="ads-detail__main-grid">
          <article className="ads-detail__primary-card">
            {ad.services?.length ? (
              <div className="ads-card__services ads-card__services--detail">
                <span className="ads-card__detail-label">Services &amp; products</span>
                <ul>
                  {ad.services.map((service) => (
                    <li key={service}>{sanitizePublicAdCopy(service)}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {ad.differentiator ? (
              <div className="ads-card__detail-block ads-card__detail-block--detail">
                <span className="ads-card__detail-label">What makes us different</span>
                <p>{sanitizePublicAdCopy(ad.differentiator)}</p>
              </div>
            ) : null}
          </article>
        </section>
      </main>

      <Footer currentPath="/ads" />
    </div>
  );
}
