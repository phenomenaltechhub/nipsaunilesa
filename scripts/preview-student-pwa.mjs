import path from 'node:path';
import { startStaticServer } from './lib/static-server.mjs';
const { server, base } = await startStaticServer(path.resolve('student-pwa'), 4173);
console.log(`PHARMAIDEIA local preview: ${base}/ (not deployed; use cloud preview controls if available).`);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
