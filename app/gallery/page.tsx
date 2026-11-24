import type { Metadata } from "next";
import Image from "next/image";
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
              Browse photographs from the chapter archive, organised into practical-session albums.
              Image captions and contributor credits appear where supplied.
            </p>
            <p className="gallery-archive-count">
              {galleryCollections.length} albums <span aria-hidden="true">·</span> {galleryImages.length} photographs
            </p>
          </div>
        </section>

        <nav className="gallery-collection-nav" aria-label="Browse photo albums">
          {galleryCollections.map((collection, index) => {
            const cover = collection.images[0];
            if (!cover) return null;
            return (
              <a href={`#gallery-${collection.slug}`} key={collection.slug}>
                <span className="gallery-collection-cover">
                  <Image src={cover.src} alt="" fill sizes="(max-width: 640px) 42vw, 220px" />
                </span>
                <span className="gallery-collection-card-copy">
                  <small>Album {String(index + 1).padStart(2, "0")}</small>
                  <strong>{collection.title}</strong>
                  <small>{collection.images.length} {collection.images.length === 1 ? "photograph" : "photographs"}</small>
                </span>
              </a>
            );
          })}
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
