import type { Metadata } from "next";
import Image from "next/image";
import Header from "../components/site-header";
import Footer from "../components/site-footer";
import { galleryCollections } from "./data";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Practical learning moments from NIPSA UNILESA and the Department of Pharmacology.",
};

export default function GalleryPage() {
  return (
    <div className="nipsa-site page-shell">
      <Header currentPath="/gallery" />

      <main className="page-main container">
        <section className="gallery-page-intro page-hero" aria-labelledby="gallery-page-title">
          <div className="gallery-page-intro-copy">
            <p className="page-kicker">Chapter gallery</p>
            <h1 id="gallery-page-title" className="page-title">
              Learning in <em>practice.</em>
            </h1>
            <p className="page-subtitle">
              A visual record of practical learning moments from our student community.
              These collections focus on foundational practical sessions.
            </p>
          </div>
        </section>

        <div className="gallery-collections">
          {galleryCollections.map((collection, collectionIndex) => (
            <section
              className="gallery-collection"
              key={collection.title}
              aria-labelledby={`gallery-collection-${collectionIndex}`}
            >
              <div className="gallery-collection-heading">
                <p className="eyebrow">{String(collectionIndex + 1).padStart(2, "0")} / PRACTICAL SESSION</p>
                <h2 id={`gallery-collection-${collectionIndex}`}>{collection.title}</h2>
                <p>{collection.description}</p>
              </div>
              <div className="gallery-grid">
                {collection.images.map((image) => (
                  <figure className="gallery-item" key={image.src}>
                    <div className="gallery-image-frame">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                        className="gallery-image"
                      />
                    </div>
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer currentPath="/gallery" />
    </div>
  );
}
