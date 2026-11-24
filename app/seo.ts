import type { Metadata } from "next";

export const siteUrl = "https://nipsaunilesa.com.ng";
export const defaultSocialImage = "/nipsa-logo.png";

export function absoluteSiteUrl(path: string) {
  return path === "/" ? siteUrl : new URL(path, siteUrl).toString();
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  image?: string;
  imageAlt?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  image = defaultSocialImage,
  imageAlt = "NIPSA University of Ilesa logo",
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: absoluteSiteUrl(path),
    },
    openGraph: {
      title,
      description,
      url: absoluteSiteUrl(path),
      siteName: "NIPSA UNILESA",
      type,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
