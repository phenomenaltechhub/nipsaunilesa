export type AnnouncementItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  date: string;
  tone: "green" | "teal" | "cyan" | "lime" | "mint" | "amber";
  additionalInfo?: string[];
  enquiries?: {
    email: string;
    purpose: string;
  };
};

export const announcements: AnnouncementItem[] = [
  {
    slug: "welcome-to-the-new-nipsa-student-resource-hub",
    title: "Welcome to the new NIPSA student resource hub",
    category: "Academic",
    summary: "A shared space for departmental updates, learning materials and community notes.",
    description:
      "This announcement introduces a shared space for departmental updates, learning materials, and community notes for NIPSA students and the wider community.",
    date: "18 Aug 2026",
    tone: "green",
    additionalInfo: [
      "Further resource hub information will be added as it is confirmed.",
    ],
    enquiries: {
      email: "academics@nipsaunilesa.com.ng",
      purpose: "academic-related enquiries",
    },
  },
  {
    slug: "departmental-orientation",
    title: "Departmental Orientation",
    category: "Important notice",
    summary: "A notice for dates, rooms and guidance that will be confirmed by the department.",
    description:
      "This is a departmental orientation notice. The dates, rooms, and guidance will be added when they are confirmed by the department.",
    date: "14 Aug 2026",
    tone: "amber",
    additionalInfo: [
      "Official orientation dates, rooms, and guidance are currently to be confirmed.",
    ],
    enquiries: {
      email: "info@nipsaunilesa.com.ng",
      purpose: "general information and official enquiries",
    },
  },
  {
    slug: "meet-your-student-community",
    title: "Meet your student community",
    category: "Community",
    summary: "Discover the people, groups and conversations helping pharmacology students move forward.",
    description:
      "This community note points students toward the people, groups, and conversations that support shared progress in pharmacology.",
    date: "08 Aug 2026",
    tone: "teal",
    additionalInfo: [
      "More community information will be shared as it becomes available.",
    ],
    enquiries: {
      email: "info@nipsaunilesa.com.ng",
      purpose: "general information and guidance",
    },
  },
];

export function getAnnouncementBySlug(slug: string) {
  return announcements.find((announcement) => announcement.slug === slug);
}