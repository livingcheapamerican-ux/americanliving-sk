import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    console.log('📥 Downloading Excel from:', file_url);
    const excelResponse = await fetch(file_url);
    const arrayBuffer = await excelResponse.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('📊 Excel loaded, rows:', data.length);

    // === MAPOVACIA TABUĽKA (Excel Header -> DB Key) ===
    const COLUMN_MAPPING = {
      // Základ
      "Cena základnej konfigurácie": "zakladna_cena",

      // Izolácia
      "Steny 150mm": "izolacia_stien_150mm",
      "Steny 200mm": "izolacia_stien_200mm",
      "Steny 250mm": "izolacia_stien_250mm",

      // Vykurovanie
      "Príprava pre konvektory": "priprava_konvektory",
      "Tepelné čerpadlo": "tepelne_cerpadlo",
      "Bez rekuperácie": "rekuperacia_bez",
      "Príprava na rekuperáciu": "pripravaNaRekuperaciu",
      "Rekuperácia": "rekuperacia",
      "Podlahové kúrenie": "podlahove_kurenie",
      "Príprava na krb": "pripravaKrb",
      "Ochrana na kachle": "ochranaKachle",
      "Príprava na klimatizáciu": "klimatizacia",

      // Fasáda & Strecha
      "Drevo Smrek": "fasada_smrek",
      "Šúchaná omietka": "fasada_omietka",
      "Smrekovec": "fasada_smrekovec",
      "Thermowood": "fasada_thermowood",
      "Korugovaný plech": "fasada_korugovany",
      "Bez odkapov": "odkvapy_bez",
      "Odkvapy": "odkvapy",
      "Biele": "odkvapy_farba_biela",
      "Anthracit": "odkvapy_farba_antracit",
      "Hnede": "odkvapy_farba_hneda",

      // Okná a Dvere
      "Kovovo-plastové dvere": "dvere_kovovo_plastove",
      "Kovové dvere": "dvere_kovove",
      "Krídlové dvere": "interier_dvere_kridlove",
      "Posuvné dvere": "dvere_posuvne",
      "Štandard": "okna_standard",
      "Štandard +": "okna_standard_plus",
      "SK Štandard": "okna_sk_standard",

      // Interiér (Pozor na preklep "Sadrokatron"!)
      "Smrek": "interier_obklad_smrek",
      "Smrek bez uzlov": "obklad_smrek_bez_uzlov",
      "Sadrokatron + tapeta + malovka": "obklad_sadrokarton_tapeta",
      "OSB + laminátový panel": "obklad_osb_panel",
      "Laminát": "podlaha_laminat",
      "Strop - vzor dreva biely": "strop_drevo_biale",
      "Sadrokartón + tapeta, maľba": "strop_kupelna_sadrokarton",

      // Elektro
      "Bleskozvod": "bleskozvod",
      "Prepäťová ochrana": "prepat",
      "Príprava na solárne panely": "pripravaNaSolarnePanely",

      // Kúpeľňa
      "Sprcha": "kupelna_sprcha",
      "Sprcha Radaway": "sprchovyKut",
      "Sprcha Radaway s obkladom": "kupelna_sprcha_radaway_obklad",
      "Batéria štandard, Grohe": "bateria",
      "Vaňa": "vana",
      "Skrinka s umývadlom": "skrinka",
      "Zavesená toaleta Geberit": "wc_geberit",

      // Základy (Pozor na medzery!)
      "Bez  základov": "zaklady_bez",
      "Zemné vruty": "zaklady_vruty",
      "Betónová pätky": "zaklady_patky",
      "Pásové betónové": "zaklady_pasove",

      // Služby
      "Inžiniering": "inziniering",
      "Projekt + Certifikácia": "projektACertifikacia",
      "Revízna dokumentácia": "revizia",
      "Montáž domu a pripojenie k sieťam": "montaz",
      "Doprava": "doprava"
    };

    // === 1. IDENTIFIKUJ HLAVIČKY (Riadok 2, Index 1) ===
    const headerRow = data[1]; // Riadok 2
    if (!headerRow) {
      return Response.json({ 
        success: false, 
        error: 'Hlavičkový riadok (index 1) neexistuje v Exceli' 
      });
    }

    console.log('📋 Header row:', headerRow);

    // Nájdi index pre stĺpec "model"
    const modelColIndex = headerRow.findIndex(h => 
      h && h.toString().toLowerCase().trim() === 'model'
    );

    if (modelColIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Stĺpec "model" nenájdený v hlavičke' 
      });
    }

    console.log('✅ Model column found at index:', modelColIndex);

    // Vytvor mapu: Header -> Index (s podporou duplicít pre "Falcované panely")
    const columnIndexMap = {};
    const falcovanePanelyIndexes = [];

    headerRow.forEach((header, idx) => {
      if (!header) return;
      const headerStr = header.toString().trim();

      // Špeciálny handling pre "Falcované panely" (duplicita)
      if (headerStr === "Falcované panely") {
        falcovanePanelyIndexes.push(idx);
        return;
      }

      // Nájdi príslušný DB kľúč z mapovacej tabuľky
      const dbKey = COLUMN_MAPPING[headerStr];
      if (dbKey) {
        columnIndexMap[dbKey] = idx;
      }
    });

    // Aplikuj duplicity "Falcované panely"
    if (falcovanePanelyIndexes.length >= 2) {
      columnIndexMap["fasada_falcovane"] = falcovanePanelyIndexes[0]; // prvý výskyt
      columnIndexMap["strecha_falcovane"] = falcovanePanelyIndexes[1]; // druhý výskyt
      console.log(`✅ Falcované panely: fasada=${falcovanePanelyIndexes[0]}, strecha=${falcovanePanelyIndexes[1]}`);
    } else if (falcovanePanelyIndexes.length === 1) {
      // Ak je len jeden, mapuj na fasádu (safe fallback)
      columnIndexMap["fasada_falcovane"] = falcovanePanelyIndexes[0];
      console.log(`⚠️ Len jeden "Falcované panely" nájdený, mapujem na fasádu`);
    }

    console.log('📊 Column index map:', columnIndexMap);

    // === 2. NAČÍTAJ VŠETKY DOMY Z DB ===
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    console.log(`🏠 Loaded ${allDomy.length} houses from DB`);
    
    // 🔍 DEBUGGING - Vypíš názvy domov v DB
    console.log("DEBUG: Názvy v DB:", allDomy.map(d => d.nazov).join(", "));

    // Super-Fuzzy Normalizačná funkcia
    const normalize = (str) => {
      if (!str) return '';
      return str.toString()
        .toLowerCase()
        .replace(/model/gi, '') // Odstráň slovo "model"
        .replace(/\s+/g, '')     // Odstráň všetky medzery
        .trim();
    };

    // === 3. SPRACUJ KAŽDÝ RIADOK EXCELU (od indexu 2) ===
    const results = [];
    let foundCount = 0;
    let notFoundCount = 0;

    for (let rowIdx = 2; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row || row.length === 0) continue;

      const modelName = row[modelColIndex];
      if (!modelName) continue;

      const normalizedExcelName = normalize(modelName);
      console.log(`\n🔍 Processing row ${rowIdx}: "${modelName}" (normalized: "${normalizedExcelName}")`);

      // Super-Fuzzy match - nájdi dom v DB (includes obojstranne)
      const matchedDom = allDomy.find(dom => {
        const normalizedDbName = normalize(dom.nazov);
        return normalizedDbName.includes(normalizedExcelName) || normalizedExcelName.includes(normalizedDbName);
      });

      if (!matchedDom) {
        console.log(`❌ Dom "${modelName}" nenájdený v DB (hľadal som: "${normalizedExcelName}")`);
        results.push({
          domNazov: modelName,
          status: 'not_found',
          vyrobca: null,
          polozky: [
            {
              label: "🔍 Debug: Prečo nenájdený?",
              oldPrice: `Hľadal som: "${normalizedExcelName}"`,
              newPrice: `Nenašiel som zhodu v ${allDomy.length} domoch`,
              isChanged: false
            }
          ]
        });
        notFoundCount++;
        continue;
      }

      console.log(`✅ Matched: "${modelName}" -> DB: "${matchedDom.nazov}" (ID: ${matchedDom.id})`);
      foundCount++;

      // Zisti či je Ticab alebo Prosto
      const isTicab = matchedDom.vyrobca === 'Ticab house';
      const existingPrices = isTicab 
        ? (matchedDom.konfigurator_ceny || {})
        : (matchedDom.konfigurator_custom_ceny_prosto_house || {});

      console.log(`🏷️ ${matchedDom.vyrobca} - Existujúce ceny:`, Object.keys(existingPrices).length);

      // === 4. EXTRAHUJ CENY Z RIADKU ===
      const polozky = [];

      // Aplikuj logiku DPH pre každý kľúč
      const applyDPH = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const num = parseFloat(value);
        if (isNaN(num)) return null;
        if (num === 0) return 0; // V cene, neprip počítavaj DPH
        return Math.round(num * 1.23 * 100) / 100; // Pripočítaj 23% DPH
      };

      // Prejdi všetky mapované stĺpce
      for (const [dbKey, colIdx] of Object.entries(columnIndexMap)) {
        const cellValue = row[colIdx];
        const newPrice = applyDPH(cellValue);
        
        if (newPrice === null) continue; // Prázdna bunka, ignoruj

        const oldPrice = existingPrices[dbKey] || 0;
        const isChanged = newPrice !== oldPrice;

        // Vytvor label z Excel headeru (nájdi spätné mapovanie)
        const excelHeader = Object.keys(COLUMN_MAPPING).find(h => COLUMN_MAPPING[h] === dbKey);
        let label = excelHeader || dbKey;

        // Špeciálne labely pre duplicitné "Falcované panely"
        if (dbKey === "fasada_falcovane") label = "Falcované panely (Fasáda)";
        if (dbKey === "strecha_falcovane") label = "Falcované panely (Strecha)";

        polozky.push({
          key: dbKey,
          label: label,
          oldPrice: oldPrice,
          newPrice: newPrice,
          isChanged: isChanged
        });
      }

      // Pridaj základnú cenu (ak existuje)
      const zakladnaCenaIdx = columnIndexMap["zakladna_cena"];
      if (zakladnaCenaIdx !== undefined) {
        const zakladnaCena = applyDPH(row[zakladnaCenaIdx]);
        if (zakladnaCena !== null) {
          polozky.push({
            key: "__zakladna_cena",
            label: "Základná cena",
            oldPrice: matchedDom.zakladna_cena || 0,
            newPrice: zakladnaCena,
            isChanged: zakladnaCena !== matchedDom.zakladna_cena
          });
        }
      }

      const changesCount = polozky.filter(p => p.isChanged).length;
      console.log(`📊 Položky: ${polozky.length}, Zmeny: ${changesCount}`);

      results.push({
        domId: matchedDom.id,
        domNazov: matchedDom.nazov,
        vyrobca: matchedDom.vyrobca,
        status: 'ready',
        polozky: polozky,
        changesCount: changesCount
      });
    }

    console.log(`\n✅ SUMMARY: Found ${foundCount}, Not found ${notFoundCount}`);

    return Response.json({
      success: true,
      found: foundCount,
      not_found: notFoundCount,
      results: results
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});