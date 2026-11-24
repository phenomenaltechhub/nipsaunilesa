export type AnnouncementItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  publishedAt: string;
  tone: "green" | "teal" | "cyan" | "lime" | "mint" | "amber";
  programme?: string;
  department?: string;
  institution?: string;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  eventStatus?: string;
  contentSections?: {
    heading: string;
    paragraphs?: string[];
    listItems?: string[];
  }[];
  relatedLinks?: {
    label: string;
    href: string;
  }[];
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
    publishedAt: "2026-08-18",
    tone: "green",
    contentSections: [
      {
        heading: "A starting point for student resources",
        paragraphs: [
          "The NIPSA Student Resource Hub brings together academic, departmental, orientation, and student-support materials that have been made available on the website.",
          "Resources are provided for students to consult and use in their academic preparation. Availability is shown on the relevant page; planned materials are not presented as already available.",
        ],
      },
      {
        heading: "Find and use available materials",
        paragraphs: [
          "Browse the Resources page to find current guides and the Orientation Checklist. The Student Portal links to these materials alongside academic support, study tips, announcements, and community information.",
        ],
      },
      {
        heading: "Academic support and future resources",
        paragraphs: [
          "For academic support, students can contact the listed academic support address. Additional materials may be added as they are prepared and approved; planned PHARMAIDEIA features are not part of the currently available public resource collection.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Browse academic resources", href: "/resources" },
      { label: "Visit the Student Portal", href: "/portal" },
      { label: "Email academic support", href: "mailto:academics@nipsaunilesa.com.ng" },
    ],
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
    summary:
      "An upcoming activity for incoming Pharmacology students, scheduled for 1 December 2026. Time and venue details will be communicated by the department.",
    description:
      "The Department of Pharmacology at the University of Ilesa will hold an orientation for incoming students on 1 December 2026. The event time is to be confirmed and the venue will be communicated by the department.",
    publishedAt: "2026-11-22",
    tone: "amber",
    programme: "Departmental Orientation",
    department: "Pharmacology",
    institution: "University of Ilesa",
    eventDate: "1st December 2026",
    eventTime: "To be confirmed",
    venue: "To be communicated by the department",
    eventStatus: "Upcoming",
    additionalInfo: [
      "Time and venue to be confirmed",
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
    publishedAt: "2026-08-08",
    tone: "teal",
    contentSections: [
      {
        heading: "Learn and collaborate with peers",
        paragraphs: [
          "Pharmacology students can learn alongside one another by discussing challenging topics, sharing study strategies, and making use of peer learning opportunities such as the existing study-circle community.",
        ],
      },
      {
        heading: "Take part in chapter life",
        paragraphs: [
          "The NIPSA UNILESA website shares student announcements, community information, and activities. Students can explore these pages to understand what is available and how to get involved.",
        ],
      },
      {
        heading: "Share information responsibly",
        paragraphs: [
          "Be considerate of other students, share information responsibly, and refer to official announcements for confirmed arrangements. Use the published contact routes when you need guidance or have a question.",
        ],
      },
    ],
    relatedLinks: [
      { label: "Explore the student community", href: "/community" },
      { label: "View official announcements", href: "/announcements" },
      { label: "Open the Student Portal", href: "/portal" },
    ],
    additionalInfo: [
      "More community information will be shared as it becomes available.",
    ],
    enquiries: {
      email: "info@nipsaunilesa.com.ng",
      purpose: "general information and guidance",
    },
  },
];

export function formatPublishedDate(publishedAt: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${publishedAt}T00:00:00.000Z`));
}

export function getAnnouncementBySlug(slug: string) {
  return announcements.find((announcement) => announcement.slug === slug);
}
