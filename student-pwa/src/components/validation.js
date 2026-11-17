/** @param {unknown} value @param {number} [max] */
export function plainText(value,max=120){if(typeof value!=='string'||/[\u0000-\u001f\u007f]/u.test(value)||!value.trim()||value.trim().length>max)throw new TypeError(`Use plain text of 1–${max} characters.`);return value.trim();}
/** @param {unknown} value @param {string[]} allowed */
export function exactFields(value,allowed){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!allowed.includes(key)))throw new TypeError('Use only documented fields.');}
/** Search is literal text; it never creates a regexp or HTML. @param {string} text */
export function searchKey(text){return text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('en').trim().slice(0,120);}
