import { element,emptyState,link,pageHeading } from '../../components/dom.js';
import { actionButton,selectField,textField } from '../../components/fields.js';
import { confidenceOptions,revisionOptions,progressSummary } from './model.js';
/** @param {ReturnType<typeof import('./model.js').createCourseProgress>} store */
export function courseProgressView(store){
 const root=element('div');root.append(pageHeading('ACADEMICS','Course progress','Organise your personal study outlines and track topics as you revise.'));
 root.append(element('p','local-context','Personal outlines · stays in this tab · clears on reload'));
 const create=element('details','workspace-details');create.open=store.list().length===0;create.append(element('summary','','Add a personal study outline'));
 const form=element('form','metadata-form');const title=textField('outline-title','Outline name');title.input.required=true;const error=element('p','field-error');error.setAttribute('role','alert');
 const submit=element('button','button','Create outline');submit.type='submit';form.append(title.wrap,submit,error);create.append(form);root.append(create);
 const workspace=element('div','stack progress-workspace');root.append(workspace,link('#/courses','← Back to courses','back-link'));
 const status=element('p','search-status');status.setAttribute('role','status');root.append(status);
 form.addEventListener('submit',event=>{event.preventDefault();try{store.addOutline(title.input.value);title.input.value='';error.textContent='';create.open=false;render();status.textContent='Personal outline created.';}catch(e){error.textContent=e instanceof Error?e.message:'The outline could not be created.';}});
 function render(){
  workspace.replaceChildren();const outlines=store.list();if(!outlines.length){workspace.append(emptyState('No study outlines','Add a personal outline to start tracking topics.','courses','h2'));return;}
  const choose=selectField('progress-outline','Study outline',outlines.map(o=>[String(o.id),o.title]));choose.input.value=String(store.selected());choose.input.addEventListener('change',()=>{store.select(Number(choose.input.value));render();});workspace.append(choose.wrap);
  const outline=outlines.find(o=>o.id===store.selected())??outlines[0];const summary=element('section','card');summary.setAttribute('aria-label','Study progress summary');workspace.append(summary);
  function updateSummary(){const current=store.list().find(o=>o.id===outline.id);const s=progressSummary(current?.topics??[]);const all=store.summary();summary.replaceChildren(element('h2','','Your study progress'));
   const grid=element('div','metric-grid');
   for(const [name,value]of [['Topic coverage',s.coverage===null?'No topics yet':`${s.coverage}% · ${s.covered}/${s.total} covered`],['Self-assessed understanding',`${s.confidence.rated}/${s.total} assessed · ${s.confidence.confident} confident`],['Practice performance','Not assessed'],['CBT performance','No assessment results']]){const item=element('div','metric');item.append(element('h3','',name),element('p','',value));grid.append(item);}
   const bar=element('progress');bar.max=100;bar.value=s.coverage??0;bar.hidden=s.coverage===null;bar.setAttribute('aria-label','Personal topic coverage');
   summary.append(grid,bar,element('p','muted',`${s.remaining} remaining · ${s.reviewed} revised · ${s.difficult} difficult · ${s.priorities} high priority`),element('p','inline-note','Totals count leaf topics. Coverage is not demonstrated mastery.'),element('p','muted',`Across your outlines: ${all.covered}/${all.total} topics covered.`));
  }updateSummary();
  const add=element('section','card');add.append(element('h2','','Add topics'));const topicForm=element('form','metadata-form');const topic=textField('topic-title','Topic name');topic.input.required=true;
  const parent=selectField('topic-parent','Parent topic (optional)',[['0','No parent'],...outline.topics.map(t=>/** @type {[string,string]} */([String(t.id),t.title]))]);const addButton=element('button','button','Add topic');addButton.type='submit';const problem=element('p','field-error');problem.setAttribute('role','alert');topicForm.append(topic.wrap,parent.wrap,addButton,problem);add.append(topicForm);workspace.append(add);
  topicForm.addEventListener('submit',event=>{event.preventDefault();try{store.addTopic(outline.id,topic.input.value,Number(parent.input.value));render();status.textContent='Topic added.';document.getElementById('topic-title')?.focus();}catch(e){problem.textContent=e instanceof Error?e.message:'The topic could not be added.';}});
  const list=element('section','card');list.append(element('h2','','Topics and revision'));const filters=selectField('topic-filter','Show topics',[['all','All topics'],['remaining','Not covered'],['difficult','Difficult'],['priority','High priority']]);list.append(filters.wrap);const rows=element('div');list.append(rows);workspace.append(list);
  /** @param {string} key */function refresh(key){updateSummary();if(filters.input.value===key){renderTopics();filters.input.focus();}}
  function renderTopics(){rows.replaceChildren();const records=store.list().find(o=>o.id===outline.id)?.topics??[];const visible=records.filter(t=>filters.input.value==='all'||(filters.input.value==='remaining'&&!t.covered)||(filters.input.value==='difficult'&&t.difficult)||(filters.input.value==='priority'&&t.priority==='high'));
   for(const t of visible){const row=element('article',`topic-row${t.parentId?' subtopic':''}`);row.append(element('h3','',t.title));const parentTitle=records.find(p=>p.id===t.parentId)?.title;if(parentTitle)row.append(element('p','muted',`Subtopic of ${parentTitle}`));
    const covered=element('label','task-check');const check=element('input');check.type='checkbox';check.checked=t.covered;covered.append(check,element('span','',`Covered: ${t.title}`));check.addEventListener('change',()=>{store.update(outline.id,t.id,{covered:check.checked});refresh('remaining');});
    const controls=element('div','topic-controls');
    for(const [key,label,options]of /** @type {[('confidence'|'revision'|'priority'),string,[string,string][]][]} */([['confidence','Understanding',Object.entries(confidenceOptions)],['revision','Revision',Object.entries(revisionOptions)],['priority','Priority',[['normal','Normal'],['high','High']]]])){const field=selectField(`${key}-${t.id}`,`${label}: ${t.title}`,options);field.input.value=t[key];field.input.addEventListener('change',()=>{store.update(outline.id,t.id,{[key]:field.input.value});refresh(key);});controls.append(field.wrap);}
    const difficult=element('label','preference-check');const d=element('input');d.type='checkbox';d.checked=t.difficult;difficult.append(d,element('span','',`Difficult: ${t.title}`));d.addEventListener('change',()=>{store.update(outline.id,t.id,{difficult:d.checked});refresh('difficult');});
    row.append(covered,controls,difficult,actionButton(`Remove topic: ${t.title}`,()=>{store.removeTopic(outline.id,t.id);render();status.textContent='Topic and its subtopics removed.';}));rows.append(row);
   }if(!visible.length)rows.append(emptyState('No topics to show','Add topics or choose another filter.'));
  }filters.input.addEventListener('change',renderTopics);renderTopics();
  workspace.append(actionButton('Remove this personal outline',()=>{store.removeOutline(outline.id);render();status.textContent='Personal outline removed.';}));
 }
 render();return root;
}
