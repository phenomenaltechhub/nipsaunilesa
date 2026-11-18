// Shared, original, inert vocabulary: imported by the native server and browser.
export const emojiGroups = Object.freeze({
  Reactions: ['👍','❤️','😂','👏','✅','🙏','💚','🤔','🎉','💯','😊','👀','❓','💡','🙌','🙂','😃','😄','😁','😆','😅','🤣','😉','😌','😍','🥰','😎','🤓','🧐','🥳','😇','😐','😕','😢','😭','😮','😲','😴','🤗','🤝','👌','✌️','🤞','💪','👋','🤚','✋','👆','👇','👉','👈'],
  Study: ['📚','📖','📝','✏️','🖊️','🔬','🧪','⚗️','💊','🧬','🧠','🎓','📅','⏰','⌛','📌','🔖','📎','🔍','💻','📱','🔋','🌱','🌿','🍀','☀️','🌙','⭐','🌟','✨','⚡','🔥','🎯','🏆','🎨','🎵','☕','🍵','💧','🌍','🕊️','🛡️','🔒','🔑','🚀','🧭','📢','💬','🗂️','📋']
});
export const emojiChoices = Object.freeze(Object.values(emojiGroups).flat());
export const reactionGlyph = value => ({thanks:'👍',agree:'✅',question:'❓'})[value] ?? value;
export const roleLabel = role => ({student:'Student',representative:'Course Rep (CR)',administrator:'Administrator',executive:'Executive',reviewer:'Academic reviewer'})[role] ?? 'Member';
export function communityText(value, optional=false) {
  if(typeof value!=='string'||/[\uD800-\uDFFF]/u.test(value)||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value))throw new Error('Use plain text.');
  const normalized=value.normalize('NFC');if(Array.from(normalized).length>2000||(!optional&&!normalized.trim()))throw new Error('Use 1–2,000 Unicode characters.');return normalized.trim();
}
