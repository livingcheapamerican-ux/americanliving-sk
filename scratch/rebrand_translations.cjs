const fs = require('fs');
const path = require('path');

const filePath = '/Users/richardkovac/Documents/american_living_web/american-living-sk/src/components/LanguageContext.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  {
    from: '    dotacia: "DOTÁCIA",',
    to: '    dotacia: "SÚKROMNÝ GRANT",'
  },
  {
    from: '    dotaciaAmericanaButton: "Dotácia AMERICANA",',
    to: '    dotaciaAmericanaButton: "Súkromný grant AMERICANA",'
  },
  {
    from: '    dotaciaNotice: "Cenovú ponuku si dokončite a požadovaná výška dotácie Vám bude odpočítaná z ceny nakonfigurovaného domu. Táto cena sa pri podpise GRANTU zníži. O samotnú dotáciu treba požiadať v sekcii DOTÁCIA AMERICANA alebo stačí kliknúť na zelené tlačidlo dotácia.",',
    to: '    dotaciaNotice: "Cenovú ponuku si dokončite a požadovaná výška súkromného grantu Vám bude odpočítaná z ceny nakonfigurovaného domu. Táto cena sa pri podpise GRANTU zníži. O samotný grant treba požiadať v sekcii SÚKROMNÝ GRANT AMERICANA alebo stačí kliknúť na zelené tlačidlo grant.",'
  },
  {
    from: '    dotaciaHeroLeftSubtitle: "Dotované bývanie pre rodiny",',
    to: '    dotaciaHeroLeftSubtitle: "Grantové bývanie pre rodiny",'
  },
  {
    from: '    dotaciaHeroLeftDesc: "Získajte príspevok na výstavbu domu a dotáciu na energie výmenou za referenčnú spoluprácu.",',
    to: '    dotaciaHeroLeftDesc: "Získajte príspevok na výstavbu domu a prevádzkový grant na energie výmenou za referenčnú spoluprácu.",'
  },
  {
    from: '    dotaciaHeroLeftButton: "Overiť nárok na dotáciu",',
    to: '    dotaciaHeroLeftButton: "Overiť nárok na grant",'
  },
  {
    from: '    dotaciaModalTitleRodina: "Program Ambassador - Žiadosť o dotáciu",',
    to: '    dotaciaModalTitleRodina: "Program Ambassador - Žiadosť o grant",'
  },
  {
    from: '    dotaciaFormSubmit: "Odoslať žiadosť o pridelenie dotácie",',
    to: '    dotaciaFormSubmit: "Odoslať žiadosť o pridelenie grantu",'
  },
  {
    from: '    dotaciaFormTypeGrantOption1: "Program AMBASSADOR - Dotované bývanie pre rodiny",',
    to: '    dotaciaFormTypeGrantOption1: "Program AMBASSADOR - Grantové bývanie pre rodiny",'
  },
  {
    from: '    dotaciaProcessStep2Title: "Podpis dotačného dekrétu",',
    to: '    dotaciaProcessStep2Title: "Podpis grantového dekrétu",'
  },
  {
    from: '    dotaciaProcessStep2Desc: "Pri podpise zmluvy vám okamžite odpočítame schválenú dotáciu z ceny nehnuteľnosti (Zníženie istiny).",',
    to: '    dotaciaProcessStep2Desc: "Pri podpise zmluvy vám okamžite odpočítame schválený grant z ceny nehnuteľnosti (Zníženie istiny)."'
  },
  {
    from: '    dotaciaProcessBenefitRodinaNote: "Naša spolupráca nekončí pri odovzdaní kľúčov! My sa o vás postaráme aj potom. Skutočná pomoc nie je len dotácia – je to, že energie zaplatíme v plnej výške! Nemusíte sa báť vysokých účtov. To je pomoc, ktorá skutočne funguje.",',
    to: '    dotaciaProcessBenefitRodinaNote: "Naša spolupráca nekončí pri odovzdaní kľúčov! My sa o vás postaráme aj potom. Skutočná pomoc nie je len grant – je to, že energie zaplatíme v plnej výške! Nemusíte sa báť vysokých účtov. To je pomoc, ktorá skutočne funguje.",'
  },
  {
    from: '    dotaciaVisualizationTitle: "Grafické znázornenie dotácie",',
    to: '    dotaciaVisualizationTitle: "Grafické znázornenie grantu",'
  },
  {
    from: '    dotaciaGrant: "DOTÁCIA AMERICAN LIVING",',
    to: '    dotaciaGrant: "SÚKROMNÝ GRANT AMERICAN LIVING",'
  },
  {
    from: '    dotaciaBonusRealHelp: "Skutočná pomoc nie je len dotácia – je to, že energie zaplatíme v plnej výške! Nemusíte sa báť vysokých účtov. To je pomoc, ktorá skutočne funguje.",',
    to: '    dotaciaBonusRealHelp: "Skutočná pomoc nie je len grant – je to, že energie zaplatíme v plnej výške! Nemusíte sa báť vysokých účtov. To je pomoc, ktorá skutočne funguje.",'
  },
  {
    from: '    dotaciaProductsTitle: "Aktuálna dotačná ponuka",',
    to: '    dotaciaProductsTitle: "Aktuálna ponuka grantov",'
  },
  {
    from: '    dotaciaViewDetail: "Detail dotačnej ponuky",',
    to: '    dotaciaViewDetail: "Detail ponuky grantu",'
  },
  {
    from: '    dotaciaFooterSubtitle: "Súkromný dotačný fond na podporu bývania a podnikania",',
    to: '    dotaciaFooterSubtitle: "Súkromný grantový fond na podporu bývania a podnikania",'
  },
  {
    from: '    dotaciaLegalNotice: "Právne upozornenie: Dotácia je poskytovaná spoločnosťou American Living ako súkromný marketingový príspevok a investičný stimul. Nejde o štátnu pomoc ani verejný grant. Podmienky platné k dátumu podpisu dotačného dekrétu (kúpnej zmluvy). Dotačná schéma môže byť kedykoľvek upravená alebo ukončená bez predchádzajúceho upozornenia pri vyčerpaní alokovaných prostriedkov.",',
    to: '    dotaciaLegalNotice: "Právne upozornenie: Súkromný grant je poskytovaný spoločnosťou American Living ako súkromný marketingový príspevok a investičný stimul. Nejde o štátnu pomoc ani verejný grant. Podmienky platné k dátumu podpisu grantového dekrétu (kúpnej zmluvy). Grantová schéma môže byť kedykoľvek upravená alebo ukončená bez predchádzajúceho upozornenia pri vyčerpaní alokovaných prostriedkov.",'
  }
];

let replacedCount = 0;
for (const replacement of replacements) {
  if (content.includes(replacement.from)) {
    content = content.replace(replacement.from, replacement.to);
    console.log(`Replaced: ${replacement.from.trim().substring(0, 40)}...`);
    replacedCount++;
  } else {
    console.error(`NOT FOUND: ${replacement.from.trim().substring(0, 40)}...`);
  }
}

if (replacedCount === replacements.length) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('SUCCESS: All replacements applied successfully.');
} else {
  console.error(`FAILED: Only ${replacedCount}/${replacements.length} replacements found.`);
}
