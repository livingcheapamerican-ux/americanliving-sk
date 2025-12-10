import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || !user.super_admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domy = await base44.asServiceRole.entities.Dom.filter({ vyrobca: 'Ticab house' });
    
    const results = [];
    
    for (const dom of domy) {
      if (!dom.specifikacia) {
        results.push({ id: dom.id, nazov: dom.nazov, status: 'skipped', reason: 'Nemá slovenský text' });
        continue;
      }

      try {
        const languages = [
          { code: 'en', field: 'specifikacia_en', name: 'English' },
          { code: 'de', field: 'specifikacia_de', name: 'German' },
          { code: 'hu', field: 'specifikacia_hu', name: 'Hungarian' },
          { code: 'pl', field: 'specifikacia_pl', name: 'Polish' },
          { code: 'uk', field: 'specifikacia_uk', name: 'Ukrainian' },
          { code: 'fr', field: 'specifikacia_fr', name: 'French' },
          { code: 'sr', field: 'specifikacia_sr', name: 'Serbian' },
          { code: 'hr', field: 'specifikacia_hr', name: 'Croatian' },
          { code: 'el', field: 'specifikacia_el', name: 'Greek' }
        ];

        const updateData = {};
        
        for (const lang of languages) {
          if (dom[lang.field]) continue;

          const prompt = `Translate this Slovak house specification document to ${lang.name}. Preserve exact formatting, symbols (✔, ✅, ❌), structure, and all numerical values.

Slovak text:
${dom.specifikacia}

Return ONLY the translated text, no explanations.`;

          const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: prompt
          });

          updateData[lang.field] = response.trim();
        }

        if (Object.keys(updateData).length > 0) {
          await base44.asServiceRole.entities.Dom.update(dom.id, updateData);
          results.push({ id: dom.id, nazov: dom.nazov, status: 'success', translated: Object.keys(updateData).length });
        } else {
          results.push({ id: dom.id, nazov: dom.nazov, status: 'skipped', reason: 'Už má všetky preklady' });
        }

      } catch (error) {
        results.push({ id: dom.id, nazov: dom.nazov, status: 'error', error: error.message });
      }
    }

    return Response.json({ 
      success: true, 
      total: domy.length,
      results: results,
      summary: {
        success: results.filter(r => r.status === 'success').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});