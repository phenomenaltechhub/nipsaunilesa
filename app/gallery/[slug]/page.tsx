import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryPage from "../page";
import { galleryImages, getGalleryImageBySlug } from "../data";
import { createPageMetadata } from "../../seo";

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

  return createPageMetadata({
    title: entry.collection.title,
    description: entry.collection.description,
    path: `/gallery/${entry.image.slug}`,
    image: entry.image.src,
    imageAlt: entry.image.alt,
  });
}

export default async function GalleryImagePage({ params }: GalleryImagePageProps) {
  const { slug } = await params;
  if (!getGalleryImageBySlug(slug)) notFound();

  return <GalleryPage initialImageSlug={slug} />;
}
