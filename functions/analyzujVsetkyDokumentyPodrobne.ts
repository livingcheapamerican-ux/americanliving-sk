import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Skontroluj autentifikáciu
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

    console.log(`Starting analysis of ${dokumenty.length} documents`);

    // OPRAVA: Spusti analýzu na pozadí a vráť odpoveď okamžite
    const processDocuments = async () => {
      let processed = 0;
      
      for (const dok of dokumenty) {
        try {
          console.log(`Processing ${processed + 1}/${dokumenty.length}: ${dok.nazov}`);
          
          const analyza = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Analyzuj tento obrázok modulárneho domu MAXIMÁLNE PODROBNE:

Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model domu: ${dok.model_domu || 'neznámy'}

1. TYP OBSAHU: Je to exteriér, interiér alebo pôdorys?
2. MATERIÁLY FASÁDY: Deteguj všetky viditeľné materiály (drevo, plech, omietka, kameň...)
3. OKNÁ A DVERE: Typ, farba, veľkosť
4. STREŠNÁ KRYTINA: Typ a farba
5. STAV FASÁDY: Nová/stará/kvalita
6. PRIRAĎOVANIE: Ktorému modelu to patrí? Správny priečinok?`,
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
              }
            }
          });

          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            vizualna_analyza: analyza,
            analyzovaný: true,
            podrobna_analyza_datum: new Date().toISOString()
          });

          processed++;
          console.log(`✓ Processed ${processed}/${dokumenty.length}`);
          
          // Rate limit protection
          if (processed % 2 === 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (error) {
          console.error('Error processing document:', dok.id, error);
        }
      }
      
      console.log(`✅ Analysis complete: ${processed} processed`);
    };

    // Spusti na pozadí
    processDocuments().catch(err => console.error('Background processing error:', err));

    // Vráť odpoveď okamžite
    return Response.json({
      success: true,
      message: 'Analýza spustená na pozadí',
      total: dokumenty.length,
      status: 'processing'
    });

  } catch (error) {
    console.error('Main error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});