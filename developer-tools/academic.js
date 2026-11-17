import { createAcademicPreparation } from '../student-pwa/src/modules/academic/models.js';
import { courseHubView } from '../student-pwa/src/modules/academic/course-hub.js';
import { preparationView } from './academic-preparation.js';
const preparation = createAcademicPreparation();
const main = document.getElementById('workbench');
function render() { main?.replaceChildren(location.hash === '#/course-hub' ? courseHubView(preparation) : preparationView(preparation)); }
window.addEventListener('hashchange', () => { render(); main?.focus(); window.scrollTo(0, 0); }); render();
