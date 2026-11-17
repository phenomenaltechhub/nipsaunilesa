import path from 'node:path';
import { startStaticServer } from './lib/static-server.mjs';
const { server, base } = await startStaticServer(path.resolve('.'), 4174, ['/developer-tools/', '/student-pwa/src/', '/student-pwa/styles/', '/student-pwa/assets/']);
console.log(`Loopback developer tooling: ${base}/developer-tools/index.html (excluded from student/website exports).`);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
