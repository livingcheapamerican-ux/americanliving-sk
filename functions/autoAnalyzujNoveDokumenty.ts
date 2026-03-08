import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Auth check - môže byť volaný aj automaticky (bez user context)
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      // Ak nie je user, použijeme service role pre automatické spustenie
    }

    // Načítaj neanalyzované fotky (max 10 naraz pre automatické spustenie)
    const neanalyzovane = await base44.asServiceRole.entities.Dokument.filter({
      typ: "fotky",
      podrobna_analyza_datum: { $exists: false }
    }, '-created_date', 10);

    if (neanalyzovane.length === 0) {
      return Response.json({
        success: true,
        processed: 0,
        message: 'Žiadne nové dokumenty na analýzu'
      });
    }

    console.log(`Našiel som ${neanalyzovane.length} neanalyzovaných dokumentov`);

    const results = [];
    let processed = 0;
    let failed = 0;

    for (const dok of neanalyzovane) {
      try {
        console.log(`Analyzujem: ${dok.nazov}`);

        if (!dok.subor_url || !dok.subor_url.startsWith('http')) {
          throw new Error('Neplatná URL obrázka');
        }

        // 🔧 OPRAVA: Zlúčené 2 LLM volania do 1 (ušetrí 50% kreditov na analýzu dokumentov)
        const kombinovanyVysledok = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyzuj tento obrázok modulárneho domu.

Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model: ${dok.model_domu || 'neznámy'}

Vráť JSON s poľami:
- ai_popis: "2-3 vetový popis zahŕňajúci typ obsahu, materiály, farby a hlavné charakteristiky"
- typ_obsahu: jeden z "exterier", "interier", "podorys", "detail"
- specificka_kategoria: text
- fasada_materialy: pole textov
- fasada_typy_drevin: pole textov
- fasada_povrchove_upravy: pole textov
- fasada_prvky: pole textov
- fasada_farby: pole textov
- okna_typ: text
- okna_farba: text
- dvere_typ: text
- dvere_farba: text
- strecha_typ: text
- strecha_farba: text
- strecha_material: text
- stav_fasady: jeden z "výborný", "dobrý", "potrebuje údržbu"
- spravny_vyrobca: text
- spravny_model: text`,
          file_urls: [dok.subor_url],
          response_json_schema: {
            type: "object",
            properties: {
              ai_popis: { type: "string" },
              typ_obsahu: { type: "string" },
              specificka_kategoria: { type: "string" },
              fasada_materialy: { type: "array", items: { type: "string" } },
              fasada_typy_drevin: { type: "array", items: { type: "string" } },
              fasada_povrchove_upravy: { type: "array", items: { type: "string" } },
              fasada_prvky: { type: "array", items: { type: "string" } },
              fasada_farby: { type: "array", items: { type: "string" } },
              okna_typ: { type: "string" },
              okna_farba: { type: "string" },
              dvere_typ: { type: "string" },
              dvere_farba: { type: "string" },
              strecha_typ: { type: "string" },
              strecha_farba: { type: "string" },
              strecha_material: { type: "string" },
              stav_fasady: { type: "string" },
              spravny_vyrobca: { type: "string" },
              spravny_model: { type: "string" }
            }
          }
        });

        const popis = kombinovanyVysledok.ai_popis || '';
        const strukturovaneData = kombinovanyVysledok;

        // (zachovaný pôvodný kód pre kompatibilitu - len dummy pre response_json_schema nižšie)
        const _dummySchemaRef = {
            type: "object",
            properties: {
              typ_obsahu: { type: "string" },
              specificka_kategoria: { type: "string" },
              fasada_materialy: { type: "array", items: { type: "string" } },
              fasada_typy_drevin: { type: "array", items: { type: "string" } },
              fasada_povrchove_upravy: { type: "array", items: { type: "string" } },
              fasada_prvky: { type: "array", items: { type: "string" } },
              fasada_farby: { type: "array", items: { type: "string" } },
              okna_typ: { type: "string" },
              okna_farba: { type: "string" },
              dvere_typ: { type: "string" },
              dvere_farba: { type: "string" },
              strecha_typ: { type: "string" },
              strecha_farba: { type: "string" },
              strecha_material: { type: "string" },
              stav_fasady: { type: "string" },
              spravny_vyrobca: { type: "string" },
              spravny_model: { type: "string" }
            }
          }
        });

        // Vypočítaj novú cestu
        let typPriecinok = '';
        if (strukturovaneData.typ_obsahu === 'exterier') typPriecinok = '/exterier';
        else if (strukturovaneData.typ_obsahu === 'interier') typPriecinok = '/interier';
        else if (strukturovaneData.typ_obsahu === 'podorys') typPriecinok = '/podorysy';
        else if (strukturovaneData.typ_obsahu === 'detail') typPriecinok = '/detaily';

        const novaCesta = strukturovaneData.spravny_vyrobca && strukturovaneData.spravny_model
          ? `${strukturovaneData.spravny_vyrobca}/${strukturovaneData.spravny_model}${typPriecinok}`
          : dok.cesta_priecinku;

        // Aktualizuj dokument
        await base44.asServiceRole.entities.Dokument.update(dok.id, {
          ai_generovany_popis: popis,
          vizualna_analyza: strukturovaneData,
          analyzovaný: true,
          podrobna_analyza_datum: new Date().toISOString(),
          cesta_priecinku: novaCesta,
          vyrobca: strukturovaneData.spravny_vyrobca || dok.vyrobca,
          model_domu: strukturovaneData.spravny_model || dok.model_domu,
          podpriecinok: typPriecinok ? typPriecinok.substring(1) : dok.podpriecinok,
          reorganizovany: true,
          reorganizovany_datum: new Date().toISOString()
        });

        results.push({
          id: dok.id,
          nazov: dok.nazov,
          status: 'success',
          typ_obsahu: strukturovaneData.typ_obsahu,
          nova_cesta: novaCesta
        });

        processed++;
        console.log(`✅ Úspešne analyzovaný: ${dok.nazov}`);

      } catch (error) {
        const errorMsg = error.message || error.toString();
        
        // Pre problémové obrázky, označ ich ale nepočítaj ako chybu
        if (errorMsg.includes('unsupported image') || errorMsg.includes('ImageURL')) {
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            podrobna_analyza_datum: new Date().toISOString(),
            ai_generovany_popis: 'Problémový obrázok - nepodporovaný formát'
          });
          
          results.push({
            id: dok.id,
            nazov: dok.nazov,
            status: 'skipped',
            reason: 'Nepodporovaný formát obrázka'
          });
        } else {
          failed++;
          results.push({
            id: dok.id,
            nazov: dok.nazov,
            status: 'error',
            error: errorMsg
          });
          console.error(`❌ Chyba pri ${dok.nazov}:`, errorMsg);
        }
      }
    }

    return Response.json({
      success: true,
      total: neanalyzovane.length,
      processed,
      failed,
      results,
      message: `Automaticky analyzovaných ${processed} z ${neanalyzovane.length} nových dokumentov`
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});