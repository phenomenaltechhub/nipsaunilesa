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
    biography: "Onifade Oluwamayowa Michael is a purpose-driven Pharmacology student with a strong passion for leadership, student advocacy, and positive change. He believes effective leadership is built on service, accountability, communication, and genuine representation. As President, he is committed to promoting student engagement, academic and personal development, and meaningful opportunities for NIPSA members.",
    officeDescription: "The Office of the President provides overall direction for NIPSA-UNILESA, coordinates the executive team, represents the interests and welfare of members, and ensures that the association remains focused on the needs of its students. The President also liaises with relevant authorities and supports initiatives that improve the academic, professional, and social experience of NIPSA members.",
    responsibilities: [
     "Oversee the affairs and activities of NIPSA-UNILESA.",
     "Represent the interests and welfare of NIPSA members.",
     "Liaise with lecturers and relevant authorities on student matters.",
     "Coordinate the executive team and promote unity within the association.",
     "Initiate and support academic, professional, and social programmes for members.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
    message: "Like I said during my campaign and in my manifesto, I have not come to make empty promises; I have come to show workings by all means possible. You have given me your support, and it is now my turn to do the needful. Together, we will move NIPSA-UNILESA forward.",
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
    biography: "John-Edward Seed'ivine is a Pharmacology student with a strong interest in technology, innovation and problem-solving. As a technology enthusiast and active builder, he is passionate about using technology and creative ideas to solve real problems and create meaningful impact. He brings this innovative mindset, alongside his commitment to academic growth and student development, into his role as Vice President of NIPSA-UNILESA.",
    officeDescription: "I work closely with the President in providing direction for student governance, oversee the activities of the various offices and ensure that every office works towards the collective interests of the students and the association chapter.",
    responsibilities: [
      "Assist and act on behalf of the President when necessary.",
      "Work closely with the President in making decisions concerning the association.",
      "Oversee and coordinate the activities of the various offices.",
      "Promote academic excellence and support initiatives that improve the academic welfare of members.",
      "Take responsibility for the effective coordination of executive activities as assigned by the President.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
    message: "My message to every NIPSA member is simple: this administration is for all of us. I believe we can do things differently, challenge the status quo and look beyond what has always been done to build solutions that genuinely make a difference in reality. Innovation is not just about technology; it is about being willing to question existing ways of doing things, recognise opportunities for improvement and take meaningful action. As Vice President, I will bring that mindset into this administration while working closely with the President, the executives and every NIPSA member to build a more united, active and progressive chapter.",
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
    biography: "Udom Edidiong John is the General Secretary of the Nigeria Pharmacology Students Association (NIPSA). He is committed to effective communication, proper documentation, and supporting the executive body in ensuring the smooth administration of the association.",
    officeDescription: "I manage official correspondence, prepare and keep accurate records and minutes of meetings, communicate decisions and notices to the house and ensure proper documentation of organizational affairs. I also support the leadership in implementing decisions and serve as an important link between the executive body and the students.",
    responsibilities: [
      "Manage official correspondence and documentation.",
      "Record minutes and communicate decisions and notices.",
      "Coordinate administrative activities and serve as a link with members.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
    message: "It is a privilege to serve as your General Secretary. I look forward to working with the executive body and every NIPSA member to promote effective communication, proper representation, and a more organized association. Together, let us make this tenure meaningful, productive, and impactful.",
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
    biography: "Adebokun Emmanuel Ayomide is a Pharmacology student committed to effective administration, communication, and teamwork. As Assistant Secretary General, he supports the Secretary General in ensuring that the administrative affairs of NIPSA are properly coordinated and documented.",
    officeDescription: "The Office of the Assistant Secretary General supports the Secretary General in managing the administrative affairs of the association, maintaining proper documentation, and ensuring effective communication between the executive body and NIPSA members.",
    responsibilities: [
      "Support correspondence, documentation, and communication.",
      "Assist with administrative activities and delegated duties.",
      "Act in place of the Secretary General when necessary and delegated.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
    message: "I am committed to supporting the Secretary General and the executive body in building a more organized, transparent, and effective NIPSA. Together, we will ensure that information is properly communicated, records are well kept, and every member remains connected to the affairs of the association.",
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
    biography: "Oloruntola Oluwanifemi Rooney is a Pharmacology student and a dedicated student leader committed to effective communication, transparency, and meaningful student representation. As Public Relations Officer, he is focused on keeping NIPSA members informed, connected, and actively involved in the affairs of the association.",
    officeDescription: "The Office of the Public Relations Officer is responsible for managing the association’s public communication, sharing accurate and timely information, promoting NIPSA activities, and maintaining a strong connection between the executive body and students.",
    responsibilities: [
      "Share timely information and publicise NIPSA activities and opportunities.",
      "Receive student feedback and communicate it appropriately.",
      "Support engagement and maintain the association's public image.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
    message: "I am committed to keeping every NIPSA member informed, connected, and heard. Together, we can build a more open, united, and active association where communication works for everyone.",
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
    biography: " I am a dedicated Pharmacology student committed to transparency, accountability, and student development.",
    officeDescription: "The Office of the Financial Secretary oversees the association’s financial records, income and expenditure, and proper management of association funds.",
    responsibilities: [
      "Keep financial records and supporting documentation.",
      "Monitor association funds and support budgeting.",
      "Promote transparency and accountability in financial activity.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
    message: "Together, we will build an association where every fund has a purpose, every student has a voice, and every opportunity is used to move us forward.",
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
    biography: "Idowu Victoria Opeyemi is a Pharmacology student passionate about creating engaging social experiences for students. As Social Director, she is committed to fostering a sense of community and belonging through well-planned social activities and events that encourage interaction, creativity, and enjoyment among NIPSA members.",
    officeDescription: "The office coordinates social and recreational programmes, student engagement, and community-building activities to enhance the overall student experience.",
    responsibilities: [
      "Coordinate social and recreational programmes and events.",
      "Encourage student engagement, interaction, and community-building.",
      "Support creativity, enjoyment, and a vibrant social environment for members.",
      "Promote a sense of belonging and inclusivity through social initiatives.",
      "Foster collaboration and teamwork among students through social activities.",
      "Encourage participation in social events and recreational opportunities.",
      "Support the development of leadership and organizational skills through event planning and coordination.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
    message: "I am committed to creating a vibrant and inclusive social environment for all NIPSA members. Let's make our time together memorable and enjoyable!"
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
    biography: "Adegoke Ademidun Fawaz is a Pharmacology student at the University of Ilesa. He is passionate about sports, teamwork, and student development, and is committed to promoting active participation and sporting excellence among NIPSA members.",
    officeDescription: "The Office of the Sport Director is responsible for coordinating and promoting sporting activities within NIPSA, encouraging students to participate in different sports, and supporting athletes in representing the association effectively.",
    responsibilities: [
      "Coordinate sporting activities and competitions.",
      "Encourage participation, training, practice, and teamwork.",
      "Support sportsmanship and students with sporting interests and talents.",
    ],
    assumedOffice: "7th September, 2026",
    tenure: "Until graduation",
    message: "Together, we build a stronger NIPSA through unity, participation, and excellence in sports.",
  },
  {
    slug: "oyebamiji-ifeoluwa",
    initials: "OI",
    name: "OYEBAMIJI IFEOLUWA",
    role: "Director of Academics",
    tone: "mint",
    image: "/images/Director of Academics.jpg",
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
    message: "I believe learning should not be limited to what happens in the classroom. There is always a better way to understand, create, share, and apply knowledge. My goal is to help build an academic culture where we learn from one another, embrace new ideas, make better use of technology and available resources, and ultimately become better students and future professionals. Together, we can make academic excellence a collective effort.",
  },
];

export function getExecutiveBySlug(slug: string) {
  return executives.find((executive) => executive.slug === slug);
}

export function getExecutiveOfficeLabel(role: Executive["role"]) {
  return `Office of The ${role}`;
}
