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

    // === ABSOLÚTNE SÚRADNICE (MATRIX COORDINATES) ===
    
    // STĹPCE (X-OS) - Každý model má pevný index
    const MODEL_COLUMNS = {
      barn_house: 4,
      double_barn: 6,
      a_frame: 8,
      flat_small: 10,
      flathouse_2_2: 12,
      flat_1_5: 16,
      double_flat: 18,
      nord: 20,
      fjord: 22
    };

    // RIADKY (Y-OS) - Každá položka má pevný index
    const ITEM_ROWS = {
      // Základné ceny
      zakladna_cena: 2,
      montaz: 7,
      
      // Rozmery (Predĺženie)
      predlzenie_1_2m: 10,
      predlzenie_2_4m: 11,
      predlzenie_3_6m: 12,
      predlzenie_4_8m: 13,
      
      // Izolácia
      izolacia_standard: 15,
      izolacia_zvysena: 16,
      izolacia_premium: 17,
      izolacia_extra: 18,
      
      // Základy
      zaklady_bez: 20,
      zaklady_vruty: 21,
      zaklady_doska: 22,
      zaklady_pasove: 23,
      
      // Interiér
      interier_bez: 26,
      interier_drevo: 27,
      interier_sadrokarton: 28,
      
      // Technológie
      elektro_rozvody: 30,
      voda: 31,
      sanita: 32,
      bojler: 33,
      tepelne_cerpadlo: 35,
      rekuperacia: 36,
      siete: 37,
      podlahove_kurenie: 54,
      
      // Okná a Dvere
      laminacia_okien: 38,
      tonovanie_skla: 39,
      dvere_standard: 41,
      dvere_kovove: 42,
      dvere_plastove: 43,
      stresne_okno: 45,
      okno_fix_90_205: 46,
      okno_vyklopne_90_205: 47,
      okno_vyklopne_55_90: 48,
      
      // Fasáda a Služby
      fasada_standard: 51,
      fasada_omietka: 52,
      podlahy_laminat: 53,
      inziniering: 56,
      projektACertifikacia: 57,
      revizia: 58,
      doprava: 59
    };

    console.log('📐 Absolute coordinates initialized:');
    console.log(`   Models: ${Object.keys(MODEL_COLUMNS).length}`);
    console.log(`   Items: ${Object.keys(ITEM_ROWS).length}`);

    // === 1. SMART FORMAT DETECTION ===
    const rowCount = data.length;
    const detectedFormat = rowCount > 40 ? 'MATRIX' : 'LIST';
    
    console.log(`🔍 Format detection:`);
    console.log(`   Rows: ${rowCount}`);
    console.log(`   Detected: ${detectedFormat}`);
    console.log(`   Columns: ${data[0]?.length || 0}`);

    // === 2. EXTRACT DATA (FORMAT-SPECIFIC) ===
    const mappingResults = {};
    let processedCells = 0;
    
    // Funkcia na čítanie a konverziu bunky
    const readCell = (row, col) => {
      if (row >= data.length || !data[row] || col >= data[row].length) {
        return null;
      }
      
      const cellValue = data[row][col];
      
      if (cellValue === null || cellValue === undefined || cellValue === '') {
        return null;
      }
      
      const cellStr = cellValue.toString().trim();
      const cleanedStr = cellStr.replace(/\s+/g, '');
      
      if (cellStr.toLowerCase().includes('nie je') || cleanedStr.toLowerCase() === 'nan') {
        return null;
      }
      
      const num = parseFloat(cleanedStr);
      return isNaN(num) ? null : num;
    };

    if (detectedFormat === 'MATRIX') {
      // === SCENÁR A: MATICA (Absolútne súradnice) ===
      console.log(`\n🔄 MATRIX MODE: Reading using absolute coordinates...`);

      for (const [modelKey, colIdx] of Object.entries(MODEL_COLUMNS)) {
        console.log(`\n📦 ${modelKey} (col ${colIdx})...`);
        
        mappingResults[modelKey] = { excelName: modelKey, items: {} };
        
        for (const [itemKey, rowIdx] of Object.entries(ITEM_ROWS)) {
          const value = readCell(rowIdx, colIdx);
          const finalValue = (itemKey.startsWith('predlzenie_') && value === 0) ? null : value;
          
          mappingResults[modelKey].items[itemKey] = {
            source: `[${rowIdx},${colIdx}]`,
            value: finalValue,
            isZero: finalValue === 0,
            isEmpty: finalValue === null
          };
          
          if (finalValue !== null) processedCells++;
        }
      }
      
    } else {
      // === SCENÁR B: ZOZNAM (Vyhľadávanie textu) ===
      console.log(`\n🔄 LIST MODE: Searching for text patterns...`);

      // Mapa textov na položky
      const LIST_SEARCH_PATTERNS = {
        'komplekt pre montáž': 'zakladna_cena',
        'montážne práce': 'montaz',
        'základ': 'zaklady_vruty',
        'laminácia': 'laminacia_okien',
        'tónovanie': 'tonovanie_skla',
        'montáž priečok': 'interier_drevo',
        'základná elektro': 'elektro_rozvody',
        'montáž vodovodného': 'voda',
        'vnútorné podlahy': 'podlahy_laminat',
        'kovové vstupné': 'dvere_kovove',
        'strešné okno': 'stresne_okno'
      };

      // Nájdi header row (row 1 alebo 2)
      let headerRow = null;
      let headerRowIdx = -1;
      
      for (let i = 1; i <= 2 && i < data.length; i++) {
        const row = data[i];
        const combinedText = row.slice(1).join(' ').toLowerCase();
        if (combinedText.includes('barn') || combinedText.includes('flat')) {
          headerRow = row;
          headerRowIdx = i;
          break;
        }
      }

      if (!headerRow) {
        console.log('⚠️ LIST format: Header not found, using row 1');
        headerRow = data[1];
        headerRowIdx = 1;
      }

      console.log(`📋 Header detected at row ${headerRowIdx}`);

      // Mapuj modely z headeru
      const listModelColumns = {};
      headerRow.forEach((cell, idx) => {
        if (idx === 0 || !cell) return;
        const cellLower = cell.toString().toLowerCase();
        
        if (cellLower.includes('barn') && cellLower.includes('light')) listModelColumns['barn_house'] = idx;
        else if (cellLower.includes('double barn')) listModelColumns['double_barn'] = idx;
        else if (cellLower.includes('a frame')) listModelColumns['a_frame'] = idx;
        else if (cellLower.includes('flat small')) listModelColumns['flat_small'] = idx;
        else if (cellLower.includes('2,2') || cellLower.includes('2.2')) listModelColumns['flathouse_2_2'] = idx;
        else if (cellLower.includes('1,5') || cellLower.includes('1.5')) listModelColumns['flat_1_5'] = idx;
        else if (cellLower.includes('doubleflat')) listModelColumns['double_flat'] = idx;
        else if (cellLower.includes('nord')) listModelColumns['nord'] = idx;
        else if (cellLower.includes('fjord')) listModelColumns['fjord'] = idx;
      });

      console.log(`📦 Found ${Object.keys(listModelColumns).length} models in LIST format`);

      // Inicializuj results
      for (const modelKey of Object.keys(listModelColumns)) {
        mappingResults[modelKey] = { excelName: modelKey, items: {} };
      }

      // Hľadaj položky v stĺpci 1
      for (let rowIdx = headerRowIdx + 1; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx];
        if (!row || row.length === 0) continue;

        const rowText = (row[1] || '').toString().toLowerCase();
        
        // Matchuj pattern
        let foundKey = null;
        for (const [pattern, key] of Object.entries(LIST_SEARCH_PATTERNS)) {
          if (rowText.includes(pattern)) {
            foundKey = key;
            break;
          }
        }

        if (!foundKey) continue;

        console.log(`✅ Row ${rowIdx}: "${rowText}" -> ${foundKey}`);

        // Načítaj hodnoty pre modely
        for (const [modelKey, colIdx] of Object.entries(listModelColumns)) {
          const value = readCell(rowIdx, colIdx);
          
          mappingResults[modelKey].items[foundKey] = {
            source: `row ${rowIdx}`,
            value: value,
            isZero: value === 0,
            isEmpty: value === null
          };
          
          if (value !== null) processedCells++;
        }
      }
    }

    console.log(`\n📊 Extraction complete: ${processedCells} cells processed`);

    // === 3. VYTVOR DEBUG REPORT ===
    const summary = {
      detected_format: detectedFormat,
      imported_models: Object.keys(mappingResults),
      total_rows: rowCount,
      processed_cells: processedCells
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
      barn_house_zakladna_cena: mappingResults.barn_house?.items?.zakladna_cena?.value || null,
      barn_house_montaz: mappingResults.barn_house?.items?.montaz?.value || null,
      barn_house_fasada_omietka: mappingResults.barn_house?.items?.fasada_omietka?.value || null,
      expected_values: {
        zakladna_cena: 20900,
        montaz: 4875,
        fasada_omietka: 4321
      },
      ticab_house_protected: ticabDomy.length > 0,
      target_field: 'konfigurator_custom_ceny_prosto_house'
    };

    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(60));
    console.log('\n✅ SUMMARY:', JSON.stringify(summary, null, 2));
    console.log('\n📋 CHECKLIST:', JSON.stringify(checklist, null, 2));
    console.log('\n🔒 TICAB INTEGRITY:', JSON.stringify(ticabIntegrityReport, null, 2));

    // Výpis KOMPLETNÝCH dát pre barn_house a flat_small
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
    
    if (mappingResults.flat_small) {
      console.log(`\n🏠 FLAT SMALL - KOMPLETNÝ JSON NÁHĽAD (Check predĺženie = null):`);
      const flatSmallData = {};
      for (const [key, item] of Object.entries(mappingResults.flat_small.items)) {
        // Zobraz aj null hodnoty pre debug predĺžení
        flatSmallData[key] = item.value;
      }
      console.log(JSON.stringify(flatSmallData, null, 2));
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