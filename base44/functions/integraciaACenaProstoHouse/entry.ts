import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // Načítať všetky Prosto House domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ 
      vyrobca: 'Prosto House' 
    });

    if (!domy || domy.length === 0) {
      return Response.json({ error: 'Žiadne Prosto House domy neboli nájdené' }, { status: 404 });
    }

    const report = {
      timestamp: new Date().toISOString(),
      total_houses: domy.length,
      houses_processed: [],
      kontrola1_nesrovnalosti: [],
      kontrola2_nesrovnalosti: [],
      kontrola3_nesrovnalosti: [],
      kontrola4_nesrovnalosti: [],
      summary: {
        total_errors: 0,
        total_warnings: 0,
        status: 'OK'
      }
    };

    // Mapovanie ID položiek konfiguratora na názvy z databázy
    const MAPOVANIE_POLOZIEK = {
      'montaz': 'montaz',
      'izolacia_standard': 'izolacia_standard',
      'izolacia_zvysena': 'izolacia_zvysena', 
      'izolacia_premium': 'izolacia_premium',
      'izolacia_extra': 'izolacia_extra',
      'zaklady_bez': 'zaklady_bez',
      'zaklady_vruty': 'zaklady_vruty',
      'zaklady_doska': 'zaklady_doska',
      'zaklady_pasove': 'zaklady_pasove',
      'interier_bez': 'interier_bez',
      'interier_drevo': 'interier_drevo',
      'interier_sadrokarton': 'interier_sadrokarton',
      'elektro_rozvody': 'elektro_rozvody',
      'voda': 'voda',
      'sanita': 'sanita',
      'bojler': 'bojler',
      'tepelne_cerpadlo': 'tepelne_cerpadlo',
      'rekuperacia': 'rekuperacia',
      'podlahove_kurenie': 'podlahove_kurenie',
      'laminacia_okien': 'laminacia_okien',
      'tonovanie_skla': 'tonovanie_skla',
      'dvere_standard': 'dvere_standard',
      'dvere_kovove': 'dvere_kovove',
      'dvere_plastove': 'dvere_plastove',
      'stresne_okno': 'stresne_okno',
      'okno_fix_90_205': 'okno_fix_90_205',
      'okno_vyklopne_90_205': 'okno_vyklopne_90_205',
      'okno_vyklopne_55_90': 'okno_vyklopne_55_90',
      'fasada_standard': 'fasada_standard',
      'fasada_omietka': 'fasada_omietka',
      'podlahy_laminat': 'podlahy_laminat',
      'inziniering': 'inziniering',
      'projektACertifikacia': 'projektACertifikacia',
      'revizia': 'revizia',
      'siete': 'siete',
      'doprava': 'doprava',
      'interierove_dvere': 'interierove_dvere',
      'pergola': 'pergola'
    };

    // Mapovanie názvov domov na kľúče súborov konfigurátorov
    const MAPOVANIE_DOMOV = {
      'Barn 48': { file: 'KonfiguratorBarn48', key: 'barn_house' },
      'Barn Double': { file: 'KonfiguratorBarnDouble', key: 'double_barn' },
      'A-Frame': { file: 'KonfiguratorAFrame', key: 'a_frame' },
      'Flat Small': { file: 'KonfiguratorFlatSmall', key: 'flat_small' },
      'Flat 72': { file: 'KonfiguratorFlat72', key: 'flathouse_2.7' },
      'Flat 2.2': { file: 'KonfiguratorFlat22', key: 'flathouse_2.2' },
      'Flat 1.5': { file: 'KonfiguratorFlat15', key: 'flat_1.5' },
      'Flat Double': { file: 'KonfiguratorFlatDouble', key: 'double_flat' },
      'Nord': { file: 'KonfiguratorNord', key: 'nord' },
      'Fjord': { file: 'KonfiguratorFjord', key: 'fjord' }
    };

    for (const dom of domy) {
      const houseName = dom.nazov.split(',')[0].trim();
      const houseMapping = MAPOVANIE_DOMOV[houseName];
      
      if (!houseMapping) {
        report.kontrola1_nesrovnalosti.push({
          dom: dom.nazov,
          error: `Nenájdené mapovanie pre dom: ${houseName}`
        });
        continue;
      }

      const ceny = dom.konfigurator_custom_ceny_prosto_house || {};
      
      const houseReport = {
        nazov: dom.nazov,
        id: dom.id,
        file: houseMapping.file,
        polozky_spracovane: 0,
        polozky_s_chybami: 0,
        ceny_z_db: ceny
      };

      // KONTROLA 1: Overenie, že všetky ceny z DB sú čísla
      for (const [key, value] of Object.entries(ceny)) {
        if (typeof value !== 'number') {
          report.kontrola1_nesrovnalosti.push({
            dom: dom.nazov,
            polozka: key,
            error: `Cena nie je číslo: ${value} (typ: ${typeof value})`
          });
          report.summary.total_errors++;
          houseReport.polozky_s_chybami++;
        }
        houseReport.polozky_spracovane++;
      }

      // KONTROLA 2: Overenie, že máme všetky požadované položky
      const required_items = Object.keys(MAPOVANIE_POLOZIEK);
      const missing_items = required_items.filter(item => !(item in ceny));
      
      if (missing_items.length > 0) {
        report.kontrola2_nesrovnalosti.push({
          dom: dom.nazov,
          chybajuce_polozky: missing_items,
          warning: `Chýbajú ${missing_items.length} položiek v databáze`
        });
        report.summary.total_warnings++;
      }

      // KONTROLA 3: Skontrolovať vzory cien pre jednotlivé kategórie
      const cenove_pary = {
        izolacia: ['izolacia_standard', 'izolacia_zvysena', 'izolacia_premium'],
        zaklady: ['zaklady_bez', 'zaklady_vruty', 'zaklady_doska', 'zaklady_pasove'],
        interier: ['interier_bez', 'interier_drevo', 'interier_sadrokarton'],
        dvere: ['dvere_standard', 'dvere_kovove', 'dvere_plastove'],
        fasada: ['fasada_standard', 'fasada_omietka']
      };

      for (const [kategoria, polozky] of Object.entries(cenove_pary)) {
        const ceny_kategorie = polozky.map(p => ceny[p]).filter(c => c !== undefined);
        
        // Kontrola, že vyššie úrovne majú vyššie ceny (alebo sú 0)
        for (let i = 1; i < ceny_kategorie.length; i++) {
          if (ceny_kategorie[i] !== 0 && ceny_kategorie[i] < ceny_kategorie[i-1] && ceny_kategorie[i-1] !== 0) {
            report.kontrola3_nesrovnalosti.push({
              dom: dom.nazov,
              kategoria: kategoria,
              polozky: polozky,
              ceny: ceny_kategorie,
              warning: `Nelogické ceny v kategórii ${kategoria}`
            });
            report.summary.total_warnings++;
          }
        }
      }

      // KONTROLA 4: Kontrola duplikátov cien (možné copy-paste chyby)
      const cenove_hodnoty = Object.values(ceny).filter(v => v > 0);
      const duplikaty = cenove_hodnoty.filter((v, i, arr) => 
        arr.indexOf(v) !== i && arr.lastIndexOf(v) !== i
      );
      
      if (duplikaty.length > 0) {
        const unique_duplikaty = [...new Set(duplikaty)];
        const duplikat_info = unique_duplikaty.map(dup => {
          const polozky_s_touto_cenou = Object.entries(ceny)
            .filter(([k, v]) => v === dup)
            .map(([k]) => k);
          return { cena: dup, polozky: polozky_s_touto_cenou };
        });
        
        report.kontrola4_nesrovnalosti.push({
          dom: dom.nazov,
          duplikaty: duplikat_info,
          warning: `Nájdených ${unique_duplikaty.length} duplicitných cien - možné copy-paste chyby`
        });
        report.summary.total_warnings++;
      }

      report.houses_processed.push(houseReport);
    }

    // Finálne zhrnutie
    if (report.summary.total_errors > 0 || report.summary.total_warnings > 0) {
      report.summary.status = 'WARNINGS_OR_ERRORS';
    }

    report.summary.kontrola1_errors = report.kontrola1_nesrovnalosti.length;
    report.summary.kontrola2_warnings = report.kontrola2_nesrovnalosti.length;
    report.summary.kontrola3_warnings = report.kontrola3_nesrovnalosti.length;
    report.summary.kontrola4_warnings = report.kontrola4_nesrovnalosti.length;

    // Generovanie súboru s aktualizovanými cenami pre každý dom
    const updatedConfigs = {};
    
    for (const dom of domy) {
      const houseName = dom.nazov.split(',')[0].trim();
      const houseMapping = MAPOVANIE_DOMOV[houseName];
      
      if (!houseMapping) continue;
      
      const ceny = dom.konfigurator_custom_ceny_prosto_house || {};
      updatedConfigs[houseMapping.file] = {
        dom: dom.nazov,
        ceny: ceny
      };
    }

    report.updated_configs = updatedConfigs;
    report.navod_na_implementaciu = {
      krok1: "Pre každý dom v 'updated_configs' nájdi príslušný súbor v 'components/'",
      krok2: "V súbore nájdi sekciu s definíciou CENY (alebo podobne)",
      krok3: "Nahraď hodnoty v CENY objektom s hodnotami z 'ceny'",
      krok4: "V názvoch dlazdíc (title prop) aktualizuj ceny podľa formátu '+X €' kde X je cena z 'ceny'",
      krok5: "Pre položky s cenou 0 používaj 'bez príplatku' namiesto '+0 €'",
      poznamka: "Ceny v názvoch dlazdíc MUSIA byť totožné s cenami v CENY objekte"
    };

    return Response.json(report, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});