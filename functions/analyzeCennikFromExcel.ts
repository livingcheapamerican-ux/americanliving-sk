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

    // Helper funkcia pre normalizáciu stringov
    const normalizeString = (str) => {
      if (!str) return '';
      return str
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
    };

    // Načítať všetky domy z databázy
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    console.log(`📊 Načítaných ${allDomy.length} domov z databázy`);
    
    const domyMap = new Map();
    allDomy.forEach(dom => {
      const key = normalizeString(dom.nazov);
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
    console.log('📋 Prvých 10 hlavičiek:', headers.slice(0, 10));

    // DYNAMICKY NÁJSŤ INDEX STĹPCA S NÁZVOM DOMU
    const INDEX_NAZOV = headers.findIndex(h => 
      h && (h.toString().trim().toLowerCase() === 'model' || 
            h.toString().trim().toLowerCase() === 'názov' ||
            h.toString().trim().toLowerCase() === 'nazov' ||
            h.toString().trim().toLowerCase() === 'dom')
    );
    
    if (INDEX_NAZOV === -1) {
      return Response.json({ 
        success: false, 
        error: 'Nenašiel sa stĺpec "model" v hlavičkách. Skontrolujte Excel súbor.' 
      });
    }
    
    console.log(`✅ Stĺpec 'model' nájdený na indexe: ${INDEX_NAZOV}`);

    // MAPOVACIA TABUĽKA - Excel názov stĺpca -> databázový kľúč a Label
    const COLUMN_MAPPING = {
      'Cena základnej konfigurácie': { key: '__zakladna_cena__', label: 'Základná cena' },
      'zastavana plocha m2': { key: '__zastavana_plocha__', label: 'Zastavaná plocha' },
      'uzitkova plocha m2': { key: '__uzitkova_plocha__', label: 'Úžitková plocha' },
      
      'Steny 150mm': { key: 'izolacia_stien_150mm', label: 'Izolácia stien 150mm' },
      'Steny 200mm': { key: 'izolacia_stien_200mm', label: 'Izolácia stien 200mm' },
      'Steny 250mm': { key: 'izolacia_stien_250mm', label: 'Izolácia stien 250mm' },
      'Izolácia podlahy 200mm': { key: 'izolacia_podlahy_200mm', label: 'Izolácia podlahy 200mm' },
      'Izolácia stropu 200mm': { key: 'izolacia_stropu_200mm', label: 'Izolácia stropu 200mm' },
      
      'Príprava pre konvektory': { key: 'priprava_konvektory', label: 'Príprava pre konvektory' },
      'Tepelné čerpadlo': { key: 'tepelne_cerpadlo', label: 'Tepelné čerpadlo' },
      'Bez rekuperácie': { key: 'rekuperacia_bez', label: 'Bez rekuperácie' },
      'Príprava na rekuperáciu': { key: 'pripravaNaRekuperaciu', label: 'Príprava na rekuperáciu' },
      'Rekuperácia': { key: 'rekuperacia', label: 'Rekuperácia' },
      'Podlahové kúrenie': { key: 'podlahove_kurenie', label: 'Podlahové kúrenie' },
      'Príprava na krb': { key: 'pripravaKrb', label: 'Príprava na krb' },
      'Ochrana na kachle': { key: 'ochranaKachle', label: 'Ochrana na kachle' },
      'Príprava na klimatizáciu': { key: 'klimatizacia', label: 'Príprava na klimatizáciu' },
      
      'Drevo Smrek': { key: 'fasada_smrek', label: 'Fasáda - Smrek' },
      'Šúchaná omietka': { key: 'fasada_omietka', label: 'Šúchaná omietka' },
      'Smrekovec': { key: 'fasada_smrekovec', label: 'Fasáda - Smrekovec' },
      'Thermowood': { key: 'fasada_thermowood', label: 'Fasáda - Thermowood' },
      'Korugovaný plech': { key: 'fasada_korugovany', label: 'Korugovaný plech' },
      
      'Bez odkapov': { key: 'odkvapy_bez', label: 'Bez odkapov' },
      'Odkvapy': { key: 'odkvapy', label: 'Odkvapy' },
      'Biele': { key: 'odkvapy_farba_biela', label: 'Odkvapy - Biele' },
      'Anthracit': { key: 'odkvapy_farba_antracit', label: 'Odkvapy - Anthracit' },
      'Hnede': { key: 'odkvapy_farba_hneda', label: 'Odkvapy - Hnedé' },
      
      'Kovovo-plastové dvere': { key: 'dvere_kovovo_plastove', label: 'Kovovo-plastové dvere' },
      'Kovové dvere': { key: 'dvere_kovove', label: 'Kovové dvere' },
      'Krídlové dvere': { key: 'interier_dvere_kridlove', label: 'Krídlové dvere' },
      'Posuvné dvere': { key: 'dvere_posuvne', label: 'Posuvné dvere' },
      'Štandard': { key: 'okna_standard', label: 'Okná - Štandard' },
      'Štandard +': { key: 'okna_standard_plus', label: 'Okná - Štandard+' },
      'SK Štandard': { key: 'okna_sk_standard', label: 'Okná - SK Štandard' },
      
      'Smrek': { key: 'interier_obklad_smrek', label: 'Interiér - Smrek' },
      'Smrek bez uzlov': { key: 'obklad_smrek_bez_uzlov', label: 'Smrek bez uzlov' },
      'Sadrokatron + tapeta + malovka': { key: 'obklad_sadrokarton_tapeta', label: 'Sadrokartón + tapeta' },
      'OSB + laminátový panel': { key: 'obklad_osb_panel', label: 'OSB + laminát' },
      'Laminát': { key: 'podlaha_laminat', label: 'Laminátová podlaha' },
      'Strop - vzor dreva biely': { key: 'strop_drevo_biele', label: 'Strop biely' },
      'Sadrokartón + tapeta, maľba': { key: 'strop_kupelna_sadrokarton', label: 'Strop kúpeľňa sadrokartón' },
      
      'Bleskozvod': { key: 'bleskozvod', label: 'Bleskozvod' },
      'Prepäťová ochrana': { key: 'prepat', label: 'Prepäťová ochrana' },
      'Príprava na solárne panely': { key: 'pripravaNaSolarnePanely', label: 'Príprava na solárne panely' },
      
      'Sprcha': { key: 'kupelna_sprcha', label: 'Sprcha' },
      'Sprcha Radaway': { key: 'sprchovyKut', label: 'Sprcha Radaway' },
      'Sprcha Radaway s obkladom': { key: 'kupelna_sprcha_radaway_obklad', label: 'Sprcha Radaway s obkladom' },
      'Batéria štandard, Grohe': { key: 'bateria', label: 'Batéria Grohe' },
      'Vaňa': { key: 'vana', label: 'Vaňa' },
      'Skrinka s umývadlom': { key: 'skrinka', label: 'Skrinka s umývadlom' },
      'Zavesená toaleta Geberit': { key: 'wc_geberit', label: 'WC Geberit' },
      
      'Bez  základov': { key: 'zaklady_bez', label: 'Bez základov' },
      'Zemné vruty': { key: 'zaklady_vruty', label: 'Zemné vruty' },
      'Betónová pätky': { key: 'zaklady_patky', label: 'Betónové pätky' },
      'Pásové betónové': { key: 'zaklady_pasove', label: 'Pásové základy' },
      
      'Inžiniering': { key: 'inziniering', label: 'Inžiniering' },
      'Projekt + Certifikácia': { key: 'projektACertifikacia', label: 'Projekt + Certifikácia' },
      'Revízna dokumentácia': { key: 'revizia', label: 'Revízna dokumentácia' },
      'Montáž domu a pripojenie k sieťam': { key: 'montaz', label: 'Montáž' },
      'Doprava': { key: 'doprava', label: 'Doprava' }
    };

    // DYNAMICKÉ MAPOVANIE stĺpcov
    const columnIndexMap = new Map(); // dbKey -> colIndex
    const falcovanePanelyIndexes = [];
    
    headers.forEach((header, index) => {
      if (!header) return;
      const headerStr = header.toString().trim();
      
      if (headerStr === 'Falcované panely') {
        falcovanePanelyIndexes.push(index);
      }
      
      const mapping = COLUMN_MAPPING[headerStr];
      if (mapping) {
        columnIndexMap.set(mapping.key, index);
      }
    });

    // Spracovať "Falcované panely"
    if (falcovanePanelyIndexes.length >= 2) {
      columnIndexMap.set('fasada_falcovane', falcovanePanelyIndexes[0]);
      columnIndexMap.set('strecha_falcovane', falcovanePanelyIndexes[1]);
    }

    console.log(`✅ Namapovaných ${columnIndexMap.size} stĺpcov`);

    // Spracovať každý riadok
    const results = [];
    
    for (let rowIndex = 2; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      const domNazov = row[INDEX_NAZOV];
      
      if (!domNazov || domNazov.toString().trim() === '') {
        continue;
      }

      const originalNazov = domNazov.toString().trim();
      const domKey = normalizeString(domNazov);
      const dom = domyMap.get(domKey);

      if (!dom) {
        results.push({
          domId: null,
          domNazov: originalNazov,
          vyrobca: null,
          status: 'not_found',
          polozky: []
        });
        continue;
      }

      // Získať aktuálne ceny z DB
      const isTicab = dom.vyrobca === 'Ticab house';
      const currentPrices = isTicab 
        ? (dom.konfigurator_ceny || {})
        : (dom.konfigurator_custom_ceny_prosto_house || {});

      // Porovnať ceny
      const polozky = [];
      
      for (const [excelHeader, mapping] of Object.entries(COLUMN_MAPPING)) {
        const dbKey = mapping.key;
        const colIndex = columnIndexMap.get(dbKey);
        
        if (colIndex === undefined) continue;
        
        const cellValue = row[colIndex];
        
        // Prázdna bunka = ignorovať
        if (cellValue === null || cellValue === undefined || cellValue === '') {
          continue;
        }

        // Konverzia na číslo
        let newPrice;
        if (typeof cellValue === 'number') {
          newPrice = cellValue;
        } else {
          const strValue = cellValue.toString().replace(/[€\s]/g, '').replace(',', '.');
          newPrice = parseFloat(strValue);
        }

        if (isNaN(newPrice) || newPrice < 0) {
          continue;
        }

        // Získať starú cenu
        const oldPrice = dbKey.startsWith('__') 
          ? (dom[dbKey.replace(/__/g, '')] || 0)
          : (currentPrices[dbKey] || 0);

        const isChanged = Math.abs(oldPrice - newPrice) > 0.01;

        polozky.push({
          key: dbKey,
          label: mapping.label,
          oldPrice: oldPrice,
          newPrice: newPrice,
          isChanged: isChanged
        });
      }

      results.push({
        domId: dom.id,
        domNazov: dom.nazov,
        vyrobca: dom.vyrobca,
        status: 'ready',
        changesCount: polozky.filter(p => p.isChanged).length,
        polozky: polozky
      });
    }

    return Response.json({
      success: true,
      results: results,
      total: results.length,
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