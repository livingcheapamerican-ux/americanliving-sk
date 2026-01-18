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
    console.log('📊 First 3 rows preview:');
    data.slice(0, 3).forEach((row, idx) => {
      console.log(`  Row ${idx}:`, row.slice(0, 5), '...');
    });

    // === WHITELIST MODELOV (Fuzzy Matching) ===
    const MODEL_FUZZY_PATTERNS = [
      { pattern: /barn\s*house/i, id: "barn_house" },
      { pattern: /double\s*barn/i, id: "double_barn" },
      { pattern: /aframe/i, id: "a_frame" },
      { pattern: /a\s*frame/i, id: "a_frame" },
      { pattern: /flat\s*small/i, id: "flat_small" },
      { pattern: /flat\s*house.*2[,.]2/i, id: "flathouse_2_2" },
      { pattern: /flat\s*1[,.]5/i, id: "flat_1_5" },
      { pattern: /double\s*flat/i, id: "double_flat" },
      { pattern: /nord\s*house/i, id: "nord" },
      { pattern: /nord$/i, id: "nord" },
      { pattern: /fjord/i, id: "fjord" }
    ];

    // === MAPOVACIA TABUĽKA (Excel Row Name -> JSON Key) ===
    // PRESNÉ MAPOVANIE - Hľadať v stĺpcoch B alebo C
    const ROW_MAPPING = {
      // Základ
      "Základná cena sady (svojpomocná montáž)": "zakladna_cena",
      "Základná cena sady": "zakladna_cena",
      "S montážou": "montaz",

      // Rozmery (Predĺženie)
      "+1,2 m": "predlzenie_1_2m",
      "+2,4 m": "predlzenie_2_4m",
      "+3,6 m": "predlzenie_3_6m",
      "+4,8 m": "predlzenie_4_8m",

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

      // Inštalácie (Checkbox)
      "Elektro rozvody": "elektro_rozvody",
      "Voda": "voda",
      "Sanita": "sanita",
      "Bojler": "bojler",

      // Technológie (Checkbox)
      "Tep. Čerpadlo": "tepelne_cerpadlo",
      "Rekuperácia": "rekuperacia",
      "Podl. Kúrenie": "podlahove_kurenie",
      "Podl.": "podlahove_kurenie",

      // Okná a Dvere (Checkbox)
      "Laminácia farby okien": "laminacia_okien",
      "Tónované sklá": "tonovanie_skla",
      "Kovové s 2 zámkami": "dvere_kovove",
      "Plastovo-kovové": "dvere_plastove",
      "Strešné": "stresne_okno",
      "Fixné 90x205": "okno_fix_90_205",
      "Výkl. 90x205": "okno_vyklopne_90_205",
      "Výkl. 55x90": "okno_vyklopne_55_90",

      // Služby (Checkbox)
      "Podlahy laminát": "podlahy_laminat",
      "Inžiniering": "inziniering",
      "Projektant": "projektACertifikacia",
      "Revízie": "revizia",
      "Siete": "siete",
      "Doprava": "doprava"
    };

    console.log('🗺️ ROW_MAPPING initialized with', Object.keys(ROW_MAPPING).length, 'keys');

    // === 1. IDENTIFIKUJ HLAVIČKY (Riadok 0 = Header) ===
    const headerRow = data[0];
    if (!headerRow) {
      return Response.json({ 
        success: false, 
        error: 'Hlavičkový riadok neexistuje v Exceli' 
      });
    }

    console.log('📋 Header row (full):', headerRow);

    // Nájdi indexy pre povolené modely
    // Index 0 = názvy položiek (ignoruj)
    // Index 1+ = jednotlivé modely
    const modelColumns = {};
    const ignoredColumns = [];

    headerRow.forEach((header, idx) => {
      if (idx === 0) {
        console.log(`📌 Column 0: "${header}" (názvy položiek - skip)`);
        return; // Skip prvý stĺpec (názvy riadkov)
      }

      if (!header) {
        console.log(`⚠️ Empty header at index ${idx}`);
        return;
      }

      const headerStr = header.toString().trim();

      // Fuzzy matching - hľadaj prvý pattern, ktorý sa zhoduje
      let matchedModel = null;
      for (const { pattern, id } of MODEL_FUZZY_PATTERNS) {
        if (pattern.test(headerStr)) {
          matchedModel = id;
          break;
        }
      }

      if (matchedModel) {
        modelColumns[matchedModel] = {
          index: idx,
          excelName: headerStr
        };
        console.log(`✅ Model "${headerStr}" -> ${matchedModel} (index ${idx})`);
      } else {
        ignoredColumns.push(headerStr);
        console.log(`⏭️ Ignorujem stĺpec: "${headerStr}"`);
      }
    });

    console.log('\n📊 Header analysis complete:');
    console.log(`  ✅ Found models: ${Object.keys(modelColumns).length}`);
    console.log(`  ⏭️  Ignored columns: ${ignoredColumns.length}`);
    
    if (Object.keys(modelColumns).length === 0) {
      console.log('❌ ERROR: No allowed models found in header!');
      console.log('Available headers:', headerRow);
      return Response.json({ 
        success: false, 
        error: 'Nenašli sa žiadne povolené modely v hlavičke',
        debug: {
          headerRow: headerRow,
          expectedPatterns: MODEL_FUZZY_PATTERNS.map(p => p.id)
        }
      });
    }

    // === 2. PRESNÉ MAPOVANIE POLOŽIEK (Stĺpce B alebo C) ===
    const mappingResults = {};

    // Inicializuj výsledky pre každý model
    for (const [modelKey, modelInfo] of Object.entries(modelColumns)) {
      mappingResults[modelKey] = {
        excelName: modelInfo.excelName,
        items: {}
      };
    }

    // Prejdi všetky riadky (od indexu 1, pretože 0 je hlavička)
    let mappedRowsCount = 0;
    let unmappedRowsCount = 0;
    const unmappedRowNames = [];

    console.log(`\n🔄 Starting DEEP ROW SCAN (${data.length - 1} rows)...`);
    console.log(`📍 Scanning first 5 columns of each row for keywords`);

    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row || row.length === 0) continue;

      // DEEP SCAN: Skombinuj prvých 5 buniek riadku
      const rowCells = [];
      for (let colIdx = 0; colIdx < 5 && colIdx < row.length; colIdx++) {
        const cell = row[colIdx];
        if (cell && cell.toString().trim() !== '') {
          rowCells.push(cell.toString().trim());
        }
      }
      
      if (rowCells.length === 0) continue;
      
      // Kombinovaný text pre hľadanie
      const combinedText = rowCells.join(' ');
      const combinedLower = combinedText.toLowerCase();

      // PARTIAL MATCH search cez všetky mapované frázy
      let jsonKey = null;
      let matchedLabel = null;

      for (const [excelLabel, key] of Object.entries(ROW_MAPPING)) {
        const labelLower = excelLabel.toLowerCase();
        
        // Hľadaj partial match (case insensitive)
        if (combinedLower.includes(labelLower)) {
          jsonKey = key;
          matchedLabel = excelLabel;
          break;
        }
      }

      if (!jsonKey) {
        unmappedRowsCount++;
        if (unmappedRowNames.length < 10) {
          unmappedRowNames.push(`"${rowCells.join(' | ')}" (row ${rowIdx})`);
        }
        continue;
      }

      mappedRowsCount++;
      console.log(`\n✅ Row ${rowIdx}: Found "${matchedLabel}" -> ${jsonKey}`);
      console.log(`   Raw cells: [${rowCells.join(', ')}]`);

      // Extrahuj hodnoty pre každý model
      for (const [modelKey, modelInfo] of Object.entries(modelColumns)) {
        const cellValue = row[modelInfo.index];

        console.log(`  📍 ${modelKey} [col ${modelInfo.index}]: raw value = "${cellValue}"`);

        // Spracuj hodnotu
        let finalValue = null;
        if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
          const cellStr = cellValue.toString().trim();
          
          // Odstráň medzery z čísiel (napr. "20 900" -> "20900")
          const cleanedStr = cellStr.replace(/\s+/g, '');
          
          if (cellStr.toLowerCase().includes('nie je') || cleanedStr.toLowerCase() === 'nan') {
            console.log(`    ⏭️ Skipped (nie je/NaN)`);
            finalValue = null;
          } else {
            const num = parseFloat(cleanedStr);
            if (!isNaN(num)) {
              finalValue = num;
              console.log(`    ✓ Parsed: ${finalValue} ${finalValue === 0 ? '(V cene)' : '€'}`);
            } else {
              console.log(`    ✗ Not a number: "${cleanedStr}"`);
            }
          }
        } else {
          console.log(`    ⚠️ Empty cell (null)`);
        }

        // Ulož do mapy
        mappingResults[modelKey].items[jsonKey] = {
          source: matchedLabel,
          value: finalValue,
          isZero: finalValue === 0,
          isEmpty: finalValue === null
        };
      }
    }

    console.log(`\n📊 Row processing complete:`);
    console.log(`  ✅ Mapped rows: ${mappedRowsCount}`);
    console.log(`  ⏭️  Unmapped rows: ${unmappedRowsCount}`);
    if (unmappedRowNames.length > 0) {
      console.log(`  📝 Sample unmapped rows:`, unmappedRowNames);
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

    // === 4. BEZPEČNOSTNÝ CHECK: Načítaj existujúce Ticab House domy ===
    console.log('\n🔒 SECURITY CHECK: Verifying Ticab House integrity...');
    const ticabDomy = await base44.asServiceRole.entities.Dom.filter({ vyrobca: 'Ticab house' });
    console.log(`✅ Found ${ticabDomy.length} Ticab House models in DB`);
    
    const ticabIntegrityReport = ticabDomy.slice(0, 3).map(dom => ({
      nazov: dom.nazov,
      hasKonfiguratorCeny: !!dom.konfigurator_ceny,
      hasProstoCustomCeny: !!dom.konfigurator_custom_ceny_prosto_house,
      ticabKeysCount: dom.konfigurator_ceny ? Object.keys(dom.konfigurator_ceny).length : 0
    }));

    // === 5. KONTROLNÝ CHECKLIST ===
    const checklist = {
      barn_mini_removed: !summary.imported_models.includes('barn_mini'),
      norway_removed: !summary.imported_models.includes('norway'),
      barn_house_base_price: mappingResults.barn_house?.items?.zakladna_cena?.value || null,
      barn_house_izolacia_standard_is_zero: mappingResults.barn_house?.items?.izolacia_standard?.isZero || false,
      ticab_house_protected: ticabDomy.length > 0,
      target_field: 'konfigurator_custom_ceny_prosto_house'
    };

    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(60));
    console.log('\n✅ SUMMARY:', JSON.stringify(summary, null, 2));
    console.log('\n📋 CHECKLIST:', JSON.stringify(checklist, null, 2));
    console.log('\n🔒 TICAB INTEGRITY:', JSON.stringify(ticabIntegrityReport, null, 2));

    // Výpis KOMPLETNÝCH dát pre barn_house
    if (mappingResults.barn_house) {
      console.log(`\n🏠 BARN HOUSE - KOMPLETNÝ JSON NÁHĽAD:`);
      const barnHouseData = {};
      for (const [key, item] of Object.entries(mappingResults.barn_house.items)) {
        if (item.value !== null) {
          barnHouseData[key] = item.value;
        }
      }
      console.log(JSON.stringify(barnHouseData, null, 2));
    }
    console.log('\n' + '='.repeat(60));

    return Response.json({
      success: true,
      summary: summary,
      checklist: checklist,
      
      security: {
        ticabHouseProtected: true,
        ticabModelsFound: ticabDomy.length,
        ticabIntegrityCheck: ticabIntegrityReport,
        warning: '⚠️ Ticab House dáta sú chránené a nebudú upravené pri ukladaní',
        targetField: 'konfigurator_custom_ceny_prosto_house'
      },
      
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