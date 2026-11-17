import { searchKey } from '../../components/validation.js';
/** A future trusted reviewed-content feed supplies entries; no definitions seeded.
 * @typedef {{id:string,term:string,definition:string,category:string,sourceUrl:string,reviewedAt:string}} GlossaryEntry */
/** @param {GlossaryEntry[]} entries @param {string} query */
export function searchGlossary(entries,query){const key=searchKey(query);return entries.filter(e=>!key||searchKey(`${e.term} ${e.definition} ${e.category}`).includes(key));}
/** @param {GlossaryEntry[]} entries @param {string} date */
export function termOfDay(entries,date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date)throw new RangeError('Use a valid calendar day.');if(!entries.length)return null;const sorted=[...entries].sort((a,b)=>a.id.localeCompare(b.id));const day=Math.floor(Date.parse(date+'T12:00:00Z')/86400000);return {...sorted[((day%sorted.length)+sorted.length)%sorted.length]};}
