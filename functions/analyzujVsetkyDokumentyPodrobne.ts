import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: "fotky"
    });

    const results = [];
    let processed = 0;

    for (const dok of dokumenty) {
      try {
        // Detailná AI vizuálna analýza pre každý obrázok
        const analyza = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyzuj tento obrázok modulárneho domu:

Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model domu: ${dok.model_domu || 'neznámy'}
Cesta: ${dok.cesta_priecinku || 'neurčená'}

ÚLOHA: Poskytni PRESNÉ a DETAILNÉ informácie:

1. TYP OBSAHU (povinné):
   - Je to exteriér, interiér alebo pôdorys?
   - Ak je to viacero pohľadov, špecifikuj všetky

2. MATERIÁLY FASÁDY (ak je exteriér):
   - Antracitový plech (drážkový)
   - Drevený obklad (typ dreva)
   - Biely plech
   - Kamenný obklad
   - Sadrokartón
   - Suchá fasáda
   - Kombinovaná fasáda
   - Omietnutá fasáda
   - Farba materiálov
   - Povrchová úprava

3. PÔDORYS (ak je to pôdorys):
   - Detailné rozmery každej miestnosti s rozmermi
   - Celková plocha
   - Počet izieb
   - Rozloženie priestoru
   - Umiestnenie dverí a okien
   - Označenie miestností

4. INTERIÉR (ak je interiér):
   - Aká miestnosť je zobrazená
   - Materiály podláh (vinyl, drevo, dlaždice)
   - Materiály stien (sadrokartón, obklad, drevo)
   - Zariadenie a nábytek
   - Farby a štýl
   - Osvetlenie

5. PRIRAĎOVANIE K DOMU:
   - Ktorému modelu domu PRESNE patrí táto fotka?
   - Je názov priečinka správny?
   - Mal by byť tento súbor presunutý do iného priečinka?
   - Je to správny výrobca?

6. TECHNICKÉ DETAILY:
   - Rozmery viditeľné na obrázku
   - Konštrukčné prvky
   - Špeciálne vlastnosti
   - Okná a dvere
   - Strecha

Buď MAXIMÁLNE KONKRÉTNÝ a PODROBNÝ. Nepíš všeobecnosti.`,
          file_urls: [dok.subor_url],
          response_json_schema: {
            type: "object",
            properties: {
              typ_obsahu: {
                type: "string",
                enum: ["exterier", "interier", "podorys", "kombinacia"]
              },
              podrobny_typ: {
                type: "string",
                description: "Detailný popis čo presne obrázok zobrazuje"
              },
              fasada_materialy: {
                type: "array",
                items: { type: "string" },
                description: "Všetky materiály viditeľné na fasáde"
              },
              fasada_farby: {
                type: "array",
                items: { type: "string" }
              },
              fasada_povrchova_uprava: {
                type: "string"
              },
              interier_miestnost: {
                type: "string"
              },
              interier_materialy: {
                type: "object",
                properties: {
                  podlaha: { type: "string" },
                  steny: { type: "string" },
                  nabytok: { type: "string" }
                }
              },
              podorys_info: {
                type: "object",
                properties: {
                  je_podorys: { type: "boolean" },
                  miestnosti: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        nazov: { type: "string" },
                        plocha: { type: "string" },
                        rozmery: { type: "string" }
                      }
                    }
                  },
                  celkova_plocha: { type: "string" }
                }
              },
              spravny_vyrobca: {
                type: "string"
              },
              spravny_model_domu: {
                type: "string",
                description: "PRESNÝ názov modelu ktorému fotka patrí"
              },
              odporucany_priecinok: {
                type: "string",
                description: "Kam by mal byť súbor umiestnený"
              },
              technicke_detaily: {
                type: "array",
                items: { type: "string" },
                description: "Všetky viditeľné technické detaily"
              },
              okna_dvere: {
                type: "string"
              },
              strecha: {
                type: "string"
              },
              kvalita_analyzy: {
                type: "string",
                enum: ["vysoka", "stredna", "nizka"]
              }
            },
            required: ["typ_obsahu", "spravny_model_domu", "odporucany_priecinok"]
          }
        });

        // Aktualizuj dokument s podrobnou analýzou
        await base44.asServiceRole.entities.Dokument.update(dok.id, {
          vizualna_analyza: analyza,
          analyzovaný: true,
          podrobna_analyza_datum: new Date().toISOString()
        });

        results.push({
          id: dok.id,
          nazov: dok.nazov,
          vyrobca: dok.vyrobca,
          povodny_model: dok.model_domu,
          novy_model: analyza.spravny_model_domu,
          typ: analyza.typ_obsahu,
          status: 'success'
        });

        processed++;
        
        // Rate limit protection
        if (processed % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

      } catch (error) {
        results.push({
          id: dok.id,
          nazov: dok.nazov,
          vyrobca: dok.vyrobca,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      processed: processed,
      total: dokumenty.length,
      results: results
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});