const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'DetailDomu_formatted.js');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

const start = 1310;
const end = 1450;
console.log(`Printing lines ${start} to ${end}:`);
for (let i = start; i <= end; i++) {
  if (lines[i]) {
    console.log(`${i}: ${lines[i]}`);
  }
}
