// Heuristic source scan only; never prints matching values. This is neither a
// full history audit nor a substitute for reviewing data and provider exports.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

let files;
try { files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean); }
catch { console.error('Credential scan could not enumerate repository files. Run with the required Git/process permissions; no scan result is claimed.'); process.exit(1); }
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{30,}\b/,
  /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\b(?:DATABASE_PASSWORD|PAYSTACK_SECRET_KEY|SESSION_SECRET)\s*[:=]\s*["'][^"'\s<>]{12,}["']/i,
];
const matches = new Set(); let checked = 0;
for (const file of new Set(files)) {
  if (!/\.(?:[cm]?js|[cm]?ts|tsx|json|html|css|md|yml|yaml|svg|txt|php|sql|webmanifest)$/.test(file)) continue;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const text = fs.readFileSync(file, 'utf8'); checked++;
  if (patterns.some(pattern => pattern.test(text))) matches.add(file);
}
if (matches.size) { console.error('Potential credentials require private review in files:', [...matches].join(', ')); process.exitCode = 1; }
else console.log(`Heuristic credential scan passed for ${checked} tracked/new text files; matching values are never logged. Private-record detection and history review require separate human review.`);
