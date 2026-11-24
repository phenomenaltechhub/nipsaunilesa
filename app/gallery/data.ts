export type GalleryImage = {
  slug: string;
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
};

export type GalleryCollection = {
  slug: string;
  title: string;
  description: string;
  images: GalleryImage[];
};

export type GalleryImageRecord = GalleryImage & {
  title: string;
  description: string;
  collectionSlug: string;
};

export const galleryCollections: GalleryCollection[] = [
  {
    slug: "physics-practical",
    title: "100 Level Physics Practical",
    description: "Photographs from the 100 Level Physics Practical collection.",
    images: [
      {
        slug: "100-level-physics-practical-01",
        src: "/gallery/100-level-physics-practical-01.jpg",
        alt: "Students taking part in a 100-level physics practical session",
      },
      {
        slug: "100-level-physics-practical-02",
        src: "/gallery/100-level-physics-practical-02.jpg",
        alt: "Students working together during a 100-level physics practical session",
      },
      {
        slug: "100-level-physics-practical-03",
        src: "/gallery/100-level-physics-practical-03.jpg",
        alt: "Students learning during a 100-level physics practical session",
      },
      {
        slug: "100-level-physics-practical-04",
        src: "/gallery/100-level-physics-practical-04.jpg",
        alt: "Students carrying out work during a 100-level physics practical session",
      },
    ],
  },
  {
    slug: "biology-practical",
    title: "100 Level Biology Practical",
    description: "A photograph from the 100 Level Biology Practical collection.",
    images: [
      {
        slug: "100-level-biology-practical",
        src: "/gallery/chubenz.jpg",
        alt: "A student taking part in a 100-level biology practical session",
      },
    ],
  },
];

export function getGalleryImageBySlug(slug: string) {
  for (const collection of galleryCollections) {
    const image = collection.images.find((item) => item.slug === slug);
    if (image) return { image, collection };
  }
  return undefined;
}

export const galleryImages = galleryCollections.flatMap((collection) =>
  collection.images.map((image) => ({
    ...image,
    title: collection.title,
    description: collection.description,
    collectionSlug: collection.slug,
  })),
);
