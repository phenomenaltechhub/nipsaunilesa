export const routes = Object.freeze([
  { id: 'home', label: 'Dashboard', title: 'Dashboard' },
  { id: 'courses', label: 'Courses', title: 'Courses' },
  { id: 'timetable', label: 'Timetable', title: 'Timetable' },
  { id: 'planner', label: 'Study planner', title: 'Study planner' },
  { id: 'glossary', label: 'Glossary', title: 'Glossary' },
  { id: 'community', label: 'Community', title: 'Community' },
  { id: 'cbt', label: 'CBT', title: 'CBT assessments' },
  { id: 'notifications', label: 'Announcements', title: 'Announcements' },
  { id: 'profile', label: 'Settings', title: 'Settings' },
  { id: 'help', label: 'Help & Guide', title: 'Help & Guide' },
  { id: 'progress', label: 'Course progress', title: 'Course progress' },
  { id: 'course-hub', label: 'Course details', title: 'Course details' },
]);

export const mobilePrimary = Object.freeze(['home', 'courses', 'community', 'planner']);
export const academicRouteIds = Object.freeze(['home', 'courses', 'timetable', 'planner', 'glossary']);

/** Navigation accepts only known local route IDs, never URLs or module paths. @param {string} hash */
export function resolveRoute(hash) {
  if (!hash || hash === '#' || hash === '#main') return routes[0];
  return routes.find(route => hash === `#/${route.id}`) ?? null;
}
