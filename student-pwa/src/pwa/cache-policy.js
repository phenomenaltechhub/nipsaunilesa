// Explicit public assets only. Never add API responses, user exports or course files.
export const cachePrefix = 'pharmaideia-public-shell-';
export const cacheName = `${cachePrefix}v1`;
export const publicAssets = Object.freeze([
  './', './index.html', './styles/tokens.css', './styles/app.css', './manifest.webmanifest',
  './assets/brand/symbol.svg', './assets/brand/symbol-dark.svg', './assets/brand/favicon.svg',
  './assets/brand/favicon-32.png', './assets/brand/apple-touch-icon.png',
  './assets/brand/icon-192.png', './assets/brand/icon-512.png',
  './assets/brand/maskable-192.png', './assets/brand/maskable-512.png',
  './src/app.js', './src/components/dom.js', './src/state/routes.js', './src/api/services.js',
  './src/modules/academic/views.js', './src/modules/study/focus.js', './src/modules/study/view.js',
  './src/modules/community/view.js', './src/modules/account/view.js', './src/pwa/register.js', './src/pwa/cache-policy.js',
]);

/** @param {{url:string,method:string,credentials?:string,mode?:string,headers:{has:(name:string)=>boolean}}} request @param {string} scope */
export function publicCacheKey(request, scope) {
  const url = new URL(request.url);
  // Hash routes select UI only. Chromium retains them on navigation requests,
  // while the precached public document has no fragment.
  url.hash = '';
  const base = new URL(scope);
  // Browser document navigation uses credentials:include. It may receive only
  // the public shell fetched without credentials at installation, never a
  // personalised network response. Runtime responses are never cache-written.
  const shellNavigation = request.mode === 'navigate' && [base.href, new URL('./index.html', base).href].includes(url.href);
  if (request.method !== 'GET' || url.origin !== base.origin || url.search || (request.credentials === 'include' && !shellNavigation) || request.headers.has('authorization') || request.headers.has('range')) return null;
  return publicAssets.map(asset => new URL(asset, base).href).includes(url.href) ? url.href : null;
}
