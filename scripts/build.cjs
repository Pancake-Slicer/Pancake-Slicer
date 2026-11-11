const fs = require('node:fs');
const path = require('node:path');
require('./assemble-runtime.cjs');
require('./verify-recovery.cjs');
const root = path.resolve(__dirname, '..');
for (const name of ['index.html', 'assets/game.bundle.js', 'assets/game.css','assets/sc4-originals.local.js']) {
  const destination = path.join(root, 'dist', name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, 'web', name), destination);
}
console.log('Built dist/ from the current assembled runtime; original v52 untouched.');
