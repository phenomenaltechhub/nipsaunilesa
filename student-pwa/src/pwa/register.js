/** @typedef {Event & { prompt: () => Promise<void>, userChoice: Promise<{outcome:string}> }} InstallEvent */

export function registerOfflineShell() {
  const notice = document.getElementById('update-notice');
  const apply = document.getElementById('apply-update');
  const install = document.getElementById('install-app');
  /** @type {InstallEvent|null} */
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = /** @type {InstallEvent} */ (event);
    if (install) install.hidden = false;
  });
  install?.addEventListener('click', async () => {
    if (!installPrompt) return;
    try { await installPrompt.prompt(); await installPrompt.userChoice; }
    catch { install.textContent = 'Install unavailable'; }
    finally { installPrompt = null; install.hidden = true; }
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; if (install) install.hidden = true; });
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  let userRequestedReload = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (userRequestedReload) window.location.reload(); });
  navigator.serviceWorker.register('./sw.js', { scope: './', type: 'module', updateViaCache: 'none' }).then(registration => {
    function showUpdate() { if (registration.waiting && navigator.serviceWorker.controller && notice) notice.hidden = false; }
    showUpdate();
    registration.addEventListener('updatefound', () => {
      registration.installing?.addEventListener('statechange', showUpdate);
    });
    apply?.addEventListener('click', () => {
      if (registration.waiting) { userRequestedReload = true; registration.waiting.postMessage({ type: 'APPLY_PUBLIC_SHELL_UPDATE' }); }
    });
  }).catch(() => {
    console.info('PWA-001: offline setup failed.');
  });
}
