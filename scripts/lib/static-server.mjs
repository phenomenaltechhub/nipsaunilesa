import {mediaRange} from './media-range.mjs';
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.vtt': 'text/vtt; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.webm': 'video/webm', '.mp4': 'video/mp4' };

// Local development/test helper only. Never used as the production host.
export async function startStaticServer(root, port = 0, allowedPrefixes = null) {
  const realRoot = fs.realpathSync(root);
  const server = createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    let target;
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (allowedPrefixes && (!allowedPrefixes.some(prefix => pathname.startsWith(prefix)) || pathname.split('/').some(part => part.startsWith('.')))) { response.writeHead(403).end(); return; }
      target = path.resolve(realRoot, '.' + pathname);
    }
    catch { response.writeHead(400).end(); return; }
    const withinRoot = file => file === realRoot || file.startsWith(realRoot + path.sep);
    if (!withinRoot(target)) { response.writeHead(403).end(); return; }
    const candidates = request.headers.rsc === '1' ? [target + '.txt', target] : [target, path.join(target, 'index.html'), target + '.html'];
    const file = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile() && withinRoot(fs.realpathSync(candidate)));
    if (!file) { response.writeHead(404).end(); return; }
    const size=fs.statSync(file).size,media=path.extname(file)==='.mp4',range=media?mediaRange(request.headers.range,size):null;
    if(range===false){response.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
    response.writeHead(range?206:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=0','Content-Length':range?range.end-range.start+1:size,...(media?{'Accept-Ranges':'bytes'}:{}),...(range?{'Content-Range':`bytes ${range.start}-${range.end}/${size}`}:{})});
    if(request.method==='HEAD')response.end();else fs.createReadStream(file,range||undefined).pipe(response);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}
