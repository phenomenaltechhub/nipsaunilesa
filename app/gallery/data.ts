export type GalleryImage = {
  slug: string;
  src: string;
  alt: string;
};

export type GalleryCollection = {
  title: string;
  description: string;
  images: GalleryImage[];
};

export type GalleryImageRecord = GalleryImage & {
  title: string;
  description: string;
};

export const galleryCollections: GalleryCollection[] = [
  {
    title: "100 Level Physics Practical",
    description:
      "A look back at our current 300-level students during their 100-level physics practical session.",
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
    title: "100 Level Biology Practical",
    description:
      "A look back at one of our current 300-level students during a 100-level biology practical session.",
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
  })),
);
