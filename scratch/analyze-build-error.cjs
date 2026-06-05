const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
const files = fs.readdirSync(assetsDir);
const detailDomuFile = files.find(f => f.startsWith('DetailDomu-') && f.endsWith('.js'));

if (!detailDomuFile) {
  console.log('DetailDomu built file not found in dist/assets!');
  process.exit(1);
}

const filePath = path.join(assetsDir, detailDomuFile);
console.log('Analyzing file:', filePath);
const code = fs.readFileSync(filePath, 'utf8');

console.log('Length of code:', code.length);

const formattedCode = code.replace(/([{};,])/g, '$1\n');
fs.writeFileSync(path.join(__dirname, 'DetailDomu_formatted.js'), formattedCode);
console.log('Formatted code written to DetailDomu_formatted.js');
