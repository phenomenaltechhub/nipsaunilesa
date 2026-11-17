import { element, emptyState, icon, link, pageHeading } from '../../components/dom.js';
import { academicNavigation, availabilityNote, sectionHeading } from '../../components/academic.js';

/** @param {string} title @param {string} route @param {Node} body */
function card(title, route, body) {
  const section = element('section', 'card');
  const header = element('div', 'card-heading');
  header.append(element('h2', '', title), link(`#/${route}`, 'Explore →'));
  section.append(header, body);
  return section;
}

/** @param {ReturnType<typeof import('../study/revision.js').createRevisionPlan>} plan */
export function homeView(plan) {
  const root = element('div');
  root.append(pageHeading('YOUR ACADEMIC WORKSPACE', 'Your academic companion', 'Courses, your week and a little room to focus. One consistent space for your studies.'));
  const hero = element('section', 'hero-card');
  const copy = element('div');
  copy.append(element('span', 'pill', 'PHARMAIDEIA · DEVELOPMENT BUILD'), element('h2', '', 'Bring your next study step into focus.'), element('p', '', 'Build a personal revision plan or start a focus session. Verified academic information will join this workspace when secure student access is ready.'), link('#/planner', 'Open your study planner →', 'button light'));
  const symbol = document.createElement('img');
  symbol.src = './assets/brand/symbol-dark.svg'; symbol.alt = ''; symbol.width = 128; symbol.height = 128;
  hero.append(copy, symbol);
  root.append(hero);
  root.append(availabilityNote('Academic services are not connected yet.', 'No student is signed in. Academic session, assigned level, course records and official schedules are unavailable. Local study tools work independently.'));
  const quick = element('nav', 'academic-launcher'); quick.setAttribute('aria-label', 'Academic shortcuts');
  for (const [id, name, detail] of [['courses', 'Course hubs', 'Notes, topics & materials'], ['timetable', 'Your timetable', 'Week & agenda views'], ['planner', 'Plan & revise', 'Personal goals & focus'], ['glossary', 'Learning glossary', 'Reviewed terms pending']]) {
    const item = link(`#/${id}`, '', 'launch-card'); const text = element('span');
    text.append(element('strong', '', name), element('small', '', detail)); item.append(icon(id), text); quick.append(item);
  }
  root.append(quick);
  const grid = element('div', 'dashboard-grid');
  grid.append(card('Courses & materials', 'courses', emptyState('No verified courses are connected', 'Explore the course hub structure without invented codes, lecturers or protected resources.')));
  grid.append(card('Classes & deadlines', 'timetable', emptyState('Your official week is awaiting information', 'The date browser works now. Confirmed classes and deadlines need authorised level-specific information.', 'timetable')));
  const personal = element('div', 'personal-summary');
  const items = plan.list(); const completed = items.filter(item => item.done).length;
  personal.append(element('span', 'local-label', 'PERSONAL · NOT SYNCED'), element('strong', 'personal-count', `${items.length} ${items.length === 1 ? 'task' : 'tasks'}`), element('p', 'card-copy', `${completed} completed during this visit. Your personal plan stays in this tab and clears on reload.`), link('#/planner', items.length ? 'Continue your plan →' : 'Add your first study task →', 'button subtle'));
  grid.append(card('Your revision plan', 'planner', personal));
  grid.append(card('Term of the Day', 'glossary', emptyState('Reviewed terms are still to come', 'Definitions, mechanisms and references need academic review. No unreviewed medical claims are published.', 'glossary')));
  const ready = element('div');
  ready.append(element('p', 'card-copy', 'Small, useful foundations for the journey ahead.'));
  const list = element('ul', 'summary-list');
  for (const [name, title, detail] of [['planner', 'A local focus session', 'A working timer, without an account or background permissions.'], ['courses', 'One academic home', 'Future 100, 200 and 300 Level access will be checked by the server.'], ['lock', 'Privacy from the start', 'No student details, passwords or payment information are collected.']]) {
    const item = element('li'); const text = element('div'); text.append(element('strong', '', title), element('p', '', detail)); item.append(icon(name), text); list.append(item);
  }
  ready.append(list);
  const details = element('details', 'workspace-details'); const summary = element('summary', '', 'What works now, and what comes next'); details.append(summary, ready);
  root.append(grid, details);
  return root;
}

/** A real search control over a deliberately empty, verified-public-content catalogue.
 * Private academic records must never be bundled into this catalogue.
 * @param {'courses'|'glossary'} kind
 */
export function catalogueView(kind) {
  const isCourse = kind === 'courses';
  const root = element('div');
  root.append(pageHeading(isCourse ? 'ACADEMIC SPACE' : 'LEARNING LIBRARY', isCourse ? 'Your course space' : 'Build your understanding', isCourse ? 'Course hubs will bring notes, practical resources and schedules together. No private course material is included in this public shell.' : 'A searchable pharmacology glossary will connect reviewed terms, mechanisms and references. The first entries need academic approval.'));
  root.append(academicNavigation(kind));
  const section = element('section', 'card');
  section.append(sectionHeading(isCourse ? 'Course directory' : 'Pharmacology glossary', 'Verified content pending'));
  const search = element('div', 'search-row');
  const label = element('label', 'field-label', isCourse ? 'Search courses' : 'Search glossary');
  const input = document.createElement('input');
  input.type = 'search'; input.id = 'catalogue-search'; input.maxLength = 120; input.placeholder = isCourse ? 'Course code or title' : 'Term or concept';
  label.htmlFor = input.id;
  const help = element('small', '', 'No verified entries are published yet. Search stays on this device.');
  help.id = 'catalogue-help'; input.setAttribute('aria-describedby', help.id);
  search.append(label, input, help);
  const status = element('p', 'search-status'); status.setAttribute('role', 'status');
  const update = () => { status.textContent = input.value.trim() ? `No published entries match “${input.value.trim()}”.` : '0 published entries'; };
  input.addEventListener('input', update); update();
  section.append(search, emptyState(isCourse ? 'No verified courses available' : 'No reviewed terms available', isCourse ? 'Authorised class representatives will maintain courses within their assigned level. Level access is not controlled by a browser selector.' : 'Definitions, references, related concepts and Term of the Day will appear only after content is reviewed and appropriately licensed.', kind), status);
  if (isCourse) section.append(link('#/course-hub', 'Explore the course hub structure →', 'button subtle'), element('p', 'inline-note', 'Structure only · No course selected · No academic access granted'));
  root.append(section);
  return root;
}
