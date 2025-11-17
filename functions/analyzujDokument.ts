import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { document_id } = await req.json();
        
        if (!document_id) {
            return Response.json({ error: 'Missing document_id' }, { status: 400 });
        }

        const dokument = await base44.asServiceRole.entities.Dokument.filter({ id: document_id });
        
        if (!dokument || dokument.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }
        
        const dok = dokument[0];
        
        const isImage = dok.typ_suboru?.includes('image');
        const isPDF = dok.typ_suboru?.includes('pdf');
        const isDocument = dok.typ_suboru?.includes('document') || dok.typ_suboru?.includes('text');
        
        let analysisPrompt = '';
        let responseSchema = {};
        let llmParams = {};

        if (isImage) {
            analysisPrompt = `Analyzuj DETAILNE túto fotografiu modulárneho domu.

DOKUMENT INFO:
- Názov: ${dok.nazov}
- Výrobca: ${dok.vyrobca}
${dok.model_domu ? `- Model: ${dok.model_domu}` : ''}

POŽADOVANÉ:
1. spravny_vyrobca - urči správneho výrobcu z: JAK Modules, Ticab house, Prosto House, Domki z Gór
2. spravny_model - presný názov modelu
3. typ_obsahu - exterier, interier alebo podorys
4. fasada_materialy - pole materiálov fasády (len exterier)
5. fasada_farby - pole farieb (len exterier)
6. technicka_analyza - detailný popis toho čo vidíš
7. Popis pre chatbot (150-200 slov)
8. Tagy (5-10 kľúčových slov)`;

            responseSchema = {
                type: "object",
                properties: {
                    extrahovaný_obsah: { type: "string" },
                    ai_generovany_popis: { type: "string" },
                    ai_generovane_tagy: { type: "array", items: { type: "string" } },
                    vizualna_analyza: {
                        type: "object",
                        properties: {
                            spravny_vyrobca: { type: "string" },
                            spravny_model: { type: "string" },
                            typ_obsahu: { type: "string" },
                            fasada_materialy: { type: "array", items: { type: "string" } },
                            fasada_farby: { type: "array", items: { type: "string" } },
                            technicka_analyza: { type: "string" },
                            styl: { type: "string" },
                            farby: { type: "array", items: { type: "string" } }
                        },
                        required: ["spravny_vyrobca", "spravny_model", "typ_obsahu"]
                    }
                },
                required: ["extrahovaný_obsah", "ai_generovany_popis", "ai_generovane_tagy", "vizualna_analyza"]
            };

            llmParams = {
                prompt: analysisPrompt,
                file_urls: [dok.subor_url],
                response_json_schema: responseSchema
            };
        } else if (isPDF || isDocument) {
            // Pre PDF a dokumenty - fetch obsahu
            let fileContent = '';
            try {
                const response = await fetch(dok.subor_url);
                const blob = await response.blob();
                fileContent = await blob.text();
            } catch (e) {
                console.error('Fetch error:', e);
            }

            analysisPrompt = `SMART ANALÝZA DOKUMENTU

DOKUMENT:
Názov: ${dok.nazov}
Typ: ${dok.typ}
Výrobca: ${dok.vyrobca}
Obsah prvých 20000 znakov: ${fileContent.substring(0, 20000)}

ÚLOHY:

1. DETEKCIA TYPU - urči presný typ:
   - **zmluva** ak obsahuje: "zmluva", "zmluvné strany", "článok", právne formulácie
   - **faktúra** ak obsahuje: "faktúra", "invoice", VS, suma, DPH, splatnosť
   - **ponuka** ak obsahuje: "cenová ponuka", "ponúkame", cena
   - **objednávka** ak obsahuje: "objednávka", "objednávam"
   - cenník, technická_špecifikácia, návod, certifikát, FAQ, blog, iné

2. EXTRAKCIA INFO (podľa typu):
   
   Pre ZMLUVU:
   - cislo_zmluvy, datum_podpisu, zmluvne_strany[], predmet_zmluvy, platnost_od, platnost_do
   
   Pre FAKTÚRU:
   - cislo_faktury, datum_vystavenia, datum_splatnosti
   - dodavatel, odberatel
   - suma_bez_dph, dph, suma_s_dph
   - polozky[]
   
   Pre PONUKU:
   - cislo_ponuky, datum_ponuky, platnost_do
   - ponukane_produkty[], celkova_cena
   
   Pre OBJEDNÁVKU:
   - cislo_objednavky, datum_objednavky
   - objednavatel, objednane_polozky[], celkova_suma

3. AI GENEROVANIE:
   - Popis (2-3 vety)
   - Tagy (8-12 kľúčových slov)
   - Zhrnutie ak >500 slov

4. CHATBOT obsah - optimalizovaný text pre AI chatbota`;

            responseSchema = {
                type: "object",
                properties: {
                    odporucana_kategoria: { 
                        type: "string",
                        enum: ["cenník", "technická_špecifikácia", "návod", "certifikát", "FAQ", "blog", "zmluva", "faktúra", "ponuka", "objednávka", "iné"]
                    },
                    extrahovaný_obsah: { type: "string" },
                    ai_generovany_popis: { type: "string" },
                    ai_generovane_tagy: { type: "array", items: { type: "string" } },
                    zhrnutie: { type: "string" },
                    kľúčové_informácie: {
                        type: "object",
                        properties: {
                            zmluva_info: {
                                type: "object",
                                properties: {
                                    cislo_zmluvy: { type: "string" },
                                    datum_podpisu: { type: "string" },
                                    zmluvne_strany: { type: "array", items: { type: "string" } },
                                    predmet_zmluvy: { type: "string" },
                                    platnost_od: { type: "string" },
                                    platnost_do: { type: "string" }
                                }
                            },
                            faktura_info: {
                                type: "object",
                                properties: {
                                    cislo_faktury: { type: "string" },
                                    datum_vystavenia: { type: "string" },
                                    datum_splatnosti: { type: "string" },
                                    dodavatel: { type: "string" },
                                    odberatel: { type: "string" },
                                    suma_bez_dph: { type: "string" },
                                    dph: { type: "string" },
                                    suma_s_dph: { type: "string" },
                                    polozky: { type: "array", items: { type: "string" } }
                                }
                            },
                            ponuka_info: {
                                type: "object",
                                properties: {
                                    cislo_ponuky: { type: "string" },
                                    datum_ponuky: { type: "string" },
                                    platnost_do: { type: "string" },
                                    ponukane_produkty: { type: "array", items: { type: "string" } },
                                    celkova_cena: { type: "string" }
                                }
                            },
                            objednavka_info: {
                                type: "object",
                                properties: {
                                    cislo_objednavky: { type: "string" },
                                    datum_objednavky: { type: "string" },
                                    pozadovany_termin: { type: "string" },
                                    objednavatel: { type: "string" },
                                    objednane_polozky: { type: "array", items: { type: "string" } },
                                    celkova_suma: { type: "string" }
                                }
                            },
                            modely_domov: { type: "array", items: { type: "string" } },
                            cenové_informácie: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                required: ["odporucana_kategoria", "extrahovaný_obsah", "ai_generovany_popis", "ai_generovane_tagy"]
            };

            llmParams = {
                prompt: analysisPrompt,
                response_json_schema: responseSchema
            };
        } else {
            return Response.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM(llmParams);

        const updateData = {
            extrahovaný_obsah: result.extrahovaný_obsah,
            ai_generovany_popis: result.ai_generovany_popis,
            ai_generovane_tagy: result.ai_generovane_tagy || [],
            analyzovaný: true,
            podrobna_analyza_datum: new Date().toISOString()
        };

        // Hash pre podobnosť
        if (result.extrahovaný_obsah) {
            const hash = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(result.extrahovaný_obsah.substring(0, 1000))
            );
            updateData.podobnost_hash = Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .substring(0, 32);
        }

        if (isImage && result.vizualna_analyza) {
            updateData.vizualna_analyza = result.vizualna_analyza;
        }

        if (!isImage) {
            if (result.odporucana_kategoria) {
                updateData.odporucana_kategoria = result.odporucana_kategoria;
            }
            if (result.zhrnutie) {
                updateData.zhrnutie = result.zhrnutie;
            }
            if (result.kľúčové_informácie) {
                updateData.kľúčové_informácie = result.kľúčové_informácie;
            }
        }

        await base44.asServiceRole.entities.Dokument.update(document_id, updateData);

        return Response.json({
            success: true,
            type: isImage ? 'image' : 'document',
            analyzed: true
        });

    } catch (error) {
        console.error('❌ Analysis error:', error);
        
        // Mark document for manual review
        try {
            const base44 = createClientFromRequest(req);
            const { document_id } = await req.json();
            
            if (document_id) {
                await base44.asServiceRole.entities.Dokument.update(document_id, {
                    ai_generovany_popis: `Chyba analýzy: ${error.message}`,
                    manualna_kontrola_potrebna: true,
                    validacia_problemy: [error.message]
                });
            }
        } catch (updateError) {
            console.error('Failed to mark document:', updateError);
        }
        
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});