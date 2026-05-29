const fs = require('fs');
const path = require('path');

const viewShowcaseTranslations = {
  sk: "Pozrieť ukážku",
  en: "View showcase",
  de: "Vorschau anzeigen",
  fr: "Voir la démonstration",
  hu: "Bemutató megtekintése",
  pl: "Zobacz pokaz",
  uk: "Переглянути демонстрацію",
  sr: "Погледај приказ",
  hr: "Pogledaj prikaz",
  el: "Προβολή δείγματος"
};

const localesDir = path.join(__dirname, '../src/components/translations/locales');

Object.keys(viewShowcaseTranslations).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.js`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Let's check if the key is already added
  if (content.includes('"viewShowcase":') || content.includes("'viewShowcase':") || content.includes("viewShowcase:")) {
    console.log(`viewShowcase already exists in ${lang}.js`);
    return;
  }

  const value = viewShowcaseTranslations[lang];
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex === -1) {
    console.error(`Could not find closing brace in ${filePath}`);
    return;
  }

  let sliceBeforeBrace = content.slice(0, lastBraceIndex).trim();
  if (!sliceBeforeBrace.endsWith(',') && !sliceBeforeBrace.endsWith('{')) {
    sliceBeforeBrace += ',';
  }

  const newContent = sliceBeforeBrace + `\n  "viewShowcase": ${JSON.stringify(value)}\n};` + content.slice(lastBraceIndex + 2);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully added viewShowcase to ${lang}.js`);
});
