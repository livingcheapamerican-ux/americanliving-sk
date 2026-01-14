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

    // NOVÝ FORMÁT: Matrica cien
    // Riadok 2 (index 1): názvy položiek konfiguratora (B2 až BO2)
    // Od riadka 3 (index 2): názvy domov v stĺpci B
    // Bunky: ceny pre konkrétny dom a položku
    
    const parsedPrices = {};
    const errors = [];
    let skippedCount = 0;
    
    if (!data || data.length < 3) {
      errors.push('Excel súbor musí mať aspoň 3 riadky (hlavička + názvy položiek + minimálne jeden dom)');
      return new Response(JSON.stringify({
        success: false,
        errors,
        parsed_prices: {},
        found_count: 0,
        skipped_count: 0
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Riadok 2 (index 1) - získať názvy položiek konfiguratora
    const headerRow = data[1]; // Riadok 2
    if (!headerRow || headerRow.length < 2) {
      errors.push('Riadok 2 musí obsahovať názvy položiek konfiguratora (B2 až BO2)');
      return new Response(JSON.stringify({
        success: false,
        errors,
        parsed_prices: {},
        found_count: 0,
        skipped_count: 0
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Extrahovať názvy položiek (od stĺpca B = index 1)
    const polozkyNazvy = [];
    for (let col = 1; col < headerRow.length; col++) {
      const nazov = headerRow[col] ? String(headerRow[col]).trim() : '';
      if (nazov) {
        polozkyNazvy.push({ index: col, nazov });
      }
    }

    console.log(`Načítaných ${polozkyNazvy.length} položiek z riadka 2:`, polozkyNazvy.map(p => p.nazov));

    if (polozkyNazvy.length === 0) {
      errors.push('V riadku 2 neboli nájdené žiadne názvy položiek');
      return new Response(JSON.stringify({
        success: false,
        errors,
        parsed_prices: {},
        found_count: 0,
        skipped_count: 0
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Hľadať riadok s názvom vybraného domu (od riadka 3 = index 2)
    let domRowIndex = -1;
    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      if (!row || !row[1]) continue; // Stĺpec B (index 1) obsahuje názov domu
      
      const domNazov = String(row[1]).trim();
      console.log(`Riadok ${i + 1}, stĺpec B: "${domNazov}"`);
      
      // Porovnať názov domu (môže byť čiastočná zhoda)
      if (domNazov && selectedDomNazov && 
          (domNazov.toLowerCase().includes(selectedDomNazov.toLowerCase()) || 
           selectedDomNazov.toLowerCase().includes(domNazov.toLowerCase()))) {
        domRowIndex = i;
        console.log(`✅ Našiel som dom "${domNazov}" na riadku ${i + 1}`);
        break;
      }
    }

    if (domRowIndex === -1) {
      errors.push(`Dom "${selectedDomNazov}" nebol nájdený v stĺpci B (od riadka 3)`);
      return new Response(JSON.stringify({
        success: false,
        errors,
        parsed_prices: {},
        found_count: 0,
        skipped_count: 0,
        available_domy: data.slice(2).map((row, idx) => `Riadok ${idx + 3}: ${row[1]}`).filter(x => x.includes(':'))
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Načítať ceny pre vybraný dom
    const domRow = data[domRowIndex];
    
    for (const polozka of polozkyNazvy) {
      const cenaValue = domRow[polozka.index];
      
      if (cenaValue === undefined || cenaValue === null || cenaValue === '') {
        skippedCount++;
        continue;
      }

      const cena = parseFloat(cenaValue);
      if (isNaN(cena)) {
        errors.push(`Položka "${polozka.nazov}": neplatná cena "${cenaValue}"`);
        skippedCount++;
        continue;
      }

      if (cena < 0) {
        errors.push(`Položka "${polozka.nazov}": záporná cena ${cena}`);
        skippedCount++;
        continue;
      }

      parsedPrices[polozka.nazov] = cena;
    }

    console.log('Rozpoznaných položiek:', Object.keys(parsedPrices).length);
    console.log('Preskočených buniek:', skippedCount);
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