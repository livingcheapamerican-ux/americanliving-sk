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
    const languages = [
      { code: 'de', name: 'Nemecký' },
      { code: 'fr', name: 'Francúzsky' },
      { code: 'sr', name: 'Srbský' },
      { code: 'hr', name: 'Chorvátsky' },
      { code: 'el', name: 'Grécky' }
    ];
    
    for (const dom of domy) {
      if (!dom.popis) {
        results.push({ dom: dom.nazov, status: 'skipped', reason: 'Žiadny slovenský popis' });
        continue;
      }

      try {
        // Vygenerovať preklady pre popis
        const descTranslations = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Preložte nasledujúci CELÝ popis domu do nemeckého, francúzskeho, srbského, chorvátskeho a gréckeho jazyka.

KRITICKÉ: Musíte preložiť CELÝ text bez skracovania alebo vynechania akejkoľvek časti. Zachovajte všetky odrážky, formátovanie, sekcie a celú štruktúru pôvodného textu.

Slovenský popis (KOMPLETNÝ):
${dom.popis}

Vráťte JSON objekt s úplnými prekladmi pre každý jazyk.`,
          response_json_schema: {
            type: "object",
            properties: {
              de: { type: "string", description: "Kompletný nemecký preklad" },
              fr: { type: "string", description: "Kompletný francúzsky preklad" },
              sr: { type: "string", description: "Kompletný srbský preklad" },
              hr: { type: "string", description: "Kompletný chorvátsky preklad" },
              el: { type: "string", description: "Kompletný grécky preklad" }
            },
            required: ["de", "fr", "sr", "hr", "el"]
          }
        });

        const updateData = {
          popis_de: descTranslations.de,
          popis_fr: descTranslations.fr,
          popis_sr: descTranslations.sr,
          popis_hr: descTranslations.hr,
          popis_el: descTranslations.el
        };

        // Ak existuje špecifikácia, prelož aj tú
        if (dom.specifikacia) {
          const specTranslations = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Preložte nasledujúcu CELÚ technickú špecifikáciu domu do nemeckého, francúzskeho, srbského, chorvátskeho a gréckeho jazyka.

KRITICKÉ: Musíte preložiť CELÝ text bez skracovania alebo vynechania akejkoľvek časti. Zachovajte všetky body, formátovanie a celú štruktúru.

Slovenská špecifikácia (KOMPLETNÁ):
${dom.specifikacia}

Vráťte JSON objekt s úplnými prekladmi pre každý jazyk.`,
            response_json_schema: {
              type: "object",
              properties: {
                de: { type: "string", description: "Kompletný nemecký preklad" },
                fr: { type: "string", description: "Kompletný francúzsky preklad" },
                sr: { type: "string", description: "Kompletný srbský preklad" },
                hr: { type: "string", description: "Kompletný chorvátsky preklad" },
                el: { type: "string", description: "Kompletný grécky preklad" }
              },
              required: ["de", "fr", "sr", "hr", "el"]
            }
          });

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
          prekladov: Object.keys(updateData).length,
          jazyky: languages.map(l => l.name).join(', ')
        });

      } catch (err) {
        results.push({ 
          dom: dom.nazov, 
          status: 'error',
          error: err.message
        });
      }

      // Malá pauza medzi požiadavkami
      await new Promise(resolve => setTimeout(resolve, 1000));
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