# National reference and offline academic calculator evaluation

Reviewed 17 November 2026. Requested source: https://nipsa.com.ng/app . A single read-only request failed at the environment's HTTPS CONNECT proxy with **403 Forbidden**. No page HTML, rendered interface, feature list, login or underlying services could be inspected. No blocked request was retried. The user identifies it as the official National student companion; this document does not independently verify its current contents or claim it has particular calculators. No National logo, artwork, interface or code was copied.

## Evidence and comparison limit

The established Pharmaideia roadmap and Issue #3 require one level-scoped academic application, course resources, timetable/deadlines, reviewed glossary/Term of the Day, personal revision tools, notifications and secure future accounts/community. Independent local planning, navigation, empty course/timetable structures, offline shell and curated preferences exist. Institutional course/glossary data and backend services remain unavailable. Student login, clinical tools, active messaging or payment controls are not presented as operational.

An evidence-based feature-by-feature comparison against National is **source-blocked**. Screenshots or an accessible public feature description would permit a later comparison of actual presentation, academic grouping, navigation, attribution, offline behavior and feature ownership without copying. Until then, product maturity is assessed against Pharmaideia's own requirements: coherent academic hierarchy, restrained branding, useful working tools, truthful data states, accessible mobile interaction, identifiable publishing authority and safe offline boundaries. National-specific findings must remain unset.

## Candidate additions — evaluation only

Academic calculators are not implemented in the current roadmap/components. These are proposed gaps in **Pharmaideia**, not verified National capabilities. Do not add menu items, fake results or clinical calculators before scope/content approval.

| Candidate | Student relevance / roadmap relationship | Offline and privacy model | Risk and maintenance assessment | Recommendation |
| --- | --- | --- | --- | --- |
| Academic unit conversions | Supports course-based revision; SI mass, volume and amount-of-substance concepts | Pure deterministic functions and explicit units; no identity, network or persistence required | Low runtime cost; reviewed conversion factors, dimensional checks, finite bounded inputs and precision/rounding tests required. Must not imply prescription/clinical use. | First candidate for an approved, limited study-tool scope. Not implemented. |
| GPA / CGPA planning | Potential personal academic planning companion to revision tools | User-entered values in tab memory only; grades can be sensitive, so no default storage, telemetry, public export or authenticated-record claim | Low computation cost but substantial institutional policy dependency: approved grade scales, weighting, repeats/rounding and level/session rules. Never label results official transcripts/eligibility decisions. | Defer until University of Ilesa-approved rules and student-use scope are supplied. Not implemented. |
| Molarity / dilution study calculations | Potentially useful to reviewed chemistry/pharmacology course resources | Pure functions; explicit units and assumptions, no patient data or clinical recommendations | Moderate content-validation burden: dimensional consistency, positive domains, significant figures, impossible inputs, unit conversion and formula references. Misuse risk if positioned as treatment advice. | Consider only after academic reviewer approval and worked test cases from licensed/verified sources. Not implemented. |
| Revision workload estimates | Extends existing task planner without institutional data | Tab-memory task/time arithmetic, no background monitoring or notifications | Low ongoing cost; durations/available time must be bounded. Avoid manufactured progress predictions or promises about learning outcomes. | Secondary candidate if user research shows it is useful; avoid redundant planner controls. Not implemented. |
| Dose, renal-function or patient-specific treatment calculators | Outside the current student-companion scope | Patient information and clinical consequences create a different risk boundary | High clinical validation, versioning, source, privacy and governance burden; an offline disclaimer is insufficient. | Exclude from this milestone and do not implement without a separate reviewed clinical scope. |

## Approval and implementation gates

1. Select a narrow educational use case with an authorised academic reviewer; document authoritative formula/unit/policy sources, licensing and version dates. No invented questions, drug facts, conversion assumptions or grade rules.
2. Keep calculation logic separate from DOM and academic records. Avoid `eval`, formula strings interpreted as code, remote calculation services and additional framework dependencies. Prefer bounded numeric functions with explicit input domains and units.
3. Test valid boundary cases, zero/negative/NaN/infinite/oversized inputs, unit mismatches, rounding, decimal behavior and expected independently reviewed results. Add accessible errors and keyboard/mobile tests; never display stale output after invalid input.
4. Keep entered grades/study values out of URL queries, logs, analytics, caches and default persistent storage. Never collect patient data. Offline public code is safe to cache; personal inputs/results are not part of the shell cache.
5. Document formula maintenance ownership, review dates and change history. Evaluate accessibility, slow-network payload and install/offline behavior before adding the approved tool to navigation.

No new feature, API, dependency, student-data collection or clinical functionality was implemented as part of this evaluation. The next action is source access for the National comparison and review of the proposed educational calculator scope, not automatic feature expansion.
