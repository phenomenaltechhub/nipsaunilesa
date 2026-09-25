export type GalleryImage = {
  src: string;
  alt: string;
};

export type GalleryCollection = {
  title: string;
  description: string;
  images: GalleryImage[];
};

export const galleryCollections: GalleryCollection[] = [
  {
    title: "100 Level Physics Practical",
    description:
      "A look back at our current 300-level students during their 100-level physics practical session.",
    images: [
      {
        src: "/gallery/100-level-physics-practical-01.jpg",
        alt: "Students taking part in a 100-level physics practical session",
      },
      {
        src: "/gallery/100-level-physics-practical-02.jpg",
        alt: "Students working together during a 100-level physics practical session",
      },
      {
        src: "/gallery/100-level-physics-practical-03.jpg",
        alt: "Students learning during a 100-level physics practical session",
      },
      {
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
        src: "/gallery/chubenz.jpg",
        alt: "A student taking part in a 100-level biology practical session",
      },
    ],
  },
];
