const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/LanguageContext.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

let currentLang = null;
let seenKeys = new Map(); // lang -> Set of keys
let duplicates = []; // list of { lang, key, lineIndex }

// First pass: find all keys and detect duplicates
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Match language block start like:  sk: { or  uk: {
  const langMatch = line.match(/^[ ]{2}([a-z]{2}): \{/);
  if (langMatch) {
    currentLang = langMatch[1];
    if (!seenKeys.has(currentLang)) {
      seenKeys.set(currentLang, new Set());
    }
    continue;
  }
  
  // Match language block end:  },
  if (currentLang && line.match(/^[ ]{2}\},/)) {
    currentLang = null;
    continue;
  }
  
  if (currentLang) {
    // Match key-value line:    keyName: "value", or    keyName: { ...
    const keyMatch = line.match(/^[ ]{4}([a-zA-Z0-9_]+):/);
    if (keyMatch) {
      const key = keyMatch[1];
      const langSet = seenKeys.get(currentLang);
      if (langSet.has(key)) {
        duplicates.push({ lang: currentLang, key, lineIndex: i, content: line });
      } else {
        langSet.add(key);
      }
    }
  }
}

console.log(`Found ${duplicates.length} duplicate keys:`);
duplicates.forEach(d => {
  console.log(`Lang: ${d.lang}, Key: ${d.key}, Line: ${d.lineIndex + 1}: ${d.content.trim()}`);
});

if (duplicates.length > 0) {
  // Let's remove the duplicates by filtering out the lines
  // We want to remove the duplicate occurrences (which are the second/later ones in duplicates list)
  // Wait, if we remove them, will it build successfully? Let's do it!
  const linesToRemove = new Set(duplicates.map(d => d.lineIndex));
  const newLines = lines.filter((_, idx) => !linesToRemove.has(idx));
  
  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log('Successfully removed duplicate keys and wrote back to LanguageContext.jsx');
} else {
  console.log('No duplicates to remove.');
}
