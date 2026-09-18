'use strict';

const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const relative of ['.deskling-local', '.deskling-local/icon-tests']) {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory);
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe local test directory');
}
const targets = ['A', 'B', 'C'].map(id => path.join(root, '.deskling-local/icon-tests', `Deskling-2B-test-${id}.txt`));
for (const target of targets) {
  try {
    fs.lstatSync(target);
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw new Error('Could not validate local test directory');
  }
  console.error('Local test targets already exist. Nothing is read or replaced.');
  process.exit(1);
}
for (const [index, target] of targets.entries()) {
  try {
    fs.writeFileSync(target, `Synthetic Deskling icon-position test ${['A', 'B', 'C'][index]}.\n`, { flag: 'wx' });
  } catch {
    throw new Error('Could not exclusively create synthetic test files');
  }
}
console.log('Synthetic A/B/C files are ready in .deskling-local/icon-tests. Copy them to Desktop yourself.');
