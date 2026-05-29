import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('src/components/translations/locales');
const skObj = (await import(path.join(localesDir, 'sk.js'))).default;

const locales = ['en', 'de', 'fr', 'hu', 'pl', 'uk', 'sr', 'hr', 'el'];

console.log("Checking for identical keys between locales and sk.js...");

for (const code of locales) {
  const langPath = path.join(localesDir, `${code}.js`);
  const obj = (await import(langPath)).default;
  const identical = [];
  
  for (const [key, skVal] of Object.entries(skObj)) {
    const val = obj[key];
    if (val === skVal && skVal && skVal.trim().length > 0) {
      // Ignore keys that are naturally identical across languages (e.g. brand names, units, short codes)
      const isNaturallyIdentical = /^[A-Z0-9\s.,\/#@!%\^&\*\(\)\-_=\+\[\]\{\}\|\\:;'"<>?`~]*$/i.test(skVal) 
        || skVal.toLowerCase().trim() === 'blog' 
        || skVal.toLowerCase().trim() === 'faq'
        || skVal.toLowerCase().trim() === 'ticabhouse'
        || skVal.toLowerCase().trim() === 'prostohouse'
        || skVal.toLowerCase().trim() === 'american living'
        || skVal.toLowerCase().trim() === 'sauna'
        || skVal.toLowerCase().trim() === 'vancouver'
        || skVal.toLowerCase().trim() === 'sicilia'
        || skVal.toLowerCase().trim() === 'london'
        || skVal.toLowerCase().trim() === 'happy wife'
        || skVal.toLowerCase().trim() === 'tiny houses'
        || skVal.toLowerCase().trim() === 'tiny house'
        || skVal.toLowerCase().trim() === 'm²'
        || skVal.toLowerCase().trim() === 'kw'
        || skVal.length <= 4;
        
      if (!isNaturallyIdentical) {
        identical.push({ key, val });
      }
    }
  }
  
  if (identical.length > 0) {
    console.log(`\n[${code.toUpperCase()}] Found ${identical.length} suspect identical keys:`);
    identical.forEach(item => {
      console.log(`  - "${item.key}": "${item.val.substring(0, 60)}..."`);
    });
  } else {
    console.log(`[${code.toUpperCase()}] Clear!`);
  }
}
