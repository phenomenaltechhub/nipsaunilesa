import { element, icon, link, pageHeading } from './components/dom.js';
import { resolveRoute, routes, mobilePrimary, academicRouteIds } from './state/routes.js';
import { homeView, catalogueView } from './modules/academic/views.js';
import { plannerView } from './modules/study/view.js';
import { settingsView } from './modules/settings/view.js';
import { createSettings, applyAppearance } from './modules/settings/model.js';
import { createCourseProgress } from './modules/progress/model.js';
import { courseProgressView } from './modules/progress/view.js';
import { createNotificationInbox } from './modules/notifications/model.js';
import { notificationsView } from './modules/notifications/view.js';
import { communityView } from './modules/community/view.js';
import { helpView } from './modules/help/view.js';
import { registerOfflineShell } from './pwa/register.js';
import { timetableView } from './modules/academic/timetable.js';
import { courseHubView } from './modules/academic/course-hub.js';
import { createRevisionPlan } from './modules/study/revision.js';
import { createAvatarPreference } from './modules/account/avatars.js';

/** @param {string} id */
function byId(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error('The application shell is incomplete.');
  return node;
}

const main = byId('main');
byId('skip-to-main').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});
const more = /** @type {HTMLDialogElement} */ (byId('more-dialog'));
let dispose = () => {};
const revisionPlan = createRevisionPlan();
const courseProgress = createCourseProgress();
const inbox = createNotificationInbox();
const settings = createSettings();
let storage = null;
try { storage = window.localStorage; } catch { /* Only the optional avatar preference uses device storage. */ }
const avatarPreference = createAvatarPreference(storage);
applyAppearance(settings);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyAppearance(settings));
function clearStudy() { revisionPlan.clear(); courseProgress.clear(); inbox.clearRead(); avatarPreference.clear(); }

/** @param {{id:string,label:string}} route @param {boolean} [compact] */
function navLink(route, compact = false) {
  const item = link(`#/${route.id}`, '', compact ? '' : 'nav-link');
  item.dataset.route = route.id;
  item.append(icon(route.id), element('span', '', compact && route.id === 'home' ? 'Home' : compact && route.id === 'planner' ? 'Planner' : route.label));
  item.addEventListener('click', () => { if (more.open) more.close(); });
  return item;
}

const visibleRoutes = routes.filter(route => !['course-hub', 'progress'].includes(route.id));
for (const route of visibleRoutes) {
  if (route.id === 'notifications') byId('primary-nav').append(element('p', 'nav-label nav-divider', 'MORE FROM PHARMAIDEIA'));
  byId('primary-nav').append(navLink(route));
}
for (const id of mobilePrimary) { const route = routes.find(route => route.id === id); if (route) byId('mobile-nav').append(navLink(route, true)); }
for (const route of visibleRoutes.filter(route => !mobilePrimary.includes(route.id))) byId('more-nav').append(navLink(route));
const moreButton = document.createElement('button'); moreButton.setAttribute('aria-haspopup', 'dialog'); moreButton.append(icon('more'), element('span', '', 'More'));
moreButton.addEventListener('click', () => more.showModal()); byId('mobile-nav').append(moreButton);
byId('close-more').addEventListener('click', () => more.close());

function render() {
  dispose(); dispose = () => {};
  const route = resolveRoute(location.hash);
  let node;
  const views={home:()=>homeView(revisionPlan,courseProgress),courses:()=>catalogueView('courses'),glossary:()=>catalogueView('glossary'),timetable:timetableView,'course-hub':courseHubView,profile:()=>settingsView(avatarPreference,settings,clearStudy),progress:()=>courseProgressView(courseProgress),community:communityView,cbt:()=>communityView('cbt'),help:helpView,notifications:()=>notificationsView(inbox)};
  if(route?.id==='planner'){const view=plannerView(revisionPlan);node=view.node;dispose=view.dispose;}
  else if(route&&Object.hasOwn(views,route.id))node=views[/** @type {keyof typeof views} */(route.id)]();
  else {node=element('div');node.append(pageHeading('PHARMAIDEIA','Page unavailable','Choose a page from the menu to continue.'),link('#/home','Return to Dashboard','button'));}
  main.replaceChildren(node); main.setAttribute('aria-labelledby', 'page-title');
  document.title = `${route?.title ?? 'Page not found'} · PHARMAIDEIA`;
  const activeId = ['course-hub','progress'].includes(route?.id ?? '') ? 'courses' : route?.id;
  for (const item of document.querySelectorAll('[data-route]')) {
    if (item.getAttribute('data-route') === activeId) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  }
  moreButton.dataset.active = String(Boolean(activeId && !mobilePrimary.includes(activeId)));
  document.body.dataset.workspace = activeId && academicRouteIds.includes(activeId) ? 'academic' : 'other';
}

window.addEventListener('hashchange', () => { render(); main.focus(); window.scrollTo(0, 0); });
function networkStatus() { const status = byId('network-status'); status.textContent = navigator.onLine ? '' : 'Offline'; status.hidden = navigator.onLine; }
window.addEventListener('online', networkStatus); window.addEventListener('offline', networkStatus);
render(); networkStatus();
registerOfflineShell();
