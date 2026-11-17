import { element, emptyState, link, pageHeading } from '../../components/dom.js';
import { searchKey } from '../../components/validation.js';
import { academicNavigation, sectionHeading } from '../../components/academic.js';

/** @param {string} title @param {string|null} route @param {Node} body */
function card(title, route, body) {
  const section = element('section', 'card');
  const header = element('div', 'card-heading');
  header.append(element('h2', '', title));
  if (route) header.append(link(`#/${route}`, route==='glossary'?'Open glossary →':`View ${title.toLowerCase()} →`));
  section.append(header, body);
  return section;
}

/** @param {ReturnType<typeof import('../study/revision.js').createRevisionPlan>} plan @param {ReturnType<typeof import('../progress/model.js').createCourseProgress>} [progress] */
export function homeView(plan, progress) {
  const root = element('div');
  root.append(pageHeading('ACADEMICS', 'Dashboard', 'Your courses, schedule and study priorities.'));
  const grid = element('div', 'dashboard-grid');
  const courses = card('Courses', 'courses', emptyState('No courses available', 'Your courses will appear here.'));
  courses.classList.add('wide'); grid.append(courses);
  grid.append(card('Timetable', 'timetable', emptyState('No timetable entries', 'Your classes and activities will appear here.', 'timetable')));
  grid.append(card('Deadlines', null, emptyState('No upcoming deadlines', 'Keep track of assignments and examinations.', 'planner')));
  const personal = element('div', 'personal-summary');
  const items = plan.list(); const completed = items.filter(item => item.done).length;
  personal.append(element('strong', 'personal-count', `${items.length} ${items.length === 1 ? 'task' : 'tasks'}`), element('p', 'card-copy', `${completed} completed. Your plan stays in this tab.`), link('#/planner', items.length ? 'Continue your plan →' : 'Add a study task →', 'button subtle'));
  grid.append(card('Study priorities', null, personal));
  grid.append(card('Announcements', 'notifications', emptyState('No announcements', 'Departmental updates will appear here.', 'notifications')));
  grid.append(card('Term of the Day', 'glossary', emptyState('No term available', 'Reviewed terms will appear in the glossary.', 'glossary')));
  if(progress?.list().length){const summary=progress.summary();personal.append(element('p','inline-note',`Personal topic coverage: ${summary.covered}/${summary.total}.`),link('#/progress','Continue course progress →','back-link'));}
  root.append(grid); return root;
}

/** @param {'courses'|'glossary'} kind */
export function catalogueView(kind) {
  const isCourse = kind === 'courses'; const root = element('div');
  root.append(pageHeading('ACADEMICS', isCourse ? 'Courses' : 'Glossary', isCourse ? 'Find course information, study materials and academic updates.' : 'Explore pharmacology terms, definitions and related concepts.'), academicNavigation(kind));
  const section = element('section', 'card'); section.append(sectionHeading(isCourse ? 'Your courses' : 'Pharmacology glossary'));
  const search = element('div', 'search-row');
  const label = element('label', 'field-label', isCourse ? 'Search courses' : 'Search glossary');
  const input = document.createElement('input'); input.type = 'search'; input.id = 'catalogue-search'; input.maxLength = 120; input.placeholder = isCourse ? 'Course code or title' : 'Term or concept'; label.htmlFor = input.id;
  search.append(label, input);
  const status = element('p', 'search-status'); status.setAttribute('role', 'status');
  const update = () => { status.textContent = searchKey(input.value) ? `No results for “${input.value.trim()}”.` : ''; };
  input.addEventListener('input', update); update();
  section.append(search, emptyState(isCourse ? 'No courses available' : 'No terms available', isCourse ? 'Your courses will appear here.' : 'Terms will appear here as they are added.', kind), status);
  if(isCourse)section.append(link('#/progress','Open personal course progress →','button subtle'),element('p','inline-note','Personal study outlines stay in this tab and are separate from official courses.'));
  root.append(section); return root;
}
