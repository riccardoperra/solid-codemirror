import * as fs from 'fs';

const packageJson = fs.readFileSync('./packages/solid-codemirror/package.json', 'utf8');
const {scripts, ...other} = JSON.parse(packageJson);
fs.writeFileSync('./packages/solid-codemirror/dist/package.json', JSON.stringify(other, null, 2));
fs.copyFileSync('./README.md', './packages/solid-codemirror/dist/README.md');
