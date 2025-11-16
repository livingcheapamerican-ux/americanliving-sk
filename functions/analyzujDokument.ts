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

        const documents = await base44.entities.Dokument.filter({ id: document_id });
        
        if (!documents || documents.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }
        
        const dokument = documents[0];
        
        const isImage = dokument.typ_suboru?.includes('image');
        const isTextFile = dokument.typ_suboru?.includes('text') || 
                          dokument.typ_suboru?.includes('pdf') ||
                          dokument.typ_suboru?.includes('document');
        
        let fileContent = '';
        if (isTextFile) {
            try {
                const response = await fetch(dokument.subor_url);
                fileContent = await response.text();
            } catch (error) {
                console.error('Error fetching file content:', error);
            }
        }

        let analysisPrompt = '';
        let responseSchema = {};

        if (isImage) {
            analysisPrompt = `
Analyzuj MAXIMÁLNE DETAILNE túto fotografiu/obrázok modulárneho domu.

DOKUMENT:
Názov súboru: ${dokument.nazov}
Výrobca: ${dokument.vyrobca}
${dokument.model_domu ? `Model: ${dokument.model_domu}` : ''}
${dokument.podpriecinok ? `Kategória: ${dokument.podpriecinok}` : ''}

ÚLOHY:
1. Identifikuj typ obsahu (exteriér/interiér/pôdorys/iné)
2. Pre pôdorysy: extrahuj presné rozmery, miestnosti, plochy
3. Pre exteriér: fasáda, strecha, slnko, terén, okolie
4. Pre interiér: materiály stien, podláh, stropu
5. Všeobecné: farby, štýl, technické detaily
6. Vizuálne odporúčania na vylepšenie
7. Vytvor profesionálny popis pre chatbota (200-300 slov)
8. Vygeneruj 5-10 relevantných TAGOV (slovensky, jedno slovo alebo krátka fráza)
9. Vytvor krátky POPIS dokumentu (1-2 vety)

Buď PRESNÝ a DETAILNÝ!
`;

            responseSchema = {
                type: "object",
                properties: {
                    extrahovaný_obsah: { type: "string" },
                    ai_generovany_popis: { type: "string" },
                    ai_generovane_tagy: { type: "array", items: { type: "string" } },
                    vizualna_analyza: {
                        type: "object",
                        properties: {
                            typ_obsahu: { type: "string", enum: ["exterier", "interier", "podorys", "ine"] },
                            typ_fasady: { type: "array", items: { type: "string" } },
                            interier_materialy: { type: "array", items: { type: "string" } },
                            extrier_materialy: { type: "array", items: { type: "string" } },
                            stresna_krytina: { type: "string" },
                            slnecna_expoziacia: { type: "string" },
                            teren_okolie: {
                                type: "object",
                                properties: {
                                    typ_terenu: { type: "string" },
                                    okolie: { type: "array", items: { type: "string" } }
                                }
                            },
                            podorys_analyza: {
                                type: "object",
                                properties: {
                                    je_podorys: { type: "boolean" },
                                    celkove_rozmery: {
                                        type: "object",
                                        properties: {
                                            sirka: { type: "string" },
                                            dlzka: { type: "string" },
                                            zastavana_plocha: { type: "string" }
                                        }
                                    },
                                    miestnosti: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                nazov: { type: "string" },
                                                rozmery: { type: "string" },
                                                plocha: { type: "string" }
                                            }
                                        }
                                    },
                                    uzitkova_plocha: { type: "string" },
                                    terasa_balkon: { type: "string" },
                                    pocet_izieb: { type: "number" }
                                }
                            },
                            technicka_analyza: { type: "string" },
                            farby: { type: "array", items: { type: "string" } },
                            styl: { type: "string" },
                            vizualne_odporucania: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                required: ["extrahovaný_obsah", "ai_generovany_popis", "ai_generovane_tagy", "vizualna_analyza"]
            };
        } else {
            analysisPrompt = `
POKROČILÁ AI ANALÝZA DOKUMENTU

DOKUMENT:
Názov: ${dokument.nazov}
Typ: ${dokument.typ}
Výrobca: ${dokument.vyrobca}
${dokument.model_domu ? `Model: ${dokument.model_domu}` : ''}
${fileContent ? `Obsah: ${fileContent.substring(0, 25000)}` : ''}

KRITICKÉ ÚLOHY:

1. AUTOMATICKÁ IDENTIFIKÁCIA TYPU:
   Urči najpresnejší typ:
   - cenník, technická_špecifikácia, návod, certifikát, FAQ, blog
   - **ZMLUVA** (hľadaj: "zmluva", "zmluvné strany", "článok", právnické formulácie)
   - **FAKTÚRA** (hľadaj: "faktúra", "invoice", "suma", "DPH", "splatnosť", číslo faktúry)
   - **PONUKA** (hľadaj: "cenová ponuka", "cena bez DPH", "ponúkame")
   - **OBJEDNÁVKA** (hľadaj: "objednávka", "objednávam", číslo objednávky)
   - fotky, video, iné

2. POKROČILÁ SUMARIZÁCIA (ak dokument >500 slov):
   A) KRÁTKE ZHRNUTIE: 1-2 vety - hlavná myšlienka
   B) STREDNÉ ZHRNUTIE: 100-150 slov - kľúčové fakty
   C) KĽÚČOVÉ BODY: 5-10 bodov - najdôležitejšie informácie

3. AI GENEROVANIE:
   A) POPIS: Vytvor atraktívny popis dokumentu (2-3 vety) pre používateľov
   B) TAGY: Vygeneruj 8-15 relevantných tagov (slovensky):
      - Kľúčové slová z obsahu
      - Model domu
      - Technické parametre
      - Cenové kategórie
      - Materiály
      Príklad: ["A0 dom", "nízkoenergetický", "drevostavba", "cenník 2024"]

4. EXTRAKCIA DÔLEŽITÝCH INFORMÁCIÍ:
   - Modely domov
   - Ceny (presné čísla s menou a DPH)
   - Rozmery (šírka, dĺžka, výška, plochy)
   - Materiály (detailne so značkami)
   - Energetické parametre (trieda, spotreba, U-hodnoty)
   - Technické špecifikácie
   - Inštalácie
   - Doprava a montáž
   - Záruky
   - Odporúčania

5. CHATBOT OBSAH:
   - Optimalizovaný text (max 1500 slov)
   - Prirodzený jazyk
   - Všetky dôležité fakty a čísla

VÝSTUP: JSON so všetkými požadovanými poľami.
`;

            responseSchema = {
                type: "object",
                properties: {
                    odporucana_kategoria: { 
                        type: "string",
                        enum: ["cenník", "technická_špecifikácia", "návod", "certifikát", "FAQ", "blog", "fotky", "video", "zmluva", "faktúra", "ponuka", "objednávka", "iné"]
                    },
                    extrahovaný_obsah: { type: "string" },
                    ai_generovany_popis: { type: "string" },
                    ai_generovane_tagy: { type: "array", items: { type: "string" } },
                    zhrnutie: { type: ["string", "null"] },
                    detailne_zhrnutie: {
                        type: ["object", "null"],
                        properties: {
                            kratke: { type: "string" },
                            stredne: { type: "string" },
                            klucove_body: { type: "array", items: { type: "string" } }
                        }
                    },
                    kľúčové_informácie: {
                        type: "object",
                        properties: {
                            modely_domov: { type: "array", items: { type: "string" } },
                            cenové_informácie: { type: "array", items: { type: "string" } },
                            technické_údaje: { type: "array", items: { type: "string" } },
                            rozmery: {
                                type: "object",
                                properties: {
                                    sirka: { type: "string" },
                                    dlzka: { type: "string" },
                                    vyska: { type: "string" },
                                    plocha: { type: "string" },
                                    uzitkova_plocha: { type: "string" },
                                    zastavana_plocha: { type: "string" }
                                }
                            },
                            materialy: { type: "array", items: { type: "string" } },
                            energia: {
                                type: "object",
                                properties: {
                                    trieda: { type: "string" },
                                    spotreba: { type: "string" },
                                    u_hodnoty: { type: "string" },
                                    vykurovanie: { type: "string" },
                                    fotovoltaika: { type: "string" }
                                }
                            },
                            instalácie: { type: "array", items: { type: "string" } },
                            doprava_montaz: { type: "array", items: { type: "string" } },
                            zaruky: { type: "array", items: { type: "string" } },
                            odporucania: { type: "array", items: { type: "string" } },
                            ostatné: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                required: ["odporucana_kategoria", "extrahovaný_obsah", "ai_generovany_popis", "ai_generovane_tagy", "kľúčové_informácie"]
            };
        }

        const llmParams = {
            prompt: analysisPrompt,
            response_json_schema: responseSchema
        };

        if (isImage) {
            llmParams.file_urls = [dokument.subor_url];
        }

        const result = await base44.integrations.Core.InvokeLLM(llmParams);

        // Vyčisti a priprav update
        const updateData = {
            extrahovaný_obsah: result.extrahovaný_obsah,
            ai_generovany_popis: result.ai_generovany_popis,
            ai_generovane_tagy: result.ai_generovane_tagy || [],
            analyzovaný: true
        };

        // Generuj hash pre podobnosť
        if (result.extrahovaný_obsah) {
            const contentForHash = result.extrahovaný_obsah.substring(0, 1000);
            const hash = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(contentForHash)
            );
            updateData.podobnost_hash = Array.from(new Uint8Array(hash))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .substring(0, 32);
        }

        if (isImage && result.vizualna_analyza) {
            const cleanedVizualna = {};
            for (const [key, value] of Object.entries(result.vizualna_analyza)) {
                if (Array.isArray(value) && value.length > 0) {
                    cleanedVizualna[key] = value;
                } else if (typeof value === 'string' && value.trim() !== '') {
                    cleanedVizualna[key] = value;
                } else if (typeof value === 'object' && value !== null) {
                    const cleanedObj = {};
                    for (const [k, v] of Object.entries(value)) {
                        if (Array.isArray(v) && v.length > 0) {
                            cleanedObj[k] = v;
                        } else if (typeof v === 'string' && v.trim() !== '') {
                            cleanedObj[k] = v;
                        } else if (typeof v === 'number' || typeof v === 'boolean') {
                            cleanedObj[k] = v;
                        } else if (typeof v === 'object' && v !== null) {
                            const deepClean = {};
                            for (const [dk, dv] of Object.entries(v)) {
                                if ((typeof dv === 'string' && dv.trim() !== '') || typeof dv === 'number' || typeof dv === 'boolean') {
                                    deepClean[dk] = dv;
                                }
                            }
                            if (Object.keys(deepClean).length > 0) cleanedObj[k] = deepClean;
                        }
                    }
                    if (Object.keys(cleanedObj).length > 0) cleanedVizualna[key] = cleanedObj;
                }
            }
            if (Object.keys(cleanedVizualna).length > 0) {
                updateData.vizualna_analyza = cleanedVizualna;
            }

            // Aktualizuj Dom z pôdorysov
            if (dokument.model_domu && result.vizualna_analyza?.podorys_analyza?.je_podorys) {
                try {
                    const podorys = result.vizualna_analyza.podorys_analyza;
                    const domy = await base44.asServiceRole.entities.Dom.filter({ nazov: dokument.model_domu });

                    if (domy && domy.length > 0) {
                        const dom = domy[0];
                        const domUpdate = {};

                        if (podorys.celkove_rozmery?.zastavana_plocha) {
                            const match = podorys.celkove_rozmery.zastavana_plocha.match(/(\d+[.,]?\d*)/);
                            if (match) domUpdate.zastavana_plocha = parseFloat(match[1].replace(',', '.'));
                        }

                        if (podorys.uzitkova_plocha) {
                            const match = podorys.uzitkova_plocha.match(/(\d+[.,]?\d*)/);
                            if (match) domUpdate.uzitkova_plocha = parseFloat(match[1].replace(',', '.'));
                        }

                        if (podorys.celkove_rozmery?.sirka && podorys.celkove_rozmery?.dlzka) {
                            domUpdate.rozmery = {
                                sirka: parseFloat(podorys.celkove_rozmery.sirka.match(/(\d+[.,]?\d*)/)?.[1].replace(',', '.') || 0),
                                dlzka: parseFloat(podorys.celkove_rozmery.dlzka.match(/(\d+[.,]?\d*)/)?.[1].replace(',', '.') || 0),
                                vyska: 0
                            };
                        }

                        if (podorys.pocet_izieb) domUpdate.pocet_izieb = podorys.pocet_izieb;

                        if (Object.keys(domUpdate).length > 0) {
                            await base44.asServiceRole.entities.Dom.update(dom.id, domUpdate);
                        }
                    }
                } catch (domError) {
                    console.error('Error updating Dom from podorys:', domError);
                }
            }
        } else {
            // Textové dokumenty
            if (result.odporucana_kategoria) {
                updateData.odporucana_kategoria = result.odporucana_kategoria;
            }

            if (result.zhrnutie) {
                updateData.zhrnutie = result.zhrnutie;
            }

            if (result.detailne_zhrnutie) {
                updateData.detailne_zhrnutie = result.detailne_zhrnutie;
            }

            if (result.kľúčové_informácie) {
                const cleanedInfo = {};
                for (const [key, value] of Object.entries(result.kľúčové_informácie)) {
                    if (Array.isArray(value)) {
                        if (value.length > 0) cleanedInfo[key] = value;
                    } else if (typeof value === 'object' && value !== null) {
                        const cleanedObj = {};
                        for (const [k, v] of Object.entries(value)) {
                            if (v && v !== '') cleanedObj[k] = v;
                        }
                        if (Object.keys(cleanedObj).length > 0) cleanedInfo[key] = cleanedObj;
                    } else if (value) {
                        cleanedInfo[key] = value;
                    }
                }
                if (Object.keys(cleanedInfo).length > 0) {
                    updateData.kľúčové_informácie = cleanedInfo;
                }
            }

            // Aktualizuj Dom z textových dokumentov
            if (dokument.model_domu && result.kľúčové_informácie) {
                try {
                    const domy = await base44.asServiceRole.entities.Dom.filter({ nazov: dokument.model_domu });

                    if (domy && domy.length > 0) {
                        const dom = domy[0];
                        const domUpdate = {};
                        const info = result.kľúčové_informácie;

                        if (info.rozmery) {
                            if (info.rozmery.zastavana_plocha) {
                                const match = info.rozmery.zastavana_plocha.match(/(\d+[.,]?\d*)/);
                                if (match) domUpdate.zastavana_plocha = parseFloat(match[1].replace(',', '.'));
                            }
                            if (info.rozmery.uzitkova_plocha) {
                                const match = info.rozmery.uzitkova_plocha.match(/(\d+[.,]?\d*)/);
                                if (match) domUpdate.uzitkova_plocha = parseFloat(match[1].replace(',', '.'));
                            }
                            if (info.rozmery.sirka && info.rozmery.dlzka) {
                                domUpdate.rozmery = {
                                    sirka: parseFloat(info.rozmery.sirka.match(/(\d+[.,]?\d*)/)?.[1].replace(',', '.') || 0),
                                    dlzka: parseFloat(info.rozmery.dlzka.match(/(\d+[.,]?\d*)/)?.[1].replace(',', '.') || 0),
                                    vyska: parseFloat(info.rozmery.vyska?.match(/(\d+[.,]?\d*)/)?.[1].replace(',', '.') || 0)
                                };
                            }
                        }

                        if (info.cenové_informácie && info.cenové_informácie.length > 0) {
                            const prvaInfo = info.cenové_informácie[0];
                            const match = prvaInfo.match(/(\d+[\s,]*\d*)\s*EUR/i);
                            if (match) {
                                domUpdate.zakladna_cena = parseInt(match[1].replace(/[\s,]/g, ''));
                            }
                        }

                        if (info.technické_údaje && info.technické_údaje.length > 0) {
                            domUpdate.specifikacia = info.technické_údaje.join('\n');
                        }

                        if (info.energia?.trieda) {
                            domUpdate.energeticky_certifikat = info.energia.trieda.includes('A0') || info.energia.trieda.includes('A');
                        }

                        if (Object.keys(domUpdate).length > 0) {
                            await base44.asServiceRole.entities.Dom.update(dom.id, domUpdate);
                        }
                    }
                } catch (domError) {
                    console.error('Error updating Dom entity:', domError);
                }
            }
        }

        await base44.asServiceRole.entities.Dokument.update(document_id, updateData);

        return Response.json({
            success: true,
            type: isImage ? 'image' : 'document',
            auto_category: result.odporucana_kategoria || null,
            has_detailed_summary: !!result.detailne_zhrnutie,
            generated_tags_count: result.ai_generovane_tagy?.length || 0,
            dom_updated: !!dokument.model_domu
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});