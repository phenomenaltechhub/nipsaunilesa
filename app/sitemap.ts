import type { MetadataRoute } from "next";
import { advertisements, hasDedicatedAdPage } from "./ads/data";
import { announcements } from "./announcements/data";
import { events } from "./events/data";
import { executives } from "./executives/data";
import { galleryImages } from "./gallery/data";
import { absoluteSiteUrl } from "./seo";

export const dynamic = "force-static";

const staticPaths = [
  "/",
  "/about",
  "/announcements",
  "/events",
  "/resources",
  "/ads",
  "/campus-navigator",
  "/community",
  "/contact",
  "/executives",
  "/gallery",
  "/portal",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...staticPaths,
    ...announcements.map(({ slug }) => `/announcements/${slug}`),
    ...events.map(({ slug }) => `/events/${slug}`),
    ...executives.map(({ slug }) => `/executives/${slug}`),
    ...galleryImages.map(({ slug }) => `/gallery/${slug}`),
    ...advertisements
      .filter(hasDedicatedAdPage)
      .map(({ slug }) => `/ads/${slug}`),
  ];

  return [...new Set(paths)].map((path) => ({
    url: absoluteSiteUrl(path),
  }));
}
