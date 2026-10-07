import { absoluteSiteUrl, siteUrl } from "../seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function StructuredData({ data }: { data: object }) {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: readonly BreadcrumbItem[];
}) {
  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteSiteUrl(item.path),
        })),
      }}
    />
  );
}

export const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Nigeria Pharmacology Students Association (NIPSA), University of Ilesa Chapter",
      alternateName: "NIPSA UNILESA",
      url: siteUrl,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "NIPSA UNILESA",
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};
