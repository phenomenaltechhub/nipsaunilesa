import { api, node, button, form, link } from '/access/api.mjs';
export { api, node, button, form, link };
export const card = (title) => { const section = node('section', '', 'card'); section.append(node('h2', title)); return section; };
export function empty(parent, title, copy = '') { parent.append(node('h3', title), node('p', copy)); }
export function notice(parent, text) { const p = node('p', text, 'status'); p.setAttribute('role', 'status'); parent.append(p); return p; }
export function action(label, fn, parent) { return button(label, async () => { try {
    await fn();
}
catch (error) {
    notice(parent, error.message);
} }); }
export function selectField(id, label, values) { return { id, label, options: values }; }
export function jsonDownload(value, name) { const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), a = link(url, 'Download'); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export function jsonInput(formNode, id, label, value) { const wrap = node('div'), l = node('label', label), input = node('textarea'); input.id = id; input.value = JSON.stringify(value, null, 2); input.rows = 8; input.maxLength = 12000; l.htmlFor = id; wrap.append(l, input); formNode.append(wrap); return input; }
export function multi(values, id, label) { const fieldset = node('fieldset'); fieldset.append(node('legend', label)); for (const [value, text] of values) {
    const l = node('label', '', 'choice'), input = node('input');
    input.type = 'checkbox';
    input.value = value;
    input.name = id;
    l.append(input, node('span', text));
    fieldset.append(l);
} return { node: fieldset, values: () => Array.from(fieldset.querySelectorAll('input:checked')).map(i => i.value) }; }
export function heading(main, title, copy) { main.replaceChildren(); const header = node('header', '', 'page-heading'), h = node('h1', title); h.id = 'page-title'; header.append(h, node('p', copy)); main.append(header); }
export function utcInput(value) { return value ? new Date(value).toISOString() : new Date().toISOString(); }
export async function studentPicker(courseId, ctx, { accessEditor = false, selectedIds = [] } = {}) { const selected = new Set(selectedIds), root = node('fieldset'), rows = node('div'), legend = node('legend', 'Select specific eligible students'); let offset = 0; const more = button('Load more students', async () => { try {
    await load();
}
catch (error) {
    notice(root, error.message);
} }); root.append(legend, rows, more); async function load() { const data = await api('/admin/academic/' + courseId + '/candidates?offset=' + offset); if (!ctx.alive())
    return; for (const user of data.students) {
    const label = node('label', '', 'choice'), input = node('input');
    input.type = 'checkbox';
    input.value = user.id;
    input.disabled = !user.eligible && !accessEditor;
    input.checked = selected.has(user.id);
    input.addEventListener('change', () => { if (input.checked)
        selected.add(user.id);
    else
        selected.delete(user.id); });
    label.append(input, node('span', `${user.name} · ${user.level} Level${user.eligible ? '' : ' · no course access'}`));
    rows.append(label);
} offset = data.nextOffset; more.hidden = offset === null; } await load(); return { node: root, values: () => Array.from(selected) }; }
