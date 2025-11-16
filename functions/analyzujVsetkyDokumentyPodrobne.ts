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
          prompt: `Analyzuj tento obrázok modulárneho domu MAXIMÁLNE PODROBNE:

Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model domu: ${dok.model_domu || 'neznámy'}
Cesta: ${dok.cesta_priecinku || 'neurčená'}

ÚLOHA - Poskytni PRESNÉ a DETAILNÉ informácie:

1. TYP OBSAHU A KATEGORIZÁCIA:
   - Je to exteriér, interiér alebo pôdorys?
   - Špecifický typ: "celkový pohľad na dom", "detail fasády", "pohľad zo strany", "interiérový detail", "kuchyňa", "obývacia izba", "kúpeľňa", "spálňa", atď.
   - Je to reklamná fotka, reálna realizácia, alebo vizualizácia?

2. MATERIÁLY FASÁDY (DETEGUJ VŠETKY VIDITEĽNÉ):
   - Antracitový plech (drážkový/hladký)
   - Drevený obklad (smrekový/borovicový/modrinový/céder/termodrevo)
   - Biely plech
   - Tmavý plech (čierna, antracit)
   - Kamenný obklad (prírodný/umelý)
   - Omietka (jemná/hrubá/zatieraná)
   - Tehla (obkladová/viditeľná)
   - Suchá fasáda (SDK)
   - Sklenená fasáda / veľké presklené plochy
   - Kombinovaná fasáda (špecifikuj kombináciu)
   - Farby každého materiálu
   - Povrchová úprava a stav

3. OKNÁ A DVERE (VEĽMI DÔLEŽITÉ):
   - Typ okien: plastové/drevené/hliníkové/drevo-hliníkové
   - Farba rámu okien
   - Veľkosť okien (malé/stredné/veľké/panoramatické)
   - Rozdelenie okien (jednodielne/dvojdielne/trojdielne)
   - Tvar okien (štandardné/oblúkové/atypické)
   - Typ dverí: vchodové/posuvné/terasové
   - Materiál dverí
   - Farba dverí
   - Špeciálne prvky (presklenie, madlá, zámky)

4. STREŠNÁ KRYTINA:
   - Typ krytiny: plechová/škridla (betónová/keramická)/šindel/plochá strecha/zelená strecha
   - Materiál a farba krytiny
   - Sklon strechy (plochá/šikmá/strmá)
   - Typ strechy: sedlová/pultová/valbová/mansardová
   - Viditeľné prvky: komín/strešné okná/klampiarské prvky/okapy
   - Farba klampiarskych prvkov
   - Stav krytiny

5. STAV A KVALITA FASÁDY:
   - Stav: nová/stará/potrebuje údržbu/poškodená
   - Viditeľné nedostatky: praskliny/odlupovanie/znečistenie/plesne
   - Kvalita prevedenia: vysoká/priemerná/nízka
   - Potreba opravy alebo renovácie

6. PÔDORYS (ak je to pôdorys):
   - Detailné rozmery každej miestnosti
   - Celková plocha
   - Počet izieb
   - Rozloženie priestoru
   - Umiestnenie dverí a okien
   - Označenie miestností

7. INTERIÉR (ak je interiér):
   - Aká miestnosť (obývačka/kuchyňa/spálňa/kúpeľňa/chodba/iné)
   - Podlaha: vinyl/laminát/drevená/dlaždice/koberec
   - Farba a vzor podlahy
   - Steny: sadrokartón/obklad/drevo/tehla/maľba
   - Farba stien
   - Nábytek a zariadenie
   - Štýl interiéru: moderný/klasický/škandinávsky/industriálny
   - Osvetlenie: LED pásy/lustry/bodové/prírodné svetlo
   - Stav interiéru

8. PRIRAĎOVANIE K DOMU:
   - Ktorému modelu domu PRESNE patrí táto fotka?
   - Je názov priečinka správny?
   - Mal by byť tento súbor presunutý do iného priečinka?
   - Je to správny výrobca?
   - Odporúčaný priečinok: Výrobca/Model/Typ (napr. "JAK Modules/LARGE ESTATE/exterier")

9. TECHNICKÉ A KONŠTRUKČNÉ DETAILY:
   - Viditeľné rozmery
   - Konštrukčné riešenia
   - Izolácia (viditeľná)
   - Inštalácie (elektroinštalácia/vykurovanie/klimatizácia)
   - Špeciálne vlastnosti
   - Technologické riešenia

Buď MAXIMÁLNE KONKRÉTNÝ a PODROBNÝ v každom bode. Nepíš všeobecnosti. Deteguj VŠETKY viditeľné prvky!`,
          file_urls: [dok.subor_url],
          response_json_schema: {
            type: "object",
            properties: {
              typ_obsahu: {
                type: "string",
                enum: ["exterier", "interier", "podorys", "kombinacia"]
              },
              specificka_kategoria: {
                type: "string",
                description: "Presná kategória ako 'celkový pohľad na dom', 'detail fasády', 'kuchyňa', atď."
              },
              typ_fotky: {
                type: "string",
                enum: ["reklamna", "realna_realizacia", "vizualizacia"]
              },
              fasada_materialy: {
                type: "array",
                items: { 
                  type: "object",
                  properties: {
                    material: { type: "string" },
                    podtyp: { type: "string" },
                    farba: { type: "string" },
                    povrchova_uprava: { type: "string" },
                    umiestnenie: { type: "string" }
                  }
                },
                description: "Všetky materiály viditeľné na fasáde s detailmi"
              },
              okna: {
                type: "object",
                properties: {
                  typ: { type: "string" },
                  material: { type: "string" },
                  farba_ramu: { type: "string" },
                  velkost: { type: "string" },
                  rozdelenie: { type: "string" },
                  tvar: { type: "string" },
                  pocet_viditelnych: { type: "number" }
                }
              },
              dvere: {
                type: "object",
                properties: {
                  typ: { type: "string" },
                  material: { type: "string" },
                  farba: { type: "string" },
                  specialne_prvky: { type: "array", items: { type: "string" } }
                }
              },
              stresna_krytina: {
                type: "object",
                properties: {
                  typ: { type: "string" },
                  material: { type: "string" },
                  farba: { type: "string" },
                  sklon: { type: "string" },
                  typ_strechy: { type: "string" },
                  prvky: { type: "array", items: { type: "string" } },
                  farba_klampiarskeho: { type: "string" },
                  stav: { type: "string" }
                }
              },
              stav_fasady: {
                type: "object",
                properties: {
                  celkovy_stav: { 
                    type: "string",
                    enum: ["nova", "stara", "potrebuje_udrzbu", "poskodena"]
                  },
                  nedostatky: { type: "array", items: { type: "string" } },
                  kvalita_prevedenia: {
                    type: "string",
                    enum: ["vysoka", "priemerna", "nizka"]
                  },
                  potreba_opravy: { type: "boolean" },
                  popis_stavu: { type: "string" }
                }
              },
              interier_miestnost: {
                type: "string"
              },
              interier_materialy: {
                type: "object",
                properties: {
                  podlaha: { type: "string" },
                  farba_podlahy: { type: "string" },
                  steny: { type: "string" },
                  farba_stien: { type: "string" },
                  nabytok: { type: "string" },
                  styl: { type: "string" },
                  osvetlenie: { type: "string" },
                  stav: { type: "string" }
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
                description: "Plná cesta: Výrobca/Model/Typ"
              },
              technicke_detaily: {
                type: "array",
                items: { type: "string" },
                description: "Všetky viditeľné technické detaily"
              },
              kvalita_analyzy: {
                type: "string",
                enum: ["vysoka", "stredna", "nizka"]
              }
            },
            required: ["typ_obsahu", "specificka_kategoria", "spravny_model_domu", "odporucany_priecinok"]
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
          kategoria: analyza.specificka_kategoria,
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