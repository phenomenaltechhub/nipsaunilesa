import {availabilityNote} from './availability.js';
import { element, emptyState, link, pageHeading } from '../student-pwa/src/components/dom.js';
import { academicNavigation, sectionHeading, tabs } from '../student-pwa/src/components/academic.js';
import { resourceCategories, eventKinds } from '../student-pwa/src/modules/academic/models.js';

/** @param {ReturnType<typeof import('../student-pwa/src/modules/academic/models.js').createAcademicPreparation>} [preparation] */
export function courseHubView(preparation) {
  const snapshot = preparation?.list() ?? { courses: [], resources: [], events: [], topics: [], selected: 0 }; const course = snapshot.courses.find(item => item.id === snapshot.selected);
  const root = element('div');
  root.append(pageHeading(preparation ? 'LOCAL COURSE PROPOSAL · UNREVIEWED' : 'COURSES', course?.title ?? 'No course selected', preparation ? 'Local preparation only. Nothing is reviewed or published.' : 'Choose a course to view its information, study materials and schedule.'));
  if (!preparation) root.append(academicNavigation('courses'));
  if (preparation) root.append(availabilityNote('Developer workbench', 'No proposal grants academic access or publishes institutional information.'));
  const card = element('section', 'card');
  card.append(sectionHeading('Course workspace', preparation ? 'Local proposal' : ''));
  card.append(tabs('course-hub', 'Course hub sections', [
    { id: 'details', title: 'Course details', render() {
      const section = element('div');
      if (course) {
        section.append(element('h3', '', course.code), element('p', 'inline-note', `${course.level} Level proposed · ${course.units} units proposed · not verified`), element('p', 'card-copy', course.description));
        if(course.session)section.append(element('p','muted',`${course.session} · ${course.semester} semester · proposed`));
        const source = link(course.sourceUrl, 'Unreviewed source reference (external)', 'back-link'); source.target = '_blank'; source.rel = 'noopener noreferrer'; section.append(source);
      } else section.append(emptyState('Course information', 'Select a course to see its details.'));
      if (preparation) section.append(link('#/academic-preparation', 'Prepare course and resource metadata →', 'button subtle'));
      return section;
    } },
    { id: 'topics', title: 'Topics', render(){const section=element('div');const records=snapshot.topics.filter(t=>t.courseId===course?.id);for(const t of records){const row=element('article','prepared-course');row.append(element('h3','',t.title),element('p','muted',t.parentId?`Subtopic of ${records.find(parent=>parent.id===t.parentId)?.title??'topic'} · local/unreviewed`:'Local/unreviewed topic'));section.append(row);}if(!records.length)section.append(emptyState('No topics added','Course topics will appear here.'));return section;} },
    { id: 'materials', title: 'Materials', render() {
      const section = element('div');
      const records = snapshot.resources.filter(item => item.courseId === course?.id);
      const label = element('label', 'field-label', 'Course resource category'); label.htmlFor = 'course-resource-category';
      const filter = element('select'); filter.id = label.htmlFor; filter.add(new Option('All categories', 'all')); for (const [key, title] of Object.entries(resourceCategories)) filter.add(new Option(title, key));
      const results = element('div'); const status = element('p', 'search-status'); status.setAttribute('role', 'status');
      function render() {
        const visible = records.filter(item => filter.value === 'all' || item.category === filter.value); results.replaceChildren();
        for (const resource of visible) { const row = element('article', 'prepared-course'); const external = link(resource.url, 'Google Drive resource (external)', 'back-link'); external.target = '_blank'; external.rel = 'noopener noreferrer'; row.append(element('h3', '', resource.title), element('p', 'muted', `${resourceCategories[/** @type {keyof typeof resourceCategories} */ (resource.category)]} · local/unreviewed`), element('p', 'card-copy', resource.description), external); results.append(row); }
        if (!visible.length) results.append(emptyState('No study materials added', 'Lecture notes, presentations and practical materials will appear here.'));
        status.textContent = preparation ? `${visible.length} local resource proposals` : '';
      }
      filter.addEventListener('change', render); section.append(label, filter, results, status); render();
      if (preparation) section.append(element('p', 'inline-note', 'Google Drive links are external. Publicly shared links cannot be protected by this app.'));
      return section;
    } },
    { id: 'schedule', title: 'Schedule', render() {
      const section = element('div');
      const events = snapshot.events.filter(item => item.courseId === course?.id);
      for (const event of events) section.append(element('h3', '', event.title), element('p', 'inline-note', `${eventKinds[/** @type {keyof typeof eventKinds} */ (event.kind)]} · ${event.date} ${event.start}${event.end ? '–' + event.end : ''} · local/unreviewed`));
      if (!events.length) section.append(emptyState('No timetable entries', 'Classes and deadlines will appear here.', 'timetable'));
      if (!preparation) section.append(link('#/timetable', 'View timetable →', 'button subtle')); return section;
    } },
    { id: 'syllabus', title: 'Syllabus', render(){const section=element('div');const records=snapshot.resources.filter(r=>r.courseId===course?.id&&r.category==='syllabus');for(const item of records){const external=link(item.url,`${item.title} — Google Drive (external)`,'back-link');external.target='_blank';external.rel='noopener noreferrer';section.append(external);}if(!records.length)section.append(emptyState('No syllabus added','Approved syllabus information will appear here.'));return section;} },
    { id: 'revision', title: 'Revision', render() {
      const section = element('div'); section.append(emptyState('No revision materials added', 'Plan your study tasks while you revise.', 'planner'), link('#/planner', 'Open the study planner →', 'button')); return section;
    } },
  ]));
  root.append(card, link(preparation ? '#/academic-preparation' : '#/courses', preparation ? '← Back to local preparation' : '← Back to courses', 'back-link'));
  return root;
}
