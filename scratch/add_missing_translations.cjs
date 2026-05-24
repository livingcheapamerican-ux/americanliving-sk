const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/LanguageContext.jsx');
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

const newTranslations = {
  de: {
    popularHouses: 'Beliebte Häuser',
    popularHousesDesc: 'Sehen Sie sich die gefragtesten Modelle aus unserem Katalog an',
    houseDetail: 'Hausdetails'
  },
  fr: {
    popularHouses: 'Maisons populaires',
    popularHousesDesc: 'Découvrez les modèles les plus demandés de notre catalogue',
    houseDetail: 'Détails de la maison'
  },
  sr: {
    popularHouses: 'Популарне куће',
    popularHousesDesc: 'Погледајте најтраженије моделе из нашег каталога',
    houseDetail: 'Детаљи куће'
  },
  hr: {
    popularHouses: 'Popularne kuće',
    popularHousesDesc: 'Pogledajte najtraženije modele iz našeg kataloga',
    houseDetail: 'Detalji kuće'
  },
  el: {
    popularHouses: 'Δημοφιλή σπίτια',
    popularHousesDesc: 'Δείτε τα μοντέλα με τη μεγαλύτερη ζήτηση από τον κατάλογό μας',
    houseDetail: 'Λεπτομέρειες σπιτιού'
  },
  hu: {
    popularHouses: 'Népszerű házak',
    popularHousesDesc: 'Tekintse meg katalógusunk legnépszerűbb modelljeit',
    houseDetail: 'Ház részletei'
  },
  pl: {
    popularHouses: 'Popularne domy',
    popularHousesDesc: 'Zobacz najpopularniejsze modele z naszego katalogu',
    houseDetail: 'Szczegóły domu'
  },
  uk: {
    popularHouses: 'Популярні будинки',
    popularHousesDesc: 'Перегляньте найпопулярніші моделі з нашого каталогу',
    houseDetail: 'Деталі будинку'
  }
};

let currentLang = null;
let modifiedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Match language block start like:  sk: { or  uk: {
  const langMatch = line.match(/^[ ]{2}([a-z]{2}): \{/);
  if (langMatch) {
    currentLang = langMatch[1];
    continue;
  }
  
  // Match language block end:  },
  if (currentLang && line.match(/^[ ]{2}\},/)) {
    currentLang = null;
    continue;
  }
  
  if (currentLang && newTranslations[currentLang]) {
    // Look for viewHousesInDifferentColors line to insert right after it
    if (line.includes('viewHousesInDifferentColors:')) {
      // Check if popularHouses is already defined on subsequent lines to avoid double-insertion
      let alreadyExists = false;
      for (let j = 1; j <= 5; j++) {
        if (lines[i + j] && lines[i + j].includes('popularHouses:')) {
          alreadyExists = true;
          break;
        }
      }
      
      if (!alreadyExists) {
        const trans = newTranslations[currentLang];
        const newLinesToInsert = [
          `    popularHouses: "${trans.popularHouses}",`,
          `    popularHousesDesc: "${trans.popularHousesDesc}",`,
          `    houseDetail: "${trans.houseDetail}",`
        ];
        
        lines.splice(i + 1, 0, ...newLinesToInsert);
        i += 3; // skip inserted lines
        modifiedCount++;
      }
    }
  }
}

if (modifiedCount > 0) {
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`Successfully added missing popularHouses translations to ${modifiedCount} languages in LanguageContext.jsx`);
} else {
  console.log('No languages needed popularHouses translations added.');
}
