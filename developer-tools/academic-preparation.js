import {availabilityNote} from './availability.js';
import { element, link, pageHeading } from '../student-pwa/src/components/dom.js';
import { sectionHeading, tabs } from '../student-pwa/src/components/academic.js';
import { eventKinds, resourceCategories } from '../student-pwa/src/modules/academic/models.js';

/** @typedef {{key:string,label:string,type?:string,options?:[string,string][],optional?:boolean,max?:number}} Field */
/** @param {string} prefix @param {Field[]} fields @param {(values:Record<string,string>)=>void} submit */
function preparationForm(prefix, fields, submit) {
  const form = element('form', 'metadata-form');
  const error = element('p', 'field-error'); error.id = `${prefix}-error`; error.setAttribute('role', 'alert');
  const status = element('p', 'search-status'); status.setAttribute('role', 'status');
  /** @type {Record<string,HTMLInputElement|HTMLSelectElement>} */ const inputs = {};
  for (const field of fields) {
    const wrapper = element('div'); const label = element('label', 'field-label', field.label); label.htmlFor = `${prefix}-${field.key}`;
    const input = field.options ? element('select') : element('input'); input.id = label.htmlFor; input.required = !field.optional;
    if (input instanceof HTMLSelectElement) for (const [value, title] of field.options ?? []) input.add(new Option(title, value));
    else { input.type = field.type ?? 'text'; input.maxLength = field.max ?? 120; input.autocomplete = 'off'; if (field.type === 'number') { input.min = '0'; input.max = '10'; input.step = '1'; } }
    input.setAttribute('aria-describedby', error.id); inputs[field.key] = input; wrapper.append(label, input); form.append(wrapper);
  }
  const button = element('button', 'button', 'Prepare local proposal'); button.type = 'submit';
  form.append(button, error, status);
  form.addEventListener('submit', event => {
    event.preventDefault(); error.textContent = '';
    try { submit(Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value]))); form.reset(); status.textContent = 'Prepared in this tab only. Not reviewed, saved remotely or published. Open Prepared items to inspect it.'; }
    catch (failure) { error.textContent = failure instanceof Error ? failure.message : 'The metadata could not be prepared.'; status.textContent = ''; }
  });
  return form;
}

/** @param {ReturnType<typeof import('../student-pwa/src/modules/academic/models.js').createAcademicPreparation>} preparation */
export function preparationView(preparation) {
  const root = element('div');
  root.append(pageHeading('ACADEMIC CONTENT PREPARATION', 'Prepare academic information', 'Independent metadata validation for future authorised representatives. Nothing entered here is verified or published.'));
  root.append(availabilityNote('Session-only preparation, not management access.', 'Use non-confidential metadata only. Proposed level is a content field, not permission to manage that level. Prepared items clear on reload; uploads and server submission are unavailable.'));
  const card = element('section', 'card'); card.append(sectionHeading('Local preparation', 'Unreviewed · not synced'));
  /** @returns {Field} */
  function courseField() { return { key: 'courseId', label: 'Prepared course', options: [['', 'Choose a local course'], ...preparation.list().courses.map(course => /** @type {[string,string]} */ ([String(course.id), `${course.code} · ${course.title}`]))] }; }
  const description = /** @type {Field} */ ({ key: 'description', label: 'Description (optional)', optional: true, max: 800 });
  const source = /** @type {Field} */ ({ key: 'sourceUrl', label: 'Source reference (HTTPS)', type: 'url', max: 2048 });
  card.append(tabs('academic-preparation', 'Academic preparation sections', [
    { id: 'course', title: 'Course', render: () => preparationForm('course-proposal', [
      { key: 'code', label: 'Proposed course code', max: 20 }, { key: 'title', label: 'Proposed course title' },
      { key: 'session', label: 'Proposed academic session', max: 9 }, { key: 'semester', label: 'Proposed semester', options: [['','Choose semester'],['first','First semester'],['second','Second semester']] },
      { key: 'units', label: 'Proposed units', type: 'number' }, { key: 'level', label: 'Proposed academic level', options: [['100', '100 Level'], ['200', '200 Level'], ['300', '300 Level']] }, description, source,
    ], value => preparation.addCourse({ code: value.code, title: value.title, units: Number(value.units), level: Number(value.level), description: value.description, sourceUrl: value.sourceUrl, session:value.session, semester:value.semester })) },
    { id: 'topic', title: 'Topics & subtopics', render: () => preparationForm('topic-proposal',[courseField(),{key:'title',label:'Proposed topic title'},{key:'parentId',label:'Parent topic (optional)',optional:true,options:[['0','No parent'],...preparation.list().topics.map(t=>/** @type {[string,string]} */([String(t.id),t.title]))]},source],value=>preparation.addTopic({courseId:Number(value.courseId),title:value.title,parentId:Number(value.parentId),sourceUrl:value.sourceUrl})) },
    { id: 'resource', title: 'Resource', render() {
      const section = element('div'); section.append(element('p', 'inline-note', 'Prepare a course first. Drive links remain external: publicly shared links cannot be protected by this app. Rights, review and actual access still need verification.'));
      section.append(preparationForm('resource-proposal', [courseField(), { key: 'title', label: 'Resource title' }, { key: 'category', label: 'Resource category', options: Object.entries(resourceCategories) }, { key: 'url', label: 'Google Drive or Docs link', type: 'url', max: 2048 }, description], value => preparation.addResource({ courseId: Number(value.courseId), title: value.title, category: value.category, url: value.url, description: value.description })));
      section.append(element('p', 'inline-note', 'File uploads are unavailable. Future PDF/PPTX/DOCX uploads need server authorization, binary inspection, size/container limits, malware scanning, private storage and safe downloads. Descriptor validation alone cannot provide those controls.')); return section;
    } },
    { id: 'schedule', title: 'Schedule & deadlines', render: () => preparationForm('event-proposal', [courseField(), { key: 'title', label: 'Proposed event title' }, { key: 'kind', label: 'Entry type', options: Object.entries(eventKinds) }, { key: 'date', label: 'Proposed date', type: 'date' }, { key: 'start', label: 'Start or deadline time', type: 'time' }, { key: 'end', label: 'End time (required for classes/exams)', type: 'time', optional: true }, source], value => preparation.addEvent({ courseId: Number(value.courseId), title: value.title, kind: value.kind, date: value.date, start: value.start, end: value.end, sourceUrl: value.sourceUrl })) },
    { id: 'prepared', title: 'Prepared items', render() {
      const section = element('div'); const snapshot = preparation.list();
      const empty = element('p', 'inline-note', 'No local metadata has been prepared. No institutional records are bundled into this application.'); empty.hidden = Boolean(snapshot.courses.length); section.append(empty);
      const counts = element('p', 'inline-note');
      function summary() { const current = preparation.list(); counts.textContent = `${current.resources.length} resource proposals · ${current.events.length} schedule/deadline proposals. Local preparation counts, not published institutional statistics.`; empty.hidden = Boolean(current.courses.length); }
      for (const course of snapshot.courses) {
        const row = element('article', 'prepared-course'); row.append(element('h3', '', `${course.code} · ${course.title}`), element('p', 'muted', `${course.level} Level proposed · ${course.units} units proposed · local/unreviewed`));
        const open = link('#/course-hub', 'Inspect prepared course hub →', 'button subtle'); open.addEventListener('click', () => preparation.select(course.id));
        const remove = element('button', 'button subtle', 'Remove local course'); remove.type = 'button'; remove.addEventListener('click', () => { preparation.remove('course', course.id); row.remove(); summary(); });
        row.append(open, remove); section.append(row);
      }
      section.append(counts); summary(); return section;
    } },
  ]));
  root.append(card); return root;
}
