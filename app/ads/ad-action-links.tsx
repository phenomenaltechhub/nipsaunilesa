import { SocialIcon, type SocialPlatform } from "../components/social-links";
import type { Advertisement } from "./data";

type AdAction = {
  href: string;
  label: string;
  platform?: SocialPlatform;
};

function getUrlPlatform(url: string): SocialPlatform | undefined {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes("wa.me") || normalizedUrl.includes("whatsapp")) return "whatsapp";
  if (normalizedUrl.includes("instagram.com")) return "instagram";
  if (normalizedUrl.includes("facebook.com")) return "facebook";
  if (normalizedUrl.includes("tiktok.com")) return "tiktok";
  if (normalizedUrl.includes("linkedin.com")) return "linkedin";
  return undefined;
}

function getActionLabel(url: string) {
  if (url.startsWith("mailto:")) return "Email";
  if (url.startsWith("tel:")) return "Call";
  const platform = getUrlPlatform(url);
  if (platform) {
    return platform === "whatsapp"
      ? "WhatsApp"
      : platform.charAt(0).toUpperCase() + platform.slice(1);
  }
  return "Visit";
}

function getAdActions(ad: Advertisement): AdAction[] {
  const actions: AdAction[] = [];
  const add = (href: string | undefined) => {
    if (!href || actions.some((action) => action.href === href)) return;
    const platform = getUrlPlatform(href);
    actions.push({ href, label: getActionLabel(href), platform });
  };

  add(ad.contactHref);
  if (ad.phone) add(`tel:${ad.phone.replace(/\s+/g, "")}`);
  if (ad.email) add(`mailto:${ad.email}`);
  add(ad.socialHref);
  ad.socialLinks?.forEach(({ href }) => add(href));

  return actions;
}

function DestinationIcon({ action }: { action: AdAction }) {
  if (action.platform) return <SocialIcon platform={action.platform} />;
  if (action.href.startsWith("mailto:")) return <span aria-hidden="true">✉</span>;
  if (action.href.startsWith("tel:")) return <span aria-hidden="true">☎</span>;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14 4h6v6M20 4 11 13" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

function isIconOnly(action: AdAction) {
  return action.platform !== undefined && action.platform !== "whatsapp";
}

export function AdActionLinks({ ad }: { ad: Advertisement }) {
  return (
    <>
      {getAdActions(ad).map((action) => (
        <a
          key={action.href}
          className={`ads-card__action-button${isIconOnly(action) ? " is-icon-only" : ""}`}
          href={action.href}
          target={action.href.startsWith("http") ? "_blank" : undefined}
          rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={`${action.label} ${ad.businessName}`}
          title={action.label}
        >
          <DestinationIcon action={action} />
          {!isIconOnly(action) ? <span>{action.label}</span> : null}
        </a>
      ))}
    </>
  );
}
