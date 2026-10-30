/** Rendering guard for curated ads; future submissions also need validation at ingestion. */
export function validateAdContactUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  const href = value.trim();
  // Reject parser-normalized controls, ambiguous backslashes and encoded control characters.
  if (!href || /[\u0000-\u0020\u007f-\u009f\\]/u.test(href) || /%(?:0[0-9a-f]|1[0-9a-f]|7f|25)/i.test(href)) return null;
  try {
    const url = new URL(href);
    if (url.protocol === "https:") {
      if (!/^https:\/\//i.test(href) || !url.hostname || url.username || url.password || (url.port && url.port !== "443")) return null;
      return url.href;
    }
    if (url.protocol === "tel:" && /^tel:\+?[0-9][0-9().-]{2,29}$/i.test(href)) {
      return `tel:${href.slice(4)}`;
    }
    if (url.protocol === "mailto:") {
      const contact = href.slice(7);
      const queryIndex = contact.indexOf("?");
      const address = queryIndex < 0 ? contact : contact.slice(0, queryIndex);
      const query = queryIndex < 0 ? undefined : contact.slice(queryIndex + 1);
      if (!/^[A-Z0-9.!#$%&'*+/=^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}$/i.test(address)) return null;
      // Only single-recipient mail, with subject/body; no injected cc/bcc or headers.
      if (href.includes("#")) return null;
      if (query !== undefined) {
        const params = new URLSearchParams(query);
        for (const [key, content] of params) {
          if (!["subject", "body"].includes(key) || /[\u0000-\u001f\u007f-\u009f]/u.test(content)) return null;
        }
      }
      return `mailto:${href.slice(7)}`;
    }
  } catch {
    return null;
  }
  return null;
}

const socialHosts = {
  whatsapp: ["wa.me", "whatsapp.com"],
  instagram: ["instagram.com"],
  facebook: ["facebook.com"],
  tiktok: ["tiktok.com"],
  linkedin: ["linkedin.com"],
} as const;

export function getAdUrlPlatform(value: string): keyof typeof socialHosts | undefined {
  const href = validateAdContactUrl(value);
  if (!href || !href.startsWith("https:")) return undefined;
  const hostname = new URL(href).hostname;
  for (const [platform, hosts] of Object.entries(socialHosts)) {
    if (hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
      return platform as keyof typeof socialHosts;
    }
  }
  return undefined;
}

/** Ads may only load reviewed assets from public/ads, never remote tracking URLs or data URIs. */
export function sanitizeAdImage(value: unknown): string {
  return typeof value === "string" && /^\/ads\/[a-zA-Z0-9_-]+\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(value)
    ? value
    : "/file.svg";
}
