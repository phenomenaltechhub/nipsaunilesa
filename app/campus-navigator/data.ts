export type Source = {
  id: string;
  title: string;
  url: string;
  kind: "official-university" | "geographic-record" | "student-site";
  lastChecked: string;
  access: "reviewed" | "blocked" | "repository-only";
  evidence: string | null;
};

export type Position = {
  latitude: number;
  longitude: number;
  precision: "university" | "building" | "entrance";
  sourceIds: string[];
  independentlyVerified: boolean;
  verifiedOn: string;
  usableForDirections: boolean;
};

export type CampusRecord = {
  id: string;
  name: string;
  category: "University" | "Faculty" | "Department" | "Student service" | "Campus facility";
  kind: "institutional-entity" | "physical-destination";
  verification: "verified" | "candidate";
  description: string;
  faculty: string | null;
  department: string | null;
  sourceIds: string[];
  position: Position | null;
  photographs: { src: string; alt: string; credit: string; license: string; sourceId: string }[];
  landmarks: { name: string; sourceIds: string[] }[];
  accessibility: string | null;
};

// Research attempts are recorded, not represented as successful source verification.
// Replace candidates only after reviewing the actual cited source; see maintenance documentation.
export const campusSources: Source[] = [
  {
    id: "university-official",
    title: "University of Ilesa official website",
    url: "https://www.unilesa.edu.ng/",
    kind: "official-university",
    lastChecked: "2026-10-30",
    access: "blocked",
    evidence: null,
  },
  {
    id: "nipsa-about",
    title: "NIPSA UNILESA — About the chapter",
    url: "https://nipsaunilesa.com.ng/about",
    kind: "student-site",
    lastChecked: "2026-10-30",
    access: "repository-only",
    evidence: "The existing repository's About page identifies the University of Ilesa chapter and Department of Pharmacology. This is not independent official-university verification.",
  },
];

export const campusRecords: CampusRecord[] = [
  {
    id: "university-of-ilesa",
    name: "University of Ilesa",
    category: "University",
    kind: "institutional-entity",
    verification: "candidate",
    description: "The university named in this campus guide. Official-source review and a geographical reference point are pending; this record does not identify a building or entrance.",
    faculty: null,
    department: null,
    sourceIds: ["university-official", "nipsa-about"],
    position: null,
    photographs: [],
    landmarks: [],
    accessibility: null,
  },
  {
    id: "department-of-pharmacology",
    name: "Department of Pharmacology",
    category: "Department",
    kind: "institutional-entity",
    verification: "candidate",
    description: "The department identified by the existing NIPSA chapter website. Independent official-source verification is pending. Its name does not establish a separate building or its position.",
    faculty: null,
    department: "Department of Pharmacology",
    sourceIds: ["nipsa-about"],
    position: null,
    photographs: [],
    landmarks: [],
    accessibility: null,
  },
];
