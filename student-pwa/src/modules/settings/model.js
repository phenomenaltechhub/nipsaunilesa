/** Non-sensitive current-tab preferences; no device permission or persistence. */
export function createSettings(){let theme='system';let textSize='standard';let announcements=true;let resources=true;return {
 snapshot(){return {theme,textSize,announcements,resources};},
 /** @param {'theme'|'textSize'|'announcements'|'resources'} key @param {string|boolean} value */set(key,value){if(key==='theme'&&typeof value==='string'&&['system','light','dark'].includes(value))theme=value;else if(key==='textSize'&&typeof value==='string'&&['standard','large'].includes(value))textSize=value;else if(key==='announcements'&&typeof value==='boolean')announcements=value;else if(key==='resources'&&typeof value==='boolean')resources=value;else throw new TypeError('Choose a supported preference.');},
 clear(){theme='system';textSize='standard';announcements=true;resources=true;},
};}
/** @param {ReturnType<typeof createSettings>} settings */
export function applyAppearance(settings){const value=settings.snapshot();document.documentElement.dataset.theme=value.theme==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):value.theme;document.documentElement.dataset.textSize=value.textSize;const meta=document.querySelector('meta[name=theme-color]');meta?.setAttribute('content',document.documentElement.dataset.theme==='dark'?'#102820':'#075443');}
