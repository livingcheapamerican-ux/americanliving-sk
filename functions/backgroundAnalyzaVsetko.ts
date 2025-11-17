import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    // Ak je akcia 'stop', nastav flag na zastavenie
    if (action === 'stop') {
      await base44.asServiceRole.entities.Dokument.update('background_analysis_control', {
        should_stop: true
      });
      return Response.json({ success: true, message: 'Analýza bude zastavená' });
    }

    // Načítaj všetky neanalyzované dokumenty
    const neanalyzovane = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky',
      podrobna_analyza_datum: { $exists: false }
    });

    if (neanalyzovane.length === 0) {
      // Spusti validáciu a reorganizáciu
      const validaciaResponse = await base44.asServiceRole.functions.invoke('validujDokumenty');
      const reorganizaciaResponse = await base44.asServiceRole.functions.invoke('reorganizujDokumenty');

      return Response.json({
        success: true,
        message: 'Všetky dokumenty analyzované, validácia a reorganizácia dokončené',
        total: 0,
        processed: 0,
        validacia: validaciaResponse.data,
        reorganizacia: reorganizaciaResponse.data
      });
    }

    const BATCH_SIZE = 3;
    let processed = 0;
    let failed = 0;
    let skipped = 0;

    // Spracuj v malých dávkach
    for (let i = 0; i < neanalyzovane.length; i += BATCH_SIZE) {
      const batch = neanalyzovane.slice(i, i + BATCH_SIZE);

      for (const dok of batch) {
        try {
          // Kontrola či sa má proces zastaviť
          const controlCheck = await base44.asServiceRole.entities.Dokument.filter({
            id: 'background_analysis_control'
          });
          
          if (controlCheck[0]?.should_stop) {
            return Response.json({
              success: true,
              message: 'Analýza zastavená používateľom',
              total: neanalyzovane.length,
              processed,
              failed,
              skipped,
              stopped: true
            });
          }

          // Analýza - popis
          const popis = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Analyzuj tento obrázok modulárneho domu a vytvor krátky popis (2-3 vety):

Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model: ${dok.model_domu || 'neznámy'}`,
            file_urls: [dok.subor_url]
          });

          // Analýza - štruktúrované dáta
          const strukturovaneData = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Analyzuj obrázok modulárneho domu a extrahuj detailné informácie:

ZÁKLADNÉ:
- typ_obsahu: "exterier", "interier", "podorys", "detail"
- specificka_kategoria: text

FASÁDA:
- fasada_materialy: pole textov
- fasada_typy_drevin: pole textov
- fasada_povrchove_upravy: pole textov
- fasada_prvky: pole textov
- fasada_farby: pole textov

OKNÁ/DVERE:
- okna_typ, okna_farba, dvere_typ, dvere_farba

STRECHA:
- strecha_typ, strecha_farba, strecha_material

KVALITA:
- stav_fasady: "výborný", "dobrý", "potrebuje údržbu"
- spravny_vyrobca, spravny_model`,
            file_urls: [dok.subor_url],
            response_json_schema: {
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

          // Ulož výsledky
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            podrobna_analyza_datum: new Date().toISOString(),
            ai_generovany_popis: popis,
            vizualna_analyza: strukturovaneData,
            analyzovaný: true
          });

          processed++;

        } catch (error) {
          const errorMsg = error.message || error.toString();
          
          if (errorMsg.includes('unsupported image') || errorMsg.includes('ImageURL')) {
            await base44.asServiceRole.entities.Dokument.update(dok.id, {
              podrobna_analyza_datum: new Date().toISOString(),
              ai_generovany_popis: 'Problémový obrázok - nepodporovaný formát'
            });
            skipped++;
          } else {
            await base44.asServiceRole.entities.Dokument.update(dok.id, {
              podrobna_analyza_datum: new Date().toISOString(),
              ai_generovany_popis: `Chyba analýzy: ${errorMsg}`
            });
            failed++;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`Checkpoint: ${processed} z ${neanalyzovane.length}`);
    }

    // Po dokončení analýzy spusti automaticky validáciu a reorganizáciu
    const validaciaResponse = await base44.asServiceRole.functions.invoke('validujDokumenty');
    const reorganizaciaResponse = await base44.asServiceRole.functions.invoke('reorganizujDokumenty');

    return Response.json({
      success: true,
      message: 'Analýza, validácia a reorganizácia dokončené',
      total: neanalyzovane.length,
      processed,
      failed,
      skipped,
      validacia: validaciaResponse.data,
      reorganizacia: reorganizaciaResponse.data
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});