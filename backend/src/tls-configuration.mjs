import fs from 'node:fs';
import path from 'node:path';
// Only explicit private local files; no forwarded-header or arbitrary-origin trust.
export function tlsConfiguration({ keyFile, certificateFile } = {}) {
    if (!keyFile && !certificateFile)
        return undefined;
    if (!keyFile || !certificateFile)
        throw new Error('Both TLS key and certificate files are required.');
    function read(file, privateKey) {
        const resolved = path.resolve(file);
        if (resolved.split(path.sep).some(p => ['public', 'student-pwa', 'out', 'design-review'].includes(p)))
            throw new Error('Private TLS configuration required.');
        const stat = fs.lstatSync(resolved);
        if (!stat.isFile() || fs.realpathSync(resolved) !== resolved || stat.size > 65536 || privateKey && (stat.mode & 0o077) !== 0)
            throw new Error('TLS files must be bounded regular files; private keys require owner-only permissions.');
        return fs.readFileSync(resolved);
    }
    return { key: read(keyFile, true), cert: read(certificateFile, false), minVersion: 'TLSv1.2' };
}
