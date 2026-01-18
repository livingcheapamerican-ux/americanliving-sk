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

    // === WHITELIST MODELOV ===
    const ALLOWED_MODELS = {
      "Barn House": "barn_house",
      "Double Barn": "double_barn",
      "A frame": "a_frame",
      "Flat Small": "flat_small",
      "FlatHouse 2,2": "flathouse_2_2",
      "Flat 1,5": "flat_1_5",
      "DoubleFlat": "double_flat",
      "Nord": "nord",
      "Fjord": "fjord"
    };

    // === MAPOVACIA TABUĽKA (Excel Row Name -> JSON Key) ===
    const ROW_MAPPING = {
      // Základ
      "Základná cena sady": "zakladna_cena",
      "S montážou": "montaz",
      "Predĺženie 1,2m": "predlzenie_1_2m",
      "Predĺženie 2,4m": "predlzenie_2_4m",
      "Predĺženie 3,6m": "predlzenie_3_6m",
      "Predĺženie 4,8m": "predlzenie_4_8m",

      // Izolácia (Radio)
      "Celoročná izolácia": "izolacia_standard",
      "Zvýšená izolácia": "izolacia_zvysena",
      "Prémium izolácia": "izolacia_premium",
      "Extra izolácia": "izolacia_extra",

      // Základy (Radio)
      "Bez základov": "zaklady_bez",
      "Pilóty/Pätky": "zaklady_vruty",
      "Základová doska": "zaklady_doska",
      "Pásové základy": "zaklady_pasove",

      // Interiér (Radio)
      "Bez interiéru": "interier_bez",
      "Drevo": "interier_drevo",
      "Sadrokartón": "interier_sadrokarton",

      // Fasáda (Radio)
      "Štadardná": "fasada_standard",
      "Šúchaná fasáda": "fasada_omietka",

      // Technológie (Checkbox)
      "Elektro rozvody": "elektro_rozvody",
      "Voda": "voda",
      "Sanita": "sanita",
      "Bojler": "bojler",
      "Tep. Čerpadlo": "tepelne_cerpadlo",
      "Rekuperácia": "rekuperacia",
      "Podl. Kúrenie": "podlahove_kurenie",

      // Okná a Dvere
      "Laminácia farby okien": "laminacia_okien",
      "Tónované sklá": "tonovanie_skla",
      "Kovové s 2 zámkami": "dvere_kovove",
      "Plastovo-kovové": "dvere_plastove",
      "Strešné": "stresne_okno",
      "Fixné 90x205": "okno_fix_90_205",
      "Výkl. 90x205": "okno_vyklopne_90_205",
      "Výkl. 55x90": "okno_vyklopne_55_90",

      // Služby
      "Podlahy laminát": "podlahy_laminat",
      "Inžiniering": "inziniering",
      "Projektant": "projektACertifikacia",
      "Revízie": "revizia",
      "Siete": "siete",
      "Doprava": "doprava"
    };

    // === 1. IDENTIFIKUJ HLAVIČKY (Riadok 1) ===
    const headerRow = data[0];
    if (!headerRow) {
      return Response.json({ 
        success: false, 
        error: 'Hlavičkový riadok neexistuje v Exceli' 
      });
    }

    console.log('📋 Header row:', headerRow);

    // Nájdi indexy pre povolené modely
    const modelColumns = {};
    const ignoredColumns = [];

    headerRow.forEach((header, idx) => {
      if (!header || idx === 0) return; // Skip prvý stĺpec (názvy riadkov)
      const headerStr = header.toString().trim();
      
      if (ALLOWED_MODELS[headerStr]) {
        modelColumns[ALLOWED_MODELS[headerStr]] = {
          index: idx,
          excelName: headerStr
        };
        console.log(`✅ Model "${headerStr}" -> ${ALLOWED_MODELS[headerStr]} (index ${idx})`);
      } else {
        ignoredColumns.push(headerStr);
        console.log(`⏭️ Ignorujem stĺpec: "${headerStr}"`);
      }
    });

    if (Object.keys(modelColumns).length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Nenašli sa žiadne povolené modely v hlavičke' 
      });
    }

    // === 2. SPRACUJ RIADKY A VYTVOR MAPPING ===
    const mappingResults = {};

    // Inicializuj výsledky pre každý model
    for (const [modelKey, modelInfo] of Object.entries(modelColumns)) {
      mappingResults[modelKey] = {
        excelName: modelInfo.excelName,
        items: {}
      };
    }

    // Prejdi všetky riadky (od indexu 1, pretože 0 je hlavička)
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row || row.length === 0) continue;

      const rowName = row[0]; // Prvý stĺpec = názov položky
      if (!rowName) continue;

      const rowNameStr = rowName.toString().trim();
      const jsonKey = ROW_MAPPING[rowNameStr];

      if (!jsonKey) {
        console.log(`⏭️ Ignorujem riadok: "${rowNameStr}" (nemá mapovanie)`);
        continue;
      }

      // Extrahuj hodnoty pre každý model
      for (const [modelKey, modelInfo] of Object.entries(modelColumns)) {
        const cellValue = row[modelInfo.index];
        
        // Spracuj hodnotu
        let finalValue = null;
        if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
          const num = parseFloat(cellValue);
          if (!isNaN(num)) {
            finalValue = num; // Necháme číslo ako je (bez DPH, pretože už je v Exceli)
          }
        }

        // Ulož do mapy
        mappingResults[modelKey].items[jsonKey] = {
          source: rowNameStr,
          value: finalValue,
          isZero: finalValue === 0,
          isEmpty: finalValue === null
        };

        if (finalValue !== null) {
          console.log(`📝 ${modelKey}.${jsonKey} = ${finalValue} (from "${rowNameStr}")`);
        }
      }
    }

    // === 3. VYTVOR DEBUG REPORT ===
    const summary = {
      imported_models: Object.keys(modelColumns),
      ignored_columns: ignoredColumns,
      total_items_mapped: Object.keys(ROW_MAPPING).length
    };

    const details = {};
    for (const [modelKey, modelData] of Object.entries(mappingResults)) {
      details[modelKey] = {
        excel_name: modelData.excelName,
        mapped_items: Object.entries(modelData.items)
          .filter(([_, item]) => item.value !== null) // Zobraz len nenulové
          .reduce((acc, [key, item]) => {
            acc[key] = item;
            return acc;
          }, {})
      };
    }

    // === 4. KONTROLNÝ CHECKLIST ===
    const checklist = {
      barn_mini_removed: !summary.imported_models.includes('barn_mini'),
      norway_removed: !summary.imported_models.includes('norway'),
      barn_house_base_price: mappingResults.barn_house?.items?.zakladna_cena?.value || null,
      barn_house_izolacia_standard_is_zero: mappingResults.barn_house?.items?.izolacia_standard?.isZero || false
    };

    console.log('\n✅ SUMMARY:', summary);
    console.log('📋 CHECKLIST:', checklist);

    return Response.json({
      success: true,
      summary: summary,
      checklist: checklist,
      details: details,
      raw_mapping: mappingResults
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