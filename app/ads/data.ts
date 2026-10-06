export type AdvertisementSocialPlatform =
  | "Instagram"
  | "Facebook"
  | "TikTok"
  | "LinkedIn"
  | "WhatsApp";

export type Advertisement = {
  id: string;
  /** Stable, URL-friendly identity slug derived from the ad identity; keep it when names change. */
  slug: string;
  /** Omitted listings are Basic; dedicated ad pages are limited to Premium tiers. */
  tier?: "basic" | "premium" | "premium-plus";
  businessName: string;
  category: string;
  subcategory?: string;
  description: string;
  differentiator: string;
  image: string;
  contactLabel: string;
  contactHref: string;
  visualMode?: "flyer-primary" | "logo-primary";
  /**
   * Admin-supplied homepage preview copy, limited to 1–2 short sentences.
   * An empty string means approved copy has not been supplied; do not generate it.
   */
  homepageNotification: string;
  featured?: boolean;
  location?: string;
  deliveryInfo?: string;
  isDemo?: boolean;
  listingLabel?: "DEMO AD" | "SAMPLE LISTING";
  socialHref?: string;
  socialLabel?: string;
  socialLinks?: { label: AdvertisementSocialPlatform; href: string }[];
  services?: string[];
  phone?: string;
  email?: string;
};

export const advertisementCategories = [
  "Food & Drinks",
  "Fashion",
  "Beauty",
  "Graphics & Design",
  "Photography",
  "Technology",
  "Printing & Academic Services",
  "Accessories",
  "Personal Services",
  "Other",
] as const;

export const advertisements: Advertisement[] = [
  {
    id: "wealthy-treats",
    slug: "wealthy-treats",
    businessName: "Wealthy Treats",
    category: "Food & Drinks",
    subcategory: "Snacks",
    description:
      "You finally found the Dodo Ikire that actually hits differently.✨ Stop settling for average snacks. Your tastebuds deserve a Wealthytreat. 🍫✨ We don’t just sell Dodo Ikire; we curate the finest, most authentic batches from the heart of Ikire, packaged with the hygiene and class you deserve.❤️ Soft, spicy-sweet, and consistently elite. No dry pieces, no stories. Just the gold standard of Nigerian snacks. 🇳🇬 Join the Wealthy Tribe. Secure your pack below: 👇",
    differentiator:
      "We offer not just a regular snack, but a finely curated indigenous healthy snack.",
    image: "/ads/wealthy-treats.jpg",
    contactLabel: "Call Wealthy Treats",
    contactHref: "tel:09115174619",
    socialHref: "https://wa.me/2349115174619?text=Hello,%20I%20want%20to%20order%20Dodo%20Ikire",
    socialLabel: "WhatsApp Wealthy Treats",
    homepageNotification: "",
    location: "School Premises",
    deliveryInfo: "Only in school premises",
    services: ["Dodo Ikire"],
    phone: "09115174619",
    email: "ayomideeniola968@gmail.com",
    featured: true,
  },
  {
    id: "pharmwear",
    slug: "pharmwear",
    businessName: "PharmWear",
    category: "Fashion",
    description:
      "Student-focused clothing and everyday pieces with clean, practical designs.",
    differentiator:
      "Easy-to-wear styles designed around student life and campus culture.",
    image: "/ads/pharmwear.svg",
    contactLabel: "Visit PharmWear",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=PharmWear%20Enquiry",
    homepageNotification:
      "Looking for everyday pieces made for student life? PharmWear offers clean, practical clothing and designs.",
    location: "Main campus market",
    deliveryInfo: "Campus pickup and local delivery",
    isDemo: true,
    listingLabel: "SAMPLE LISTING",
    featured: true,
  },
  {
    id: "niffygold-brand",
    slug: "niffygold-brand",
    businessName: "Niffygold Brand",
    category: "Graphics & Design",
    description:
      "Niffygold Brand is a creative design brand that helps individuals, businesses, organizations and brands communicate their ideas through clean, attractive and purposeful designs.",
    differentiator:
      "Niffygold Brand focuses on creating designs that are not just beautiful but also communicate clearly and serve a purpose. Every design is created with attention to detail, creativity and the client's specific needs.",
    image: "/ads/niffygold-brand.jpg",
    visualMode: "logo-primary",

    contactLabel: "Message Niffygold Brand on WhatsApp",
    contactHref: "https://wa.me/2349028609353",
    homepageNotification:
      "Need help with your next design? Niffygold Brand creates clean, purposeful designs for individuals, businesses, organisations and brands.",
    location: "Nigeria — serving clients remotely nationwide",
    deliveryInfo: "Remote services; designs delivered digitally through WhatsApp, email or other agreed platforms",
    services: [
      "Flyers",
      "Logo Design",
      "Social Media Carousels",
      "Watermarks",
      "Stickers",
      "Basic Social Media Graphics",
    ],
    socialLinks: [
      {
        label: "Instagram",
        href: "https://www.instagram.com/oluwanifemivictoriamoyebi?stkn=MWRpbDdjZzJvOGhidw==",
      },
      {
        label: "Facebook",
        href: "https://www.facebook.com/profile.php?id=100073441203208",
      },
    ],
    featured: true,
  },
  {
    id: "lenslab",
    slug: "lenslab",
    businessName: "LensLab",
    category: "Photography",
    description:
      "Photography services for portraits, events, academic milestones, and student projects.",
    differentiator:
      "Flexible student-focused photography packages for both individual and event needs.",
    image: "/ads/lenslab.svg",
    contactLabel: "Book a shoot",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=LensLab%20Enquiry",
    homepageNotification:
      "Planning portraits, an event or an academic milestone? LensLab offers photography for students and student projects.",
    location: "Ilesa and nearby events",
    deliveryInfo: "On-location and studio sessions",
    isDemo: true,
    listingLabel: "DEMO AD",
  },
  {
    id: "phenomenal-tech-hub",
    slug: "phenomenal-tech-hub",
    businessName: "PHENOMENAL TECH HUB",
    category: "Technology",
    description:
      "Technology support and ICT services covering computer repairs, upgrades, software installation, technical assistance, and device-selection guidance.",
    differentiator:
      "Practical technology support tailored to your needs, including guidance on choosing the right device for your requirements.",
    image: "/ads/phenomenal-tech-hub.jpg",
    visualMode: "flyer-primary",
    contactLabel: "Contact Phenomenal Tech Hub",
    contactHref: "https://wa.me/2348146702412",
    homepageNotification:
      "Need help with your computer or software? PHENOMENAL TECH HUB offers repairs, upgrades, installation, technical support and device-selection guidance.",
    deliveryInfo: "Remote support, appointments, and physical/on-site assistance where possible",
    socialHref: "mailto:officialpth.contact@gmail.com",
    socialLabel: "Email officialpth.contact@gmail.com",
    phone: "07011130579",
    email: "officialpth.contact@gmail.com",
  },
  {
    id: "glowhaus",
    slug: "glowhaus",
    businessName: "GlowHaus",
    category: "Beauty",
    description:
      "Beauty and personal-care services designed for students and young professionals.",
    differentiator:
      "Accessible beauty services with flexible arrangements for student schedules.",
    image: "/ads/glowhaus.svg",
    contactLabel: "Book a beauty session",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=GlowHaus%20Enquiry",
    homepageNotification:
      "Looking for beauty or personal-care services? GlowHaus offers student-friendly services with flexible arrangements.",
    location: "Student-friendly studio",
    deliveryInfo: "Appointments and small-group booking",
    isDemo: true,
    listingLabel: "DEMO AD",
  },
];

export function getAdvertisementBySlug(slug: string) {
  return advertisements.find((advertisement) => advertisement.slug === slug);
}

export function hasDedicatedAdPage(advertisement: Advertisement) {
  return advertisement.tier === "premium" || advertisement.tier === "premium-plus";
}

export function validateHomepageNotification(copy: string) {
  const sentences = copy.trim().match(/[^.!?]+[.!?]?/g)?.filter((sentence) => sentence.trim()) ?? [];
  return copy.trim().length > 0 && sentences.length <= 2;
}

export function getAdSummary(ad: Advertisement) {
  if (ad.services?.length) {
    return sanitizePublicAdCopy(ad.services.slice(0, 4).join(", "));
  }

  if (ad.description) {
    return sanitizePublicAdCopy(ad.description);
  }

  return `${ad.businessName} in ${ad.category}.`;
}

export function sanitizePublicAdCopy(copy: string) {
  return copy
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "")
    .replace(/\b(?:https?:\/\/|www\.)\S+|\b(?:wa\.me|(?:[\w-]+\.)+(?:com|net|org|ng|co|io|app|me|edu))\/?\S*/gi, "")
    .replace(/(?<!\w)@[A-Za-z0-9._]+/g, "")
    .replace(/(?<!\w)\+?(?:\d[\s().-]?){8,}\d(?!\w)/g, "")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function getSanitizedAdImage(ad: Advertisement) {
  return ad.image && ad.image.trim().length > 0 ? ad.image : "/file.svg";
}
