import fs from 'fs';
import path from 'path';

// Define the 10-language dictionaries for each subcatalog page

const modularneT = {
  sk: {
    metaTitle: "Modulové domy a Tiny House | Katalóg a ceny | American Living",
    metaDesc: "Modulové domy na kľúč, ktoré rastú s vami. Zistite viac o rastúcich domoch a kategórii Tiny House. Pevné ceny, rýchle dodanie a špičková kvalita.",
    badge: "Bývanie bez kompromisov",
    h1Title: "Modulové Domy",
    h1Desc: "Vyskladajte si bývanie ako z lega. Modulárne domy, ktoré sa dajú kedykoľvek zväčšiť, alebo obľúbené Tiny Houses bez zbytočnej byrokracie a s minimálnymi nákladmi na prevádzku.",
    showModules: "Zobraziť najlepšie moduly",
    card1Title: "Rastúce domy",
    card1Desc: "Teraz vám stačia 2 moduly (50m2)? Výborne. Ak sa rodina rozrastie, o 3 roky jednoducho pripojíte tretí modul.",
    card2Title: "3D Moduly z továrne",
    card2Desc: "Modul príde z výrobnej haly kompletne hotový, často už aj s obkladmi, sanitou či nábytkom. Žiadny prach na pozemku.",
    card3Title: "Fenomén Tiny House",
    card3Desc: "Minimalizmus a sloboda. Malé domčeky (často do 25m2), ktoré nevyžadujú zložité stavebné povolenia a obrovskú hypotéku.",
    h2Title: "Modulové Domy",
    h2Desc: "Ideálne pre moderné bývanie bez dlhov, alebo pre startupy hľadajúce inovatívne firemné priestory.",
    area: "Plocha",
    priceFrom: "Cena od",
    viewAllButton: "Pozrieť všetky modulové domy a Tiny house",
    whyInvestTitle: "Prečo sa oplatí investovať do modulárneho bývania?",
    whyInvestDesc: "Architektúra na Slovensku sa mení. Už nestaviame 3-poschodové vily pre generácie dopredu. Moderný človek chce bývať okamžite, bez dlhov a s možnosťou úprav. A práve na toto odpovedajú modulárne domy.",
    mythsTitle: "Mýty a fakty o modulových domoch",
    mythsWrong: "Čo si ľudia (mylne) myslia",
    myth1: "\"Zle to izoluje.\" (Fakt: Modulárne domy majú rovnako hrubú izoláciu ako akýkoľvek iný montovaný dom v kategórii A0).",
    myth2: "\"Je to len kontajner.\" (Fakt: Hoci majú tvar kvádra kvôli preprave, vnútri môžu skrývať luxusné materiály a smart domácnosť).",
    realityTitle: "Aká je realita",
    reality1: "Modulárna konštrukcia (najmä pri Tiny House) poskytuje absolútnu slobodu s minimálnymi poplatkami za réžiu a údržbu.",
    reality2: "V prípade sťahovania si dom jednoducho zoberiete so sebou.",
    faqTitle: "Časté otázky (FAQ)"
  },
  en: {
    metaTitle: "Modular Homes and Tiny House | Catalog and Prices | American Living",
    metaDesc: "Turnkey modular homes that grow with you. Learn more about growing homes and the Tiny House category. Fixed prices, fast delivery and top quality.",
    badge: "Living without compromise",
    h1Title: "Modular Homes",
    h1Desc: "Build your home like Lego. Modular homes that can be expanded at any time, or popular Tiny Houses without unnecessary bureaucracy and with minimal operating costs.",
    showModules: "View best modules",
    card1Title: "Growing houses",
    card1Desc: "Are 2 modules (50m2) enough for you now? Great. If the family grows, you simply connect a third module in 3 years.",
    card2Title: "3D Modules from the factory",
    card2Desc: "The module comes completely finished from the production hall, often with tiles, sanitary ware or furniture. No dust on the plot.",
    card3Title: "Tiny House Phenomenon",
    card3Desc: "Minimalism and freedom. Small houses (often up to 25m2) that do not require complex building permits and a huge mortgage.",
    h2Title: "Modular Homes",
    h2Desc: "Ideal for modern debt-free living, or for startups looking for innovative business spaces.",
    area: "Area",
    priceFrom: "Price from",
    viewAllButton: "View all modular homes and Tiny houses",
    whyInvestTitle: "Why is it worth investing in modular housing?",
    whyInvestDesc: "Architecture is changing. We no longer build 3-story villas for generations ahead. Modern people want to live immediately, without debt and with the possibility of modifications. And modular homes answer exactly this.",
    mythsTitle: "Myths and facts about modular homes",
    mythsWrong: "What people (mistakenly) think",
    myth1: "\"It insulates poorly.\" (Fact: Modular homes have the same thick insulation as any other prefabricated home in the A0 category).",
    myth2: "\"It's just a container.\" (Fact: Although they have a cuboid shape for transport, they can hide luxurious materials and smart homes inside).",
    realityTitle: "What is the reality",
    reality1: "Modular construction (especially for Tiny House) provides absolute freedom with minimal overhead and maintenance fees.",
    reality2: "In case of moving, you simply take the house with you.",
    faqTitle: "Frequently Asked Questions (FAQ)"
  }
};

const mobilneT = {
  sk: {
    metaTitle: "Celoročné mobilné domy | Ceny, výhody a katalóg | American Living",
    metaDesc: "Katalóg luxusných celoročných mobilných domov. Rýchle dodanie, plnohodnotné zateplenie, dodanie na kľúč. Zistite ceny a prezrite si najlepšie modely.",
    badge: "Najväčší trend tohto roka",
    h1Title: "Mobilné Domy",
    h1Desc: "Plnohodnotné, zateplené a luxusne vybavené bývanie, ktoré vám dovezieme kompletne hotové priamo na pozemok. Žiadne stavebné povolenia plné byrokracie, len okamžité nasťahovanie.",
    showModels: "Prezrieť najlepšie modely",
    card1Title: "Dovezieme hotové",
    card1Desc: "Dom príde hotový na kamióne. Žiadny neporiadok zo stavby na vašom pozemku, stačí len napojiť siete.",
    card2Title: "Sloboda presunu",
    card2Desc: "Váš dom nie je pevne spojený so zemou. Ak sa o 5 rokov rozhodnete zmeniť lokalitu, dom môže cestovať s vami.",
    card3Title: "Zimné zateplenie",
    card3Desc: "Používame pokročilé izolačné panely a PUR penu, vďaka čomu naše domy pohodlne zvládnu aj kruté zimy.",
    h2Title: "Mobilné Domy",
    h2Desc: "Tieto modely sú u našich zákazníkov najžiadanejšie pre celoročné bývanie aj víkendový oddych.",
    area: "Plocha",
    priceFrom: "Cena od",
    viewAllButton: "Zobraziť všetky mobilné domy",
    mythTitle: "Mobilné bývanie nie sú len staré karavany",
    mythDesc: "Pri slove \"mobilný dom\" si mnohí predstavia tenké plechové domčeky z bazáru, ktoré v lete pripomínajú saunu a v zime mrazničku. Dnešné celoročné mobilné domy sú však konštrukčne, dizajnovo a najmä tepelne na úplne inej úrovni.",
    differenceTitle: "Rozdiel medzi víkendovým a celoročným mobilným domom",
    weekend: "Víkendové / Sezónne",
    weekendDesc: "Lacnejšie varianty, ktoré majú tenšiu vrstvu izolácie (zvyčajne do 10 cm). Sú ideálne ako záhradné chatky, kde sa nezdržiavate počas najväčších mrazov.",
    yearRound: "Celoročné zateplené",
    yearRoundDesc: "Mohutnejšia konštrukcia (často oceľová klietka alebo silný drevený rám), izolačná vrstva od 15-20 cm vyššie, 3-sklá, kvalitné podlahové kúrenie. Zaručujú absolútny komfort 365 dní v roku.",
    faqTitle: "Časté otázky o mobilných domoch (FAQ)"
  },
  en: {
    metaTitle: "Year-round Mobile Homes | Prices, Advantages & Catalog | American Living",
    metaDesc: "Catalog of luxury year-round mobile homes. Fast delivery, full insulation, turnkey delivery. Find out prices and view the best models.",
    badge: "Biggest trend of this year",
    h1Title: "Mobile Homes",
    h1Desc: "Fully-fledged, insulated and luxuriously equipped housing that we will deliver completely finished directly to your plot. No building permits full of bureaucracy, just immediate move-in.",
    showModels: "View best models",
    card1Title: "Delivered ready",
    card1Desc: "The house arrives finished on a truck. No mess from construction on your plot, just connect to utilities.",
    card2Title: "Mobility",
    card2Desc: "Your house is not permanently connected to the ground. If you decide to change location in 5 years, the house can travel with you.",
    card3Title: "Winter insulation",
    card3Desc: "We use advanced insulation panels and PUR foam, thanks to which our houses comfortably handle even harsh winters.",
    h2Title: "Mobile Homes",
    h2Desc: "These models are most requested by our customers for year-round living and weekend relaxation.",
    area: "Area",
    priceFrom: "Price from",
    viewAllButton: "View all mobile homes",
    mythTitle: "Mobile living is not just old caravans",
    mythDesc: "At the word \"mobile home\", many imagine thin tin houses from a bazaar that resemble a sauna in summer and a freezer in winter. Today's year-round mobile homes, however, are on a completely different level in terms of construction, design and especially thermal insulation.",
    differenceTitle: "Difference between weekend and year-round mobile home",
    weekend: "Weekend / Seasonal",
    weekendDesc: "Cheaper options that have a thinner layer of insulation (usually up to 10 cm). They are ideal as garden cottages where you do not stay during the biggest frosts.",
    yearRound: "Year-round insulated",
    yearRoundDesc: "Sturdier construction (often a steel cage or strong wooden frame), insulation layer of 15-20 cm or more, triple glazing, quality underfloor heating. They guarantee absolute comfort 365 days a year.",
    faqTitle: "Frequently Asked Questions about Mobile Homes (FAQ)"
  }
};

const montovaneT = {
  sk: {
    metaTitle: "Montované domy na kľúč s cenou | Drevodomy A0 | American Living",
    metaDesc: "Katalóg nízkoenergetických montovaných domov a drevostavieb na kľúč. Najrýchlejšia výstavba, pevná cena, A0 certifikát a špičkový dizajn. Pozrite si našu ponuku.",
    badge: "Najlepšia voľba pre rok 2025",
    h1Title: "Montované Domy",
    h1Desc: "Zabudnite na roky plné stresu pri stavaní. Nízkoenergetické drevodomy a montované stavby vám dodáme bleskovo, s garanciou pevnej ceny a v prísnom energetickom štandarde A0.",
    showModels: "Pozrieť najlepšie domy",
    viewAllButton: "Zobraziť kompletný katalóg",
    card1Title: "Blesková rýchlosť",
    card1Desc: "Výroba v hale nie je závislá na počasí. Na pozemku staviame v priebehu pár dní, bývať môžete do 3-4 mesiacov.",
    card2Title: "Pevná a garantovaná cena",
    card2Desc: "Vďaka presnej prefabrikácii nehrozia žiadne \"nepredvídané\" stavebné náklady. Čo je v zmluve, to platí.",
    card3Title: "Energetický štandard A0",
    card3Desc: "Drevostavby s dokonalou tepelnou izoláciou, rekuperáciou a úspornými technológiami pre zdravý a lacný život.",
    h2Title: "Montované Domy",
    h2Desc: "Vybrali sme pre vás tie najvyhľadávanejšie projekty s najlepším pomerom ceny a kvality pre slovenský trh.",
    area: "Plocha",
    priceFrom: "Cena od",
    whyTrendTitle: "Prečo sú moderné montované domy trendom budúcnosti?",
    whyTrendDesc: "Výraz \"montovaný dom\" už dávno neznamená tenkú stenu a letnú chatku. V roku 2025 ide o špičkové, inžiniersky prepracované drevostavby a oceľové konštrukcie, ktoré hrúbkou izolácie a energetickou úspornosťou často prekonávajú klasické tehlové domy.",
    advantagesTitle: "Výhody a nevýhody montovaných domov",
    advantagesHeader: "Hlavné Výhody",
    advantage1: "Hrubá stavba hotová za pár dní (tzv. suchá výstavba bez potreby zrenia).",
    advantage2: "Viac úžitkovej plochy pri rovnakej zastavanej ploche (steny drevodomov sú tenšie, ale lepšie izolujú).",
    advantage3: "Ekologické a udržateľné materiály pre zdravé bývanie.",
    disadvantagesHeader: "Na čo si dať pozor",
    disadvantage1: "Menšia tepelná akumulácia (dom sa rýchlejšie vykúri, ale po vypnutí kúrenia skôr vychladne, čo riešime špičkovou izoláciou).",
    disadvantage2: "Horšia zvuková izolácia pri nesprávnom návrhu (my však používame hrubé sendvičové panely s akustickými doskami).",
    faqTitle: "Časté otázky (FAQ)"
  },
  en: {
    metaTitle: "Turnkey Prefabricated Homes | Wooden Houses A0 | American Living",
    metaDesc: "Catalog of low-energy prefabricated homes and turnkey wooden buildings. Fastest construction, fixed price, A0 certificate and top design.",
    badge: "Best choice for 2025",
    h1Title: "Prefabricated Homes",
    h1Desc: "Forget about years of stress during construction. We will deliver low-energy wooden houses and prefabricated buildings to you lightning fast, with a guaranteed fixed price and in a strict A0 energy standard.",
    showModels: "View best houses",
    viewAllButton: "View complete catalog",
    card1Title: "Lightning speed",
    card1Desc: "Factory production does not depend on weather. We assemble on the plot in a few days, you can move in within 3-4 months.",
    card2Title: "Fixed and guaranteed price",
    card2Desc: "Thanks to precise prefabrication, there are no \"unexpected\" construction costs. What's in the contract holds.",
    card3Title: "Energy standard A0",
    card3Desc: "Timber buildings with perfect thermal insulation, heat recovery and cost-saving technologies for a healthy and cheap life.",
    h2Title: "Prefabricated Homes",
    h2Desc: "We have selected the most sought-after projects with the best price-quality ratio for you.",
    area: "Area",
    priceFrom: "Price from",
    whyTrendTitle: "Why are modern prefab homes the trend of the future?",
    whyTrendDesc: "The term \"prefabricated house\" has long ceased to mean a thin wall and a summer cottage. In 2025, these are top-class, engineered wooden buildings and steel structures that often surpass classic brick houses in insulation thickness and energy efficiency.",
    advantagesTitle: "Advantages and disadvantages of prefab homes",
    advantagesHeader: "Key Advantages",
    advantage1: "Shell structure finished in a few days (dry construction without curing time).",
    advantage2: "More usable area for the same built-up area (walls are thinner but insulate better).",
    advantage3: "Ecological and sustainable materials for healthy living.",
    disadvantagesHeader: "What to watch out for",
    disadvantage1: "Less heat accumulation (the house heats up quickly but cools down faster, which we solve with top insulation).",
    disadvantage2: "Poorer sound insulation if improperly designed (we use thick sandwich panels with acoustic boards).",
    faqTitle: "Frequently Asked Questions (FAQ)"
  }
};

// Auto-fill fallback languages (de, fr, hu, pl, uk, sr, hr, el) using English values
function populateLangs(dict) {
  const otherLangs = ['de', 'fr', 'hu', 'pl', 'uk', 'sr', 'hr', 'el'];
  otherLangs.forEach(lang => {
    dict[lang] = dict.en;
  });
}
populateLangs(modularneT);
populateLangs(mobilneT);
populateLangs(montovaneT);

// Now apply patching to each file

// 1. KatalogModularneDomy.jsx
const modPath = 'src/pages/KatalogModularneDomy.jsx';
if (fs.existsSync(modPath)) {
  let content = fs.readFileSync(modPath, 'utf8');

  // Let's do the text replacements on the content BEFORE prepending localT!
  content = content.replace(
    'import { useQuery } from "@tanstack/react-query";',
    'import { useQuery } from "@tanstack/react-query";\nimport { useLanguage } from "../components/LanguageContext";'
  );
  content = content.replace(
    'export default function KatalogModularneDomy() {',
    'export default function KatalogModularneDomy() {\n  const { t, language } = useLanguage();\n  const mt = localT[language] || localT.sk;'
  );

  // Theme wrapper & visual replacements
  content = content.replace(
    'className="min-h-screen bg-slate-950 font-[\'Outfit\'] text-slate-100 overflow-hidden"',
    'className="min-h-screen bg-background font-[\'Outfit\'] text-foreground overflow-hidden transition-colors duration-300"'
  );
  content = content.replace(
    'bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950',
    'bg-gradient-to-b from-background via-muted/40 to-background'
  );
  content = content.replace(
    'bg-slate-900 border-y border-slate-800',
    'bg-card border border-border border-y border-slate-800'
  );
  content = content.replaceAll(
    'bg-slate-950 rounded-2xl border border-slate-800',
    'bg-background rounded-2xl border border-border'
  );
  content = content.replaceAll(
    'bg-slate-900 border-slate-800',
    'bg-card border-border'
  );
  content = content.replaceAll(
    'border-t border-slate-800 pt-4',
    'border-t border-border pt-4'
  );
  content = content.replace(
    'bg-slate-900 border-t border-slate-800',
    'bg-card border-t border-border'
  );

  // Text values
  content = content.replace(
    '<title>Modulové domy a Tiny House | Katalóg a ceny | American Living</title>',
    '<title>{mt.metaTitle}</title>'
  );
  content = content.replace(
    '<meta name="description" content="Modulové domy na kľúč, ktoré rastú s vami. Zistite viac o rastúcich domoch a kategórii Tiny House. Pevné ceny, rýchle dodanie a špičková kvalita." />',
    '<meta name="description" content={mt.metaDesc} />'
  );
  content = content.replace(
    'Bývanie bez kompromisov',
    '{mt.badge}'
  );
  content = content.replace(
    'Moderné <span className="text-blue-500">Modulové Domy</span> a Tiny House',
    'Moderné <span className="text-blue-500">{mt.h1Title}</span> a Tiny House'
  );
  content = content.replace(
    'Vyskladajte si bývanie ako z lega. Modulárne domy, ktoré sa dajú kedykoľvek zväčšiť, alebo obľúbené Tiny Houses bez zbytočnej byrokracie a s minimálnymi nákladmi na prevádzku.',
    '{mt.h1Desc}'
  );
  content = content.replace(
    'Zobraziť najlepšie moduly',
    '{mt.showModules}'
  );
  content = content.replace(
    'Rastúce domy',
    '{mt.card1Title}'
  );
  content = content.replace(
    'Teraz vám stačia 2 moduly (50m2)? Výborne. Ak sa rodina rozrastie, o 3 roky jednoducho pripojíte tretí modul.',
    '{mt.card1Desc}'
  );
  content = content.replace(
    '3D Moduly z továrne',
    '{mt.card2Title}'
  );
  content = content.replace(
    'Modul príde z výrobnej haly kompletne hotový, často už aj s obkladmi, sanitou či nábytkom. Žiadny prach na pozemku.',
    '{mt.card2Desc}'
  );
  content = content.replace(
    'Fenomén Tiny House',
    '{mt.card3Title}'
  );
  content = content.replace(
    'Minimalizmus a sloboda. Malé domčeky (často do 25m2), ktoré nevyžadujú zložité stavebné povolenia a obrovskú hypotéku.',
    '{mt.card3Desc}'
  );
  content = content.replace(
    'Najobľúbenejšie <span className="text-blue-500">Modulové Domy</span>',
    'Najobľúbenejšie <span className="text-blue-500">{mt.h2Title}</span>'
  );
  content = content.replace(
    'Ideálne pre moderné bývanie bez dlhov, alebo pre startupy hľadajúce inovatívne firemné priestory.',
    '{mt.h2Desc}'
  );
  content = content.replaceAll(
    'Plocha',
    '{mt.area}'
  );
  content = content.replaceAll(
    'Cena od',
    '{mt.priceFrom}'
  );
  content = content.replace(
    'Pozrieť všetky modulové domy a Tiny house',
    '{mt.viewAllButton}'
  );
  content = content.replace(
    'Prečo sa oplatí investovať do modulárneho bývania?',
    '{mt.whyInvestTitle}'
  );
  content = content.replace(
    `Architektúra na Slovensku sa mení. Už nestaviame 3-poschodové vily pre generácie dopredu. 
              Moderný človek chce bývať okamžite, bez dlhov a s možnosťou úprav. A práve na toto odpovedajú modulárne domy.`,
    '{mt.whyInvestDesc}'
  );
  content = content.replace(
    'Mýty a fakty o modulových domoch',
    '{mt.mythsTitle}'
  );
  content = content.replaceAll(
    'bg-red-950/30 p-6 rounded-xl border border-red-900/50',
    'bg-destructive/10 p-6 rounded-xl border border-destructive/20'
  );
  content = content.replaceAll(
    'bg-blue-950/30 p-6 rounded-xl border border-blue-900/50',
    'bg-primary/10 p-6 rounded-xl border border-primary/20'
  );
  content = content.replaceAll(
    'text-red-500 font-bold',
    'text-destructive font-bold'
  );
  content = content.replaceAll(
    'text-blue-500 font-bold',
    'text-primary font-bold'
  );
  content = content.replace(
    'Čo si ľudia (mylne) myslia',
    '{mt.mythsWrong}'
  );
  content = content.replace(
    'Aká je realita',
    '{mt.realityTitle}'
  );
  content = content.replace(
    '"Zle to izoluje." (Fakt: Modulárne domy majú rovnako hrubú izoláciu ako akýkoľvek iný montovaný dom v kategórii A0).',
    '{mt.myth1}'
  );
  content = content.replace(
    '"Je to len kontajner." (Fakt: Hoci majú tvar kvádra kvôli preprave, vnútri môžu skrývať luxusné materiály a smart domácnosť).',
    '{mt.myth2}'
  );
  content = content.replace(
    'Modulárna konštrukcia (najmä pri Tiny House) poskytuje absolútnu slobodu s minimálnymi poplatkami za réžiu a údržbu.',
    '{mt.reality1}'
  );
  content = content.replace(
    'V prípade sťahovania si dom jednoducho zoberiete so sebou.',
    '{mt.reality2}'
  );
  content = content.replace(
    'Časté otázky (FAQ)',
    '{mt.faqTitle}'
  );
  content = content.replaceAll(
    'text-slate-100',
    'text-foreground'
  );
  content = content.replaceAll(
    'text-slate-300',
    'text-muted-foreground'
  );
  content = content.replaceAll(
    'text-slate-400',
    'text-muted-foreground'
  );
  content = content.replaceAll(
    'bg-white text-slate-900 hover:bg-slate-200',
    'bg-primary text-primary-foreground hover:bg-primary/90'
  );

  // Now, prepend the localT dictionary block
  const localTBlock = `\nconst localT = ${JSON.stringify(modularneT, null, 2)};\n`;
  content = content.replace(
    'export default function KatalogModularneDomy() {',
    `${localTBlock}\nexport default function KatalogModularneDomy() {`
  );

  fs.writeFileSync(modPath, content, 'utf8');
  console.log('✅ Successfully patched src/pages/KatalogModularneDomy.jsx');
}

// 2. KatalogMobilneDomy.jsx
const mobPath = 'src/pages/KatalogMobilneDomy.jsx';
if (fs.existsSync(mobPath)) {
  let content = fs.readFileSync(mobPath, 'utf8');

  // Let's do the text replacements on the content BEFORE prepending localT!
  content = content.replace(
    'import { useQuery } from "@tanstack/react-query";',
    'import { useQuery } from "@tanstack/react-query";\nimport { useLanguage } from "../components/LanguageContext";'
  );
  content = content.replace(
    'export default function KatalogMobilneDomy() {',
    'export default function KatalogMobilneDomy() {\n  const { t, language } = useLanguage();\n  const mt = localT[language] || localT.sk;'
  );

  // Theme wrapper & visual replacements
  content = content.replace(
    'className="min-h-screen bg-slate-950 font-[\'Outfit\'] text-slate-100 overflow-hidden"',
    'className="min-h-screen bg-background font-[\'Outfit\'] text-foreground overflow-hidden transition-colors duration-300"'
  );
  content = content.replace(
    'bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950',
    'bg-gradient-to-b from-background via-muted/40 to-background'
  );
  content = content.replace(
    'bg-slate-900 border-y border-slate-800',
    'bg-card border border-border border-y border-slate-800'
  );
  content = content.replaceAll(
    'bg-slate-950 rounded-2xl border border-slate-800',
    'bg-background rounded-2xl border border-border'
  );
  content = content.replaceAll(
    'bg-slate-900 border-slate-800',
    'bg-card border-border'
  );
  content = content.replaceAll(
    'border-t border-slate-800 pt-4',
    'border-t border-border pt-4'
  );
  content = content.replace(
    'bg-slate-900 border-t border-slate-800',
    'bg-card border-t border-border'
  );

  // Text values
  content = content.replace(
    '<title>Celoročné mobilné domy | Ceny, výhody a katalóg | American Living</title>',
    '<title>{mt.metaTitle}</title>'
  );
  content = content.replace(
    '<meta name="description" content="Katalóg luxusných celoročných mobilných domov. Rýchle dodanie, plnohodnotné zateplenie, dodanie na kľúč. Zistite ceny a prezrite si najlepšie modely." />',
    '<meta name="description" content={mt.metaDesc} />'
  );
  content = content.replace(
    'Najväčší trend tohto roka',
    '{mt.badge}'
  );
  content = content.replace(
    'Celoročné <span className="text-emerald-500">Mobilné Domy</span>',
    'Celoročné <span className="text-emerald-500">{mt.h1Title}</span>'
  );
  content = content.replace(
    'Plnohodnotné, zateplené a luxusne vybavené bývanie, ktoré vám dovezieme kompletne hotové priamo na pozemok. Žiadne stavebné povolenia plné byrokracie, len okamžité nasťahovanie.',
    '{mt.h1Desc}'
  );
  content = content.replace(
    'Prezrieť najlepšie modely',
    '{mt.showModels}'
  );
  content = content.replace(
    'Dovezieme hotové',
    '{mt.card1Title}'
  );
  content = content.replace(
    'Dom príde hotový na kamióne. Žiadny neporiadok zo stavby na vašom pozemku, stačí len napojiť siete.',
    '{mt.card1Desc}'
  );
  content = content.replace(
    'Sloboda presunu',
    '{mt.card2Title}'
  );
  content = content.replace(
    'Váš dom nie je pevne spojený so zemou. Ak sa o 5 rokov rozhodnete zmeniť lokalitu, dom môže cestovať s vami.',
    '{mt.card2Desc}'
  );
  content = content.replace(
    'Zimné zateplenie',
    '{mt.card3Title}'
  );
  content = content.replace(
    'Používame pokročilé izolačné panely a PUR penu, vďaka čomu naše domy pohodlne zvládnu aj kruté zimy.',
    '{mt.card3Desc}'
  );
  content = content.replace(
    'Najobľúbenejšie <span className="text-emerald-500">Mobilné Domy</span>',
    'Najobľúbenejšie <span className="text-emerald-500">{mt.h2Title}</span>'
  );
  content = content.replace(
    'Tieto modely sú u našich zákazníkov najžiadanejšie pre celoročné bývanie aj víkendový oddych.',
    '{mt.h2Desc}'
  );
  content = content.replaceAll(
    'Plocha',
    '{mt.area}'
  );
  content = content.replaceAll(
    'Cena od',
    '{mt.priceFrom}'
  );
  content = content.replace(
    'Zobraziť všetky mobilné domy',
    '{mt.viewAllButton}'
  );
  content = content.replace(
    'Mobilné bývanie nie sú len staré karavany',
    '{mt.mythTitle}'
  );
  content = content.replace(
    'Pri slove "mobilný dom" si mnohí predstavia tenké plechové domčeky z bazáru, ktoré v lete pripomínajú saunu a v zime mrazničku. Dnešné celoročné mobilné domy sú však konštrukčne, dizajnovo a najmä tepelne na úplne inej úrovni.',
    '{mt.mythDesc}'
  );
  content = content.replace(
    'Rozdiel medzi víkendovým a celoročným mobilným domom',
    '{mt.differenceTitle}'
  );
  content = content.replace(
    'Víkendové / Sezónne',
    '{mt.weekend}'
  );
  content = content.replace(
    'Lacnejšie varianty, ktoré majú tenšiu vrstvu izolácie (zvyčajne do 10 cm). Sú ideálne ako záhradné chatky, kde sa nezdržiavate počas najväčších mrazov.',
    '{mt.weekendDesc}'
  );
  content = content.replace(
    'Celoročné zateplené',
    '{mt.yearRound}'
  );
  content = content.replace(
    'Mohutnejšia konštrukcia (často oceľová klietka alebo silný drevený rám), izolačná vrstva od 15-20 cm vyššie, 3-sklá, kvalitné podlahové kúrenie. Zaručujú absolútny komfort 365 dní v roku.',
    '{mt.yearRoundDesc}'
  );
  content = content.replace(
    'Časté otázky o mobilných domoch (FAQ)',
    '{mt.faqTitle}'
  );
  content = content.replaceAll(
    'text-slate-100',
    'text-foreground'
  );
  content = content.replaceAll(
    'text-slate-300',
    'text-muted-foreground'
  );
  content = content.replaceAll(
    'text-slate-400',
    'text-muted-foreground'
  );
  content = content.replaceAll(
    'bg-white text-slate-900 hover:bg-slate-200',
    'bg-primary text-primary-foreground hover:bg-primary/90'
  );

  // Now, prepend the localT dictionary block
  const localTBlock = `\nconst localT = ${JSON.stringify(mobilneT, null, 2)};\n`;
  content = content.replace(
    'export default function KatalogMobilneDomy() {',
    `${localTBlock}\nexport default function KatalogMobilneDomy() {`
  );

  fs.writeFileSync(mobPath, content, 'utf8');
  console.log('✅ Successfully patched src/pages/KatalogMobilneDomy.jsx');
}

// 3. KatalogMontovaneDomy.jsx
const montPath = 'src/pages/KatalogMontovaneDomy.jsx';
if (fs.existsSync(montPath)) {
  let content = fs.readFileSync(montPath, 'utf8');

  // Let's do the text replacements on the content BEFORE prepending localT!
  content = content.replace(
    'import { useQuery } from "@tanstack/react-query";',
    'import { useQuery } from "@tanstack/react-query";\nimport { useLanguage } from "../components/LanguageContext";'
  );
  content = content.replace(
    'export default function KatalogMontovaneDomy() {',
    'export default function KatalogMontovaneDomy() {\n  const { t, language } = useLanguage();\n  const mt = localT[language] || localT.sk;'
  );

  // Theme wrapper & visual replacements
  content = content.replace(
    'className="min-h-screen bg-slate-950 font-[\'Outfit\'] text-slate-100 overflow-hidden"',
    'className="min-h-screen bg-background font-[\'Outfit\'] text-foreground overflow-hidden transition-colors duration-300"'
  );
  content = content.replace(
    'bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950',
    'bg-gradient-to-b from-background via-muted/40 to-background'
  );
  content = content.replace(
    'bg-slate-900 border-y border-slate-800',
    'bg-card border border-border border-y border-slate-800'
  );
  content = content.replaceAll(
    'bg-slate-950 rounded-2xl border border-slate-800',
    'bg-background rounded-2xl border border-border'
  );
  content = content.replaceAll(
    'bg-slate-900 border-slate-800',
    'bg-card border-border'
  );
  content = content.replaceAll(
    'border-t border-slate-800 pt-4',
    'border-t border-border pt-4'
  );
  content = content.replace(
    'bg-slate-900 border-t border-slate-800',
    'bg-card border-t border-border'
  );

  // Text values
  content = content.replace(
    '<title>Montované domy na kľúč s cenou | Drevodomy A0 | American Living</title>',
    '<title>{mt.metaTitle}</title>'
  );
  content = content.replace(
    '<meta name="description" content="Katalóg nízkoenergetických montovaných domov a drevostavieb na kľúč. Najrýchlejšia výstavba, pevná cena, A0 certifikát a špičkový dizajn. Pozrite si našu ponuku." />',
    '<meta name="description" content={mt.metaDesc} />'
  );
  content = content.replace(
    'Najlepšia voľba pre rok 2025',
    '{mt.badge}'
  );
  content = content.replace(
    'Moderné <span className="text-red-500">Montované Domy</span> na kľúč',
    'Moderné <span className="text-red-500">{mt.h1Title}</span> na kľúč'
  );
  content = content.replace(
    'Zabudnite na roky plné stresu pri stavaní. Nízkoenergetické drevodomy a montované stavby vám dodáme bleskovo, s garanciou pevnej ceny a v prísnom energetickom štandarde A0.',
    '{mt.h1Desc}'
  );
  content = content.replace(
    'Pozrieť najlepšie domy',
    '{mt.showModels}'
  );
  content = content.replace(
    'Zobraziť kompletný katalóg',
    '{mt.viewAllButton}'
  );
  content = content.replace(
    'Blesková rýchlosť',
    '{mt.card1Title}'
  );
  content = content.replace(
    'Výroba v hale nie je závislá na počasí. Na pozemku staviame v priebehu pár dní, bývať môžete do 3-4 mesiacov.',
    '{mt.card1Desc}'
  );
  content = content.replace(
    'Pevná a garantovaná cena',
    '{mt.card2Title}'
  );
  content = content.replace(
    'Vďaka presnej prefabrikácii nehrozia žiadne "nepredvídané" stavebné náklady. Čo je v zmluve, to platí.',
    '{mt.card2Desc}'
  );
  content = content.replace(
    'Energetický štandard A0',
    '{mt.card3Title}'
  );
  content = content.replace(
    'Drevostavby s dokonalou tepelnou izoláciou, rekuperáciou a úspornými technológiami pre zdravý a lacný život.',
    '{mt.card3Desc}'
  );
  content = content.replace(
    'Najobľúbenejšie <span className="text-red-500">Montované Domy</span>',
    'Najobľúbenejšie <span className="text-red-500">{mt.h2Title}</span>'
  );
  content = content.replace(
    'Vybrali sme pre vás tie najvyhľadávanejšie projekty s najlepším pomerom ceny a kvality pre slovenský trh.',
    '{mt.h2Desc}'
  );
  content = content.replaceAll(
    'Plocha',
    '{mt.area}'
  );
  content = content.replaceAll(
    'Cena od',
    '{mt.priceFrom}'
  );
  content = content.replace(
    'Pozrieť ďalšie montované domy',
    '{mt.viewAllButton}'
  );
  content = content.replace(
    'Prečo sú moderné montované domy trendom budúcnosti?',
    '{mt.whyTrendTitle}'
  );
  content = content.replace(
    'Výraz "montovaný dom" už dávno neznamená tenkú stenu a letnú chatku. V roku 2025 ide o špičkové, inžiniersky prepracované drevostavby a oceľové konštrukcie, ktoré <strong>hrúbkou izolácie a energetickou úspornosťou často prekonávajú klasické tehlové domy</strong>.',
    '{mt.whyTrendDesc}'
  );
  content = content.replace(
    'Výhody a nevýhody montovaných domov',
    '{mt.advantagesTitle}'
  );
  content = content.replace(
    'Hlavné Výhody',
    '{mt.advantagesHeader}'
  );
  content = content.replace(
    'Hrubá stavba hotová za pár dní (tzv. suchá výstavba bez potreby zrenia).',
    '{mt.advantage1}'
  );
  content = content.replace(
    'Viac úžitkovej plochy pri rovnakej zastavanej ploche (steny drevodomov sú tenšie, ale lepšie izolujú).',
    '{mt.advantage2}'
  );
  content = content.replace(
    'Ekologické a udržateľné materiály pre zdravé bývanie.',
    '{mt.advantage3}'
  );
  content = content.replace(
    'Na čo si dať pozor',
    '{mt.disadvantagesHeader}'
  );
  content = content.replace(
    'Menšia tepelná akumulácia (dom sa rýchlejšie vykúri, ale po vypnutí kúrenia skôr vychladne, čo riešime špičkovou izoláciou).',
    '{mt.disadvantage1}'
  );
  content = content.replace(
    'Horšia zvuková izolácia pri nesprávnom návrhu (my však používame hrubé sendvičové panely s akustickými doskami).',
    '{mt.disadvantage2}'
  );
  content = content.replace(
    'Časté otázky (FAQ)',
    '{mt.faqTitle}'
  );
  content = content.replaceAll(
    'bg-red-950/30 p-6 rounded-xl border border-red-900/50',
    'bg-destructive/10 p-6 rounded-xl border border-destructive/20'
  );
  content = content.replaceAll(
    'bg-green-950/30 p-6 rounded-xl border border-green-900/50',
    'bg-emerald-950/30 p-6 rounded-xl border border-emerald-900/20'
  );
  content = content.replaceAll(
    'text-red-500 font-bold',
    'text-destructive font-bold'
  );
  content = content.replaceAll(
    'text-green-500 font-bold',
    'text-emerald-500 font-bold'
  );
  content = content.replaceAll(
    'text-slate-100',
    'text-foreground'
  );
  content = content.replaceAll(
    'text-slate-300',
    'text-muted-foreground'
  );
  content = content.replaceAll(
    'text-slate-400',
    'text-muted-foreground'
  );
  content = content.replaceAll(
    'bg-white text-slate-900 hover:bg-slate-200',
    'bg-primary text-primary-foreground hover:bg-primary/90'
  );

  // Now, prepend the localT dictionary block
  const localTBlock = `\nconst localT = ${JSON.stringify(montovaneT, null, 2)};\n`;
  content = content.replace(
    'export default function KatalogMontovaneDomy() {',
    `${localTBlock}\nexport default function KatalogMontovaneDomy() {`
  );

  fs.writeFileSync(montPath, content, 'utf8');
  console.log('✅ Successfully patched src/pages/KatalogMontovaneDomy.jsx');
}

console.log('All subcatalogs successfully patched and styled!');
