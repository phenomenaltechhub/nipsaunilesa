export type Executive = {
  slug: string;
  initials: string;
  name: string;
  role: string;
  tone: "mint" | "teal" | "cyan" | "lime";
  image?: string;
  email: string;
  intro: string;
  biography: string;
  officeDescription: string;
  responsibilities: string[];
  assumedOffice: string;
  tenure: string;
  message?: string;
};

export const executives: Executive[] = [
  {
    slug: "onifade-oluwamayowa-michael",
    initials: "OM",
    name: "ONIFADE OLUWAMAYOWA MICHAEL",
    role: "President",
    tone: "mint",
    image: "/images/President.jpg",
    email: "president@nipsaunilesa.com.ng",
    intro: "Provides overall leadership and represents NIPSA UNILESA in matters affecting its members.",
    biography: "The President coordinates the executive body and helps keep student welfare, representation, and constructive engagement at the centre of the association's work.",
    officeDescription: "The office provides overall direction for NIPSA activities and represents members in engagement with authorities and lecturers.",
    responsibilities: [
      "Coordinate the executive body and represent the association.",
      "Support student welfare and engagement with authorities and lecturers.",
      "Encourage academic, professional, and social initiatives for members.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
  },
  {
    slug: "john-edward-seedivine",
    initials: "JS",
    name: "JOHN-EDWARD SEED'IVINE",
    role: "Vice President",
    tone: "teal",
    image: "/images/Vice President.jpg",
    email: "vicepresident@nipsaunilesa.com.ng",
    intro: "Works closely with the President to support coordination, student welfare, and the work of the executive body.",
    biography: "The Vice President assists the President and helps maintain coordination across the association's offices and initiatives.",
    officeDescription: "The office supports executive coordination, oversees offices where necessary, and contributes to academic excellence and student welfare.",
    responsibilities: [
      "Assist the President with executive coordination.",
      "Oversee offices and delegated activities where necessary.",
      "Contribute to academic excellence and student welfare.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
  },
  {
    slug: "udom-edidiong-john",
    initials: "EJ",
    name: "UDOM EDIDIONG JOHN",
    role: "Secretary General",
    tone: "cyan",
    image: "/images/Secretary General.jpg",
    email: "secretarygeneral@nipsaunilesa.com.ng",
    intro: "Keeps official correspondence, documentation, and communication moving across the association.",
    biography: "The Secretary General supports the administrative life of NIPSA by documenting decisions and helping members stay informed.",
    officeDescription: "The office serves as an administrative link between the executive body and members through clear records and timely notices.",
    responsibilities: [
      "Manage official correspondence and documentation.",
      "Record minutes and communicate decisions and notices.",
      "Coordinate administrative activities and serve as a link with members.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
  },
  {
    slug: "adebokun-emmanuel-ayomide",
    initials: "E",
    name: "ADEBOKUN EMMANUEL AYOMIDE",
    role: "Assistant Secretary General",
    tone: "lime",
    image: "/images/Assistant Secretary General.jpg",
    email: "assistantsecretarygeneral@nipsaunilesa.com.ng",
    intro: "Supports the Secretary General with documentation, correspondence, communication, and delegated administrative work.",
    biography: "The Assistant Secretary General works alongside the Secretary General to keep administrative tasks organised and responsive.",
    officeDescription: "The office supports the secretariat and may act in place of the Secretary General when necessary and delegated.",
    responsibilities: [
      "Support correspondence, documentation, and communication.",
      "Assist with administrative activities and delegated duties.",
      "Act in place of the Secretary General when necessary and delegated.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
  },
  {
    slug: "oloruntola-oluwanifemi-rooney",
    initials: "OR",
    name: "OLORUNTOLA OLUWANIFEMI ROONEY",
    role: "Public Relations Officer (PRO)",
    tone: "cyan",
    image: "/images/Public Relations Officer.jpg",
    email: "publicrelationsofficer@nipsaunilesa.com.ng",
    intro: "Helps members receive timely information about NIPSA activities, opportunities, and conversations.",
    biography: "The PRO supports communication and engagement while helping NIPSA maintain a clear and welcoming public image.",
    officeDescription: "The office manages public communication, publicity, student feedback, and engagement around association activities.",
    responsibilities: [
      "Share timely information and publicise NIPSA activities and opportunities.",
      "Receive student feedback and communicate it appropriately.",
      "Support engagement and maintain the association's public image.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
  },
  {
    slug: "ajayi-precious-oluwabusola",
    initials: "AP",
    name: "AJAYI PRECIOUS OLUWABUSOLA",
    role: "Financial Secretary",
    tone: "mint",
    image: "/images/Financial Secretary.jpg",
    email: "financialsecretary@nipsaunilesa.com.ng",
    intro: "Supports accurate financial records, documentation, transparency, and accountability within NIPSA.",
    biography: "The Financial Secretary helps the association keep a clear account of its financial activity and resources.",
    officeDescription: "The office maintains financial records, monitors association funds, and supports responsible budgeting.",
    responsibilities: [
      "Keep financial records and supporting documentation.",
      "Monitor association funds and support budgeting.",
      "Promote transparency and accountability in financial activity.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
  },
  {
    slug: "idowu-victoria-opeyemi",
    initials: "IV",
    name: "IDOWU VICTORIA OPEYEMI",
    role: "Social Director",
    tone: "cyan",
    image: "/images/Social Director.jpg",
    email: "socialdirector@nipsaunilesa.com.ng",
    intro: "Builds participation and connection through creative social and recreational programmes.",
    biography: "The Social Director supports the social life of NIPSA by creating opportunities for interaction, participation, and community building.",
    officeDescription: "The office helps make NIPSA activities more engaging through social interaction, recreation, and creative programming.",
    responsibilities: [
      "Plan social and recreational programmes for members.",
      "Encourage participation, interaction, and community building.",
      "Bring creativity to activities and make engagement more welcoming.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
  },
  {
    slug: "adegoke-ademidun-fawaz",
    initials: "AF",
    name: "ADEGOKE ADEMIDUN FAWAZ",
    role: "Sport Director",
    tone: "teal",
    image: "/images/Sports Director.jpg",
    email: "sportsdirector@nipsaunilesa.com.ng",
    intro: "Supports sporting participation, teamwork, and healthy competition among NIPSA members.",
    biography: "The Sport Director helps students with sporting interests and talents find opportunities to participate and grow.",
    officeDescription: "The office coordinates sporting activities, competitions, training, and practice while encouraging sportsmanship.",
    responsibilities: [
      "Coordinate sporting activities and competitions.",
      "Encourage participation, training, practice, and teamwork.",
      "Support sportsmanship and students with sporting interests and talents.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
  },
  {
    slug: "oyebamiji-ifeoluwa",
    initials: "OI",
    name: "OYEBAMIJI IFEOLUWA",
    role: "Director of Academics",
    tone: "mint",
    email: "directorofacademics@nipsaunilesa.com.ng",
    intro: "Encourages learning beyond the classroom through continuous learning, knowledge sharing, and useful academic tools.",
    biography: "Oyebamiji Ifeoluwa is a Pharmacology student passionate about academic growth, continuous learning, and finding better ways to approach education. As Director of Academics, he is committed to creating an academic environment where students are encouraged to learn beyond the classroom, share knowledge, and make meaningful progress in their studies.",
    officeDescription: "The Office of the Director of Academics focuses on promoting academic excellence and supporting the educational development of NIPSA members. The office also seeks to introduce practical and innovative approaches to learning, helping students make better use of available academic resources and opportunities.",
    responsibilities: [
      "Promote academic excellence and a culture of continuous learning among NIPSA members.",
      "Identify and communicate useful academic resources, opportunities, and materials.",
      "Organize tutorials, academic programmes, seminars, and other learning-focused activities.",
      "Encourage peer learning, collaboration, and knowledge sharing among students.",
      "Support students in identifying effective approaches to studying and academic development.",
      "Explore innovative approaches and tools that can improve the learning experience of Pharmacology students.",
      "Work with the executive body to address academic concerns affecting members."
    ],
    assumedOffice: "30th November, 2026",
    tenure: "Until graduation",
    message: "Academics made priority"
  },
];

export function getExecutiveBySlug(slug: string) {
  return executives.find((executive) => executive.slug === slug);
}

export function getExecutiveOfficeLabel(role: Executive["role"]) {
  return `Office of The ${role}`;
}
