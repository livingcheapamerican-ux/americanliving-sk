const fs = require('fs');
const path = require('path');

// We find the compiled DetailDomu file in dist/assets
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

// The error is: ReferenceError: Cannot access 'u' before initialization at Pl (DetailDomu-xxxx.js:16:26525)
// Note: our local build might have different line/col, but let's look for "Pl" function or references.
// Let's pretty print or format the file so we can search it more easily, or search for "Pl" in the minified code.

// Let's find some occurrences of "Pl" or look for where the error could originate.
// A common TDZ error in React build is where a component or variable is imported but is undefined/uninitialized when accessed.
// Let's print around references of "Pl" or similar.
console.log('Length of code:', code.length);

// Let's write a formatted version to a scratch file so we can view it
const formattedCode = code.replace(/([{};,])/g, '$1\n');
fs.writeFileSync(path.join(__dirname, 'DetailDomu_formatted.js'), formattedCode);
console.log('Formatted code written to DetailDomu_formatted.js');
