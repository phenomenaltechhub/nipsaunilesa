import media from "./media.json";

export const tourMedia = media;
export const tourDescription = "Discover the academic resources, student services, community information and opportunities available through the chapter website.";

export type TourDestination = {
  id: string;
  title: string;
  description: string;
  category: "Academic" | "Chapter" | "Explore";
  href: string;
  image: string;
  imageAlt: string;
  linkLabel: string;
  secondary?: { label: string; href: string };
  status?: string;
  featured?: boolean;
};

export const tourDestinations: TourDestination[] = [
  { id: "resources", title: "Academic Resources", description: "Open the Orientation Checklist, Study Skills Guide and other public departmental materials.", category: "Academic", href: "/resources", image: "/media/website-tour/images/resources.webp", imageAlt: "The NIPSA Resources page and public document library", linkLabel: "Find resources", featured: true },
  { id: "portal", title: "Student Portal & study tools", description: "Find academic support, then use personal GPA estimates, a weekly timetable and revision planning. Entries stay on your device.", category: "Academic", href: "/portal", secondary: { label: "Open study tools", href: "/portal/tools" }, image: "/media/website-tour/images/tools.webp", imageAlt: "The existing browser-based NIPSA study tools", linkLabel: "Visit Student Portal", featured: true },
  { id: "announcements", title: "Announcements", description: "Read published notices in full. Check the date, related links and which event details are confirmed.", category: "Chapter", href: "/announcements", image: "/media/website-tour/images/announcements.webp", imageAlt: "Dated announcements on the chapter website", linkLabel: "Read announcements", featured: true },
  { id: "home", title: "Home & About NIPSA", description: "Get to know the University of Ilesa chapter, its purpose and the website’s main starting points.", category: "Chapter", href: "/", secondary: { label: "About the chapter", href: "/about" }, image: "/media/website-tour/images/home.webp", imageAlt: "The corrected NIPSA UNILESA homepage", linkLabel: "Visit the homepage" },
  { id: "events", title: "Events", description: "Explore published activities. Read dates and status carefully; archived events remain as references.", category: "Chapter", href: "/events", image: "/media/website-tour/images/events.webp", imageAlt: "The website’s published events directory", linkLabel: "Explore events" },
  { id: "community", title: "Community", description: "Find information about peer learning, study circles and support. Published community links may open another service.", category: "Chapter", href: "/community", image: "/media/website-tour/images/community.webp", imageAlt: "The public NIPSA community information page", linkLabel: "Find community support" },
  { id: "executives", title: "Executives", description: "Meet the chapter leadership through published profiles and find the appropriate office for an enquiry.", category: "Chapter", href: "/executives", image: "/media/website-tour/images/executives.webp", imageAlt: "The NIPSA chapter’s existing executive directory", linkLabel: "Meet the executives" },
  { id: "gallery", title: "Gallery", description: "Browse departmental photo collections, open the image viewer and download a NIPSA-watermarked copy.", category: "Explore", href: "/gallery", image: "/media/website-tour/images/gallery.webp", imageAlt: "The corrected Gallery page with its published photo collections", linkLabel: "Browse the Gallery" },
  { id: "ads", title: "Student Ads", description: "Discover listed businesses and their contact options. Entries labelled as sample listings are illustrative.", category: "Explore", href: "/ads", image: "/media/website-tour/images/ads.webp", imageAlt: "The existing Student Ads business directory", linkLabel: "Explore Student Ads" },
  { id: "navigator", title: "Campus Navigator", description: "Try directory search, filters and record details. Candidate records await verification; mapped destinations and route directions are unavailable.", category: "Explore", href: "/campus-navigator", image: "/media/website-tour/images/navigator.webp", imageAlt: "Campus Navigator’s directory-first Interactive Preview", linkLabel: "Explore the preview", status: "Interactive Preview" },
  { id: "contact", title: "Contact", description: "Find the published office or support address for your question, feedback or a broken-link report.", category: "Chapter", href: "/contact", image: "/media/website-tour/images/contact.webp", imageAlt: "The official contact directory published on the NIPSA website", linkLabel: "Find the right contact" },
];

export function filterTourDestinations(query: string, category: string = "All") {
  const search = query.trim().toLocaleLowerCase("en");
  return tourDestinations.filter((destination) =>
    (category === "All" || destination.category === category)
    && `${destination.title} ${destination.description}`.toLocaleLowerCase("en").includes(search));
}

export const tourPathways = [
  { title: "I’m a newly admitted student", description: "Start with the checklist, then check the dated departmental notices for current arrangements.", href: "/resources#orientation-checklist", label: "Open the orientation resources" },
  { title: "I need academic resources", description: "Browse the public guides, handbook and available learning-support links.", href: "/resources", label: "Find learning resources" },
  { title: "I want to plan my studies", description: "Try on-device GPA estimates, a personal weekly timetable and revision priorities.", href: "/portal/tools", label: "Open study tools" },
  { title: "I’m looking for chapter updates", description: "Read official notices in full and check event dates before making plans.", href: "/announcements", label: "Read chapter announcements" },
  { title: "I’m exploring student businesses", description: "Browse the listed businesses and their published contact options.", href: "/ads", label: "Discover Student Ads" },
  { title: "I need to contact NIPSA", description: "Choose the published office or support route that matches your enquiry.", href: "/contact", label: "Open the contact directory" },
];
