const fs = require('fs');
const path = require('path');

const bannerTranslations = {
  sk: {
    interactiveConfigurator: "Interaktívny konfigurátor",
    configuratorTitle: "Prispôsobte si {name}",
    configuratorSubtitle: "Zostavte si svoj domov snov presne podľa vašich predstáv. Zvoľte si účel stavby, hrúbku zateplenia, typ fasády a technológie. Cenu a špecifikáciu prepočítame transparentne v reálnom čase.",
    transparentPricing: "Jasné ceny",
    transparentPricingDesc: "Každá možnosť má presne vyčíslenú cenu bez skrytých poplatkov.",
    a0Compliance: "A0 Štandard",
    a0ComplianceDesc: "Konfigurátor vás sám navedie na výbavu spĺňajúcu stavebné normy A0.",
    customOptions: "Široká voľba",
    customOptionsDesc: "Od farby okien cez typy fasády až po kľúčové inštalácie a základy."
  },
  en: {
    interactiveConfigurator: "Interactive Configurator",
    configuratorTitle: "Customize your {name}",
    configuratorSubtitle: "Build your dream home exactly to your liking. Choose the purpose of the building, insulation thickness, facade type and technologies. We calculate the price and specification transparently in real time.",
    transparentPricing: "Transparent pricing",
    transparentPricingDesc: "Each option has a precisely calculated price with no hidden fees.",
    a0Compliance: "A0 Standard",
    a0ComplianceDesc: "The configurator will guide you to equipment that meets building standards A0.",
    customOptions: "Wide choice",
    customOptionsDesc: "From window color through facade types to key installations and foundations."
  },
  de: {
    interactiveConfigurator: "Interaktiver Konfigurator",
    configuratorTitle: "Personalisieren Sie Ihr {name}",
    configuratorSubtitle: "Bauen Sie Ihr Traumhaus genau nach Ihren Wünschen. Wählen Sie den Zweck des Gebäudes, die Dämmstärke, den Fassadentyp und die Technologien. Wir berechnen den Preis und die Spezifikationen transparent in Echtzeit.",
    transparentPricing: "Transparente Preise",
    transparentPricingDesc: "Jede Option hat einen genau kalkulierten Preis ohne versteckte Gebühren.",
    a0Compliance: "A0 Standard",
    a0ComplianceDesc: "Der Konfigurator führt Sie zu Ausstattungen, die den Baustandards A0 entsprechen.",
    customOptions: "Breite Auswahl",
    customOptionsDesc: "Von der Fensterfarbe über Fassadentypen bis hin zu Schlüsselinstallationen und Fundamenten."
  },
  fr: {
    interactiveConfigurator: "Configurateur interactif",
    configuratorTitle: "Personnalisez votre {name}",
    configuratorSubtitle: "Construisez la maison de vos rêves exactement comme vous le souhaitez. Choisissez l'usage du bâtiment, l'épaisseur de l'isolation, le type de façade et les technologies. Nous calculons le prix et les spécifications de manière transparente en temps réel.",
    transparentPricing: "Prix transparents",
    transparentPricingDesc: "Chaque option a un prix calculé avec précision, sans frais cachés.",
    a0Compliance: "Norme A0",
    a0ComplianceDesc: "Le configurateur vous guidera vers les équipements répondant aux normes de construction A0.",
    customOptions: "Large choix",
    customOptionsDesc: "De la couleur des fenêtres aux types de façades, en passant par les installations clés et les fondations."
  },
  sr: {
    interactiveConfigurator: "Интерактивни конфигуратор",
    configuratorTitle: "Прилагодите свој {name}",
    configuratorSubtitle: "Изградите свој дом из снова баш по својој мери. Изаберите намену објекта, дебљину изолације, тип фасаде и технологије. Цену и спецификацију обрачунавамо транспарентно у реалном времену.",
    transparentPricing: "Јасне цене",
    transparentPricingDesc: "Свака опција има прецизно обрачунату цену без скривених трошкова.",
    a0Compliance: "А0 Стандард",
    a0ComplianceDesc: "Конфигуратор ће вас сам водити до опреме која испуњава грађевинске стандарде А0.",
    customOptions: "Широк избор",
    customOptionsDesc: "Од боје прозора преко типова фасаде до кључних инсталација и темеља."
  },
  hr: {
    interactiveConfigurator: "Interaktivni konfigurator",
    configuratorTitle: "Prilagodite svoj {name}",
    configuratorSubtitle: "Izgradite svoj dom iz snova baš po svojoj mjeri. Odaberite namjenu objekta, debljinu izolacije, tip fasade i tehnologije. Cijenu i specifikaciju obračunavamo transparentno u stvarnom vremenu.",
    transparentPricing: "Jasne cijene",
    transparentPricingDesc: "Svaka opcija ima precizno obračunatu cijenu bez skrivenih troškova.",
    a0Compliance: "A0 Standard",
    a0ComplianceDesc: "Konfigurator će vas sam voditi do opreme koja ispunjava građevinske dokumente A0.",
    customOptions: "Širok izbor",
    customOptionsDesc: "Od boje prozora preko tipova fasade do ključnih instalacija i temelja."
  },
  el: {
    interactiveConfigurator: "Διαδραστικός διαμορφωτής",
    configuratorTitle: "Προσαρμόστε το {name} σας",
    configuratorSubtitle: "Χτίστε το σπίτι των ονείρων σας ακριβώς όπως το θέλετε. Επιλέξτε τον σκοπό του κτιρίου, το πάχος της μόνωσης, τον τύπο της πρόσοψης και τις τεχνολογίες. Υπολογίζουμε την τιμή και τις προδιαγραφές με διαφάνεια σε πραγματικό χρόνο.",
    transparentPricing: "Διαφανείς τιμές",
    transparentPricingDesc: "Κάθε επιλογή έχει ακριβώς υπολογισμένη τιμή χωρίς κρυφές χρεώσεις.",
    a0Compliance: "Πρότυπο A0",
    a0ComplianceDesc: "Ο διαμορφωτής θα σας καθοδηγήσει σε εξοπλισμό που πληροί τα κατασκευαστικά πρότυπα A0.",
    customOptions: "Ευρεία επιλογή",
    customOptionsDesc: "Από το χρώμα των παραθύρων και τους τύπους πρόσοψης μέχρι τις βασικές εγκαταστάσεις και τα θεμέλια."
  },
  hu: {
    interactiveConfigurator: "Interaktív konfigurátor",
    configuratorTitle: "Személyre szabhatja {name} házát",
    configuratorSubtitle: "Építse fel álmai otthonát pontosan az Ön elképzelései szerint. Válassza ki az épület célját, a szigetelés vastagságát, a homlokzat típusát és a technológiákat. Az árat és a specifikációt átláthatóan, valós időben számoljuk ki.",
    transparentPricing: "Világos árak",
    transparentPricingDesc: "Minden opció pontosan kiszámított árral rendelkezik, rejtett költségek nélkül.",
    a0Compliance: "A0 szabvány",
    a0ComplianceDesc: "A konfigurátor elvezeti Önt az A0-s építési szabványoknak megfelelő berendezésekhez.",
    customOptions: "Széles választék",
    customOptionsDesc: "Ablakszínektől a homlokzati típusokon át a kulcsfontosságú gépészetig és alapozásig."
  },
  pl: {
    interactiveConfigurator: "Interaktywny konfigurator",
    configuratorTitle: "Dostosuj swój {name}",
    configuratorSubtitle: "Zbuduj swój wymarzony dom dokładnie według swoich upodobań. Wybierz przeznaczenie budynku, grubość izolacji, typ elewacji i technologie. Cenę i specyfikację obliczamy w przejrzysty sposób w czasie rzeczywistym.",
    transparentPricing: "Jasne ceny",
    transparentPricingDesc: "Każda opcja ma precyzyjnie skalkulowaną cenę bez ukrytych opłat.",
    a0Compliance: "Standard A0",
    a0ComplianceDesc: "Konfigurator sam poprowadzi Cię do wyposażenia spełniającego normy budowlane A0.",
    customOptions: "Szeroki wybór",
    customOptionsDesc: "Od koloru okien przez typy elewacji po kluczowe instalacje i fundamenty."
  },
  uk: {
    interactiveConfigurator: "Інтерактивний конфігуратор",
    configuratorTitle: "Налаштуйте свій {name}",
    configuratorSubtitle: "Побудуйте дім своєї мрії саме так, як вам подобається. Виберіть призначення будівлі, товщину ізоляції, тип фасаду та технології. Ми розраховуємо ціну та специфікацію прозоро в режимі реального часу.",
    transparentPricing: "Прозорі ціни",
    transparentPricingDesc: "Кожна опція має точно розраховану ціну без прихованих платежів.",
    a0Compliance: "Стандарт А0",
    a0ComplianceDesc: "Конфігуратор сам підкаже обладнання, що відповідає будівельним нормам А0.",
    customOptions: "Широкий вибір",
    customOptionsDesc: "Від кольору вікон через типи фасадів до ключових комунікацій та фундаменту."
  }
};

const localesDir = path.join(__dirname, '../src/components/translations/locales');

Object.keys(bannerTranslations).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.js`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Let's check if the keys are already added
  const newKeys = bannerTranslations[lang];
  const keysToAdd = [];
  
  for (const [key, value] of Object.entries(newKeys)) {
    if (!content.includes(`"${key}":`) && !content.includes(`'${key}':`) && !content.includes(`${key}:`)) {
      keysToAdd.push(`  "${key}": ${JSON.stringify(value)}`);
    }
  }

  if (keysToAdd.length === 0) {
    console.log(`No new keys to add for ${lang}`);
    return;
  }

  // Find the closing brace of the export default object
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex === -1) {
    console.error(`Could not find closing brace in ${filePath}`);
    return;
  }

  // Check if we need to add a trailing comma to the last item
  let sliceBeforeBrace = content.slice(0, lastBraceIndex).trim();
  if (!sliceBeforeBrace.endsWith(',') && !sliceBeforeBrace.endsWith('{')) {
    sliceBeforeBrace += ',';
  }

  const newContent = sliceBeforeBrace + '\n' + keysToAdd.join(',\n') + '\n};' + content.slice(lastBraceIndex + 2);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully added ${keysToAdd.length} keys to ${lang}.js`);
});
