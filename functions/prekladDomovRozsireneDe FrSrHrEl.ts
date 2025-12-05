import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = [];
    const log = (message) => {
      console.log(message);
      logs.push({ timestamp: new Date().toISOString(), message });
    };

    log('Začínam rozšírený preklad domov do DE, FR, SR, HR, EL...');

    // Načítať všetky domy
    const domy = await base44.asServiceRole.entities.Dom.list();
    log(`Načítaných ${domy.length} domov`);

    let prelozenychDomov = 0;
    let chyb = 0;

    for (const dom of domy) {
      try {
        log(`\n=== Spracovávam: ${dom.nazov} (${dom.vyrobca}) ===`);
        
        const updates = {};
        let needsUpdate = false;

        // Preklad popis do DE, FR, SR, HR, EL
        if (dom.popis && (!dom.popis_de || !dom.popis_fr || !dom.popis_sr || !dom.popis_hr || !dom.popis_el)) {
          log(`Prekladám popis...`);
          
          const languages = [
            { code: 'de', field: 'popis_de', name: 'nemčina' },
            { code: 'fr', field: 'popis_fr', name: 'francúzština' },
            { code: 'sr', field: 'popis_sr', name: 'srbčina' },
            { code: 'hr', field: 'popis_hr', name: 'chorvátčina' },
            { code: 'el', field: 'popis_el', name: 'gréčtina' }
          ];

          for (const lang of languages) {
            if (!dom[lang.field]) {
              try {
                const translated = await base44.asServiceRole.integrations.Core.InvokeLLM({
                  prompt: `Prelož nasledujúci text do jazyka ${lang.name}. Zachovaj technické termíny, formátovanie, značky ✔ a štruktúru textu. Neprekladaj značky produktov (Strotex, Izovat, OSB, PVC, atď). Prelož len samotný obsah:\n\n${dom.popis}`,
                  add_context_from_internet: false
                });
                updates[lang.field] = translated;
                log(`  ✓ ${lang.name}: OK`);
                needsUpdate = true;
              } catch (e) {
                log(`  ✗ ${lang.name}: Chyba - ${e.message}`);
              }
            } else {
              log(`  ⊙ ${lang.name}: Už existuje`);
            }
          }
        }

        // Preklad specifikácia do DE, FR, SR, HR, EL
        if (dom.specifikacia && (!dom.specifikacia_de || !dom.specifikacia_fr || !dom.specifikacia_sr || !dom.specifikacia_hr || !dom.specifikacia_el)) {
          log(`Prekladám špecifikáciu...`);
          
          const languages = [
            { code: 'de', field: 'specifikacia_de', name: 'nemčina' },
            { code: 'fr', field: 'specifikacia_fr', name: 'francúzština' },
            { code: 'sr', field: 'specifikacia_sr', name: 'srbčina' },
            { code: 'hr', field: 'specifikacia_hr', name: 'chorvátčina' },
            { code: 'el', field: 'specifikacia_el', name: 'gréčtina' }
          ];

          for (const lang of languages) {
            if (!dom[lang.field]) {
              try {
                const translated = await base44.asServiceRole.integrations.Core.InvokeLLM({
                  prompt: `Prelož nasledujúci text do jazyka ${lang.name}. Zachovaj technické termíny, formátovanie a štruktúru textu. Neprekladaj značky produktov a jednotky (m², kW, atď). Prelož len samotný obsah:\n\n${dom.specifikacia}`,
                  add_context_from_internet: false
                });
                updates[lang.field] = translated;
                log(`  ✓ ${lang.name}: OK`);
                needsUpdate = true;
              } catch (e) {
                log(`  ✗ ${lang.name}: Chyba - ${e.message}`);
              }
            } else {
              log(`  ⊙ ${lang.name}: Už existuje`);
            }
          }
        }

        // Ak sú nejaké updaty, ulož ich
        if (needsUpdate) {
          await base44.asServiceRole.entities.Dom.update(dom.id, updates);
          log(`✓ Dom "${dom.nazov}" aktualizovaný s novými prekladmi`);
          prelozenychDomov++;
        } else {
          log(`⊙ Dom "${dom.nazov}" už má všetky preklady`);
        }

      } catch (error) {
        log(`✗ CHYBA pri dome "${dom.nazov}": ${error.message}`);
        chyb++;
      }
    }

    log(`\n=== HOTOVO ===`);
    log(`Preložených domov: ${prelozenychDomov}`);
    log(`Chýb: ${chyb}`);

    return Response.json({
      success: true,
      prelozenychDomov,
      chyb,
      logs
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});