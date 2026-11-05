const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
let checked = 0;
function checkPage(file) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)="([^"]+)"/g)) {
    const url = match[1];
    if (/^(?:https?:|data:|#)/.test(url)) continue;
    const dependency = path.resolve(path.dirname(file), url.split(/[?#]/)[0]);
    if (!fs.existsSync(dependency)) throw Error(`Missing dependency from ${file}: ${url}`);
    checked++;
  }
  for (const match of html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if (match[1].trim()) new vm.Script(match[1], {filename: file});
  }
}
function visit(dir) {
  for (const item of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) visit(file);
    else if (item.name.endsWith('.html')) checkPage(file);
    else if (item.name.endsWith('.js')) { new vm.Script(fs.readFileSync(file, 'utf8'), {filename: file}); checked++; }
  }
}
visit(root);
const reference = path.join(root, 'courses/cs4341/assets/reference');
if (fs.readdirSync(reference).filter(name => /^page-\d+\.png$/.test(name)).length !== 52) throw Error('CS 4341 reference pages incomplete');
const a = fs.readFileSync(path.join(root, 'courses/cs3345/storage.js'), 'utf8');
const b = fs.readFileSync(path.join(root, 'courses/cs4341/app.js'), 'utf8');
if (!a.includes('study-practice:cs3345:') || !b.includes('study-practice:cs4341:')) throw Error('Course storage namespaces missing');
console.log(`Checked ${checked} local dependencies and JavaScript files; 52 CS 4341 reference pages present.`);
