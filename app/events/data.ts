export type EventLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type EventSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

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
  links?: EventLink[];
  details?: { label: string; value: string }[];
  sections?: EventSection[];
};

function parseEventDate(date: string) {
  const normalized = date.trim();

  if (!normalized) {
    return null;
  }

  const rangeMatch = normalized.match(/^(\d{1,2})\s*[–-]\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (rangeMatch) {
    const [, startDay, , monthName, year] = rangeMatch;
    const startDate = new Date(`${monthName} ${startDay}, ${year}`);
    return Number.isNaN(startDate.getTime()) ? null : startDate;
  }

  const singleMatch = normalized.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (singleMatch) {
    const [, day, monthName, year] = singleMatch;
    const parsed = new Date(`${monthName} ${day}, ${year}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const fallback = new Date(normalized);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export const events: EventItem[] = [
  {
    slug: "nipsa-day",
    title: "NIPSA DAY",
    category: "Student event",
    summary:
      "A day where Pharmacology students across chapters have their moment to celebrate the discipline, the community and, of course, ourselves.",
    description:
      "NIPSA Day is a celebration of Pharmacology students and the wider NIPSA community. It provides an opportunity for students to come together, celebrate their shared identity, strengthen chapter relationships, and highlight the role of Pharmacology in healthcare, research, and public health.",
    date: "07 May 2026",
    time: "To be confirmed",
    venue: "To be confirmed",
    status: "Details to be confirmed",
    tone: "green",
    details: [
      { label: "Date", value: "07 May 2026" },
      { label: "Time", value: "To be confirmed" },
      { label: "Venue", value: "To be confirmed" },
      { label: "Status", value: "Details to be confirmed" },
    ],
    links: [
      { label: "NIPSA National official website", href: "https://nipsa.com.ng/", external: true },
    ],
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "NIPSA Day is a celebration of Pharmacology students and the wider NIPSA community. It provides an opportunity for students to come together, celebrate their shared identity, strengthen chapter relationships, and highlight the role of Pharmacology in healthcare, research, and public health.",
          "For a chapter such as NIPSA UNILESA, the day can also serve as a platform for student engagement beyond the regular academic routine, bringing together different levels of students, chapter leadership, alumni, lecturers, and members of the wider university community.",
        ],
      },
      {
        heading: "What NIPSA Day can involve",
        paragraphs: [
          "The exact programme varies from chapter to chapter, but activities observed around NIPSA events and celebrations can include:",
        ],
        list: [
          "Academic and professional sessions — talks, discussions, seminars, or interactive sessions related to Pharmacology, healthcare, research, or professional development.",
          "Student engagement activities — activities designed to bring students from different levels together and encourage interaction within the chapter.",
          "Public-health awareness — discussions or campaigns that connect Pharmacology with medication safety, responsible medicine use, and broader health issues.",
          "Games and recreational activities — social or sporting activities that provide an informal setting for students to interact.",
          "Recognition and celebration — appreciation of students, executives, contributors, or achievements within the chapter.",
          "Networking and community building — opportunities for students to connect with colleagues, senior students, alumni, academics, and other members of the NIPSA community.",
        ],
      },
      {
        heading: "Why it matters",
        paragraphs: [
          "Beyond the celebration itself, NIPSA Day reinforces the sense of community among Pharmacology students. It provides a space to recognise the discipline, encourage student participation, and connect academic life with the professional and social community that students are becoming part of.",
          "These examples are intended to give visitors an idea of the type of activities that may accompany NIPSA Day. They are not a confirmed programme for the University of Ilesa chapter. The official UNILESA schedule will be reflected here when confirmed.",
        ],
      },
    ],
    additionalInfo: [
      "NIPSA Day is a community celebration and not yet confirmed as a fixed UNILESA programme.",
      "The official UNILESA schedule will be published here when it is formally confirmed.",
    ],
  },
  {
    slug: "nipsa-health-week",
    title: "NIPSA HEALTH WEEK",
    category: "Awareness campaign",
    summary: "A health-focused student engagement period designed to highlight wellness, awareness, and public health conversations.",
    description:
      "NIPSA Health Week is centred around health awareness, student engagement, and the role of Pharmacology students in promoting better understanding of medicines and public health.",
    date: "29 June 2026",
    time: "To be confirmed",
    venue: "To be confirmed",
    status: "Details to be confirmed",
    tone: "teal",
    details: [
      { label: "Date", value: "29 June 2026" },
      { label: "Time", value: "To be confirmed" },
      { label: "Venue", value: "To be confirmed" },
      { label: "Status", value: "Details to be confirmed" },
    ],
    links: [
      { label: "NIPSA National official website", href: "https://nipsa.com.ng/", external: true },
      { label: "NIPSA National About / relevant official information", href: "https://nipsa.com.ng/", external: true },
    ],
    sections: [
      {
        heading: "Overview",
        paragraphs: [
          "NIPSA Health Week is centred around health awareness, student engagement, and the role of Pharmacology students in promoting better understanding of medicines and public health.",
          "The initiative provides an opportunity for Pharmacology students to take what they learn beyond the classroom through educational activities, awareness campaigns, professional discussions, and community-focused engagement.",
          "NIPSA's national profile identifies public-health advocacy, including awareness around drug misuse and related health issues, as part of the association's wider objectives.",
        ],
      },
      {
        heading: "What Health Week can involve",
        paragraphs: [
          "Activities associated with NIPSA Health Week can vary between chapters and years. Examples observed across NIPSA-related activities include:",
        ],
        list: [
          "Health-awareness campaigns addressing relevant public-health concerns.",
          "Health education and sensitization for students and members of the wider community.",
          "Academic symposiums and seminars featuring discussions around Pharmacology, healthcare, medicines, research, and emerging health issues.",
          "Drug-safety and rational-use education, including conversations around responsible medicine use, medication risks, and drug-related misconceptions.",
          "Community outreach, where students engage members of the public with health information.",
          "Health checks or screening activities, where organised and supported by the appropriate professionals and partners.",
          "Public-health campaigns addressing issues such as antimicrobial resistance, drug misuse, self-medication, vaccination, or other locally relevant concerns. NIPSA's national profile specifically identifies public-health advocacy around AMR, drug misuse, and vaccine advocacy.",
          "Student wellness and engagement activities that encourage participation and interaction within the university community.",
        ],
      },
      {
        heading: "Why it matters",
        paragraphs: [
          "Health Week connects Pharmacology education with its practical role in society. Pharmacology students are trained to understand how medicines work, how they can be used safely, and how drug-related decisions affect individuals and communities.",
          "Through awareness and educational activities, Health Week provides a platform for students to contribute to conversations around medicine safety, rational drug use, public health, and responsible healthcare practices.",
          "As with NIPSA Day, the activities above are examples drawn from NIPSA activities and chapter practices, not a confirmed UNILESA programme. The University of Ilesa chapter's specific schedule will be added once officially confirmed.",
        ],
      },
    ],
    additionalInfo: [
      "Health Week is intentionally presented as an example-based awareness initiative rather than a confirmed UNILESA programme.",
      "The chapter-specific schedule will be added once officially confirmed.",
    ],
  },
  {
    slug: "nipsa-annual-convention",
    title: "NIPSA ANNUAL CONVENTION",
    category: "Annual gathering",
    summary: "A national gathering of Pharmacology students and healthcare stakeholders across NIPSA chapters for learning, competition, networking, and community engagement.",
    description:
      "The NIPSA Annual Convention is a national gathering that brings together Pharmacology students and members of the wider healthcare and academic community.",
    date: "19–24 October 2026",
    time: "To be confirmed",
    venue: "Delta State University, Abraka",
    status: "Official national schedule confirmed",
    tone: "cyan",
    details: [
      { label: "Event", value: "AEGIS '26 — NIPSA 2026 National Annual Convention" },
      { label: "Date", value: "19–24 October 2026" },
      { label: "Host institution", value: "Delta State University, Abraka" },
      { label: "Location", value: "Delta State, Nigeria" },
      { label: "Organizer", value: "Nigerian Pharmacology Students Association (NIPSA National)" },
    ],
    links: [
      { label: "NIPSA National — AEGIS '26 / Convention", href: "https://nipsa.com.ng/convention", external: true },
      { label: "NIPSA National official website", href: "https://nipsa.com.ng/", external: true },
    ],
    sections: [
      {
        heading: "About the Convention",
        paragraphs: [
          "The NIPSA Annual Convention is a national gathering that brings together Pharmacology students and members of the wider healthcare and academic community.",
          "At its core, the convention provides a setting for academic exchange, professional interaction, student competition, networking, leadership engagement, and social connection across NIPSA chapters.",
          "It allows students from different institutions to interact outside their individual campuses, exchange ideas, participate in academic and recreational activities, and engage with professionals and other members of the healthcare community.",
        ],
      },
      {
        heading: "AEGIS '26 — 2026 National Annual Convention",
        paragraphs: [
          "For 2026, NIPSA's national convention is officially presented as AEGIS '26.",
          "According to the official NIPSA convention page, AEGIS '26 will take place from 19–24 October 2026 at Delta State University (DELSU), Abraka, Delta State.",
          "This official national convention information supersedes older date references and reflects the confirmed AEGIS '26 schedule published by NIPSA National.",
        ],
      },
      {
        heading: "What is planned",
        paragraphs: [
          "The official NIPSA programme currently highlights a broad range of academic, competitive, health-focused, and social activities, including:",
        ],
        list: [
          "Seminars & Symposia — sessions involving speakers and discussions across Pharmacology, pharmacy, public health, healthcare, and related areas.",
          "Quizzes & Academic Competitions — academic competitions bringing students from different institutions together to test and demonstrate their knowledge.",
          "Debates — structured debates around significant issues, providing students with opportunities to research, discuss, and defend their positions.",
          "Sports Activities — inter-school and recreational sporting activities designed to encourage interaction and competition outside academic sessions.",
          "Health Walk & Sensitization Rally — a health-focused outreach activity extending the convention's engagement beyond the university campus and into the surrounding community.",
          "Movie Night — a social activity providing delegates with an opportunity to relax and interact outside the formal programme.",
          "Beach Fest — a recreational gathering included as part of the convention's social programme.",
          "Networking & Social Events — opportunities for delegates to meet students, academics, professionals, and other participants from different institutions and backgrounds.",
        ],
      },
      {
        heading: "Who can participate?",
        paragraphs: [
          "The official convention information identifies the event as being open to people within and around the Nigerian healthcare space, including:",
        ],
        list: [
          "Pharmacology and pharmacy students",
          "Students in health sciences and related disciplines",
          "Healthcare professionals",
          "Academics and researchers",
          "Industry participants",
          "Others interested in health, science, and medicine",
        ],
      },
      {
        heading: "Official programme highlights",
        paragraphs: [
          "Seminars & Symposia · Academic Competitions · Debates · Sports · Health Walk & Sensitization Rally · Movie Night · Beach Fest · Networking & Social Events",
        ],
      },
      {
        heading: "Official information",
        paragraphs: [
          "These activities are taken from the official AEGIS '26 convention information published by NIPSA National.",
          "The convention therefore extends beyond an individual university chapter and functions as a national gathering of students and other participants within the wider healthcare ecosystem.",
        ],
      },
    ],
    additionalInfo: [
      "AEGIS '26 is the official NIPSA National Annual Convention for 2026.",
      "Official convention information has been used for the programme and logistics on this page.",
    ],
  },
];

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function getEventTemporalStatus(event: Pick<EventItem, "date">, now = new Date()) {
  const startDate = parseEventDate(event.date);
  if (!startDate) {
    return "Upcoming";
  }

  return startDate < now ? "Past" : "Upcoming";
}
