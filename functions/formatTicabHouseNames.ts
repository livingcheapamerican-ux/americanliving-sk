import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Načítaj všetky Ticab house domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ vyrobca: 'Ticab house' });
    
    const updated = [];
    const skipped = [];
    
    for (const dom of domy) {
      const currentName = dom.nazov;
      const zastavana = dom.zastavana_plocha;
      
      // Vynechaj LONDON a HAPPY WIFE
      if (currentName.includes('LONDON') || currentName.includes('HAPPY WIFE')) {
        skipped.push({ nazov: currentName, reason: 'Excluded by user' });
        continue;
      }
      
      // Ak už má správny formát (VEĽKÉ PÍSMENÁ, XXm²), preskoč - OCHRANA PRED PREPISOVANÍM
      const alreadyFormatted = /^[A-Z\s]+,\s\d+m²$/.test(currentName);
      if (alreadyFormatted) {
        // Overíme aj či sa plocha zhoduje s databázou
        const expectedArea = Math.round(zastavana);
        const currentArea = parseInt(currentName.match(/(\d+)m²$/)?.[1] || '0');

        if (currentArea === expectedArea) {
          skipped.push({ nazov: currentName, reason: 'Already correctly formatted' });
          continue;
        } else {
          // Ak sa plocha nezhoduje, upozorníme ale NEPREPISUJEME automaticky
          skipped.push({ 
            nazov: currentName, 
            reason: `Area mismatch: DB has ${expectedArea}m² but name shows ${currentArea}m². Manual review required.` 
          });
          continue;
        }
      }
      
      if (!zastavana) {
        skipped.push({ nazov: currentName, reason: 'Missing zastavana_plocha' });
        continue;
      }
      
      // Odstráň "Model " prefix a čísla z názvu
      let cleanName = currentName
        .replace(/^Model\s+/i, '')
        .replace(/,?\s*\d+m²?\s*$/i, '')
        .trim();
      
      // Konvertuj na VEĽKÉ PÍSMENÁ
      cleanName = cleanName.toUpperCase();
      
      // Nový formát: NÁZOV, XXm²
      const newName = `${cleanName}, ${Math.round(zastavana)}m²`;
      
      // Aktualizuj len ak sa názov zmenil
      if (newName !== currentName) {
        await base44.asServiceRole.entities.Dom.update(dom.id, {
          nazov: newName
        });
        updated.push({
          old: currentName,
          new: newName,
          zastavana: Math.round(zastavana)
        });
      } else {
        skipped.push({ nazov: currentName, reason: 'No change needed' });
      }
    }
    
    return Response.json({
      success: true,
      updated: updated.length,
      skipped: skipped.length,
      details: { updated, skipped }
    });
    
  } catch (error) {
    console.error('Format error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});