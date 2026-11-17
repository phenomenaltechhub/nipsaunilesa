// Same-origin controlled-service bootstrap. No credentials or private data cached.
import { session } from '/access/api.mjs';
let mounted = null, epoch = 0;
async function connect() { const ticket = ++epoch; mounted?.dispose(); mounted = null; if (document.hidden || !navigator.onLine)
    return; try {
    const state = await session();
    if (ticket !== epoch)
        return;
    if (state.stage !== 'authenticated')
        return;
    const feature = await import('/operations/app.mjs');
    if (ticket !== epoch)
        return;
    mounted = feature.mount(state);
}
catch { /* The independent offline personal tools remain usable. */ } }
window.addEventListener('hashchange', connect);
window.addEventListener('online', connect);
window.addEventListener('offline', connect);
window.addEventListener('pageshow', connect);
document.addEventListener('visibilitychange', connect);
new BroadcastChannel('pharmaideia-account-state').addEventListener('message', connect);
if (document.readyState === 'complete')
    connect();
else
    window.addEventListener('load', connect, { once: true });
