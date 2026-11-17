import { exactFields,plainText } from '../../components/validation.js';
/** @typedef {{id:number,title:string,parentId:number,covered:boolean,revision:string,confidence:string,difficult:boolean,priority:string}} Topic */
/** @typedef {{id:number,title:string,topics:Topic[]}} Outline */
export const confidenceOptions=Object.freeze({unassessed:'Not assessed',low:'Low',developing:'Developing',confident:'Confident'});
export const revisionOptions=Object.freeze({'not-started':'Not started',planned:'Planned',reviewed:'Reviewed'});
/** Coverage counts leaf topics, so parents and subtopics are not double counted.
 * @param {Topic[]} topics */
export function progressSummary(topics){const leaves=topics.filter(topic=>!topics.some(child=>child.parentId===topic.id));const total=leaves.length;const covered=leaves.filter(t=>t.covered).length;const rated=leaves.filter(t=>t.confidence!=='unassessed');return {total,covered,remaining:total-covered,coverage:total?Math.round(100*covered/total):null,reviewed:leaves.filter(t=>t.revision==='reviewed').length,difficult:leaves.filter(t=>t.difficult).length,priorities:leaves.filter(t=>t.priority==='high').length,confidence:{rated:rated.length,low:rated.filter(t=>t.confidence==='low').length,developing:rated.filter(t=>t.confidence==='developing').length,confident:rated.filter(t=>t.confidence==='confident').length},practice:null,cbt:null};}
/** Personal, non-confidential outlines in tab memory only. No official records. */
export function createCourseProgress(){
 /** @type {Outline[]} */let outlines=[];let next=0;let selected=0;
 /** @param {number} id */function requireOutline(id){const item=outlines.find(o=>o.id===id);if(!item)throw new RangeError('Choose a personal outline.');return item;}
 return {
 list(){return outlines.map(o=>({...o,topics:o.topics.map(t=>({...t}))}));},selected(){return selected;},
 /** @param {string} title */addOutline(title){const value=plainText(title);if(outlines.length>=10||outlines.some(o=>o.title.toLocaleLowerCase()===value.toLocaleLowerCase()))throw new RangeError('Use a unique outline name; maximum 10 outlines.');const id=++next;outlines.push({id,title:value,topics:[]});selected=id;return id;},
 /** @param {number} id */select(id){requireOutline(id);selected=id;},
 /** @param {number} id @param {string} title @param {number} [parentId] */addTopic(id,title,parentId=0){const outline=requireOutline(id);const value=plainText(title);if(outline.topics.length>=100)throw new RangeError('Maximum 100 topics per outline.');if(parentId&&!outline.topics.some(t=>t.id===parentId))throw new RangeError('Choose a parent in this outline.');if(outline.topics.some(t=>t.title.toLowerCase()===value.toLowerCase()&&t.parentId===parentId))throw new RangeError('This topic already exists.');outline.topics.push({id:++next,title:value,parentId,covered:false,revision:'not-started',confidence:'unassessed',difficult:false,priority:'normal'});},
 /** @param {number} outlineId @param {number} topicId @param {{covered?:boolean,revision?:string,confidence?:string,difficult?:boolean,priority?:string}} change */update(outlineId,topicId,change){exactFields(change,['covered','revision','confidence','difficult','priority']);const topic=requireOutline(outlineId).topics.find(t=>t.id===topicId);if(!topic)throw new RangeError('Choose a topic in this outline.');if(('covered'in change&&typeof change.covered!=='boolean')||('difficult'in change&&typeof change.difficult!=='boolean')||(change.revision!==undefined&&!Object.hasOwn(revisionOptions,change.revision))||(change.confidence!==undefined&&!Object.hasOwn(confidenceOptions,change.confidence))||(change.priority!==undefined&&!['normal','high'].includes(change.priority)))throw new TypeError('Choose valid topic progress values.');Object.assign(topic,change);},
 /** @param {number} outlineId @param {number} topicId */removeTopic(outlineId,topicId){const outline=requireOutline(outlineId);const ids=new Set([topicId]);for(let i=0;i<outline.topics.length;i++)for(const t of outline.topics)if(ids.has(t.parentId))ids.add(t.id);outline.topics=outline.topics.filter(t=>!ids.has(t.id));},
 /** @param {number} id */removeOutline(id){requireOutline(id);outlines=outlines.filter(o=>o.id!==id);if(selected===id)selected=outlines[0]?.id??0;},
 summary(){return progressSummary(outlines.flatMap(o=>o.topics));},clear(){outlines=[];selected=0;},
 };
}
