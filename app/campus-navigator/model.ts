import type { CampusRecord, Source } from "./data";

export type DirectoryFilters = { query: string; category: string; faculty: string; department: string; verification: string };
export const emptyFilters: DirectoryFilters = { query: "", category: "All categories", faculty: "All faculties", department: "All departments", verification: "All records" };
export const missingPositionMessage = "Exact campus location awaiting verification.";

export function safeSourceUrl(value: string) {
  try {
    const url = new URL(value);
    return /^https:\/\//i.test(value) && url.protocol === "https:" && !url.username && !url.password && !/[\u0000-\u0020\u007f\\]/u.test(value) ? url.href : null;
  } catch { return null; }
}

export function validCoordinates(latitude: unknown, longitude: unknown) {
  return typeof latitude === "number" && typeof longitude === "number" &&
    Number.isFinite(latitude) && Number.isFinite(longitude) &&
    latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function isMappable(record: CampusRecord, sources: Source[]) {
  const position = record.position;
  return record.verification === "verified" && record.kind === "physical-destination" && !!position &&
    validCoordinates(position.latitude, position.longitude) && position.independentlyVerified &&
    ["building", "entrance"].includes(position.precision) && validDate(position.verifiedOn) &&
    position.sourceIds.length > 0 && position.sourceIds.every(id => sources.some(source =>
      source.id === id && source.access === "reviewed" && !!source.evidence && !!safeSourceUrl(source.url),
    )) && position.sourceIds.some(id => sources.some(source => source.id === id && source.kind === "geographic-record"));
}

export function getDirectionsUrl(record: CampusRecord, sources: Source[]) {
  if (!isMappable(record, sources) || !record.position?.usableForDirections || record.position.precision === "university") return null;
  const destination = `${record.position.latitude},${record.position.longitude}`;
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", destination);
  return url.href;
}

export function filterCampusRecords(records: CampusRecord[], filters: DirectoryFilters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return records.filter(record =>
    (!query || [record.name, record.description, record.faculty, record.department].filter(Boolean).join(" ").toLocaleLowerCase().includes(query)) &&
    (filters.category === "All categories" || record.category === filters.category) &&
    (filters.faculty === "All faculties" || record.faculty === filters.faculty) &&
    (filters.department === "All departments" || record.department === filters.department) &&
    (filters.verification === "All records" || (filters.verification === "Verified records" ? record.verification === "verified" : record.verification === "candidate")),
  );
}

export function selectionForResults(selectedId: string | null, records: CampusRecord[]) {
  return records.some(record => record.id === selectedId) ? selectedId : records[0]?.id ?? null;
}

export function validateCampusData(records: CampusRecord[], sources: Source[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (sourceIds.has(source.id) || !source.id || !safeSourceUrl(source.url) || !validDate(source.lastChecked)) errors.push(`Invalid source: ${source.id}`);
    sourceIds.add(source.id);
    if (source.access === "reviewed" && !source.evidence?.trim()) errors.push(`Missing reviewed evidence: ${source.id}`);
  }
  for (const record of records) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id) || ids.has(record.id) || !record.name.trim() || !record.description.trim()) errors.push(`Invalid record: ${record.id}`);
    ids.add(record.id);
    if (!record.sourceIds.length || record.sourceIds.some(id => !sourceIds.has(id))) errors.push(`Missing sources: ${record.id}`);
    if (record.verification === "verified" && !record.sourceIds.some(id => sources.some(source => source.id === id && source.access === "reviewed" && !!source.evidence))) errors.push(`Unverified entity: ${record.id}`);
    if (record.position && (!isMappable(record, sources) || !validDate(record.position.verifiedOn))) errors.push(`Unverified position: ${record.id}`);
    if (record.position?.usableForDirections && record.position.precision === "university") errors.push(`University point cannot direct to a building: ${record.id}`);
    for (const photo of record.photographs) {
      if (!/^\/campus-navigator\/[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(photo.src) || !photo.alt || !photo.credit || !photo.license || !sources.some(source => source.id === photo.sourceId && source.access === "reviewed")) errors.push(`Unlicensed or unsafe photograph: ${record.id}`);
    }
    for (const landmark of record.landmarks) if (!landmark.name || !landmark.sourceIds.length || landmark.sourceIds.some(id => !sources.some(source => source.id === id && source.access === "reviewed"))) errors.push(`Unverified landmark: ${record.id}`);
  }
  return errors;
}
