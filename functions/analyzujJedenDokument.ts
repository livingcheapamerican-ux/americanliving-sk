import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { dokumentId } = await req.json();
    
    if (!dokumentId) {
      return Response.json({ error: 'Missing dokumentId' }, { status: 400 });
    }

    // Načítaj dokument
    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({ id: dokumentId });
    const dok = dokumenty[0];
    
    if (!dok) {
      return Response.json({ error: 'Dokument not found' }, { status: 404 });
    }

    console.log(`Analyzing: ${dok.data.nazov}`);

    // AI analýza
    const analyza = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Analyzuj tento obrázok modulárneho domu:

Súbor: ${dok.data.nazov}
Výrobca: ${dok.data.vyrobca || 'neznámy'}
Model: ${dok.data.model_domu || 'neznámy'}

Poskytni:
1. TYP: exteriér/interiér/pôdorys
2. MATERIÁLY FASÁDY: všetky viditeľné (drevo, plech, omietka...)
3. OKNÁ: typ, farba
4. STRECHA: typ, farba
5. MODEL: ktorému modelu to patrí?`,
      file_urls: [dok.data.subor_url],
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

    return Response.json({
      success: true,
      dokument: {
        id: dok.id,
        nazov: dok.data.nazov,
        analyza: analyza
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});