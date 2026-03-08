import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Only flag on update events, not create (create events are handled by the main AEO automation)
    if (event.type !== 'update') {
      return Response.json({ success: true, message: 'Not an update event, skipping' });
    }

    // Skip if no old data available for comparison
    if (!old_data || !data) {
      return Response.json({ skipped: true, reason: 'Missing data for comparison' });
    }

    const domId = event.entity_id;

    // SMART CHANGE DETECTION: Check if content fields changed
    const contentFields = [
      'zakladna_cena',
      'popis', 'popis_en', 'popis_hu', 'popis_pl', 'popis_uk', 'popis_de', 'popis_fr', 'popis_sr', 'popis_hr', 'popis_el',
      'nazov',
      'konfigurator_ceny',
      'konfigurator_custom_ceny_prosto_house',
      'konfigurator_skryte_polozky',
      'prosto_skryte_polozky',
      'hlavny_obrazok',
      'zakladna_konfiguracia_obrazok',
      'galeria',
      'galerie',
      'podorys_2d',
      'podorys_3d',
      'specifikacia', 'specifikacia_en', 'specifikacia_hu', 'specifikacia_pl', 'specifikacia_uk', 'specifikacia_de', 'specifikacia_fr', 'specifikacia_sr', 'specifikacia_hr', 'specifikacia_el',
      'pocet_izieb',
      'zastavana_plocha',
      'uzitkova_plocha',
      'terasa_plocha'
    ];

    // Compare old vs new data
    let hasContentChange = false;
    for (const field of contentFields) {
      const oldValue = JSON.stringify(old_data[field]);
      const newValue = JSON.stringify(data[field]);
      if (oldValue !== newValue) {
        hasContentChange = true;
        console.log(`✓ Content field changed: ${field}`);
        break;
      }
    }

    // If only meta fields changed (aeo_update_pending, visit stats, etc.), skip
    if (!hasContentChange) {
      return Response.json({ 
        skipped: true, 
        reason: 'No content fields changed - only meta fields updated',
        entity_id: domId
      });
    }

    // Content changed - flag for AEO update ONLY if not already flagged (prevents loop)
    if (data.aeo_update_pending === true) {
      return Response.json({ skipped: true, reason: 'Already flagged for AEO update', entity_id: domId });
    }
    await base44.asServiceRole.entities.Dom.update(domId, {
      aeo_update_pending: true
    });

    console.log(`✓ Dom ${domId} flagged for AEO update (content changed)`);

    return Response.json({ 
      success: true, 
      flagged: domId,
      reason: 'Content fields changed'
    });
  } catch (error) {
    console.error('Error flagging Dom for AEO update:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});