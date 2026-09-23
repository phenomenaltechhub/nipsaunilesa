export type SocialPlatform = "instagram" | "facebook" | "x" | "linkedin" | "whatsapp" | "tiktok";

export type SocialLinkItem = {
  platform: SocialPlatform;
  label: string;
  href?: string;
};

export const socialLinks: SocialLinkItem[] = [
  { platform: "instagram", label: "Instagram" },
  { platform: "facebook", label: "Facebook" },
  { platform: "x", label: "X" },
  { platform: "linkedin", label: "LinkedIn" },
  { platform: "whatsapp", label: "WhatsApp" },
  { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@pharmily.unilesha" },
];

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (platform) {
    case "instagram":
      return (
        <svg {...commonProps}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...commonProps}>
          <path d="M14.5 8.2h2.2V4.8h-2.7c-3 0-4.5 1.9-4.5 4.5v2.1H7.5v3.3h2.1v5.8h3.5v-5.8h2.7l.5-3.3h-3.2V9.7c0-1 .7-1.5 1.4-1.5Z" />
        </svg>
      );
    case "x":
      return (
        <svg {...commonProps}>
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8.3 10.2v6.1M8.3 7.6v.1M12 16.3v-3.5c0-1.3 1.1-2.4 2.4-2.4s2.1 1.1 2.1 2.5v3.4" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...commonProps}>
          <path d="M6.5 17.6 5.5 19l1.4-4.1A8.1 8.1 0 1 1 6.5 17.6Z" />
          <path d="M9.4 8.7c.3-.5.7-.6 1-.6.3 0 .7 0 1 .4.2.3.6.9.6 1.9 0 1-.6 1.9-1 2.2-.3.3-.8.7-1.1 1.1-.3.3-.6.8-.2 1.5.3.7 1.3 1.8 2.4 2.5 1.1.7 1.9.9 2.6.8.7-.1 1.1-.8 1.3-1.3.2-.5.1-1-.2-1.4l-.7-.9c-.3-.3-.7-.4-1.1-.1l-.4.3c-.3.2-.7.5-1.2.1-.6-.4-1.4-1.2-2-2.1-.6-.8-.7-1.1-.5-1.5l.3-.4c.2-.3.3-.7 0-1l-.8-1.2c-.3-.4-.5-.4-.8-.4h-.1c-.2 0-.5.1-.7.3l-.5.6Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...commonProps}>
          <path d="M14.5 4.5c.8 1.2 1.9 2 3.3 2.3v2.6c-1.4 0-2.7-.4-3.8-1.2v6.7a4.7 4.7 0 1 1-4.7-4.7c.3 0 .6 0 .9.1v2.8a2.2 2.2 0 1 0 1.6 2.1V4.5h2.7Z" />
        </svg>
      );
    default:
      return null;
  }
}

export function SocialLinkGroup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`social-link-group${compact ? " social-link-group--compact" : ""}`} aria-label="NIPSA UNILESA social media channels">
      {socialLinks.map((item) => {
        const icon = <SocialIcon platform={item.platform} />;

        if (!item.href) {
          return (
            <button
              key={item.platform}
              type="button"
              className="social-button social-button--inactive"
              aria-label={`${item.label} (not configured)`}
              title={`${item.label} is not configured yet`}
              disabled
            >
              {icon}
            </button>
          );
        }

        return (
          <a
            key={item.platform}
            href={item.href}
            className="social-button"
            aria-label={item.label}
            title={item.label}
            target="_blank"
            rel="noopener noreferrer"
          >
            {icon}
          </a>
        );
      })}
    </div>
  );
}
