import * as fs from 'fs';

const packageJson = fs.readFileSync('./package.json', 'utf8');
const {scripts, ...other} = JSON.parse(packageJson);
fs.writeFileSync('./dist/package.json', JSON.stringify(other, null, 2));
fs.copyFileSync('./README.md', './dist/README.md');
