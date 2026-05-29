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

const missingTranslations = {
  foundationsDesc: {
    sk: "Spôsob osadenia modulu na pozemok. V prípade klasických základov sa prispôsobíme typu terénu.",
    en: "Method of placing the module on the land. In the case of classic foundations, we will adapt to the type of terrain.",
    de: "Methode der Platzierung des Moduls auf dem Grundstück. Bei klassischen Fundamenten passen wir uns dem Gelände an.",
    fr: "Méthode de placement du module sur le terrain. Dans le cas de fondations classiques, nous nous adapterons au type de terrain.",
    hu: "A modul elhelyezésének módja a telken. Klasszikus alapozás esetén a terep típusához igazodunk.",
    pl: "Sposób posadowienia modułu na działce. W przypadku klasycznych fundamentów dostosujemy się do rodzaju terenu.",
    uk: "Спосіб встановлення модуля на ділянку. У разі класичного фундаменту ми підлаштуємося під тип рельєфу.",
    sr: "Начин постављања модула на плац. У случају класичних темеља, прилагодићемо се типу терена.",
    hr: "Način postavljanja modula na parcelu. U slučaju klasičnih temelja, prilagodit ćemo se tipu terena.",
    el: "Μέθοδος τοποθέτησης της μονάδας στο οικόπεδο. Σε περίπτωση κλασικών θεμελίων, θα προσαρμοστούμε στον τύπο του εδάφους."
  },
  shellAssemblyDesc: {
    sk: "Zvoľte, či si montáž zabezpečíte svojpomocne alebo profesionálne od nás.",
    en: "Choose whether you will assemble it yourself or professionally by us.",
    de: "Wählen Sie, ob Sie die Montage selbst oder professionell durch uns durchführen lassen.",
    fr: "Choisissez si vous effectuez le montage vous-même ou professionnellement par nos soins.",
    hu: "Válassza ki, hogy a szerelést saját maga végzi, vagy szakemberre bízza.",
    pl: "Wybierz, czy montaż wykonasz samodzielnie, czy zlecicie go profesjonalnie nam.",
    uk: "Виберіть, чи ви виконаєте монтаж самостійно, чи довірите його професіоналам від нас.",
    sr: "Изаберите да ли ћете монтажу извршити сами or професионално од нас.",
    hr: "Odaberite hoćete li montažu izvršiti sami ili profesionalno od nas.",
    el: "Επιλέξτε εάν θα κάνετε τη συναρμολόγηση μόνοι σας ή επαγγελματικά από εμάς."
  },
  insulationTypeDesc: {
    sk: "Hrúbka minerálnej izolácie v obvodových stenách domu pre energetický certifikát.",
    en: "Thickness of mineral insulation in the outer walls of the house for the energy certificate.",
    de: "Stärke der Mineralwolle-Dämmung in den Außenwänden des Hauses für den Energieausweis.",
    fr: "Épaisseur de l'isolation minérale dans les murs extérieurs de la maison pour le certificat énergétique.",
    hu: "Az ásványi szigetelés vastagsága a ház külső falaiban az energetikai tanúsítványhoz.",
    pl: "Grubość izolacji mineralnej w ścianach zewnętrznych domu do certyfikatu energetycznego.",
    uk: "Товщина мінеральної ізоляції в зовнішніх стінах будинку для енергетичного сертифіката.",
    sr: "Дебљина минералне изолације у спољашњим зидовима куће за енергетски пасош.",
    hr: "Debljina mineralne izolacije u vanjskim zidovima kuće za energetski certifikat.",
    el: "Πάχος της ορυκτής μόνωσης στους εξωτερικούς τοίχους του σπιтиού για το ενεργειακό πιστοποιητικό."
  },
  facadeDesc: {
    sk: "Vyberte si štýl vonkajšieho obkladu a fasády.",
    en: "Choose the style of the exterior cladding and facade.",
    de: "Wählen Sie den Stil der Außenverkleidung und Fassade.",
    fr: "Choisissez le style du bardage extérieur et de la façade.",
    hu: "Válassza ki a külső burkolat és homlokzat stílusát.",
    pl: "Wybierz styl okładziny zewnętrznej i elewacji.",
    uk: "Виберіть стиль зовнішньої обшивки та фасаду.",
    sr: "Изаберите стил спољашњег облагања и фасаде.",
    hr: "Odaberite stil vanjskog oblaganja i fasade.",
    el: "Επιλέξτε το στυλ της εξωτερικής επένδυσης και της πρόσοψης."
  },
  interiorFinishDesc: {
    sk: "Zvoľte finálny vzhľad stien v interiéri Vášho domu.",
    en: "Choose the final look of the walls in the interior of your house.",
    de: "Wählen Sie das endgültige Aussehen der Wände im Innenbereich Ihres Hauses.",
    fr: "Choisissez l'aspect final des murs à l'intérieur de votre maison.",
    hu: "Válassza ki a falak végső megjelenését a ház belsejében.",
    pl: "Wybierz ostateczny wygląd ścian wewnątrz swojego domu.",
    uk: "Виберіть фінальний вигляд стін усередині вашого будинку.",
    sr: "Изаберите коначни изглед зидова у унутрашњости ваше куће.",
    hr: "Odaberite konačni izgled zidova u unutrašnjosti vaše kuće.",
    el: "Επιλέξτε την τελική εμφάνιση των τοίχων στο εσωτερικό του σπιτιού σας."
  },
  houseExtensionDesc: {
    sk: "Možnosť predĺženia modulu pre získanie väčšieho obytného priestoru.",
    en: "Option to extend the module to get more living space.",
    de: "Option zur Verlängerung des Moduls für mehr Wohnraum.",
    fr: "Option d'extension du module pour obtenir plus d'espace de vie.",
    hu: "A modul meghosszabbításának lehetősége több lakótér érdekében.",
    pl: "Opcja przedłużenia modułu w celu uzyskania większej przestrzeni życiowej.",
    uk: "Можливість подовження модуля для отримання більшого житлового простору.",
    sr: "Опција продужења модула за добијање већег стамбеног простора.",
    hr: "Opcija produženja modula za dobivanje većeg stambenog prostora.",
    el: "Επιλογή επέκτασης της μονάδας για περισσότερο χώρο διαβίωσης."
  },
  windowModification: {
    sk: "Úprava okien",
    en: "Window modification",
    de: "Fensteränderung",
    fr: "Modification de fenêtre",
    hu: "Ablak módosítása",
    pl: "Modyfikacja okna",
    uk: "Модифікація вікна",
    sr: "Модификација прозора",
    hr: "Modifikacija prozora",
    el: "Τροποποίηση παραθύρου"
  }
};

// Update translations
Object.keys(translations).forEach(lang => {
  if (translations[lang]) {
    Object.keys(missingTranslations).forEach(key => {
      if (missingTranslations[key][lang]) {
        translations[lang][key] = missingTranslations[key][lang];
      }
    });
  }
});

// Reconstruct the file content
const newObjStr = JSON.stringify(translations, null, 2);
const newContent = `export const prostoHouseTranslations = ${newObjStr};\n`;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully added all missing description translations in ProstoHouseTranslations.jsx!");
