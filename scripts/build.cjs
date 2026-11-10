const fs = require('node:fs');
const path = require('node:path');
require('./verify-recovery.cjs');
const root = path.resolve(__dirname, '..');
for (const name of ['index.html', 'assets/game.bundle.js', 'assets/game.css']) {
  const destination = path.join(root, 'dist', name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, 'web', name), destination);
}
console.log('Built dist/ from the preserved recovery files. No gameplay transformation applied.');
