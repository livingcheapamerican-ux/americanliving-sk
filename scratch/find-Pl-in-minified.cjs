const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'dist', 'assets');
const files = fs.readdirSync(assetsDir);
const detailDomuFile = files.find(f => f.startsWith('DetailDomu-') && f.endsWith('.js'));

if (!detailDomuFile) {
  console.log('DetailDomu built file not found!');
  process.exit(1);
}

const filePath = path.join(assetsDir, detailDomuFile);
const code = fs.readFileSync(filePath, 'utf8');

// We search for "function Pl("
const index = code.indexOf('function Pl(');
if (index === -1) {
  console.log('function Pl( not found in minified code.');
  // Let's do a case-insensitive search or look for Pl
  const regex = /[a-zA-Z_$][0-9a-zA-Z_$]*\s*=\s*function\s*Pl\(/;
  const match = code.match(regex);
  if (match) {
    console.log('Found match:', match[0], 'at', match.index);
    console.log('Context:', code.substring(match.index - 200, match.index + 800));
  } else {
    // Let's look for "Pl("
    const idx2 = code.indexOf('Pl(');
    if (idx2 !== -1) {
      console.log('Found Pl( at', idx2);
      console.log('Context:', code.substring(idx2 - 200, idx2 + 800));
    }
  }
} else {
  console.log('Found function Pl( at index', index);
  console.log('Context:', code.substring(index - 200, index + 800));
}
