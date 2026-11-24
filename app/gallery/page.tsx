import type { Metadata } from "next";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { BreadcrumbStructuredData } from "../components/seo-json-ld";
import { galleryCollections, galleryImages } from "./data";
import GalleryImageViewer from "./gallery-image-viewer";
import { createPageMetadata } from "../seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gallery",
  description:
    "Practical learning moments from NIPSA UNILESA and the Department of Pharmacology.",
  path: "/gallery",
});

export default function GalleryPage({ initialImageSlug }: { initialImageSlug?: string }) {
  const initialImage = initialImageSlug
    ? galleryImages.find((image) => image.slug === initialImageSlug)
    : undefined;

  return (
    <div className="nipsa-site page-shell">
      <BreadcrumbStructuredData
        items={
          initialImage
            ? [
                { name: "Home", path: "/" },
                { name: "Gallery", path: "/gallery" },
                {
                  name: initialImage.alt,
                  path: `/gallery/${initialImage.slug}`,
                },
              ]
            : [{ name: "Home", path: "/" }, { name: "Gallery", path: "/gallery" }]
        }
      />
      <Header currentPath="/gallery" />

      <main className="page-main container">
        <section className="gallery-page-intro page-hero" aria-labelledby="gallery-page-title">
          <div className="gallery-page-intro-copy">
            <p className="page-kicker">Chapter gallery</p>
            <h1 id="gallery-page-title" className="page-title">
              Learning in <em>practice.</em>
            </h1>
            <p className="page-subtitle">
              Browse the chapter&apos;s existing photographs, organised into practical-session albums.
              Captions use available descriptions; photographer credits appear only when supplied.
            </p>
            <p className="gallery-archive-count">
              {galleryCollections.length} albums <span aria-hidden="true">·</span> {galleryImages.length} photographs
            </p>
          </div>
        </section>

        <nav className="gallery-collection-nav" aria-label="Gallery collections">
          {galleryCollections.map((collection) => (
            <a href={`#gallery-${collection.slug}`} key={collection.slug}>
              <span>{collection.title}</span>
              <small>{collection.images.length} {collection.images.length === 1 ? "photograph" : "photographs"}</small>
            </a>
          ))}
        </nav>

        <GalleryImageViewer
          images={galleryImages}
          collections={galleryCollections}
          initialImageSlug={initialImageSlug}
        />
      </main>

      <Footer currentPath="/gallery" />
    </div>
  );
}
