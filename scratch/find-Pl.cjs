const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'DetailDomu_formatted.js');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

console.log('Searching for Pl occurrences...');
const matches = [];
lines.forEach((line, index) => {
  if (line.includes('Pl') || line.includes('function Pl') || line.includes('const Pl')) {
    matches.push({ index: index + 1, content: line.trim() });
  }
});

console.log(`Found ${matches.length} matches:`);
matches.slice(0, 30).forEach(m => {
  console.log(`Line ${m.index}: ${m.content.substring(0, 100)}`);
});
