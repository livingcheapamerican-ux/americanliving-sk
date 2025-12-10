import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || !user.super_admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítaj všetky Ticabhouse domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ vyrobca: 'Ticab house' });
    
    const results = [];
    
    for (const dom of domy) {
      // Preskočiť, ak už má všetky preklady
      if (dom.specifikacia_de && dom.specifikacia_fr && dom.specifikacia_sr && 
          dom.specifikacia_hr && dom.specifikacia_el && dom.specifikacia_en && 
          dom.specifikacia_hu && dom.specifikacia_pl && dom.specifikacia_uk) {
        results.push({ id: dom.id, nazov: dom.nazov, status: 'skipped', reason: 'Už má všetky preklady' });
        continue;
      }

      if (!dom.specifikacia) {
        results.push({ id: dom.id, nazov: dom.nazov, status: 'skipped', reason: 'Nemá slovenský text' });
        continue;
      }

      try {
        // Preložiť do všetkých jazykov pomocou LLM
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
          // Preskočiť, ak už má preklad
          if (dom[lang.field]) {
            continue;
          }

          const prompt = `Preloż ten dokument specyfikacji domu ze słowackiego na ${lang.name}.

WAŻNE ZASADY TŁUMACZENIA:
- Zachowaj dokładnie taką samą strukturę formatowania (nagłówki, znaki ✔, ✅, ❌)
- Zachowaj dokładnie takie same wartości liczbowe, wymiary i jednostki miary
- NIE dodawaj żadnych dodatkowych wyjaśnień ani komentarzy
- Tłumacz tylko tekst, zachowując wszystkie symbole i formatowanie

Tekst do tłumaczenia:
${dom.specifikacia}

Zwróć TYLKO przetłumaczony tekst, bez żadnych dodatkowych komentarzy.`;

          const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: prompt
          });

          updateData[lang.field] = response.trim();
        }

        // Aktualizovať dom s prekladmi
        if (Object.keys(updateData).length > 0) {
          await base44.asServiceRole.entities.Dom.update(dom.id, updateData);
          results.push({ 
            id: dom.id, 
            nazov: dom.nazov, 
            status: 'success', 
            translatedLanguages: Object.keys(updateData).length 
          });
        } else {
          results.push({ id: dom.id, nazov: dom.nazov, status: 'no_update', reason: 'Všetky preklady už existujú' });
        }

      } catch (error) {
        results.push({ 
          id: dom.id, 
          nazov: dom.nazov, 
          status: 'error', 
          error: error.message 
        });
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