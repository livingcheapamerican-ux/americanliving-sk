const fs = require('fs');
const path = require('path');

const consultWithKexoTranslations = {
  sk: "Konzultovať s Kexom",
  en: "Consult with Kexo",
  de: "Mit Kexo besprechen",
  fr: "Consulter Kexo",
  hu: "Konzultáljon Kexóval",
  pl: "Skonsultuj się z Kexo",
  uk: "Проконсультуватися з Кексо",
  sr: "Консултујте се са Кексом",
  hr: "Konzultirajte se s Kexom",
  el: "Συμβουλευτείτε τον Kexo"
};

const localesDir = path.join(__dirname, '../src/components/translations/locales');

Object.keys(consultWithKexoTranslations).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.js`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Let's check if the key is already added
  if (content.includes('"consultWithKexo":') || content.includes("'consultWithKexo':") || content.includes("consultWithKexo:")) {
    console.log(`consultWithKexo already exists in ${lang}.js`);
    return;
  }

  const value = consultWithKexoTranslations[lang];
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex === -1) {
    console.error(`Could not find closing brace in ${filePath}`);
    return;
  }

  let sliceBeforeBrace = content.slice(0, lastBraceIndex).trim();
  if (!sliceBeforeBrace.endsWith(',') && !sliceBeforeBrace.endsWith('{')) {
    sliceBeforeBrace += ',';
  }

  const newContent = sliceBeforeBrace + `\n  "consultWithKexo": ${JSON.stringify(value)}\n};` + content.slice(lastBraceIndex + 2);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully added consultWithKexo to ${lang}.js`);
});
