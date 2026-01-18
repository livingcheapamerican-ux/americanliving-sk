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

    // === DVE SADY SÚRADNÍC (SMALL FILE vs MATRIX) ===
    
    // SCENÁR A: SMALL FILE (Price.csv, < 40 riadkov)
    const SMALL_FILE_COLUMNS = {
      barn_house: 3,
      double_barn: 9,
      a_frame: 12,
      flat_small: 15,
      flathouse_2_2: 18,
      flat_1_5: 24,
      double_flat: 27,
      nord: 30,
      fjord: 33
    };

    const SMALL_FILE_ROWS = {
      zakladna_cena: 2,
      montaz: 3,
      zaklady_vruty: 4,
      laminacia_okien: 5,
      tonovanie_skla: 6,
      interier_drevo: 7,
      elektro_rozvody: 8,
      voda: 9,
      podlahy_laminat: 10,
      dvere_kovove: 11
    };

    // SCENÁR B: MATRIX (Sheet1.csv, >= 40 riadkov)
    const MATRIX_COLUMNS = {
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

    const MATRIX_ROWS = {
      zakladna_cena: 2,
      montaz: 7,
      predlzenie_1_2m: 10,
      predlzenie_2_4m: 11,
      predlzenie_3_6m: 12,
      predlzenie_4_8m: 13,
      izolacia_standard: 15,
      izolacia_zvysena: 16,
      izolacia_premium: 17,
      izolacia_extra: 18,
      zaklady_bez: 20,
      zaklady_vruty: 21,
      zaklady_doska: 22,
      zaklady_pasove: 23,
      interier_bez: 26,
      interier_drevo: 27,
      interier_sadrokarton: 28,
      elektro_rozvody: 30,
      voda: 31,
      sanita: 32,
      bojler: 33,
      tepelne_cerpadlo: 35,
      rekuperacia: 36,
      siete: 37,
      laminacia_okien: 38,
      tonovanie_skla: 39,
      dvere_standard: 41,
      dvere_kovove: 42,
      dvere_plastove: 43,
      stresne_okno: 45,
      okno_fix_90_205: 46,
      okno_vyklopne_90_205: 47,
      okno_vyklopne_55_90: 48,
      fasada_standard: 51,
      fasada_omietka: 52,
      podlahy_laminat: 53,
      podlahove_kurenie: 54,
      inziniering: 56,
      projektACertifikacia: 57,
      revizia: 58,
      doprava: 59
    };

    console.log('📐 Dual coordinate sets initialized:');
    console.log(`   SMALL_FILE: ${Object.keys(SMALL_FILE_COLUMNS).length} models, ${Object.keys(SMALL_FILE_ROWS).length} items`);
    console.log(`   MATRIX: ${Object.keys(MATRIX_COLUMNS).length} models, ${Object.keys(MATRIX_ROWS).length} items`);

    // === 1. AUTO-DETECT FILE SIZE ===
    const rowCount = data.length;
    const detectedMode = rowCount < 40 ? 'SMALL_FILE' : 'MATRIX';
    
    // Vyber správne súradnice
    const MODEL_COLUMNS = detectedMode === 'SMALL_FILE' ? SMALL_FILE_COLUMNS : MATRIX_COLUMNS;
    const ITEM_ROWS = detectedMode === 'SMALL_FILE' ? SMALL_FILE_ROWS : MATRIX_ROWS;
    
    console.log(`🔍 Auto-detection:`);
    console.log(`   Rows: ${rowCount}`);
    console.log(`   Mode: ${detectedMode}`);
    console.log(`   Columns: ${data[0]?.length || 0}`);
    console.log(`   Will use ${Object.keys(MODEL_COLUMNS).length} models, ${Object.keys(ITEM_ROWS).length} items`);

    // === 2. EXTRACT DATA USING SELECTED COORDINATES ===
    const mappingResults = {};
    let processedCells = 0;
    
    console.log(`\n🔄 ${detectedMode} MODE: Reading using absolute coordinates...`);

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

    // Iteruj cez každý model
    for (const [modelKey, colIdx] of Object.entries(MODEL_COLUMNS)) {
      console.log(`\n📦 ${modelKey} (col ${colIdx})...`);
      
      mappingResults[modelKey] = { excelName: modelKey, items: {} };
      
      // Iteruj cez každú položku
      for (const [itemKey, rowIdx] of Object.entries(ITEM_ROWS)) {
        const value = readCell(rowIdx, colIdx);
        
        // ŠPECIÁLNA LOGIKA: Predĺženie s cenou 0 -> null (len pre MATRIX)
        const finalValue = (detectedMode === 'MATRIX' && itemKey.startsWith('predlzenie_') && value === 0) ? null : value;
        
        mappingResults[modelKey].items[itemKey] = {
          source: `[${rowIdx},${colIdx}]`,
          value: finalValue,
          isZero: finalValue === 0,
          isEmpty: finalValue === null
        };
        
        if (finalValue !== null) processedCells++;
      }
    }

    console.log(`\n📊 Extraction complete: ${processedCells} cells processed`);

    // === 3. VYTVOR DEBUG REPORT ===
    const summary = {
      detected_mode: detectedMode,
      imported_models: Object.keys(mappingResults),
      total_rows: rowCount,
      processed_cells: processedCells,
      coordinate_set: detectedMode === 'SMALL_FILE' ? 'Price.csv layout' : 'Sheet1.csv layout'
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