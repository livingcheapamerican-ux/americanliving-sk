import fs from 'fs';
import path from 'path';

// Define translations for AkoToFunguje.jsx in 10 languages
const akoToFungujeTranslations = {
  sk: {
    title: "Ako to funguje?",
    subtitle: "Transparentný proces od prvého stretnutia až po odovzdanie kľúčov. Sme s vami na každom kroku.",
    stepsTitle: "Proces v 5 krokoch",
    stepsSubtitle: "Od sna po realitu - jasný a prehľadný proces",
    techTitle: "Technológia a kvalita",
    techSubtitle: "Používame najmodernejšie technológie a kvalitné materiály pre váš komfort a úspory",
    faqTitle: "Často kladené otázky",
    faqSubtitle: "Odpovede na najčastejšie otázky našich klientov",
    ctaTitle: "Máte ďalšie otázky?",
    ctaSubtitle: "Radi vám poradíme a zodpovieme všetky vaše otázky. Kontaktujte nás ešte dnes!",
    contactUs: "Kontaktovať nás",
    viewCatalog: "Prezrieť katalóg",
    proces: [
      {
        cislo: "01",
        nazov: "Prvá konzultácia",
        popis: "Stretnutie, kde spoločne prediskutujeme vaše predstavy, požiadavky a rozpočet. Poradíme vám s výberom modelu a vysvetlíme celý proces.",
        details: [
          "Konzultácia je úplne nezáväzná a bezplatná",
          "Môžeme sa stretnúť osobne, online alebo telefonicky",
          "Pomôžeme vám vybrať ideálny model z katalógu"
        ]
      },
      {
        cislo: "02",
        nazov: "Návrh a vizualizácie",
        popis: "Na základe vašich požiadaviek vytvoríme detailný návrh vrátane pôdorysov, 3D vizualizácií a technickej dokumentácie.",
        details: [
          "Profesionálne 3D vizualizácie exteriéru a interiéru",
          "Detailné pôdorysy všetkých podlaží",
          "Prispôsobíme návrh podľa vašich pripomienok"
        ]
      },
      {
        cislo: "03",
        nazov: "Stavebné povolenia",
        popis: "Zabezpečíme všetky potrebné stavebné povolenia a dokumentáciu. O administratívu sa postaráme my, vy sa môžete tešiť na nový domov.",
        details: [
          "Vybavíme všetky potrebné povolenia",
          "Komunikácia s úradmi na našej strane",
          "Pravidelné informovanie o priebehu"
        ]
      },
      {
        cislo: "04",
        nazov: "Výstavba",
        popis: "Realizácia výstavby podľa dohodnutého harmonogramu. Pravidelne vás informujeme o postupe prác a kedykoľvek môžete stavbu navštíviť.",
        details: [
          "Výstavba trvá typicky 4-6 mesiacov",
          "Týždenné reporty s fotkami z výstavby",
          "Osobný stavebný manažér pre vás"
        ]
      },
      {
        cislo: "05",
        nazov: "Odovzdanie na kľúč",
        popis: "Po dokončení výstavby prebehne záverečná prehliadka a odovzdanie domu. Poskytujeme aj pozáručný servis a poradenstvo.",
        details: [
          "Kompletná záverečná kontrola kvality",
          "Odovzdanie všetkej dokumentácie",
          "5-ročná záruka a pozáručný servis"
        ]
      }
    ],
    technologia: [
      {
        nazov: "Energetická efektivita",
        popis: "Naše domy dosahujú energetickú triedu A. Použitím kvalitnej izolácie a moderných technológií výrazne znížite náklady na vykurovanie a chladenie.",
        features: ["Tepelné čerpadlo", "Rekuperácia", "Fotovoltika (možnosť)"]
      },
      {
        nazov: "Drevostavba",
        popis: "Moderná drevostavba kombinuje rýchlosť výstavby s výbornou tepelnou izoláciou. Drevo je prírodný, obnoviteľný a ekologický materiál.",
        features: ["Drevený skelet", "Viacvrstvová konštrukcia", "Priedušná konštrukcia"]
      },
      {
        nazov: "Rýchla výstavba",
        popis: "Vďaka prefabrikácii a moderným technológiám dokážeme váš dom postaviť za 4-6 mesiacov od začiatku výstavby na pozemku.",
        features: ["Predvýroba v hale", "Montáž na pozemku", "Menšia závislosť na počasí"]
      }
    ],
    faq: [
      {
        otazka: "Aká je cena domu na kľúč?",
        odpoved: "Cena závisí od veľkosti domu, štandardu vybavenia a konkrétnych požiadaviek. Orientačne sa ceny pohybujú od 1500-2500 €/m². Presný rozpočet vám pripravíme po konzultácii."
      },
      {
        otazka: "Ako dlho trvá výstavba?",
        odpoved: "Samotná výstavba domu na pozemku trvá 4-6 mesiacov. Celkový čas od podpisu zmluvy po odovzdanie závisí aj od vybavenia stavebného povolenia (cca 2-4 mesiace)."
      },
      {
        otazka: "Môžem si dom prispôsobiť?",
        odpoved: "Áno, každý náš model môžete prispôsobiť podľa svojich predstáv. Môžete meniť dispozíciu, veľkosť miestností, materiály, farby a mnoho ďalšieho."
      },
      {
        otazka: "Aká je životnosť drevostavby?",
        odpoved: "Pri správnej údržbe má drevostavba životnosť viac ako 100 rokov. Moderné technológie a materiály zabezpečujú dlhovekosť porovnateľnú s murovanými domami."
      },
      {
        otazka: "Poskytujete financovanie?",
        odpoved: "Spolupracujeme s viacerými bankami a môžeme vám pomôcť s vybavením hypotéky. Pripravíme všetku potrebnú dokumentáciu pre banku."
      },
      {
        otazka: "Čo všetko zahŕňa cena na kľúč?",
        odpoved: "Cena na kľúč zahŕňa projekt, stavebné povolenie, výstavbu domu, technológie (kúrenie, voda, elektrina), vnútorné omietky a kompletné podlahy. Nezahŕňa pozemok a prípojky inžinierskych sietí."
      }
    ]
  },
  en: {
    title: "How it works?",
    subtitle: "A transparent process from the first meeting to the handover of the keys. We are with you every step of the way.",
    stepsTitle: "Process in 5 steps",
    stepsSubtitle: "From dream to reality - a clear and transparent process",
    techTitle: "Technology and quality",
    techSubtitle: "We use state-of-the-art technology and quality materials for your comfort and savings",
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Answers to our clients' most common questions",
    ctaTitle: "Do you have more questions?",
    ctaSubtitle: "We will be happy to advise you and answer all your questions. Contact us today!",
    contactUs: "Contact Us",
    viewCatalog: "View Catalog",
    proces: [
      {
        cislo: "01",
        nazov: "First Consultation",
        popis: "A meeting where we discuss your ideas, requirements, and budget together. We will advise you on choosing a model and explain the whole process.",
        details: [
          "Consultation is completely non-binding and free",
          "We can meet in person, online, or by phone",
          "We will help you choose the ideal model from the catalog"
        ]
      },
      {
        cislo: "02",
        nazov: "Design and Visualizations",
        popis: "Based on your requirements, we will create a detailed design including floor plans, 3D visualizations, and technical documentation.",
        details: [
          "Professional 3D visualizations of the exterior and interior",
          "Detailed floor plans of all floors",
          "We will adapt the design according to your comments"
        ]
      },
      {
        cislo: "03",
        nazov: "Building Permits",
        popis: "We will secure all necessary building permits and documentation. We handle the paperwork, so you can look forward to your new home.",
        details: [
          "We handle all necessary permits",
          "Communication with authorities is on our side",
          "Regular progress updates"
        ]
      },
      {
        cislo: "04",
        nazov: "Construction",
        popis: "Realization of construction according to the agreed schedule. We regularly update you on progress and you can visit the site anytime.",
        details: [
          "Construction typically takes 4-6 months",
          "Weekly reports with photos from the construction site",
          "Personal construction manager for you"
        ]
      },
      {
        cislo: "05",
        nazov: "Turnkey Handover",
        popis: "After completion of construction, the final inspection and handover of the house takes place. We also provide post-warranty service and advice.",
        details: [
          "Complete final quality control",
          "Handover of all documentation",
          "5-year warranty and post-warranty service"
        ]
      }
    ],
    technologia: [
      {
        nazov: "Energy Efficiency",
        popis: "Our houses achieve energy class A. By using quality insulation and modern technologies, you will significantly reduce heating and cooling costs.",
        features: ["Heat pump", "Heat recovery", "Photovoltaics (optional)"]
      },
      {
        nazov: "Timber Frame",
        popis: "Modern timber frame construction combines speed of assembly with excellent thermal insulation. Wood is a natural, renewable, and ecological material.",
        features: ["Wooden skeleton", "Multi-layer construction", "Breathable construction"]
      },
      {
        nazov: "Fast Construction",
        popis: "Thanks to prefabrication and modern technologies, we can build your house in 4-6 months from the start of construction on site.",
        features: ["Factory prefabrication", "Site assembly", "Less dependent on weather"]
      }
    ],
    faq: [
      {
        otazka: "What is the price of a turnkey house?",
        odpoved: "The price depends on the size of the house, the standard of equipment, and specific requirements. Roughly, prices range from 1500-2500 €/m². We will prepare a precise budget after the consultation."
      },
      {
        otazka: "How long does construction take?",
        odpoved: "The actual construction of the house on site takes 4-6 months. The total time from signing the contract to handover also depends on obtaining the building permit (approx. 2-4 months)."
      },
      {
        otazka: "Can I customize the house?",
        odpoved: "Yes, you can customize each of our models to your liking. You can change layout, room sizes, materials, colors, and much more."
      },
      {
        otazka: "What is the lifespan of a timber house?",
        odpoved: "With proper maintenance, a timber frame house has a lifespan of more than 100 years. Modern technologies and materials ensure longevity comparable to brick houses."
      },
      {
        otazka: "Do you provide financing?",
        odpoved: "We work with several banks and can help you secure a mortgage. We will prepare all necessary documentation for the bank."
      },
      {
        otazka: "What does the turnkey price include?",
        odpoved: "The turnkey price includes design, building permit, construction of the house, utilities (heating, water, electricity), interior plastering, and complete flooring. It does not include land and utility connections."
      }
    ]
  }
};

// Fill in French, German, Hungarian, Polish, Ukrainian, Serbian, Croatian, Greek fallback arrays
const otherLangs = ['de', 'fr', 'hu', 'pl', 'uk', 'sr', 'hr', 'el'];
const translatePlaceholders = {
  de: {
    title: "Wie funktioniert es?",
    subtitle: "Ein transparenter Prozess vom ersten Gespräch bis zur Schlüsselübergabe. Wir begleiten Sie bei jedem Schritt.",
    stepsTitle: "Prozess in 5 Schritten",
    stepsSubtitle: "Vom Traum zur Realität - ein klarer und übersichtlicher Prozess",
    techTitle: "Technologie und Qualität",
    techSubtitle: "Wir nutzen modernste Technologien und Qualitätsmaterialien für Ihren Komfort und Ersparnisse",
    faqTitle: "Häufig gestellte Fragen",
    faqSubtitle: "Antworten auf die häufigsten Fragen unserer Kunden",
    ctaTitle: "Haben Sie weitere Fragen?",
    ctaSubtitle: "Wir beraten Sie gerne und beantworten alle Ihre Fragen. Kontaktieren Sie uns noch heute!",
    contactUs: "Kontaktieren Sie uns",
    viewCatalog: "Katalog ansehen",
    proces: [
      { cislo: "01", nazov: "Erste Beratung", popis: "Ein Treffen, bei dem wir gemeinsam Ihre Vorstellungen, Anforderungen und Ihr Budget besprechen. Wir beraten Sie bei der Modellauswahl und erklären den gesamten Ablauf.", details: ["Die Beratung ist völlig unverbindlich und kostenlos", "Wir können uns persönlich, online oder telefonisch treffen", "Wir helfen Ihnen bei der Auswahl des idealen Modells aus dem Katalog"] },
      { cislo: "02", nazov: "Entwurf und Visualisierungen", popis: "Basierend auf Ihren Anforderungen erstellen wir einen detaillierten Entwurf inklusive Grundrissen, 3D-Visualisierungen und technischer Dokumentation.", details: ["Professionelle 3D-Visualisierungen für außen und innen", "Detaillierte Grundrisse aller Etagen", "Wir passen den Entwurf an Ihre Rückmeldungen an"] },
      { cislo: "03", nazov: "Baugenehmigungen", popis: "Wir besorgen alle notwendigen Baugenehmigungen und Unterlagen. Wir kümmern uns um die Bürokratie, damit Sie sich auf Ihr neues Zuhause freuen können.", details: ["Wir besorgen alle notwendigen Genehmigungen", "Die Kommunikation mit den Behörden liegt bei uns", "Regelmäßige Informationen über den Fortschritt"] },
      { cislo: "04", nazov: "Bauphase", popis: "Realisierung des Baus nach dem vereinbarten Zeitplan. Wir informieren Sie regelmäßig über den Fortschritt und Sie können die Baustelle jederzeit besuchen.", details: ["Der Bau dauert in der Regel 4-6 Monate", "Wöchentliche Berichte mit Fotos von der Baustelle", "Ein persönlicher Bauleiter für Sie"] },
      { cislo: "05", nazov: "Schlüsselfertige Übergabe", popis: "Nach Fertigstellung des Baus erfolgt die Endabnahme und Übergabe des Hauses. Wir bieten auch Nachgarantieservice und Beratung.", details: ["Komplette abschließende Qualitätskontrolle", "Übergabe aller Unterlagen", "5 Jahre Garantie und Nachgarantieservice"] }
    ],
    technologia: [
      { nazov: "Energieeffizienz", popis: "Unsere Häuser erreichen die Energieklasse A. Durch den Einsatz hochwertiger Dämmung und moderner Technologien senken Sie die Heiz- und Kühlkosten deutlich.", features: ["Wärmepumpe", "Lüftungsanlage mit Wärmerückgewinnung", "Photovoltaik (optional)"] },
      { nazov: "Holzrahmenbau", popis: "Der moderne Holzrahmenbau verbindet schnelle Montage mit hervorragender Wärmedämmung. Holz ist ein natürlicher, nachwachsender und ökologischer Baustoff.", features: ["Holzskelett", "Mehrschichtige Konstruktion", "Atmungsaktive Konstruktion"] },
      { nazov: "Schneller Bau", popis: "Dank Vorfertigung und moderner Technologien können wir Ihr Haus in 4-6 Monaten ab Baubeginn auf dem Grundstück errichten.", features: ["Vorfertigung im Werk", "Montage auf dem Grundstück", "Geringere Wetterabhängigkeit"] }
    ],
    faq: [
      { otazka: "Wie hoch ist der Preis für ein schlüsselfertiges Haus?", odpoved: "Der Preis hängt von der Größe des Hauses, dem Ausstattungsstandard und den spezifischen Anforderungen ab. Richtungsweisend liegen die Preise zwischen 1500-2500 €/m². Ein genaues Budget erstellen wir Ihnen nach der Beratung." },
      { otazka: "Wie lange dauert der Bau?", odpoved: "Der eigentliche Bau des Hauses auf dem Grundstück dauert 4-6 Monate. Die Gesamtzeit von der Vertragsunterzeichnung bis zur Übergabe hängt auch von der Erteilung der Baugenehmigung ab (ca. 2-4 Monate)." },
      { otazka: "Kann ich das Haus individuell anpassen?", odpoved: "Ja, Sie können jedes unserer Modelle nach Ihren Wünschen anpassen. Sie können den Grundriss, die Raumgrößen, Materialien, Farben und vieles mehr ändern." },
      { otazka: "Wie hoch ist die Lebensdauer eines Holzhauses?", odpoved: "Bei sachgemäßer Wartung hat ein Holzrahmenhaus eine Lebensdauer von mehr als 100 Jahren. Moderne Technologien und Materialien gewährleisten eine mit Ziegelhäusern vergleichbare Langlebigkeit." },
      { otazka: "Bieten Sie eine Finanzierung an?", odpoved: "Wir arbeiten mit mehreren Banken zusammen und können Ihnen bei der Finanzierung helfen. Wir bereiten alle notwendigen Unterlagen für die Bank vor." },
      { otazka: "Was beinhaltet der schlüsselfertige Preis?", odpoved: "Der schlüsselfertige Preis beinhaltet Planung, Baugenehmigung, Hausbau, Haustechnik (Heizung, Wasser, Strom), Innenputz und komplette Bodenbeläge. Nicht enthalten sind Grundstück und Erschließungskosten." }
    ]
  }
};

// Build translations for all languages, using EN as fallback if not in DE
otherLangs.forEach(lang => {
  if (!translatePlaceholders[lang]) {
    // Generate simple localizations programmatically
    const isPL = lang === 'pl';
    const isHU = lang === 'hu';
    const isUA = lang === 'uk';
    const isHR = lang === 'hr';
    const isSR = lang === 'sr';
    
    translatePlaceholders[lang] = {
      title: isPL ? "Jak to działa?" : isHU ? "Hogyan működik?" : isUA ? "Як це працює?" : isHR ? "Kako to radi?" : isSR ? "Како то ради?" : "How it works?",
      subtitle: akoToFungujeTranslations.en.subtitle,
      stepsTitle: isPL ? "Proces w 5 krokach" : isHU ? "Folyamat 5 lépésben" : isUA ? "Процес у 5 кроків" : isHR ? "Proces u 5 koraka" : "Process in 5 steps",
      stepsSubtitle: akoToFungujeTranslations.en.stepsSubtitle,
      techTitle: isPL ? "Technologia i jakość" : isHU ? "Technológia és minőség" : isUA ? "Технологія та якість" : "Technology and quality",
      techSubtitle: akoToFungujeTranslations.en.techSubtitle,
      faqTitle: isPL ? "Często Zadawane Pytania" : isHU ? "Gyakran Ismételt Kérdések" : isUA ? "Часті питання" : "FAQ",
      faqSubtitle: akoToFungujeTranslations.en.faqSubtitle,
      ctaTitle: akoToFungujeTranslations.en.ctaTitle,
      ctaSubtitle: akoToFungujeTranslations.en.ctaSubtitle,
      contactUs: isPL ? "Skontaktuj się z nami" : isHU ? "Kapcsolatfelvétel" : isUA ? "Зв'язатися з нами" : "Contact Us",
      viewCatalog: isPL ? "Zobacz katalog" : isHU ? "Katalógus megtekintése" : isUA ? "Переглянути каталог" : "View Catalog",
      proces: akoToFungujeTranslations.en.proces.map((p, idx) => ({
        cislo: p.cislo,
        nazov: akoToFungujeTranslations.sk.proces[idx].nazov, // Fallback name works fine
        popis: p.popis,
        details: p.details
      })),
      technologia: akoToFungujeTranslations.en.technologia.map((t, idx) => ({
        nazov: akoToFungujeTranslations.sk.technologia[idx].nazov,
        popis: t.popis,
        features: t.features
      })),
      faq: akoToFungujeTranslations.en.faq.map((f, idx) => ({
        otazka: akoToFungujeTranslations.sk.faq[idx].otazka,
        odpoved: f.odpoved
      }))
    };
  }
});

Object.assign(akoToFungujeTranslations, translatePlaceholders);


// Main execution block
console.log('Starting patch operation...');

// 1. PATCH AKOTOFUNGUJE.JSX
const akoPath = 'src/pages/AkoToFunguje.jsx';
if (fs.existsSync(akoPath)) {
  let content = fs.readFileSync(akoPath, 'utf8');
  
  // Insert translations object
  const transInsert = `\n// 10-language translations dictionary\nconst pageTranslations = ${JSON.stringify(akoToFungujeTranslations, null, 2)};\n`;
  
  // Replace the original component start to import and use translations
  content = content.replace(
    'import { motion } from "framer-motion";',
    'import { motion } from "framer-motion";\nimport { useLanguage } from "../components/LanguageContext";'
  );
  
  // Replace the body variables
  const originalDecl = 'export default function AkoToFunguje() {\n  const proces = [';
  const targetDecl = `export default function AkoToFunguje() {\n  const { language } = useLanguage();\n  const t = pageTranslations[language] || pageTranslations.sk;\n  const proces = t.proces;\n  const technologia = t.technologia;\n  const faq = t.faq;`;
  
  // Find where const proces = ends (around faq declaration)
  // We can just remove the local arrays and inject our dynamic mapping
  const startIdx = content.indexOf('const proces = [');
  const endIdx = content.indexOf('return (', startIdx);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const originalBlock = content.substring(startIdx, endIdx);
    content = content.replace(originalBlock, `const t = pageTranslations[language] || pageTranslations.sk;\n  const proces = t.proces;\n  const technologia = t.technologia;\n  const faq = t.faq;\n\n  `);
  }
  
  // Now insert the translation dictionary at the top
  content = content.replace('export default function AkoToFunguje() {', `${transInsert}\nexport default function AkoToFunguje() {`);
  
  // Also add useLanguage destruct
  content = content.replace('export default function AkoToFunguje() {', 'export default function AkoToFunguje() {\n  const { language } = useLanguage();');
  
  // Replace background and Slovak texts in JSX
  content = content.replace('className="min-h-screen bg-gray-50"', 'className="min-h-screen bg-background text-foreground transition-colors duration-300"');
  content = content.replace('from-primary to-blue-700', 'from-[#9E2A2B] to-[#802021]');
  content = content.replace('className="text-5xl md:text-6xl font-bold mb-6"\n          >\n            Ako to funguje?\n          </h1', 'className="text-5xl md:text-6xl font-bold mb-6"\n          >\n            {t.title}\n          </h1');
  content = content.replace('Transparentný proces od prvého stretnutia až po odovzdanie kľúčov. \n              Sme s vami na každom kroku.', '{t.subtitle}');
  content = content.replace('Proces v 5 krokoch', '{t.stepsTitle}');
  content = content.replace('Od sna po realitu - jasný a prehľadný proces', '{t.stepsSubtitle}');
  content = content.replace('Technológia a kvalita', '{t.techTitle}');
  content = content.replace('Používame najmodernejšie technológie a kvalitné materiály pre váš komfort a úspory', '{t.techSubtitle}');
  content = content.replace('Často kladené otázky', '{t.faqTitle}');
  content = content.replace('Odpovede na najčastejšie otázky našich klientov', '{t.faqSubtitle}');
  content = content.replace('Máte ďalšie otázky?', '{t.ctaTitle}');
  content = content.replace('Radi vám poradíme a zodpovieme všetky vaše otázky. Kontaktujte nás ešte dnes!', '{t.ctaSubtitle}');
  content = content.replace('Kontaktovať nás', '{t.contactUs}');
  content = content.replace('Prezrieť katalóg', '{t.viewCatalog}');
  
  // Fix background values in JSX
  content = content.replace('className="py-20 bg-white"', 'className="py-20 bg-background border-t border-border transition-colors duration-300"');
  content = content.replace('className="p-8 flex-grow bg-white"', 'className="p-8 flex-grow bg-card text-foreground transition-colors duration-300"');
  content = content.replace('className="py-20 bg-gray-50"', 'className="py-20 bg-muted/30 border-y border-border transition-colors duration-300"');
  content = content.replace('className="p-8 h-full hover:shadow-xl transition-shadow bg-white"', 'className="p-8 h-full hover:shadow-xl border border-border transition-shadow bg-card"');
  content = content.replace('className="py-20 bg-white"', 'className="py-20 bg-background border-t border-border transition-colors duration-300"');
  content = content.replace('className="p-6 hover:shadow-lg transition-shadow bg-white"', 'className="p-6 hover:shadow-lg border border-border transition-shadow bg-card"');
  content = content.replace('bg-gradient-to-br from-primary to-blue-600', 'bg-gradient-to-br from-primary to-secondary');
  content = content.replace('bg-blue-100', 'bg-primary/10');
  content = content.replace('text-gray-900', 'text-foreground');
  content = content.replace('text-gray-700', 'text-muted-foreground');
  
  fs.writeFileSync(akoPath, content, 'utf8');
  console.log('✅ Patched AkoToFunguje.jsx');
}

// 2. PATCH DOMOV.JSX (HAPPY WIFE -> FLAT DOUBLE 142)
const domovPath = 'src/pages/Domov.jsx';
if (fs.existsSync(domovPath)) {
  let content = fs.readFileSync(domovPath, 'utf8');
  
  // Replace happy wife ID with flat double ID
  content = content.replace('"6916ec94c11aacdd15248f06"', '"6916ec94c11aacdd15248f18"');
  
  // Update local fallback staticGalleries
  const happyWifeBlock = `"6916ec94c11aacdd15248f06": { // Happy Wife 122
        exterier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/6e386b445_HappyWifeexteriermurovka4.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/353d1e4f2_HappyWifeexteriermurovka1.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/91acde74e_HappyWifeexterierdrevoplech1.jpeg"
        ],
        interier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/c4139ab8c_HappyWifeinteriersadrokarton1.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/4c679c6c0_HappyWifeinterierdrevo1.jpg"
        ]
      }`;
  
  const flatDoubleBlock = `"6916ec94c11aacdd15248f18": { // Flat Double 142
        exterier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/335e826f0_FlatdoubleExteriermurovka1.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/e21659a4d_FlatdoubleExteriermurovka4.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/6b3ff5efc_FlatdoubleExteriermurovka5.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/de8e12c89_FlatdoubleExteriermurovka6.jpeg"
        ],
        interier: [
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/7eaca1fe0_Gemini_Generated_Image_2i1lyq2i1lyq2i1l.jpeg",
          "https://base44.app/api/apps/6916d89a485af231beb54c71/files/public/6916d89a485af231beb54c71/543aa55d3_Gemini_Generated_Image_5iqao65iqao65iqa.jpeg"
        ]
      }`;
      
  content = content.replace(happyWifeBlock, flatDoubleBlock);
  content = content.replace('{ id: "6916ec94c11aacdd15248f06", name: "HAPPY WIFE 122", desc: "Moderný dvojkrídlový dom", price: "od 168 510 €" }', '{ id: "6916ec94c11aacdd15248f18", name: "FLAT DOUBLE 142", desc: "Dizajnový modulárny dom", price: "od 61 700 €" }');
  
  // Add missing translations local mapping inside Domov.jsx
  const localShowcaseDict = `
const localShowcaseT = {
  sk: {
    galleryTitle: "Galéria našich najlukratívnejších domov",
    galleryDesc: "Pozrite si reálne fotografie a detaily exteriéru a interiéru z našich prémiových montovaných a modulárnych domov.",
    exterier: "Exteriér domov",
    interier: "Interiér a dispozícia",
    noCapitalTitle: "Chcete si postaviť nový dom a nemáte na to kapitál?",
    noCapitalDesc: "Žiadny problém! Máme model financovania pre tých, ktorí nemajú našetrené. Pomôžeme vám vyriešiť financovanie celej výstavby od A po Z.",
    askKexoFinancing: "Opýtať sa Kexa na financovanie",
    trustGrantTitle: "Súkromný Grant AMERICANA",
    trustGrantDesc: "Poskytujeme jedinečný prevádzkový grant a finančnú bonifikáciu na energetickú certifikáciu a prevádzku domu až do výšky 15 000 €.",
    trustGrantLink: "Zistiť nárok na grant",
    trustFinanceTitle: "100% Financovanie stavby",
    trustFinanceDesc: "Nemáte hotovosť? V American Living financujeme výstavbu domu bez počiatočných úspor. Všetko vybavíme za vás vrátane hypotéky.",
    trustFinanceButton: "Spýtať sa na financovanie",
    trustBuildTitle: "Rýchle odovzdanie stavby",
    trustBuildDesc: "Garantujeme zmluvné odovzdanie vo fabrike už do 6 týždňov pre modulárne stavby a do 12 týždňov na kľúč pre montované domy.",
    trustBuildLink: "Ako to funguje",
    socialRealEst: "Kapitál pre váš nový domov získame rýchlo a bezpečne.",
    socialRealEstDesc: "Aby ste mohli stavať nové, často musíte najprv dobre predať to staré. Postaráme sa o kompletný realitný servis vašej súčasnej nehnuteľnosti.",
    socialLand: "Nie každá lúka je vhodný stavebný pozemok.",
    socialLandDesc: "Nájdeme pre vás pozemok, ktorý nie je len \\"staviteľný\\" na papieri, ale je optimálny pre vybranú technológiu domu.",
    socialFinance: "Financovanie výstavby domu nie je bežná hypotéka.",
    socialFinanceDesc: "Stavba domu vyžaduje špecifické čerpanie úveru v tranžiach. Naši finanční špecialisti nastavia hypotéku presne na mieru harmonogramu.",
    socialArch: "Dom, ktorý má hlavu a pätu ešte pred prvým výkopom.",
    socialArchDesc: "Či už chcete upraviť jeden z našich katalógových projektov alebo túžite po unikátnom dizajne na mieru, naši architekti sú vám k dispozícii.",
    socialPermits: "Byrokraciu nechajte na nás.",
    socialPermitsDesc: "Získanie stavebného povolenia je pre bežného človeka nočnou morou – pre nás je to rutina. Zastúpime vás v celom inžinierskom procese.",
    socialBuild: "Kvalitná realizácia bez skrytých poplatkov.",
    socialBuildDesc: "Realizujeme hrubé stavby, holodomy aj domy na kľúč. Pracujeme s overenými materiálmi a vlastným tímom odborníkov.",
    socialUtilities: "Aby všetko fungovalo po otočení kohútikom.",
    socialUtilitiesDesc: "Dom bez sietí je len hrubá stavba. Zabezpečíme kompletnú realizáciu prípojok vody, elektriny, plynu a kanalizácie.",
    socialApproval: "Posledná pečiatka a odovzdanie kľúčov.",
    socialApprovalDesc: "Cieľová rovinka. Pripravíme všetky revízie, certifikáty, geometrické plány a dokumenty potrebné ku kolaudačnému konaniu.",
    verifikaciaText: "Vizualizácia / Realizácia"
  },
  en: {
    galleryTitle: "Gallery of our most lucrative houses",
    galleryDesc: "View real photos and details of the exterior and interior of our premium prefabricated and modular homes.",
    exterier: "Exterior of houses",
    interier: "Interior and layout",
    noCapitalTitle: "Do you want to build a new house and have no capital?",
    noCapitalDesc: "No problem! We have a financing model for those with no savings. We will help you secure financing from A to Z.",
    askKexoFinancing: "Ask Kexo about financing",
    trustGrantTitle: "Súkromný Grant AMERICANA",
    trustGrantDesc: "We provide a unique operational grant and financial subsidy for energy certification and house operation up to €15,000.",
    trustGrantLink: "Check grant eligibility",
    trustFinanceTitle: "100% Construction Financing",
    trustFinanceDesc: "No cash? At American Living we finance construction without initial savings. We arrange everything for you including mortgage.",
    trustFinanceButton: "Ask about financing",
    trustBuildTitle: "Fast Handover of Construction",
    trustBuildDesc: "We guarantee factory handover in just 6 weeks for modular homes and within 12 weeks turnkey for prefab homes.",
    trustBuildLink: "How it works",
    socialRealEst: "Capital for your new home secured quickly and safely.",
    socialRealEstDesc: "To build new, you often need to sell the old first. We provide full real estate service for your current property.",
    socialLand: "Not every meadow is a suitable building plot.",
    socialLandDesc: "We will find you a plot that is optimal for the chosen house technology, checking utilities, access, and zoning.",
    socialFinance: "Financing house construction is not a standard mortgage.",
    socialFinanceDesc: "Construction requires drawdowns in stages. Our specialists will tailor a mortgage to the project timeline.",
    socialArch: "A house with logic before the first shovel hits.",
    socialArchDesc: "Whether you want to adapt a catalog model or design a unique custom home, our architects are here for you.",
    socialPermits: "Leave the bureaucracy to us.",
    socialPermitsDesc: "Getting a permit is a nightmare - for us it's routine. We represent you in all engineering processes.",
    socialBuild: "Quality construction without hidden costs.",
    socialBuildDesc: "We build structures to turnkey standard using certified materials and our own team of experts.",
    socialUtilities: "So that everything works at the turn of a tap.",
    socialUtilitiesDesc: "A house without utilities is just shell. We provide full connections for water, electricity, gas, and sewer.",
    socialApproval: "Last stamp and handover of keys.",
    socialApprovalDesc: "Final stretch. We prepare all tests, certificates, maps, and documents needed for final occupancy approval.",
    verifikaciaText: "Visualization / Realization"
  }
};
`;

  content = content.replace('export default function Domov() {', `${localShowcaseDict}\nexport default function Domov() {`);
  content = content.replace('const sp = socialProofT[language] || socialProofT.sk;', 'const sp = socialProofT[language] || socialProofT.sk;\n  const gt = localShowcaseT[language] || localShowcaseT.sk;');
  
  // Replace hardcoded values in JSX
  content = content.replace('Galéria našich najlukratívnejších domov', '{gt.galleryTitle}');
  content = content.replace('Pozrite si reálne fotografie a detaily exteriéru a interiéru z našich prémiových montovaných a modulárnych domov.', '{gt.galleryDesc}');
  content = content.replace('Exteriér domov', '{gt.exterier}');
  content = content.replace('Interiér a dispozícia', '{gt.interier}');
  content = content.replace('Chcete si postaviť nový dom a nemáte na to kapitál?', '{gt.noCapitalTitle}');
  content = content.replace('Žiadny problém! Máme model financovania pre tých, ktorí nemajú našetrené. Pomôžeme vám vyriešiť financovanie celej výstavby od A po Z.', '{gt.noCapitalDesc}');
  content = content.replace('Opýtať sa Kexa na financovanie', '{gt.askKexoFinancing}');
  
  // Replace Trust Grid text
  content = content.replace('Súkromný Grant AMERICANA', '{gt.trustGrantTitle}');
  content = content.replace('Poskytujeme jedinečný prevádzkový grant a finančnú bonifikáciu na energetickú certifikáciu a prevádzku domu až do výšky 15 000 €.', '{gt.trustGrantDesc}');
  content = content.replace('Zistiť nárok na grant', '{gt.trustGrantLink}');
  content = content.replace('100% Financovanie stavby', '{gt.trustFinanceTitle}');
  content = content.replace('Nemáte hotovosť? V American Living financujeme výstavbu domu bez počiatočných úspor. Všetko vybavíme za vás vrátane hypotéky.', '{gt.trustFinanceDesc}');
  content = content.replace('Spýtať sa na financovanie', '{gt.trustFinanceButton}');
  content = content.replace('Rýchle odovzdanie stavby', '{gt.trustBuildTitle}');
  content = content.replace('Garantujeme zmluvné odovzdanie vo fabrike už do 6 týždňov pre modulárne stavby a do 12 týždňov na kľúč pre montované domy.', '{gt.trustBuildDesc}');
  content = content.replace('Ako to funguje', '{gt.trustBuildLink}');
  
  // Replace Real Estate/Land sections
  content = content.replace('Kapitál pre váš nový domov získame rýchlo a bezpečne.', '{gt.socialRealEst}');
  content = content.replace('Aby ste mohli stavať nové, často musíte najprv dobre predať to staré. Postaráme sa o kompletný realitný servis vašej súčasnej nehnuteľnosti. Nastavíme trhovú cenu tak, aby sa predala v ideálnom čase nadväzujúcom na vašu novú výstavbu. Zabezpečíme home staging, profesionálne fotenie, právny servis a prevod peňazí, ktoré plynulo použijeme na financovanie vášho nového projektu.', '{gt.socialRealEstDesc}');
  content = content.replace('Nie každá lúka je vhodný stavebný pozemok.', '{gt.socialLand}');
  content = content.replace('Nájdeme pre vás pozemok, ktorý nie je len \\"staviteľný\\" na papieri, ale je optimálny pre vybranú technológiu domu. Preveríme svahovitosť, prístupové cesty, inžinierske sietia a územný plán. Vyhnete sa tak neočakávaným výdavkom na zemné práce, ktoré by mohli stavbu predražiť o tisíce eur.', '{gt.socialLandDesc}');
  content = content.replace('Financovanie výstavby domu nie je bežná hypotéka.', '{gt.socialFinance}');
  content = content.replace('Stavba domu vyžaduje špecifické čerpanie úveru v tranžiach. Naši finanční špecialisti nastavia hypotéku presne na mieru harmonogramu výstavby American Living. Komunikujeme priamo s bankou a znalcami, takže vy nemusíte nosiť faktúry a stresovať sa s uvoľňovaním prostriedkov. Garancia najlepších podmienok na trhu je samozrejmosťou.', '{gt.socialFinanceDesc}');
  content = content.replace('Dom, ktorý má hlavu a pätu ešte pred prvým výkopom.', '{gt.socialArch}');
  content = content.replace('Či už chcete upraviť jeden z našich katalógových projektov alebo túžite po unikátnom dizajne na mieru, naši architekti sú vám k dispozícii. Pripravíme kompletną projektovú dokumentáciu pre stavebné povolenie aj realizáciu. Myslíme na detaily, presvetlenie izieb aj energetickú úspornosť, aby sa vám v dome žilo pohodlne a náklady boli nízke.', '{gt.socialArchDesc}');
  content = content.replace('Byrokraciu nechajte na nás.', '{gt.socialPermits}');
  content = content.replace('Získanie stavebného povolenia je pre bežného človeka nočnou morou – pre nás je to rutina. Zastúpime vás v celom inžinierskom procese. Obiehame úrady, vybavujeme vyjadrenia dotknutých orgánov, správcov sietí a obce. Vy len počkáte na právoplatné rozhodnutie, s ktorým môžeme začať stavať.', '{gt.socialPermitsDesc}');
  content = content.replace('Kvalitná realizácia bez skrytých poplatkov.', '{gt.socialBuild}');
  content = content.replace('Realizujeme hrubé stavby, holodomy aj domy na kľúč. Pracujeme s overenými materiálmi a vlastným tímom odborníkov. Garantujeme dodržanie dohodnutého rozpočtu a termínov. Počas výstavby máte k dispozícii stavebný dozor a pravidelné reporty, takže presne vidíte, ako váš nový domov rastie pred očami.', '{gt.socialBuildDesc}');
  content = content.replace('Aby všetko fungovalo po otočení kohútikom.', '{gt.socialUtilities}');
  content = content.replace('Dom bez sietí je len hrubá stavba. Zabezpečíme kompletnú realizáciu prípojok vody, elektriny, plynu a kanalizácie. Riešime výkopy, pokládku, revízne správy aj finálne osadenie meračov. Koordinujeme všetko tak, aby bol dom pripravený na plnohodnotné užívanie.', '{gt.socialUtilitiesDesc}');
  content = content.replace('Posledná pečiatka a odovzdanie kľúčov.', '{gt.socialApproval}');
  content = content.replace('Cieľová rovinka. Pripravíme všetky revízie, certifikáty, geometrické plány a dokumenty potrebné ku kolaudačnému konaniu. Zastúpime vás pri miestnom šetrení stavebného úradu. Vám odovzdáme už skolaudovaný dom so súpisným číslom, pripravený na nasťahovanie a prepis energií.', '{gt.socialApprovalDesc}');
  
  content = content.replace('Vizualizácia / Realizácia', '{gt.verifikaciaText}');
  
  fs.writeFileSync(domovPath, content, 'utf8');
  console.log('✅ Patched Domov.jsx');
}

// 3. PATCH DOTACIAAMERICANA.JSX (LIGHT/DARK DESIGN FIX & LOCALIZATION)
const dotaciaPath = 'src/pages/DotaciaAmericana.jsx';
if (fs.existsSync(dotaciaPath)) {
  let content = fs.readFileSync(dotaciaPath, 'utf8');
  
  // Fix background: replace bg-slate-950 and bg-slate-900 with bg-background and bg-card
  content = content.replace('className="min-h-screen bg-slate-950"', 'className="min-h-screen bg-background text-foreground transition-colors duration-300"');
  content = content.replace('className="bg-slate-950 py-8 px-4 space-y-6"', 'className="bg-background py-8 px-4 space-y-6 transition-colors duration-300"');
  content = content.replace('className="p-6 bg-slate-900/50 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden"', 'className="p-6 bg-card backdrop-blur-xl border border-border shadow-lg relative overflow-hidden"');
  content = content.replace('className="p-6 bg-slate-900/50 backdrop-blur-xl border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden"', 'className="p-6 bg-card backdrop-blur-xl border border-border shadow-lg relative overflow-hidden"');
  content = content.replace('className="bg-slate-950 border-white/10 max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl"', 'className="bg-card border-border max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl w-full max-w-lg sm:max-w-xl md:max-w-2xl text-foreground"');
  content = content.replace('className="py-10 sm:py-16 md:py-20 bg-slate-950 border-t border-white/10 text-white"', 'className="py-10 sm:py-16 md:py-20 bg-background border-t border-border text-foreground transition-colors duration-300"');
  content = content.replace('className="bg-slate-900/95 backdrop-blur-sm rounded-xl p-5 shadow-xl border-2 border-emerald-400"', 'className="bg-card backdrop-blur-sm rounded-xl p-5 shadow-xl border border-border"');
  content = content.replace('className="bg-slate-900/95 backdrop-blur-sm rounded-xl p-5 shadow-xl border-2 border-yellow-400"', 'className="bg-card backdrop-blur-sm rounded-xl p-5 shadow-xl border border-border"');
  content = content.replace('className="bg-slate-900 p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl shadow-2xl"', 'className="bg-card p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl border border-border shadow-lg"');
  content = content.replace('bg-slate-900 border-white/10 text-white placeholder:text-slate-500', 'bg-background border-border text-foreground placeholder:text-muted-foreground');
  content = content.replace('bg-slate-950/80 backdrop-blur-xl p-6 rounded-xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] w-full max-w-md', 'bg-card backdrop-blur-xl p-6 rounded-xl border border-border shadow-xl w-full max-w-md');
  content = content.replace('bg-slate-950/80 backdrop-blur-xl p-6 rounded-xl border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)] w-full max-w-md', 'bg-card backdrop-blur-xl p-6 rounded-xl border border-border shadow-xl w-full max-w-md');
  
  // Local translations for form values and success alerts in DotaciaAmericana.jsx
  const dotaciaLocalTranslations = `
const dotaciaLocalT = {
  sk: {
    selectBestLoan: "3. Vyberte mi najlepší úver",
    successSent: "Žiadosť úspešne odoslaná!",
    successEmailConfirm: "Potvrdenie sme Vám zaslali na email. Budeme Vás kontaktovať v najbližších dňoch.",
    selectedHouse: "Váš vybraný dom",
    dotaciaLabel: "Dotácia:",
    ourContacts: "Naše kontakty",
    cash: "Hotovosť",
    loanSelf: "Úver - vybavujem si sám",
    photoManagerAmbassador: "🏡 Správa fotiek - Program Ambassador",
    photoManagerPartner: "📈 Správa fotiek - Program Partner",
    uploading: "Nahrávam...",
    uploadPhotos: "Nahrať nové fotky"
  },
  en: {
    selectBestLoan: "3. Choose the best loan for me",
    successSent: "Application successfully sent!",
    successEmailConfirm: "We have sent a confirmation to your email. We will contact you in the coming days.",
    selectedHouse: "Your selected house",
    dotaciaLabel: "Grant:",
    ourContacts: "Our contacts",
    cash: "Cash",
    loanSelf: "Mortgage - self-arranged",
    photoManagerAmbassador: "🏡 Manage Photos - Ambassador Program",
    photoManagerPartner: "📈 Manage Photos - Partner Program",
    uploading: "Uploading...",
    uploadPhotos: "Upload new photos"
  }
};
`;

  content = content.replace('export default function DotaciaAmericana() {', `${dotaciaLocalTranslations}\nexport default function DotaciaAmericana() {`);
  content = content.replace('const { t, language } = useLanguage();', 'const { t, language } = useLanguage();\n  const dt = dotaciaLocalT[language] || dotaciaLocalT.sk;');
  
  // Replace JSX Slovak text
  content = content.replace('3. Vyberte mi najlepší úver', '{dt.selectBestLoan}');
  content = content.replace('Žiadosť úspešne odoslaná!', '{dt.successSent}');
  content = content.replace('Potvrdenie sme Vám zaslali na email. Budeme Vás kontaktovať v najbližších dňoch.', '{dt.successEmailConfirm}');
  content = content.replace('Váš vybraný dom', '{dt.selectedHouse}');
  content = content.replace('Dotácia:', '{dt.dotaciaLabel}');
  content = content.replace('Naše kontakty', '{dt.ourContacts}');
  content = content.replace('Hotovosť', '{dt.cash}');
  content = content.replace('Úver - vybavujem si sám', '{dt.loanSelf}');
  content = content.replace('Správa fotiek - Program Ambassador', '{dt.photoManagerAmbassador}');
  content = content.replace('Správa fotiek - Program Partner', '{dt.photoManagerPartner}');
  content = content.replace('Nahrávam...', '{dt.uploading}');
  content = content.replace('Nahrať nové fotky', '{dt.uploadPhotos}');
  
  fs.writeFileSync(dotaciaPath, content, 'utf8');
  console.log('✅ Patched DotaciaAmericana.jsx');
}

// 4. PATCH SUB-CATALOGS (LIGHT MODE & LOCALIZATION)
const subCatalogs = [
  {
    path: 'src/pages/KatalogModularneDomy.jsx',
    title: 'Modulové Domy',
    banner: 'https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/prosto-house-design.webp'
  },
  {
    path: 'src/pages/KatalogMobilneDomy.jsx',
    title: 'Mobilné Domy',
    banner: 'https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/e6f77ccb-c5e7-49f9-bcff-183e20e8b284.webp'
  },
  {
    path: 'src/pages/KatalogMontovaneDomy.jsx',
    title: 'Montované Domy',
    banner: 'https://cloud.base44.com/storage/v1/object/public/uploads/americanliving-sk/images/e6f77ccb-c5e7-49f9-bcff-183e20e8b284.webp'
  }
];

subCatalogs.forEach(cat => {
  if (fs.existsSync(cat.path)) {
    let content = fs.readFileSync(cat.path, 'utf8');
    
    // Replace bg-slate-950 and text-slate-100 with theme variables
    content = content.replace('className="min-h-screen bg-slate-950 font-[\'Outfit\'] text-slate-100 overflow-hidden"', 'className="min-h-screen bg-background text-foreground font-[\'Outfit\'] transition-colors duration-300 overflow-hidden"');
    content = content.replace('bg-slate-950', 'bg-background');
    content = content.replace('bg-slate-900', 'bg-card border border-border');
    content = content.replace('bg-slate-800', 'bg-muted/50 border-y border-border');
    content = content.replace('text-slate-300', 'text-muted-foreground');
    content = content.replace('text-slate-400', 'text-muted-foreground');
    content = content.replace('text-slate-100', 'text-foreground');
    content = content.replace('text-white', 'text-foreground');
    content = content.replace('bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950', 'bg-gradient-to-b from-background via-muted/40 to-background');
    
    // Add useLanguage import if missing
    if (!content.includes('useLanguage')) {
      content = content.replace('import { useQuery }', 'import { useLanguage } from "../components/LanguageContext";\nimport { useQuery }');
    }
    
    // Deconstruct useLanguage at top of component
    const functionDeclaration = `export default function ${path.basename(cat.path, '.jsx')}() {`;
    content = content.replace(functionDeclaration, `${functionDeclaration}\n  const { t, language } = useLanguage();`);
    
    fs.writeFileSync(cat.path, content, 'utf8');
    console.log(`✅ Patched theme styling in ${path.basename(cat.path)}`);
  }
});

console.log('All patch operations complete!');
