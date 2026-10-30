# Campus Navigator source register

Research date: 30 October 2026. This register distinguishes attempted research from successful verification. **No independent university or geographic source could be read in this environment.** Network-proxy HTTPS CONNECT requests returned 403, including an escalated attempt. The approved university/OSM hosts are present in saved configuration, but the last actual runtime requests still returned proxy 403. Configuration presence is not proof of working access; investigate environment propagation/access before further research. No additional source requests were made during the directory-first completion run, as requested. Public-source verification remains a prerequisite for claiming a verified institutional directory or wayfinding service. The owner has separately authorized preparing the explicitly labeled experimental interface for publication with its limitations visible.

## Production records

| Record | Provenance | Confidence / status | Coordinates / photographs / directions |
| --- | --- | --- | --- |
| University of Ilesa | University's name supplied in the request and the existing NIPSA About page (`app/about/page.tsx`), linked as https://nipsaunilesa.com.ng/about . Intended official authority: https://www.unilesa.edu.ng/ . | Candidate. Existing-site context only; official website access was blocked. Not described as an independently verified destination. | None. No position inferred from address, institution name or memory; no building marker, photo or directions. |
| Department of Pharmacology | Existing NIPSA About page identifies the chapter as within the Department of Pharmacology. https://nipsaunilesa.com.ng/about is a citation to that existing website, not a claim of a freshly fetched independent university source. | Candidate. Repository text reviewed; independent official institutional review pending. No faculty association or separate building is assumed. | None. No department building, landmark, route or photograph is invented. |

These are the only initial records. They are not fictional filler, but they do **not** satisfy the independent verification standard required for a verified institutional directory. UI badges and cards explicitly say “Candidate · source review pending”; unknown positions say “Exact campus location awaiting verification.” Candidates can be searched/selected but cannot produce pins or directions. No additional faculty, service, gate, laboratory, library or facility name was invented.

## Sources attempted

| Source | Access attempt | Intended use | Result / uncertainty |
| --- | --- | --- | --- |
| https://www.unilesa.edu.ng/ | 2026-10-30 | Official institutional name, faculties/departments, published directory links, possible public map | Blocked by environment proxy; content not reviewed. No directory links or official claims extracted. |
| https://unilesa.edu.ng/ | 2026-10-30 | Alternate official host | Blocked; no content reviewed. |
| https://www.openstreetmap.org/ | 2026-10-30 | Geographic feature/element evidence and map attribution | Blocked; no OSM element, campus geometry or coordinates verified. |
| https://nominatim.openstreetmap.org/search?q=University%20of%20Ilesa&format=jsonv2 | 2026-10-30 | One-off research discovery of a potential university element; never an application search endpoint | Blocked; no search results or coordinates accepted. |
| https://nipsaunilesa.com.ng/about | Existing repository text, 2026-10-30 | Explain the origin of the two existing-site candidate names | Repository-only. Not independently fetched or official university verification. |

The prior check of https://overpass-api.de/api/status and a single https://tile.openstreetmap.org/0/0/0.png world tile also returned proxy 403. Neither response supplied campus evidence. Those blocked requests have not been retried during this completion run. No API endpoint is called at runtime for directory search. Research should resume against official directory pages, then OSM element pages/history and an independent geographic source; a geocoder's display label or a polygon centroid must not be relabeled as a building entrance.

## Map data and policy

- Leaflet 1.9.4 renders real slippy-map tiles from `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, only when actual verified destinations exist and the visitor clicks “Load interactive map.” It is loaded from the installed package, not an executable CDN script. No geolocation, route API, tile prefetch, offline download or cache bypass is used.
- Attribution remains visible: https://www.openstreetmap.org/copyright . OpenStreetMap data is made available under ODbL; standard raster tiles have a separate service policy: https://operations.osmfoundation.org/policies/tiles/ . These policy links are provided for maintenance; they were not fetched successfully in this environment.
- Production deployment must preserve visible attribution, browser caching and a valid browser Referer. Do not set a site policy that strips the Referer for OSM tile requests without selecting another suitable provider. Standard OSM tiles are best-effort, not an SLA or permission to bulk download; review service suitability before wider adoption.
- With zero verified destinations, the primary view is the searchable directory and record details. Map view is an informative verification-status panel: no empty Leaflet canvas, world-reference view, Load Map button, zoom controls, directions or tile requests. Mobile Browse directory returns to the list and focuses search. The Leaflet architecture, explicit loading consent, attribution and service-recovery logic are retained for future verified destinations.
- No university/building coordinates are present in production records. Numeric coordinates in unit fixtures are synthetic tests only, never loaded by the application.

## Photograph and landmark rights

No campus photographs or landmarks were added. No usable photograph license or author permission was established. The neutral icon placeholder is UI, not an illustration of an actual building. For each future photo record, retain the original source, author, license/permission evidence, attribution and verification date. Do not hotlink images found on university/social media pages merely because they are public. No inferred nearby facilities, accessibility claims or internal walking routes are included.

## Evidence required before the public-data release

1. Read official pages and quote the specific evidence supporting each institution/category/description; record the exact URL and date, not just a homepage citation.
2. Record stable OSM element IDs/URLs or another auditable geographic record, geometry/precision and date. Cross-check independently; distinguish university area/reference point from a building or usable entrance.
3. Publish markers only for a verified physical destination with building/entrance precision and independent geographic evidence. Verified institutional entities without positions can join the directory, but cannot become markers. General university points/area centroids are excluded from marker eligibility and directions.
4. If sources remain unreachable, keep candidate status and zero pins. Do not rename blocked checks as completed or populate an attractive fictional campus map. This implementation is a reviewable technical preview; independently verified university data remains blocked.
