import { element, emptyState, icon, link, pageHeading } from './components/dom.js';
import { resolveRoute, routes, mobilePrimary, academicRouteIds } from './state/routes.js';
import { homeView, catalogueView } from './modules/academic/views.js';
import { plannerView } from './modules/study/view.js';
import { communityView } from './modules/community/view.js';
import { accountView } from './modules/account/view.js';
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
let storage = null;
try { storage = window.localStorage; } catch { /* Only the optional avatar preference uses device storage. */ }
const avatarPreference = createAvatarPreference(storage);

/** @param {{id:string,label:string}} route @param {boolean} [compact] */
function navLink(route, compact = false) {
  const item = link(`#/${route.id}`, '', compact ? '' : 'nav-link');
  item.dataset.route = route.id;
  item.append(icon(route.id), element('span', '', compact && route.id === 'planner' ? 'Planner' : route.label));
  item.addEventListener('click', () => { if (more.open) more.close(); });
  return item;
}

const visibleRoutes = routes.filter(route => route.id !== 'course-hub');
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
  switch (route?.id) {
    case 'home': node = homeView(revisionPlan); break;
    case 'courses': node = catalogueView('courses'); break;
    case 'glossary': node = catalogueView('glossary'); break;
    case 'planner': { const view = plannerView(revisionPlan); node = view.node; dispose = view.dispose; break; }
    case 'timetable': node = timetableView(); break;
    case 'course-hub': node = courseHubView(); break;
    case 'community': node = communityView(); break;
    case 'profile': node = accountView(avatarPreference); break;
    case 'notifications':
      node = element('div');
      node.append(pageHeading('OFFICIAL INFORMATION, CLEAR OWNERSHIP', 'Stay in the loop', 'Approved announcements may flow from the editorial system. Level-specific notifications need authenticated access.'), emptyState('Notifications are not connected', 'No notification history is stored. Verified senders, read status and publishing permissions require the backend and editorial integration.', 'notifications', 'h2'));
      break;
    default:
      node = element('div'); node.append(pageHeading('PAGE NOT FOUND', 'Find your next step', 'This route does not exist in the application.'), link('#/home', 'Return to overview', 'button'));
  }
  main.replaceChildren(node); main.setAttribute('aria-labelledby', 'page-title');
  document.title = `${route?.title ?? 'Page not found'} · PHARMAIDEIA`;
  const activeId = route?.id === 'course-hub' ? 'courses' : route?.id;
  for (const item of document.querySelectorAll('[data-route]')) {
    if (item.getAttribute('data-route') === activeId) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  }
  moreButton.dataset.active = String(Boolean(activeId && !mobilePrimary.includes(activeId)));
  document.body.dataset.workspace = activeId && academicRouteIds.includes(activeId) ? 'academic' : 'other';
}

window.addEventListener('hashchange', () => { render(); main.focus(); window.scrollTo(0, 0); });
function networkStatus() { byId('network-status').textContent = navigator.onLine ? 'Device online' : 'Offline · local tools'; }
window.addEventListener('online', networkStatus); window.addEventListener('offline', networkStatus);
render(); networkStatus();
registerOfflineShell();
