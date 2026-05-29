const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/translations/ProstoHouseTranslations.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Parse the JS file into an object by matching the object part
const match = content.match(/export const prostoHouseTranslations = (\{[\s\S]+\});/);
if (!match) {
  console.error("Could not match the translations object in the file.");
  process.exit(1);
}

const objStr = match[1];
let translations;
try {
  translations = eval(`(${objStr})`);
} catch (e) {
  console.error("Failed to eval translations:", e);
  process.exit(1);
}

const facadeStandardDescTranslations = {
  sk: "Kombinácia antracitového plechu a dreva",
  en: "Combination of anthracite sheet metal and wood",
  de: "Kombination aus anthrazitfarbenem Blech und Holz",
  fr: "Combinaison de tôle anthracite et de bois",
  hu: "Antracit lemez és fa kombinációja",
  pl: "Połączenie blachy antracytowej i drewna",
  uk: "Поєднання антрацитового листа та дерева",
  sr: "Комбинација антрацит лима и дрвета",
  hr: "Kombinacija antracitnog lima i drva",
  el: "Συνδυασμός ανθρακί λαμαρίνας και ξύλου"
};

const sendQuoteForAmountTranslations = {
  sk: "Odoslať cenovú ponuku na sumu {amount} €",
  en: "Send price quote for the amount of {amount} €",
  de: "Preisangebot über den Betrag von {amount} € senden",
  fr: "Envoyer le devis d'un montant de {amount} €",
  hu: "Árajánlat küldése {amount} € értékben",
  pl: "Wyślij ofertę cenową na kwotę {amount} €",
  uk: "Надіслати цінову пропозицію на суму {amount} €",
  sr: "Пошаљите понуду у износу од {amount} €",
  hr: "Pošaljite ponudu u iznosu od {amount} €",
  el: "Αποστολή προσφοράς για το ποσό των {amount} €"
};

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

// Update translations
Object.keys(translations).forEach(lang => {
  if (translations[lang]) {
    // 1. Update facadeStandardDesc
    if (facadeStandardDescTranslations[lang]) {
      translations[lang].facadeStandardDesc = facadeStandardDescTranslations[lang];
    }
    // 2. Add sendQuoteForAmount
    if (sendQuoteForAmountTranslations[lang]) {
      translations[lang].sendQuoteForAmount = sendQuoteForAmountTranslations[lang];
    }
    // 3. Add viewShowcase
    if (viewShowcaseTranslations[lang]) {
      translations[lang].viewShowcase = viewShowcaseTranslations[lang];
    }
  }
});

// Reconstruct the file content
const newObjStr = JSON.stringify(translations, null, 2);
const newContent = `export const prostoHouseTranslations = ${newObjStr};\n`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully updated Prosto House translations in ProstoHouseTranslations.jsx!");
