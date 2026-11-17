import { element, emptyState, icon, link, pageHeading } from '../../components/dom.js';

/** @param {string} title @param {string} route @param {Node} body */
function card(title, route, body) {
  const section = element('section', 'card');
  const header = element('div', 'card-heading');
  header.append(element('h2', '', title), link(`#/${route}`, 'Explore →'));
  section.append(header, body);
  return section;
}

export function homeView() {
  const root = element('div');
  root.append(pageHeading('LEARN · ORGANISE · CONNECT', 'Your academic companion', 'A thoughtful space for Pharmacology students, from the first lecture to the next chapter.'));
  const hero = element('section', 'hero-card');
  const copy = element('div');
  copy.append(element('span', 'pill', 'PHARMAIDEIA · FOUNDATION IN DEVELOPMENT'), element('h2', '', 'More clarity. More room to learn.'), element('p', '', 'Keep your studies in focus. Explore the application, try a local focus session, and see how your future academic space is taking shape.'), link('#/planner', 'Start a focus session →', 'button light'));
  const symbol = document.createElement('img');
  symbol.src = './assets/brand/symbol-dark.svg'; symbol.alt = ''; symbol.width = 128; symbol.height = 128;
  hero.append(copy, symbol);
  root.append(hero);
  const notice = element('aside', 'notice');
  const note = element('div');
  note.append(element('strong', '', 'Your private student workspace is not connected yet.'), element('p', '', 'No account is signed in. Courses, level-specific records, notifications and community messaging need secure hosting before they become available.'));
  notice.append(icon('lock'), note);
  root.append(notice);
  const grid = element('div', 'dashboard-grid');
  grid.append(card('Your courses', 'courses', emptyState('Course information is awaiting verification', 'No course codes, lecturers or academic records have been invented. Approved courses will appear after secure account access is ready.')));
  grid.append(card('Term of the Day', 'glossary', emptyState('A reviewed term is on its way', 'Definitions and references need academic review before publication. There is no unreviewed medical content here.', 'glossary')));
  grid.append(card('Classes & deadlines', 'planner', emptyState('No verified schedule available', 'Academic session, level, classes and deadlines will come from authorised departmental or level representatives.', 'planner')));
  const ready = element('div');
  ready.append(element('p', 'card-copy', 'Small, useful foundations for the journey ahead.'));
  const list = element('ul', 'summary-list');
  for (const [name, title, detail] of [['planner', 'A local focus session', 'A working timer, without an account or background permissions.'], ['courses', 'One academic home', 'Future 100, 200 and 300 Level access will be checked by the server.'], ['lock', 'Privacy from the start', 'No student details, passwords or payment information are collected.']]) {
    const item = element('li'); const text = element('div'); text.append(element('strong', '', title), element('p', '', detail)); item.append(icon(name), text); list.append(item);
  }
  ready.append(list);
  grid.append(card('Built with care', 'profile', ready));
  root.append(grid);
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
  const section = element('section', 'card');
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
  root.append(section);
  return root;
}
