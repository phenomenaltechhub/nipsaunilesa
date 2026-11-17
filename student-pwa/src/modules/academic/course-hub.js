import { element, emptyState, link, pageHeading } from '../../components/dom.js';
import { academicNavigation, availabilityNote, sectionHeading, tabs } from '../../components/academic.js';

export function courseHubView() {
  const root = element('div');
  root.append(pageHeading('COURSE HUB STRUCTURE', 'No course selected', 'Explore how a course hub is organised. This is an interface structure, not a published course or access to protected materials.'), academicNavigation('courses'));
  root.append(availabilityNote('Verified course information is required.', 'No course code, title, units, lecturer or syllabus has been invented. Your future account level will be enforced by the server.'));
  const card = element('section', 'card');
  card.append(sectionHeading('Course workspace', 'Structure only'));
  card.append(tabs('course-hub', 'Course hub sections', [
    { id: 'overview', title: 'Overview', render() {
      const section = element('div'); section.append(emptyState('Course details are awaiting verification', 'Official title, code, units, description and approved syllabus will appear here. A browser preview cannot grant academic access.'));
      return section;
    } },
    { id: 'topics', title: 'Topics', render: () => emptyState('No approved topic checklist', 'Topics and progress checklists will be based on reviewed course information. No syllabus or assessment has been fabricated.') },
    { id: 'materials', title: 'Materials', render() {
      const section = element('div');
      section.append(emptyState('No course materials are available', 'Lecture notes, presentations, practical resources and approved questions require reviewed content and authorised access. No protected files are bundled here.'));
      section.append(element('p', 'inline-note', 'Future Google Drive resources will be labelled external. A publicly shared Drive link cannot be made private by this application.'));
      return section;
    } },
    { id: 'schedule', title: 'Schedule', render() {
      const section = element('div'); section.append(emptyState('No verified class or deadline information', 'Course-linked entries will show their source and last update. The calendar currently displays dates only.', 'timetable'), link('#/timetable', 'Explore the timetable interface →', 'button subtle')); return section;
    } },
    { id: 'revision', title: 'Revision', render() {
      const section = element('div'); section.append(emptyState('Course revision content is not connected', 'Reviewed topics, licensed questions and course bookmarks will come later. You can use the independent personal planner now.', 'planner'), link('#/planner', 'Open the study planner →', 'button')); return section;
    } },
  ]));
  root.append(card, link('#/courses', '← Back to courses', 'back-link'));
  return root;
}
