import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.pdf': 'application/pdf' };

// Local development/test helper only. Never used as the production host.
export async function startStaticServer(root, port = 0) {
  const realRoot = fs.realpathSync(root);
  const server = createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    let target;
    try { target = path.resolve(realRoot, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname)); }
    catch { response.writeHead(400).end(); return; }
    const withinRoot = file => file === realRoot || file.startsWith(realRoot + path.sep);
    if (!withinRoot(target)) { response.writeHead(403).end(); return; }
    const candidates = request.headers.rsc === '1' ? [target + '.txt', target] : [target, path.join(target, 'index.html'), target + '.html'];
    const file = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile() && withinRoot(fs.realpathSync(candidate)));
    if (!file) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=0' });
    if (request.method === 'HEAD') response.end(); else fs.createReadStream(file).pipe(response);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}
