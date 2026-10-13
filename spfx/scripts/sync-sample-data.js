// Copies /sample-data (repo root, the single source of truth) into src/ so the TypeScript
// rig (rootDir = src) can import it. Output is git-ignored. Run automatically before build/start/test.
const fs = require('fs');
const path = require('path');
const from = path.resolve(__dirname, '../../sample-data');
const to = path.resolve(__dirname, '../src/services/mock/data');
fs.mkdirSync(to, { recursive: true });
for (const f of fs.readdirSync(from).filter((n) => n.endsWith('.json'))) {
  fs.copyFileSync(path.join(from, f), path.join(to, f));
}
console.log('sample data synced ->', path.relative(process.cwd(), to));
