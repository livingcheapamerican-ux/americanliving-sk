const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/translations/ProstoHouseTranslations.jsx');
const content = fs.readFileSync(filePath, 'utf8');

// A simple parser to extract blocks of translations
const extractBlock = (lang) => {
  const startRegex = new RegExp(`"${lang}":\\s*\\{`);
  const match = content.match(startRegex);
  if (!match) return null;
  
  let braceCount = 1;
  let index = match.index + match[0].length;
  let blockStr = '{';
  
  while (braceCount > 0 && index < content.length) {
    const char = content[index];
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    blockStr += char;
    index++;
  }
  
  try {
    // Clean trailing commas and parse as JSON-like object by wrapping keys in quotes if they are not already
    // Or just evaluate it safely by creating a function
    return eval(`(${blockStr})`);
  } catch (e) {
    console.error(`Failed to parse block for ${lang}:`, e);
    return null;
  }
};

const sk = extractBlock('sk');
const en = extractBlock('en');

if (!sk || !en) {
  console.log('Could not extract sk or en blocks.');
  process.exit(1);
}

const skKeys = Object.keys(sk);
const enKeys = Object.keys(en);

console.log('Comparing keys between SK and EN in ProstoHouseTranslations.jsx:');
const missingInEn = skKeys.filter(k => !enKeys.includes(k));
console.log('\nMissing in EN:', missingInEn);

const identical = skKeys.filter(k => {
  if (!en) return false;
  if (k === 'boiler' || k === 'heatPump' || k === 'recuperation' || k === 'sanitary') return false;
  return sk[k] === en[k];
});
console.log('\nIdentical in SK and EN:', identical);
