import { parseCalendarDate } from './calendar.js';

import { resourceCategories,eventKinds } from './catalogue.js';
export { resourceCategories,eventKinds } from './catalogue.js';
/** @param {unknown} value @param {string[]} keys */
function fields(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(key => !keys.includes(key))) throw new TypeError('Use only the documented metadata fields.');
}
/** @param {unknown} value @param {string} label @param {number} max @param {boolean} [optional] */
function text(value, label, max, optional = false) {
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/u.test(value) || value.trim().length > max || (!optional && !value.trim())) throw new TypeError(`${label} must be plain text of ${optional ? '0' : '1'}–${max} characters.`);
  return value.trim();
}
/** Source links are references, never proof of review. @param {unknown} value */
export function academicSourceUrl(value) {
  if (typeof value !== 'string' || value.length > 2048 || !/^https:\/\//i.test(value)) return null;
  try {
    if (/[\u0000-\u0020\u007f\\]/u.test(value)) return null;
    let decoded = value;
    for (let index = 0; index < 3; index++) { if (/[\u0000-\u001f\u007f\\]/u.test(decoded)) return null; decoded = decodeURIComponent(decoded); }
    if (/[\u0000-\u001f\u007f\\]/u.test(decoded) || /%(?:25)*(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i.test(decoded)) return null;
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname && !url.username && !url.password && (!url.port || url.port === '443') ? url.href : null;
  } catch { return null; }
}
/** Only explicit Drive/Docs destinations; strips tracking/redirect arguments. @param {unknown} value */
export function driveResourceUrl(value) {
  const safe = academicSourceUrl(value); if (!safe) return null;
  const url = new URL(safe);
  const id = '[A-Za-z0-9_-]{10,200}';
  const drive = url.hostname === 'drive.google.com' && new RegExp(`^/(?:file/d/${id}(?:/view)?|drive/folders/${id})/?$`).test(url.pathname);
  const docs = url.hostname === 'docs.google.com' && new RegExp(`^/(?:document|presentation|spreadsheets)/d/${id}/(?:edit|view|preview)/?$`).test(url.pathname);
  if (!drive && !docs) return null;
  const key = url.searchParams.get('resourcekey');
  if (key && !/^[A-Za-z0-9_-]{1,200}$/.test(key)) return null;
  url.search = ''; url.hash = ''; if (key) url.searchParams.set('resourcekey', key);
  return url.href;
}
/** @param {{code:string,title:string,units:number,level:number,description:string,sourceUrl:string,session?:string,semester?:string}} value */
export function courseProposal(value) {
  fields(value, ['code', 'title', 'units', 'level', 'description', 'sourceUrl', 'session', 'semester']);
  const code = text(value.code, 'Course code', 20).toUpperCase();
  if (!/^[A-Z][A-Z0-9 -]{1,19}$/.test(code)) throw new TypeError('Use a short alphanumeric course code.');
  if (!Number.isInteger(value.units) || value.units < 0 || value.units > 10 || ![100, 200, 300].includes(value.level)) throw new RangeError('Use integer units from 0–10 and a proposed 100, 200 or 300 Level.');
  const sourceUrl = academicSourceUrl(value.sourceUrl); if (!sourceUrl) throw new TypeError('Supply a safe HTTPS source reference.');
  const session=value.session??''; const semester=value.semester??'';
  if((session||semester)&&(!/^20\d{2}\/20\d{2}$/.test(session)||Number(session.slice(5))!==Number(session.slice(0,4))+1||!['first','second'].includes(semester)))throw new TypeError('Use a consecutive academic session and first or second semester.');
  return { code, title: text(value.title, 'Course title', 120), units: value.units, level: value.level, description: text(value.description, 'Description', 1200, true), sourceUrl, session, semester };
}
/** @param {{courseId:number,title:string,parentId:number,sourceUrl:string}} value */
export function topicProposal(value){fields(value,['courseId','title','parentId','sourceUrl']);const sourceUrl=academicSourceUrl(value.sourceUrl);if(!sourceUrl||!Number.isSafeInteger(value.parentId)||value.parentId<0)throw new TypeError('Use a source reference and valid parent topic.');return {courseId:value.courseId,title:text(value.title,'Topic title',120),parentId:value.parentId,sourceUrl};}
/** @param {{courseId:number,title:string,category:string,url:string,description:string}} value */
export function resourceProposal(value) {
  fields(value, ['courseId', 'title', 'category', 'url', 'description']);
  if (!Object.hasOwn(resourceCategories, value.category)) throw new TypeError('Choose an approved resource category.');
  const url = driveResourceUrl(value.url); if (!url) throw new TypeError('Use a direct HTTPS Google Drive or Docs resource link.');
  return { courseId: value.courseId, title: text(value.title, 'Resource title', 120), category: value.category, url, description: text(value.description, 'Description', 800, true) };
}
/** @param {string} value */
function clock(value) { if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new RangeError('Use a valid 24-hour time.'); return Number(value.slice(0, 2)) * 60 + Number(value.slice(3)); }
/** @param {{courseId:number,title:string,kind:string,date:string,start:string,end:string,sourceUrl:string}} value */
export function eventProposal(value) {
  fields(value, ['courseId', 'title', 'kind', 'date', 'start', 'end', 'sourceUrl']);
  if (!Object.hasOwn(eventKinds, value.kind) || !parseCalendarDate(value.date) || value.date < '2000-01-01' || value.date > '2200-12-31') throw new RangeError('Choose an event kind and a valid date from 2000–2200.');
  const start = clock(value.start);
  if ((value.kind === 'class' || value.kind === 'examination') && !value.end) throw new RangeError('Classes and examinations require an end time.');
  if (value.end && clock(value.end) <= start) throw new RangeError('End time must follow start time on the same date.');
  const sourceUrl = academicSourceUrl(value.sourceUrl); if (!sourceUrl) throw new TypeError('Supply a safe HTTPS source reference.');
  return { courseId: value.courseId, title: text(value.title, 'Event title', 120), kind: value.kind, date: value.date, start: value.start, end: value.end, sourceUrl };
}
/** Descriptor checks are not binary inspection, malware scanning or upload authorization.
 * @param {{name:string,size:number,type:string}} file */
export function academicFileDescriptor(file) {
  fields(file, ['name', 'size', 'type']);
  const name = text(file.name, 'Filename', 120);
  if (!/^[A-Za-z0-9][A-Za-z0-9._ -]+$/.test(name) || name.includes('..')) throw new TypeError('Use a plain filename without paths or traversal.');
  const types = { pdf: 'application/pdf', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  const extension = name.split('.').pop()?.toLowerCase();
  if (!extension || !Object.hasOwn(types, extension) || types[/** @type {keyof typeof types} */ (extension)] !== file.type || !Number.isSafeInteger(file.size) || file.size <= 0 || file.size > 10 * 1024 * 1024) throw new RangeError('Proposed files must be bounded PDF, PPTX or DOCX descriptors with matching declared types.');
  return { name: name.replaceAll(' ', '-'), size: file.size, type: file.type };
}
/** All output remains local and unreviewed. This is not a database or RBAC layer. */
export function createAcademicPreparation() {
  /** @type {(ReturnType<typeof courseProposal>&{id:number,status:string})[]} */ let courses = [];
  /** @type {(ReturnType<typeof resourceProposal>&{id:number,status:string})[]} */ let resources = [];
  /** @type {(ReturnType<typeof eventProposal>&{id:number,status:string})[]} */ let events = [];
  /** @type {(ReturnType<typeof topicProposal>&{id:number,status:string})[]} */ let topics = [];
  let serial = 0; let selected = 0;
  const list = () => ({ courses: courses.map(item => ({ ...item })), resources: resources.map(item => ({ ...item })), events: events.map(item => ({ ...item })), topics:topics.map(item=>({...item})), selected });
  /** @param {number} id */
  function requireCourse(id) { const course = courses.find(item => item.id === id); if (!course) throw new RangeError('Choose a course prepared in this tab.'); return course; }
  return {
    list,
    /** @param {Parameters<typeof courseProposal>[0]} value */
    addCourse(value) { const course = courseProposal(value); if (courses.length >= 20 || courses.some(item => item.code === course.code && item.level === course.level && item.session===course.session && item.semester===course.semester)) throw new RangeError('Avoid duplicate course/context proposals; maximum 20 courses.'); courses.push({ ...course, id: ++serial, status: 'local-unreviewed' }); selected = serial; return serial; },
    /** @param {Parameters<typeof topicProposal>[0]} value */
    addTopic(value){const topic=topicProposal(value);requireCourse(topic.courseId);if(topics.length>=200||topics.some(t=>t.courseId===topic.courseId&&t.parentId===topic.parentId&&t.title.toLowerCase()===topic.title.toLowerCase()))throw new RangeError('Use unique topics; maximum 200 proposals.');if(topic.parentId&&!topics.some(t=>t.id===topic.parentId&&t.courseId===topic.courseId))throw new RangeError('Parent topic must belong to this course.');topics.push({...topic,id:++serial,status:'local-unreviewed'});},
    /** @param {Parameters<typeof resourceProposal>[0]} value */
    addResource(value) { const resource = resourceProposal(value); requireCourse(resource.courseId); if (resources.length >= 80) throw new RangeError('Maximum 80 local resource proposals.'); resources.push({ ...resource, id: ++serial, status: 'local-unreviewed' }); },
    /** @param {Parameters<typeof eventProposal>[0]} value */
    addEvent(value) {
      const event = eventProposal(value); const course = requireCourse(event.courseId);
      /** @param {string} kind */ const blocks = (kind) => kind === 'class' || kind === 'examination';
      if (events.length >= 80 || (blocks(event.kind) && events.some(item => blocks(item.kind) && requireCourse(item.courseId).level === course.level && requireCourse(item.courseId).session===course.session && requireCourse(item.courseId).semester===course.semester && item.date === event.date && clock(item.start) < clock(event.end) && clock(event.start) < clock(item.end)))) throw new RangeError('Conflicting proposed class/examination times or the 80-event limit was reached.');
      events.push({ ...event, id: ++serial, status: 'local-unreviewed' });
    },
    /** @param {number} id */
    select(id) { requireCourse(id); selected = id; },
    /** @param {'course'|'resource'|'event'} kind @param {number} id */
    remove(kind, id) {
      if (kind === 'resource') resources = resources.filter(item => item.id !== id);
      if (kind === 'event') events = events.filter(item => item.id !== id);
      if (kind === 'course') { courses = courses.filter(item => item.id !== id); resources = resources.filter(item => item.courseId !== id); events = events.filter(item => item.courseId !== id); topics=topics.filter(item=>item.courseId!==id); if (selected === id) selected = 0; }
    },
  };
}
