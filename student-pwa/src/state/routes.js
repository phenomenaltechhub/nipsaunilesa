export const routes = Object.freeze([
  { id: 'home', label: 'Overview', title: 'Your academic companion' },
  { id: 'courses', label: 'Courses', title: 'Your course space' },
  { id: 'timetable', label: 'Timetable', title: 'A clearer view of your week' },
  { id: 'planner', label: 'Study planner', title: 'Make time for learning' },
  { id: 'glossary', label: 'Glossary', title: 'Build your understanding' },
  { id: 'notifications', label: 'Notifications', title: 'Stay in the loop' },
  { id: 'community', label: 'Community', title: 'One department. One community.' },
  { id: 'profile', label: 'Account', title: 'Your student account' },
  { id: 'course-hub', label: 'Course hub structure', title: 'No course selected' },
]);

export const mobilePrimary = Object.freeze(['home', 'courses', 'timetable', 'planner']);
export const academicRouteIds = Object.freeze(['home', 'courses', 'timetable', 'planner', 'glossary']);

/** Navigation accepts only known local route IDs, never URLs or module paths. @param {string} hash */
export function resolveRoute(hash) {
  if (!hash || hash === '#' || hash === '#main') return routes[0];
  return routes.find(route => hash === `#/${route.id}`) ?? null;
}
