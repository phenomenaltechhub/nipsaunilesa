import { element } from './dom.js';
/** @param {string} id @param {string} title @param {'text'|'search'|'date'} [type] */
export function textField(id,title,type='text'){const wrap=element('div');const label=element('label','field-label',title);label.htmlFor=id;const input=element('input');input.id=id;input.type=type;input.maxLength=120;wrap.append(label,input);return {wrap,input};}
/** @param {string} id @param {string} title @param {[string,string][]} options */
export function selectField(id,title,options){const wrap=element('div');const label=element('label','field-label',title);label.htmlFor=id;const input=element('select');input.id=id;for(const [value,text]of options)input.add(new Option(text,value));wrap.append(label,input);return {wrap,input};}
/** @param {string} label @param {()=>void} action @param {string} [className] */
export function actionButton(label,action,className='button subtle'){const button=element('button',className,label);button.type='button';button.addEventListener('click',action);return button;}
