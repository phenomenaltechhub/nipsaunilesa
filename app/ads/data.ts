export type Advertisement = {
  id: string;
  businessName: string;
  category: string;
  description: string;
  differentiator: string;
  image: string;
  contactLabel: string;
  contactHref: string;
  featured?: boolean;
  location?: string;
  deliveryInfo?: string;
  isDemo?: boolean;
  listingLabel?: "DEMO AD" | "SAMPLE LISTING";
  socialHref?: string;
  socialLabel?: string;
  socialLinks?: { label: "Instagram" | "Facebook"; href: string }[];
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
    id: "campus-bites",
    businessName: "Campus Bites",
    category: "Food & Drinks",
    description: "Affordable meals, snacks, and drinks prepared with students in mind.",
    differentiator:
      "Convenient campus-friendly options with simple ordering and flexible pickup arrangements.",
    image: "/ads/campus-bites.svg",
    contactLabel: "Contact Campus Bites",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=Campus%20Bites%20Enquiry",
    location: "Near faculty blocks",
    deliveryInfo: "Pickup and student delivery available",
    featured: true,
    isDemo: true,
    listingLabel: "DEMO AD",
  },
  {
    id: "pharmwear",
    businessName: "PharmWear",
    category: "Fashion",
    description:
      "Student-focused clothing and everyday pieces with clean, practical designs.",
    differentiator:
      "Easy-to-wear styles designed around student life and campus culture.",
    image: "/ads/pharmwear.svg",
    contactLabel: "Visit PharmWear",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=PharmWear%20Enquiry",
    location: "Main campus market",
    deliveryInfo: "Campus pickup and local delivery",
    isDemo: true,
    listingLabel: "SAMPLE LISTING",
    featured: true,
  },
  {
    id: "pixelcraft-designs",
    businessName: "Niffygold Brand",
    category: "Graphics & Design",
    description:
      "Niffygold Brand is a creative design brand that helps individuals, businesses, organizations and brands communicate their ideas through clean, attractive and purposeful designs.",
    differentiator:
      "Niffygold Brand focuses on creating designs that are not just beautiful but also communicate clearly and serve a purpose. Every design is created with attention to detail, creativity and the client's specific needs.",
    image: "/ads/niffygold-brand.jpg",
    contactLabel: "Message Niffygold Brand on WhatsApp",
    contactHref: "https://wa.me/2349028609353",
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
    businessName: "LensLab",
    category: "Photography",
    description:
      "Photography services for portraits, events, academic milestones, and student projects.",
    differentiator:
      "Flexible student-focused photography packages for both individual and event needs.",
    image: "/ads/lenslab.svg",
    contactLabel: "Book a shoot",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=LensLab%20Enquiry",
    location: "Ilesa and nearby events",
    deliveryInfo: "On-location and studio sessions",
    isDemo: true,
    listingLabel: "DEMO AD",
  },
  {
    id: "phenomenal-tech-hub",
    businessName: "PHENOMENAL TECH HUB",
    category: "Technology",
    description:
      "Technology support and ICT services covering computer repairs, upgrades, software installation, technical assistance, and device-selection guidance.",
    differentiator:
      "Practical technology support tailored to your needs, including guidance on choosing the right device for your requirements.",
    image: "/ads/phenomenal-tech-hub.jpg",
    contactLabel: "Contact Phenomenal Tech Hub",
    contactHref: "https://wa.me/2348146702412",
    deliveryInfo: "Remote support, appointments, and physical/on-site assistance where possible",
    socialHref: "mailto:officialpth.contact@gmail.com",
    socialLabel: "Email officialpth.contact@gmail.com",
    phone: "07011130579",
    email: "officialpth.contact@gmail.com",
  },
  {
    id: "glowhaus",
    businessName: "GlowHaus",
    category: "Beauty",
    description:
      "Beauty and personal-care services designed for students and young professionals.",
    differentiator:
      "Accessible beauty services with flexible arrangements for student schedules.",
    image: "/ads/glowhaus.svg",
    contactLabel: "Book a beauty session",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=GlowHaus%20Enquiry",
    location: "Student-friendly studio",
    deliveryInfo: "Appointments and small-group booking",
    isDemo: true,
    listingLabel: "DEMO AD",
  },
  {
    id: "studyprint-hub",
    businessName: "StudyPrint Hub",
    category: "Printing & Academic Services",
    description:
      "Printing, document preparation, binding, and other academic support services.",
    differentiator:
      "Convenient academic printing and document support for students.",
    image: "/ads/studyprint-hub.svg",
    contactLabel: "Talk to StudyPrint Hub",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=StudyPrint%20Hub%20Enquiry",
    location: "Near campus atrium",
    deliveryInfo: "Quick print, bind, and pickup service",
    isDemo: true,
    listingLabel: "DEMO AD",
  },
  {
    id: "sweet-crumbs",
    businessName: "Sweet Crumbs",
    category: "Food & Drinks",
    description:
      "Homemade treats, pastries, and sweet snacks for everyday cravings and special occasions.",
    differentiator:
      "Freshly prepared treats with convenient ordering for students and small events.",
    image: "/ads/sweet-crumbs.svg",
    contactLabel: "Order from Sweet Crumbs",
    contactHref: "mailto:admin@nipsaunilesa.com.ng?subject=Sweet%20Crumbs%20Enquiry",
    location: "City centre pickup",
    deliveryInfo: "Orders for study days and events",
    isDemo: true,
    listingLabel: "SAMPLE LISTING",
  },
];
