"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import CampusMap from "./campus-map";
import { campusRecords, campusSources, type CampusRecord } from "./data";
import { emptyFilters, filterCampusRecords, getDirectionsUrl, isMappable, missingPositionMessage, safeSourceUrl, selectionForResults, validateCampusData } from "./model";
import styles from "./navigator.module.css";

const issues = validateCampusData(campusRecords, campusSources);
if (issues.length) throw new Error(`Campus data validation failed: ${issues.join("; ")}`);

function RecordDetails({ record }: { record: CampusRecord }) {
  const mapped = isMappable(record, campusSources);
  const directions = getDirectionsUrl(record, campusSources);
  return (
    <section className={styles.details} aria-labelledby="destination-details-heading">
      <div className={styles.detailVisual}>
        {record.photographs.length ? <Image src={record.photographs[0].src} alt={record.photographs[0].alt} fill sizes="(max-width: 760px) 100vw, 350px" /> : <><span aria-hidden="true">⌂</span><p>Photograph awaiting verification</p></>}
      </div>
      {record.photographs[0] && <small>{record.photographs[0].credit} · {record.photographs[0].license}</small>}
      <div className={styles.detailBody}>
        <span className={styles.eyebrow}>SELECTED DIRECTORY RECORD</span>
        <h2 id="destination-details-heading" tabIndex={-1}>{record.name}</h2>
        <div className={styles.badges}><span>{record.category}</span><span>{record.verification === "verified" ? "Verified record" : "Candidate · source review pending"}</span></div>
        <p>{record.description}</p>
        <div className={styles.positionNote}>{mapped && record.position ? <><strong>Verified physical position</strong><p>{record.position.latitude}, {record.position.longitude}</p></> : <><strong>{missingPositionMessage}</strong><p>No precise marker or directions are available for this record.</p></>}</div>
        <dl className={styles.facts}>
          <div><dt>Faculty</dt><dd>{record.faculty ?? "Not yet verified"}</dd></div>
          <div><dt>Department</dt><dd>{record.department ?? "Not applicable or not yet verified"}</dd></div>
          <div><dt>Nearby landmarks</dt><dd>{record.landmarks.length ? record.landmarks.map(item => item.name).join(", ") : "Awaiting verification"}</dd></div>
          <div><dt>Accessibility</dt><dd>{record.accessibility ?? "Information not yet verified"}</dd></div>
        </dl>
        {directions && <a className={styles.primaryButton} href={directions} target="_blank" rel="noopener noreferrer">External directions ↗</a>}
        <h3 className={styles.sourceTitle}>Sources &amp; verification</h3>
        <ul className={styles.sources}>
          {record.sourceIds.map(id => {
            const source = campusSources.find(item => item.id === id);
            const url = source && safeSourceUrl(source.url);
            return source && url ? <li key={id}><a href={url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><small>{source.access === "reviewed" ? "Source reviewed" : source.access === "blocked" ? "Access blocked; review pending" : "Existing website repository; not independent verification"} · checked {source.lastChecked}</small></li> : null;
          })}
        </ul>
      </div>
    </section>
  );
}

export default function Navigator() {
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(campusRecords[0]?.id ?? null);
  const [view, setView] = useState<"list" | "map">("list");
  const records = useMemo(() => filterCampusRecords(campusRecords, filters), [filters]);
  const activeId = selectionForResults(selectedId, records);
  const selected = records.find(record => record.id === activeId);
  const mapped = useMemo(() => records.filter(record => isMappable(record, campusSources)), [records]);
  const verifiedCount = campusRecords.filter(record => record.verification === "verified").length;
  const hasMappedDestinations = campusRecords.some(record => isMappable(record, campusSources));
  const onBrowseDirectory = useCallback(() => {
    setView("list");
    window.requestAnimationFrame(() => document.getElementById("campus-directory-search")?.focus());
  }, []);
  const onSelect = useCallback((id: string) => setSelectedId(id), []);
  const categories = [...new Set(campusRecords.map(record => record.category))];
  const faculties = [...new Set(campusRecords.flatMap(record => record.faculty ? [record.faculty] : []))];
  const departments = [...new Set(campusRecords.flatMap(record => record.department ? [record.department] : []))];

  return (
    <>
      {campusRecords.some(record => record.verification === "candidate") && <div className={styles.researchNote}><span aria-hidden="true">ⓘ</span><p><strong>Public-source review is pending.</strong> {campusRecords.filter(record => record.verification === "candidate").length} directory records await independent verification. Source access and evidence are listed in each profile. Only geographically verified destinations can appear as pins; no campus markers, photographs or walking routes have been invented.</p></div>}
      <div className={styles.mobileTabs} role="group" aria-label="Navigator view">
        <button aria-pressed={view === "list"} onClick={() => setView("list")}>Directory</button>
        <button aria-pressed={view === "map"} onClick={() => setView("map")}>Map</button>
      </div>
      <div className={`${styles.workspace} ${!hasMappedDestinations ? styles.directoryFirst : ""}`}>
        <section className={`${styles.directory} ${view === "map" ? styles.mobileHidden : ""}`} aria-labelledby="directory-heading">
          <div className={styles.directoryHead}><span className={styles.eyebrow}>FIND YOUR STARTING POINT</span><h2 id="directory-heading">University directory</h2><p>{verifiedCount} verified · {campusRecords.length - verifiedCount} awaiting source review</p></div>
          <div className={styles.filters}>
            <label className={styles.searchLabel}>Search the directory<input id="campus-directory-search" type="search" placeholder="Search names or departments…" value={filters.query} onChange={event => setFilters(current => ({ ...current, query: event.target.value }))} /></label>
            <label>Category<select aria-label="Category" value={filters.category} onChange={event => setFilters(current => ({ ...current, category: event.target.value }))}><option>All categories</option>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
            <label>Verification<select aria-label="Verification" value={filters.verification} onChange={event => setFilters(current => ({ ...current, verification: event.target.value }))}><option>All records</option><option>Verified records</option><option>Candidates awaiting review</option></select></label>
            <div className={styles.filterPair}>
              <label>Faculty<select aria-label="Faculty" disabled={!faculties.length} value={filters.faculty} onChange={event => setFilters(current => ({ ...current, faculty: event.target.value }))}><option>All faculties</option>{faculties.map(faculty => <option key={faculty}>{faculty}</option>)}</select></label>
              <label>Department<select aria-label="Department" value={filters.department} onChange={event => setFilters(current => ({ ...current, department: event.target.value }))}><option>All departments</option>{departments.map(department => <option key={department}>{department}</option>)}</select></label>
            </div>
            {!faculties.length && <small>Faculty associations await official-source verification.</small>}
          </div>
          <div className={styles.resultsHeading}><p role="status">{records.length} {records.length === 1 ? "record" : "records"} · {mapped.length} mapped</p><button className={styles.textButton} onClick={() => setFilters(emptyFilters)}>Reset filters</button></div>
          <ul className={styles.recordList} aria-label="Directory records">
            {records.map(record => <li key={record.id}><button aria-pressed={activeId === record.id} aria-controls="navigator-details" className={styles.recordCard} onClick={() => onSelect(record.id)}><span className={styles.recordIcon} aria-hidden="true">{record.category === "University" ? "⌂" : "▤"}</span><span><small>{record.category}</small><strong>{record.name}</strong><span>{record.verification === "candidate" ? "Candidate · source review pending" : isMappable(record, campusSources) ? "Verified map position" : "Verified institution · position pending"}</span></span><span aria-hidden="true">↗</span></button></li>)}
          </ul>
          {!records.length && <div className={styles.empty}><h3>No matching records</h3><p>Try another name or reset the filters. The directory will grow as reliable information is verified.</p><button className={styles.primaryButton} onClick={() => setFilters(emptyFilters)}>Clear filters</button></div>}
        </section>
        <div className={`${styles.mapColumn} ${view === "list" ? styles.mobileHidden : ""}`}><CampusMap records={mapped} selectedId={activeId} onSelect={onSelect} onBrowseDirectory={onBrowseDirectory} /></div>
        <div id="navigator-details" className={styles.detailColumn}>{selected ? <RecordDetails record={selected} /> : <section className={styles.empty}><h2>No destination selected</h2><p>Reset the directory filters to explore the available records.</p></section>}</div>
      </div>
      <section className={styles.roadmap} aria-labelledby="navigator-progress-heading"><div><span className={styles.eyebrow}>A PREVIEW THAT GROWS WITH THE CAMPUS</span><h2 id="navigator-progress-heading">Useful today. More precise with verification.</h2></div><div><strong>Interactive now</strong><p>Search, category and verification filters, department filtering, record selection, source notes and map/directory views. Map navigation becomes available for verified destinations.</p></div><div><strong>Awaiting evidence</strong><p>Official directory review, campus coordinates, building photographs, landmarks and accessibility notes.</p></div><div><strong>Planned for the full release</strong><p>Verified entrances and internal walking paths. No campus walking guidance is available in this preview.</p></div></section>
    </>
  );
}
