import { moduleStatus } from './modules.js';
import { element } from '../student-pwa/src/components/dom.js';
const body = document.getElementById('modules');
for (const entry of moduleStatus) { const row = element('tr'); for (const value of entry) row.append(element('td', '', value)); body?.append(row); }
