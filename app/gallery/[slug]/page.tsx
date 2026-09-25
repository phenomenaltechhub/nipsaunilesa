import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryPage from "../page";
import { galleryImages, getGalleryImageBySlug } from "../data";

type GalleryImagePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return galleryImages.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: GalleryImagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getGalleryImageBySlug(slug);
  if (!entry) notFound();

  return {
    title: entry.collection.title,
    description: entry.collection.description,
    openGraph: {
      title: entry.collection.title,
      description: entry.collection.description,
      images: [entry.image.src],
    },
  };
}

export default async function GalleryImagePage({ params }: GalleryImagePageProps) {
  const { slug } = await params;
  if (!getGalleryImageBySlug(slug)) notFound();

  return <GalleryPage initialImageSlug={slug} />;
}
