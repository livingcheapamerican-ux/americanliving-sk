import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Autentifikácia
    let user;
    try {
      user = await base44.auth.me();
    } catch (error) {
      return Response.json({ error: 'Authentication failed', details: error.message }, { status: 401 });
    }
    
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ 
        error: 'Unauthorized', 
        user_role: user?.role,
        is_super_admin: user?.super_admin 
      }, { status: 403 });
    }

    // Načítaj všetky fotky
    const vsetkyDokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: "fotky"
    });

    // Filtruj len tie BEZ podrobna_analyza_datum
    const dokumenty = vsetkyDokumenty.filter(dok => !dok.podrobna_analyza_datum);

    if (!dokumenty || dokumenty.length === 0) {
      return Response.json({
        success: true,
        processed: 0,
        total: 0,
        message: 'Všetky dokumenty sú už analyzované',
        results: []
      });
    }

    // BATCH PROCESSING - analyzuj max 5 naraz
    const BATCH_SIZE = 5;
    const batch = dokumenty.slice(0, BATCH_SIZE);

    console.log(`Analyzing ${batch.length} documents (${dokumenty.length} remaining)`);

    const results = [];
    let processed = 0;

    for (const dok of batch) {
      try {
        console.log(`Processing ${processed + 1}/${batch.length}: ${dok.nazov}`);
        
        const analyza = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyzuj tento obrázok modulárneho domu:

Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model: ${dok.model_domu || 'neznámy'}

Poskytni:
1. TYP: exteriér/interiér/pôdorys
2. MATERIÁLY FASÁDY: všetky viditeľné (drevo, plech, omietka...)
3. OKNÁ: typ, farba
4. STRECHA: typ, farba
5. MODEL: ktorému modelu to patrí?`,
          file_urls: [dok.subor_url],
          response_json_schema: {
            type: "object",
            properties: {
              typ_obsahu: {
                type: "string",
                enum: ["exterier", "interier", "podorys", "kombinacia"]
              },
              specificka_kategoria: { type: "string" },
              fasada_materialy: {
                type: "array",
                items: { 
                  type: "object",
                  properties: {
                    material: { type: "string" },
                    farba: { type: "string" }
                  }
                }
              },
              okna: {
                type: "object",
                properties: {
                  typ: { type: "string" },
                  farba_ramu: { type: "string" }
                }
              },
              stresna_krytina: {
                type: "object",
                properties: {
                  typ: { type: "string" },
                  farba: { type: "string" }
                }
              },
              spravny_vyrobca: { type: "string" },
              spravny_model_domu: { type: "string" },
              odporucany_priecinok: { type: "string" }
            },
            required: ["typ_obsahu", "spravny_model_domu"]
          }
        });

        // Aktualizuj dokument
        await base44.asServiceRole.entities.Dokument.update(dok.id, {
          vizualna_analyza: analyza,
          analyzovaný: true,
          podrobna_analyza_datum: new Date().toISOString()
        });

        results.push({
          id: dok.id,
          nazov: dok.nazov,
          vyrobca: dok.vyrobca,
          novy_model: analyza.spravny_model_domu,
          typ: analyza.typ_obsahu,
          status: 'success'
        });

        processed++;
        console.log(`✓ Processed ${processed}/${batch.length}`);

      } catch (error) {
        console.error('Error:', dok.id, error.message);
        results.push({
          id: dok.id,
          nazov: dok.nazov,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      processed: processed,
      total: dokumenty.length,
      batch_size: BATCH_SIZE,
      remaining: dokumenty.length - processed,
      results: results,
      message: `Analyzovaných ${processed} z ${dokumenty.length}. Zostáva ${dokumenty.length - processed}.`
    });

  } catch (error) {
    console.error('Main error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});