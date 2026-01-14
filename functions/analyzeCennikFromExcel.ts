import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as XLSX from 'npm:xlsx@0.18.5';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Overiť, či je používateľ admin
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'Prístup zamietnutý. Táto funkcia je len pre administrátorov.' 
      }, { status: 403 });
    }

    const { file_url, vyrobca } = await req.json();

    if (!file_url || !vyrobca) {
      return Response.json({ 
        success: false, 
        error: 'Chýbajúce parametre: file_url a vyrobca sú povinné' 
      }, { status: 400 });
    }

    console.log('Analyzujem Excel súbor z:', file_url, 'pre výrobcu:', vyrobca);

    // Stiahnuť Excel súbor
    const fileResponse = await fetch(file_url);
    if (!fileResponse.ok) {
      throw new Error('Nepodarilo sa stiahnuť Excel súbor');
    }
    
    const arrayBuffer = await fileResponse.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Predpokladáme, že dáta sú v prvom sheet-e
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    console.log('Načítané riadky z Excelu:', data.length);

    // Parsovanie dát z Excelu (len analýza, neukladá)
    const parsedPrices = {};
    const errors = [];
    let skippedCount = 0;

    // Preskočiť prvý riadok ak obsahuje hlavičku
    const startRow = data[0] && (typeof data[0][0] === 'string' && data[0][0].toLowerCase().includes('nazov')) ? 1 : 0;

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      
      // Preskočiť prázdne riadky
      if (!row || row.length < 2 || (!row[0] && !row[1])) {
        skippedCount++;
        continue;
      }

      const polozkaKey = row[0] ? String(row[0]).trim() : '';
      const cenaValue = row[1];
      
      // Detailná validácia
      if (!polozkaKey) {
        errors.push(`Riadok ${i + 1}: Chýba názov položky (stĺpec A je prázdny)`);
        skippedCount++;
        continue;
      }

      const cena = parseFloat(cenaValue);
      if (isNaN(cena)) {
        errors.push(`Riadok ${i + 1}: Neplatná cena pre "${polozkaKey}" (hodnota: "${cenaValue}")`);
        skippedCount++;
        continue;
      }

      if (cena < 0) {
        errors.push(`Riadok ${i + 1}: Záporná cena pre "${polozkaKey}" (${cena})`);
        skippedCount++;
        continue;
      }

      parsedPrices[polozkaKey] = cena;
    }

    console.log('Rozpoznaných položiek:', Object.keys(parsedPrices).length);
    console.log('Preskočených riadkov:', skippedCount);
    console.log('Chýb:', errors.length);

    return Response.json({
      success: true,
      found_count: Object.keys(parsedPrices).length,
      skipped_count: skippedCount,
      errors: errors,
      parsed_prices: parsedPrices,
      vyrobca: vyrobca
    });

  } catch (error) {
    console.error('Chyba pri analýze:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});