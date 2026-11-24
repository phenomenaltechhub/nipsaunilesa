// Optional private static-export preview; no production server dependency.
import { createServer } from 'node:http';
import { existsSync, statSync, realpathSync, createReadStream } from 'node:fs';
import { resolve, join, extname, sep } from 'node:path';
const root = resolve(process.argv[2] || 'out');
const port = Number(process.argv[3] || 3420);
const mime = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8' };
createServer((req, res) => {
  let target;
  try { target = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); } catch { res.writeHead(400).end(); return; }
  if (target !== root && !target.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  const candidates = req.headers.rsc === '1' ? [target + '.txt', target] : [target, target + '.html', join(target, 'index.html')];
  const file = candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile());
  if (!file) { res.writeHead(404).end('Not found'); return; }
  if (!realpathSync(file).startsWith(root + sep)) { res.writeHead(403).end(); return; }
  const size = statSync(file).size;
  const headers = { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if (range) {
    const start = Number(range[1]), end = Math.min(Number(range[2] || size - 1), size - 1);
    if (start > end) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    createReadStream(file, { start, end }).pipe(res);
  } else { res.writeHead(200, { ...headers, 'Content-Length': size }); createReadStream(file).pipe(res); }
}).listen(port, '0.0.0.0', () => console.log(`Static review ready on port ${port}`));
