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

    const { file_url, dom_id } = await req.json();

    if (!file_url || !dom_id) {
      return Response.json({ 
        success: false, 
        error: 'Chýbajúce parametre: file_url a dom_id sú povinné' 
      }, { status: 400 });
    }

    console.log('Sťahujem Excel súbor z:', file_url);

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

    // Načítať dom z databázy
    const domy = await base44.asServiceRole.entities.Dom.filter({ id: dom_id });
    if (!domy || domy.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Dom s ID ' + dom_id + ' nebol nájdený' 
      }, { status: 404 });
    }

    const dom = domy[0];
    const vyrobca = dom.vyrobca;

    console.log('Dom:', dom.nazov, 'Výrobca:', vyrobca);

    // Určiť, ktoré pole použiť na základe výrobcu
    const isTicab = vyrobca === 'Ticab house';
    const isProsto = vyrobca === 'Prosto House';

    if (!isTicab && !isProsto) {
      return Response.json({ 
        success: false, 
        error: 'Tento výrobca nie je podporovaný. Podporovaní: Ticab house, Prosto House' 
      }, { status: 400 });
    }

    // Parsovanie dát z Excelu
    const updatedPrices = {};
    const errors = [];
    let skippedCount = 0;

    // Preskočiť prvý riadok ak obsahuje hlavičku
    const startRow = data[0] && (typeof data[0][0] === 'string' && data[0][0].toLowerCase().includes('nazov')) ? 1 : 0;

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 2) {
        skippedCount++;
        continue;
      }

      const polozkaKey = String(row[0]).trim();
      const cena = parseFloat(row[1]);

      if (!polozkaKey || isNaN(cena)) {
        errors.push(`Riadok ${i + 1}: Neplatný kľúč alebo cena`);
        skippedCount++;
        continue;
      }

      updatedPrices[polozkaKey] = cena;
    }

    console.log('Rozpoznaných položiek:', Object.keys(updatedPrices).length);

    // Aktualizovať ceny v databáze
    const existingPrices = isTicab 
      ? (dom.konfigurator_ceny || {})
      : (dom.konfigurator_custom_ceny_prosto_house || {});

    const newPrices = { ...existingPrices, ...updatedPrices };

    const updateData = isTicab
      ? { konfigurator_ceny: newPrices }
      : { konfigurator_custom_ceny_prosto_house: newPrices };

    await base44.asServiceRole.entities.Dom.update(dom_id, updateData);

    console.log('Ceny úspešne aktualizované v databáze');

    return Response.json({
      success: true,
      updated_count: Object.keys(updatedPrices).length,
      skipped_count: skippedCount,
      errors: errors,
      updated_prices: updatedPrices,
      dom_nazov: dom.nazov,
      vyrobca: vyrobca
    });

  } catch (error) {
    console.error('Chyba pri spracovaní:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});