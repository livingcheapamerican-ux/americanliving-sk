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
        
        // Detekcia typu súboru
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

        // ANALÝZA OBRÁZKOV
        if (isImage) {
            analysisPrompt = `
Analyzuj DETAILNE túto fotografiu modulárneho domu.

DOKUMENT:
Názov: ${dokument.nazov}
Výrobca: ${dokument.vyrobca}
${dokument.model_domu ? `Model: ${dokument.model_domu}` : ''}
${dokument.podpriecinok ? `Kategória: ${dokument.podpriecinok}` : ''}

ÚLOHY:
1. Urči či je to EXTERIÉR alebo INTERIÉR
2. FASÁDA (ak exteriér):
   - Deteguj TYP FASÁDY: klasická biela omietka, drevený obklad, antracitový plech, sivý plech, kombinovaná fasáda, sklenená fasáda, kamenný obklad, atď.
   - Urči FARBU fasády presne
   - Identifikuj MATERIÁLY fasády viditeľné na fotografii
3. INTERIÉR (ak interiér):
   - Deteguj MATERIÁLY STIEN: drevo (aký typ), sádrokarton, maľovaná omietka, obklad, atď.
   - Podlaha: drevo, laminát, dlažba, atď.
   - Strop: drevo, sádrokarton, napnutý, atď.
4. VŠEOBECNÉ:
   - Architektonický ŠTÝL: moderný, tradičný, minimalistický, škandinávsky, industriálny, atď.
   - DOMINANTNÉ FARBY (3-5 hlavných farieb)
   - TECHNICKÉ DETAILY: typ okien, dverí, strešná krytina (ak viditeľná), terasa, balkón, atď.
5. DETAILNÝ POPIS pre chatbota (200-300 slov) - ako by si profesionálne opisoval túto fotku potenciálnemu zákazníkovi

Buď MAXIMÁLNE DETAILNÝ a PRESNÝ.
`;

            responseSchema = {
                type: "object",
                properties: {
                    extrahovaný_obsah: { type: "string" },
                    vizualna_analyza: {
                        type: "object",
                        properties: {
                            typ_fasady: { type: "array", items: { type: "string" } },
                            interier_materialy: { type: "array", items: { type: "string" } },
                            extrier_materialy: { type: "array", items: { type: "string" } },
                            technicka_analyza: { type: "string" },
                            farby: { type: "array", items: { type: "string" } },
                            styl: { type: "string" }
                        }
                    }
                },
                required: ["extrahovaný_obsah", "vizualna_analyza"]
            };
        } else {
            // ANALÝZA TEXTOVÝCH DOKUMENTOV
            analysisPrompt = `
Analyzuj tento dokument pre slovenský web o modulárnych domoch. Vykonaj KOMPLEXNÚ a DETAILNÚ analýzu.

DOKUMENT:
Názov: ${dokument.nazov}
Aktuálny typ: ${dokument.typ}
Výrobca: ${dokument.vyrobca}
${dokument.model_domu ? `Model domu (z priečinka): ${dokument.model_domu}` : ''}
${dokument.podpriecinok ? `Podpriečinok: ${dokument.podpriecinok}` : ''}
${dokument.cesta_priecinku ? `Cesta: ${dokument.cesta_priecinku}` : ''}
Popis: ${dokument.popis || 'N/A'}
${fileContent ? `Obsah súboru: ${fileContent.substring(0, 20000)}` : ''}

ÚLOHY ANALÝZY:

1. AUTOMATICKÁ KATEGORIZÁCIA
   - Urči najpresnejší typ dokumentu: cenník, technická_špecifikácia, návod, certifikát, FAQ, blog, fotky, video alebo iné
   - Zohľadni názov, cestu a obsah

2. EXTRAKCIA INFORMÁCIÍ (MAXIMÁLNE DETAILNE):

   A) MODELY DOMOV:
   - Všetky spomenuté modely/typy
   - Zahrň aj model z názvu priečinka
   - Formát: "Názov modelu" alebo "Séria - Model"
   
   B) CENOVÉ INFORMÁCIE:
   - Základné ceny s DPH/bez DPH
   - Cenové rozpätia (od-do)
   - Prirážky a zľavy
   - Ceny príslušenstva/doplnkov
   - Ceny montáže, dopravy
   - Formát: "Položka: XXX EUR (s/bez DPH) - detailný popis"
   
   C) ROZMERY A PLOCHY:
   - Šírka, dĺžka, výška (v metroch)
   - Úžitková plocha (m²)
   - Zastavaná plocha (m²)
   - Podlahová plocha (m²)
   - Rozmery miestností
   
   D) MATERIÁLY A KONŠTRUKCIA:
   - Konštrukčný systém (drevo, oceľ, beton)
   - Izolačné materiály (typ, hrúbka, U-hodnota)
   - Strešná krytina
   - Fasádne materiály
   - Výplne otvorov (okná, dvere)
   - Značky a výrobcovia
   - Certifikáty materiálov
   
   E) ENERGETICKÉ PARAMETRE:
   - Energetická trieda (A0, A, B, C...)
   - Spotreba energie (kWh/m²/rok)
   - Tepelná izolácia (U-hodnoty)
   - Typ vykurovania
   - Možnosti fotovoltaiky
   - Tepelné čerpadlo
   - Rekuperácia
   
   F) TECHNICKÉ ŠPECIFIKÁCIE:
   - Počet izieb/poschodí
   - Výška stropu
   - Hmotnosť konštrukcie
   - Zaťažiteľnosť
   - Akustické parametre
   - Požiarna odolnosť
   - Životnosť
   - Záručná doba
   - Čas výroby a montáže
   
   G) INŠTALÁCIE A VYBAVENIE:
   - Elektroinštalácia (specifikácia)
   - Voda a kanalizácia
   - Vykurovanie/chladenie
   - Vetranie
   - Smart home systémy
   - Štandardné vybavenie
   - Možné príplatky
   
   H) PRÁVNE A ADMINISTRATÍVNE:
   - Stavebné povolenie (požiadavky)
   - Energetický certifikát
   - Kolaudácia
   - Projektová dokumentácia
   - Záruky a servis
   
   I) DOPRAVA A MONTÁŽ:
   - Spôsob dopravy
   - Cena dopravy
   - Čas montáže
   - Požiadavky na pozemok
   - Prípojné body

3. INTELIGENTNÉ ODPORÚČANIA:
   - Pre akú skupinu zákazníkov je dom vhodný
   - Výhody a nevýhody
   - Porovnanie s podobnými modelmi
   - Odporúčané príslušenstvo

4. ZHRNUTIE:
   - Ak dokument má viac ako 200 slov: vytvor stručné zhrnutie (max 150 slov)
   - Zhrň najdôležitejšie fakty
   
5. CHATBOT OBSAH:
   - Optimalizovaný text (max 1000 slov)
   - Všetky čísla a parametre
   - Prirodzený, dobre štruktúrovaný text

PRAVIDLÁ:
- Buď MAXIMÁLNE detailný
- Čísla a hodnoty PRESNE ako v dokumente
- Model z priečinka MUSÍ byť v modely_domov
- Ak údaje chýbajú, vynechaj ich (nepoužívaj null)
`;

            responseSchema = {
                type: "object",
                properties: {
                    odporucana_kategoria: { 
                        type: "string",
                        enum: ["cenník", "technická_špecifikácia", "návod", "certifikát", "FAQ", "blog", "fotky", "video", "iné"]
                    },
                    extrahovaný_obsah: { type: "string" },
                    zhrnutie: { type: ["string", "null"] },
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
                required: ["odporucana_kategoria", "extrahovaný_obsah", "kľúčové_informácie"]
            };
        }

        // Zavolaj LLM s prílohou ak ide o obrázok
        const llmParams = {
            prompt: analysisPrompt,
            response_json_schema: responseSchema
        };

        if (isImage) {
            llmParams.file_urls = [dokument.subor_url];
        }

        const result = await base44.integrations.Core.InvokeLLM(llmParams);

        // Vyčisti prázdne hodnoty
        const updateData = {
            extrahovaný_obsah: result.extrahovaný_obsah,
            analyzovaný: true
        };

        if (isImage && result.vizualna_analyza) {
            // Vyčisti vizuálnu analýzu
            const cleanedVizualna = {};
            for (const [key, value] of Object.entries(result.vizualna_analyza)) {
                if (Array.isArray(value) && value.length > 0) {
                    cleanedVizualna[key] = value;
                } else if (typeof value === 'string' && value.trim() !== '') {
                    cleanedVizualna[key] = value;
                } else if (typeof value === 'object' && value !== null) {
                    const cleanedObj = {};
                    for (const [k, v] of Object.entries(value)) {
                        if (v && v !== '') cleanedObj[k] = v;
                    }
                    if (Object.keys(cleanedObj).length > 0) cleanedVizualna[key] = cleanedObj;
                }
            }
            if (Object.keys(cleanedVizualna).length > 0) {
                updateData.vizualna_analyza = cleanedVizualna;
            }
        } else {
            // Textové dokumenty
            if (result.odporucana_kategoria) {
                updateData.odporucana_kategoria = result.odporucana_kategoria;
            }

            if (result.zhrnutie) {
                updateData.zhrnutie = result.zhrnutie;
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

            // AUTOMATICKÁ AKTUALIZÁCIA ENTITY DOM
            if (dokument.model_domu && result.kľúčové_informácie) {
                try {
                    const domy = await base44.asServiceRole.entities.Dom.filter({ 
                        nazov: dokument.model_domu 
                    });

                    if (domy && domy.length > 0) {
                        const dom = domy[0];
                        const domUpdate = {};

                        const info = result.kľúčové_informácie;

                        // Aktualizuj rozmery
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

                        // Aktualizuj cenu
                        if (info.cenové_informácie && info.cenové_informácie.length > 0) {
                            const prvaInfo = info.cenové_informácie[0];
                            const match = prvaInfo.match(/(\d+[\s,]*\d*)\s*EUR/i);
                            if (match) {
                                domUpdate.zakladna_cena = parseInt(match[1].replace(/[\s,]/g, ''));
                            }
                        }

                        // Aktualizuj špecifikáciu
                        if (info.technické_údaje && info.technické_údaje.length > 0) {
                            domUpdate.specifikacia = info.technické_údaje.join('\n');
                        }

                        // Aktualizuj energetický certifikát
                        if (info.energia?.trieda) {
                            domUpdate.energeticky_certifikat = info.energia.trieda.includes('A0') || info.energia.trieda.includes('A');
                        }

                        // Urob update ak máme nejaké zmeny
                        if (Object.keys(domUpdate).length > 0) {
                            await base44.asServiceRole.entities.Dom.update(dom.id, domUpdate);
                        }
                    }
                } catch (domError) {
                    console.error('Error updating Dom entity:', domError);
                    // Nepadaj ak Dom update zlyhá
                }
            }
        }

        await base44.asServiceRole.entities.Dokument.update(document_id, updateData);

        return Response.json({
            success: true,
            analysis: result,
            type: isImage ? 'image' : 'document',
            auto_category: result.odporucana_kategoria || null,
            has_summary: !!result.zhrnutie,
            dom_updated: !!dokument.model_domu
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});