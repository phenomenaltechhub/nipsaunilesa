export type EventItem = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  date: string;
  time?: string;
  venue?: string;
  status?: string;
  image?: string;
  tone: "green" | "teal" | "cyan" | "lime" | "mint" | "amber";
  additionalInfo?: string[];
};

export const events: EventItem[] = [
  {
    slug: "nipsa-day",
    title: "NIPSA DAY",
    category: "Student event",
    summary:
      "A day where Pharmacology students across chapters have their moment to celebrate the discipline, the community and, of course, ourselves.",
    description:
      "NIPSA Day is a student-facing celebration of community, learning, and shared momentum across the Department of Pharmacology. The event brings together students, peers, and supporters around the values of academic growth, connection, and student leadership.",
    date: "07 May 2026",
    time: "Time to be confirmed",
    venue: "Venue to be confirmed",
    status: "Details to be confirmed",
    tone: "green",
    additionalInfo: [
      "This page will be updated as official event details are confirmed.",
      "The current information reflects the public event summary already available in the project.",
    ],
  },
  {
    slug: "nipsa-health-week",
    title: "NIPSA HEALTH WEEK",
    category: "Awareness campaign",
    summary: "A health-focused student engagement period designed to highlight wellness, awareness, and public health conversations.",
    description:
      "NIPSA Health Week is presented here as a public awareness and engagement initiative focused on health, wellness, and student learning. Full schedule and logistics are still to be confirmed by the organizing team.",
    date: "29 June 2026",
    time: "Time to be confirmed",
    venue: "Venue to be confirmed",
    status: "Details to be confirmed",
    tone: "teal",
    additionalInfo: [
      "The session schedule and exact venue are currently not official or publicly confirmed.",
      "This placeholder information is intentionally kept general until confirmed.",
    ],
  },
  {
    slug: "nipsa-annual-convention",
    title: "NIPSA ANNUAL CONVENTION",
    category: "Annual gathering",
    summary: "An annual student convention intended to convene members around discussions, updates, and community engagement.",
    description:
      "The NIPSA Annual Convention is a major student-facing gathering that may include leadership updates, academic engagement, and community-focused programming. Specific details remain to be confirmed by the organizing body.",
    date: "06 October 2026",
    time: "Time to be confirmed",
    venue: "Venue to be confirmed",
    status: "Details to be confirmed",
    tone: "cyan",
    additionalInfo: [
      "The final program, venue, and attendance details are not yet confirmed.",
      "This page remains intentionally general until official information is available.",
    ],
  },
];

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function getEventTemporalStatus(event: Pick<EventItem, "date">, now = new Date()) {
  return new Date(event.date) < now ? "Past" : "Upcoming";
}
