import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítať všetky Prosto House domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ vyrobca: "Prosto House" });
    
    const results = [];
    
    for (const dom of domy) {
      if (!dom.popis) {
        results.push({ dom: dom.nazov, status: 'skipped', reason: 'Žiadny slovenský popis' });
        continue;
      }

      // Vygenerovať preklady pomocou LLM
      const translations = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Prelož nasledujúci popis domu do anglického, maďarského, poľského, ukrajinského, nemeckého, francúzskeho, srbského, chorvétskeho a gréckeho jazyka. Zachovaj formátovanie, odrážky a štruktúru textu.

Slovenský popis:
${dom.popis}

Vráť JSON objekt s prekladmi.`,
        response_json_schema: {
          type: "object",
          properties: {
            en: { type: "string" },
            hu: { type: "string" },
            pl: { type: "string" },
            uk: { type: "string" },
            de: { type: "string" },
            fr: { type: "string" },
            sr: { type: "string" },
            hr: { type: "string" },
            el: { type: "string" }
          },
          required: ["en", "hu", "pl", "uk", "de", "fr", "sr", "hr", "el"]
        }
      });

      // Ak existuje špecifikácia, prelož aj tú
      let specTranslations = null;
      if (dom.specifikacia) {
        specTranslations = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Prelož nasledujúcu technickú špecifikáciu domu do anglického, maďarského, poľského, ukrajinského, nemeckého, francúzskeho, srbského, chorvétskeho a gréckeho jazyka. Zachovaj formátovanie a štruktúru.

Slovenská špecifikácia:
${dom.specifikacia}

Vráť JSON objekt s prekladmi.`,
          response_json_schema: {
            type: "object",
            properties: {
              en: { type: "string" },
              hu: { type: "string" },
              pl: { type: "string" },
              uk: { type: "string" },
              de: { type: "string" },
              fr: { type: "string" },
              sr: { type: "string" },
              hr: { type: "string" },
              el: { type: "string" }
            },
            required: ["en", "hu", "pl", "uk", "de", "fr", "sr", "hr", "el"]
          }
        });
      }

      // Updatnúť dom s novými prekladmi
      const updateData = {
        popis_en: translations.en,
        popis_hu: translations.hu,
        popis_pl: translations.pl,
        popis_uk: translations.uk,
        popis_de: translations.de,
        popis_fr: translations.fr,
        popis_sr: translations.sr,
        popis_hr: translations.hr,
        popis_el: translations.el
      };

      if (specTranslations) {
        updateData.specifikacia_en = specTranslations.en;
        updateData.specifikacia_hu = specTranslations.hu;
        updateData.specifikacia_pl = specTranslations.pl;
        updateData.specifikacia_uk = specTranslations.uk;
        updateData.specifikacia_de = specTranslations.de;
        updateData.specifikacia_fr = specTranslations.fr;
        updateData.specifikacia_sr = specTranslations.sr;
        updateData.specifikacia_hr = specTranslations.hr;
        updateData.specifikacia_el = specTranslations.el;
      }

      await base44.asServiceRole.entities.Dom.update(dom.id, updateData);

      results.push({ 
        dom: dom.nazov, 
        status: 'success',
        translations: Object.keys(updateData).length
      });
    }

    return Response.json({ 
      success: true,
      processed: results.length,
      results 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});