import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ 
        success: false, 
        error: 'Chybajúci parameter: file_url je povinný' 
      }, { status: 400 });
    }

    // Načítať všetky domy z databázy
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    const domyMap = new Map();
    allDomy.forEach(dom => {
      const key = dom.nazov.trim().toLowerCase();
      domyMap.set(key, dom);
    });

    // Stiahnuť Excel súbor
    const fileResponse = await fetch(file_url);
    const arrayBuffer = await fileResponse.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

    if (data.length < 3) {
      return Response.json({ 
        success: false, 
        error: 'Excel súbor musí mať aspoň 3 riadky (hlavička v riadku 2, dáta od riadku 3)' 
      });
    }

    // Hlavičky sú v riadku 2 (index 1)
    const headers = data[1];

    // MAPOVACIA TABUĽKA - Excel názov stĺpca -> databázový kľúč
    const COLUMN_MAPPING = {
      // ZÁKLAD
      'Cena základnej konfigurácie': '__zakladna_cena__',
      'zastavana plocha m2': '__zastavana_plocha__',
      'uzitkova plocha m2': '__uzitkova_plocha__',
      
      // Izolácia
      'Steny 150mm': 'izolacia_stien_150mm',
      'Steny 200mm': 'izolacia_stien_200mm',
      'Steny 250mm': 'izolacia_stien_250mm',
      'Izolácia podlahy 200mm': 'izolacia_podlahy_200mm',
      'Izolácia stropu 200mm': 'izolacia_stropu_200mm',
      
      // Vykurovanie
      'Príprava pre konvektory': 'priprava_konvektory',
      'Tepelné čerpadlo': 'tepelne_cerpadlo',
      'Bez rekuperácie': 'rekuperacia_bez',
      'Príprava na rekuperáciu': 'pripravaNaRekuperaciu',
      'Rekuperácia': 'rekuperacia',
      'Podlahové kúrenie': 'podlahove_kurenie',
      'Príprava na krb': 'pripravaKrb',
      'Ochrana na kachle': 'ochranaKachle',
      'Príprava na klimatizáciu': 'klimatizacia',
      
      // Fasáda
      'Drevo Smrek': 'fasada_smrek',
      'Šúchaná omietka': 'fasada_omietka',
      'Smrekovec': 'fasada_smrekovec',
      'Thermowood': 'fasada_thermowood',
      'Korugovaný plech': 'fasada_korugovany',
      
      // Strecha
      'Bez odkapov': 'odkvapy_bez',
      'Odkvapy': 'odkvapy',
      'Biele': 'odkvapy_farba_biela',
      'Anthracit': 'odkvapy_farba_antracit',
      'Hnede': 'odkvapy_farba_hneda',
      
      // Okná a dvere
      'Kovovo-plastové dvere': 'dvere_kovovo_plastove',
      'Kovové dvere': 'dvere_kovove',
      'Krídlové dvere': 'interier_dvere_kridlove',
      'Posuvné dvere': 'dvere_posuvne',
      'Štandard': 'okna_standard',
      'Štandard +': 'okna_standard_plus',
      'SK Štandard': 'okna_sk_standard',
      
      // Interiér
      'Smrek': 'interier_obklad_smrek',
      'Smrek bez uzlov': 'obklad_smrek_bez_uzlov',
      'Sadrokatron + tapeta + malovka': 'obklad_sadrokarton_tapeta',
      'OSB + laminátový panel': 'obklad_osb_panel',
      'Laminát': 'podlaha_laminat',
      'Strop - vzor dreva biely': 'strop_drevo_biele',
      'Sadrokartón + tapeta, maľba': 'strop_kupelna_sadrokarton',
      
      // Elektro
      'Bleskozvod': 'bleskozvod',
      'Prepäťová ochrana': 'prepat',
      'Príprava na solárne panely': 'pripravaNaSolarnePanely',
      
      // Kúpeľňa
      'Sprcha': 'kupelna_sprcha',
      'Sprcha Radaway': 'sprchovyKut',
      'Sprcha Radaway s obkladom': 'kupelna_sprcha_radaway_obklad',
      'Batéria štandard, Grohe': 'bateria',
      'Vaňa': 'vana',
      'Skrinka s umývadlom': 'skrinka',
      'Zavesená toaleta Geberit': 'wc_geberit',
      
      // Základy
      'Bez  základov': 'zaklady_bez',
      'Zemné vruty': 'zaklady_vruty',
      'Betónová pätky': 'zaklady_patky',
      'Pásové betónové': 'zaklady_pasove',
      
      // Služby
      'Inžiniering': 'inziniering',
      'Projekt + Certifikácia': 'projektACertifikacia',
      'Revízna dokumentácia': 'revizia',
      'Montáž domu a pripojenie k sieťam': 'montaz',
      'Doprava': 'doprava'
    };

    // Nájsť indexy "Falcované panely"
    const falcovanePanelyIndexes = [];
    headers.forEach((header, index) => {
      if (header && header.toString().trim() === 'Falcované panely') {
        falcovanePanelyIndexes.push(index);
      }
    });

    // Nájsť indexy pre elektro varianty (ak existujú duplicity)
    const elektroMapping = new Map();
    let elektroStartIndex = -1;
    headers.forEach((header, index) => {
      if (header === 'SK Štandard' && index > 30) elektroStartIndex = index;
      if (header === 'Štandard +' && index > 30 && elektroStartIndex !== -1) {
        elektroMapping.set(elektroStartIndex, 'elektro_cz');
        elektroMapping.set(index, 'elektro_ge');
      }
    });

    // Spracovať každý riadok (od index 2 = riadok 3)
    const results = [];
    
    for (let rowIndex = 2; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      const domNazov = row[1]; // Stĺpec B
      
      if (!domNazov || domNazov.toString().trim() === '') {
        continue; // Preskočiť prázdne riadky
      }

      const domKey = domNazov.toString().trim().toLowerCase();
      const dom = domyMap.get(domKey);

      if (!dom) {
        results.push({
          dom: domNazov.toString().trim(),
          status: 'not_found',
          changes: 0,
          message: 'Dom sa nenašiel v databáze'
        });
        continue;
      }

      // Parsovať ceny pre tento dom
      const parsedPrices = {};
      const baseData = {};
      let changeCount = 0;

      headers.forEach((header, colIndex) => {
        if (!header || colIndex < 2) return;
        
        const headerStr = header.toString().trim();
        let dbKey = COLUMN_MAPPING[headerStr];
        
        // Špeciálne spracovanie "Falcované panely"
        if (headerStr === 'Falcované panely') {
          const currentIndex = falcovanePanelyIndexes.indexOf(colIndex);
          if (currentIndex === 0) {
            dbKey = 'fasada_falcovane';
          } else if (currentIndex === 1) {
            dbKey = 'strecha_falcovane';
          }
        }

        // Špeciálne spracovanie elektro (ak duplicity existujú)
        if (elektroMapping.has(colIndex)) {
          dbKey = elektroMapping.get(colIndex);
        }

        if (!dbKey) return;

        const cellValue = row[colIndex];
        
        // Prázdna bunka = preskočiť (ponechať pôvodnú cenu)
        if (cellValue === null || cellValue === undefined || cellValue === '') {
          return;
        }

        // Konverzia na číslo
        let price;
        if (typeof cellValue === 'number') {
          price = cellValue;
        } else {
          const strValue = cellValue.toString().replace(/[€\s]/g, '').replace(',', '.');
          price = parseFloat(strValue);
        }

        if (isNaN(price) || price < 0) {
          return;
        }

        // Uložiť hodnotu
        if (dbKey.startsWith('__')) {
          baseData[dbKey.replace(/__/g, '')] = price;
        } else {
          parsedPrices[dbKey] = price;
        }
        
        changeCount++;
      });

      results.push({
        dom: dom.nazov,
        dom_id: dom.id,
        vyrobca: dom.vyrobca,
        status: 'ready',
        changes: changeCount,
        parsed_prices: parsedPrices,
        base_data: baseData
      });
    }

    return Response.json({
      success: true,
      results: results,
      total_rows: results.length,
      found: results.filter(r => r.status === 'ready').length,
      not_found: results.filter(r => r.status === 'not_found').length
    });

  } catch (error) {
    console.error('Error in analyzeCennikFromExcel:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});