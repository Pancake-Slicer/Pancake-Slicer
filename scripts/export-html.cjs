const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
require('./build.cjs');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'dist', name), 'utf8');
const js = read('assets/game.bundle.js');
const css = read('assets/game.css');
let html = read('index.html');
assert.equal((html.match(/<script type="module" src="\.\/assets\/game\.bundle\.js"><\/script>/g) || []).length, 1);
assert.equal((html.match(/<link rel="stylesheet" href="\.\/assets\/game\.css">/g) || []).length, 1);
assert.ok(!/<\/script/i.test(js), 'JavaScript must escape closing script tags before embedding');
assert.ok(!/<\/style/i.test(css), 'CSS must escape closing style tags before embedding');
assert.ok(!/url\(\s*["']?(?!data:|#)/i.test(css), 'CSS references an external asset');
html = html.replace('<script type="module" src="./assets/game.bundle.js"></script>', () => `<script type="module">${js}</script>`);
html = html.replace('<link rel="stylesheet" href="./assets/game.css">', () => `<style>${css}</style>`);
assert.ok(!/<(?:script|link|img|iframe|audio|video|source)\b[^>]*\b(?:src|href)\s*=/i.test(html), 'HTML references an external resource');
assert.equal(html.match(/<script type="module">([\s\S]*?)<\/script>/)[1], js);
assert.equal(html.match(/<style>([\s\S]*?)<\/style>/)[1], css);
const output = path.join(root, 'dist', 'Pancake City - Playtest.html');
fs.writeFileSync(output, html);
console.log(`Standalone offline HTML: ${output} (${Buffer.byteLength(html)} bytes)`);
if (process.argv[2]) {
  const destination = process.argv[2] === '--downloads'
    ? path.join(require('node:os').homedir(), 'Downloads', 'Pancake City - Playtest.html')
    : path.resolve(process.argv[2]);
  // Never silently replace a playtest or the original HTML.
  fs.copyFileSync(output, destination, fs.constants.COPYFILE_EXCL);
  assert.deepEqual(fs.readFileSync(destination), fs.readFileSync(output));
  console.log(`Verified exported copy: ${destination}`);
}
