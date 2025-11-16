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
Analyzuj MAXIMÁLNE DETAILNE túto fotografiu/obrázok modulárneho domu.

DOKUMENT:
Názov súboru: ${dokument.nazov}
Výrobca: ${dokument.vyrobca}
${dokument.model_domu ? `Model (z priečinka): ${dokument.model_domu}` : ''}
${dokument.podpriecinok ? `Kategória: ${dokument.podpriecinok}` : ''}
${dokument.cesta_priecinku ? `Cesta: ${dokument.cesta_priecinku}` : ''}

ÚLOHY ANALÝZY:

1. IDENTIFIKÁCIA TYPU OBSAHU:
   Urči či je to:
   - EXTERIÉR domu (vonkajší pohľad)
   - INTERIÉR domu (vnútorné priestory)
   - PÔDORYS (technický výkres, blueprint)
   - INÉ (grafika, diagram, atď.)

2. AK JE TO PÔDORYS (technický výkres):
   KRITICKÉ: Toto je najdôležitejšia časť! Podrobne analyzuj:
   
   A) IDENTIFIKÁCIA MODELU:
   - Zisti model domu z názvu súboru alebo priečinka
   - Hľadaj čísla, písmená, kódy (napr. "A1", "Modul 50", "Dom 123")
   
   B) CELKOVÉ ROZMERY:
   - Šírka domu (m) - číselná hodnota z pôdorysu
   - Dĺžka domu (m) - číselná hodnota z pôdorysu
   - Vypočítaj ZASTAVANÁ PLOCHA = šírka × dĺžka (m²)
   
   C) MIESTNOSTI - pre KAŽDÚ miestnosť urči:
   - Názov (obývačka, spálňa, kuchyňa, kúpeľňa, chodba, atď.)
   - Rozmery (napr. "3.5 × 4.2 m")
   - Plocha jednotlivej miestnosti (m²)
   
   D) UŽITKOVÁ PLOCHA:
   - Spočítaj plochu všetkých obytných miestností
   - Nezapočítavaj terasy, balkóny, technické miestnosti
   
   E) VONKAJŠIE PRIESTORY:
   - Terasa/balkón - rozmery a plocha ak sú
   
   F) POČET IZIEB:
   - Spočítaj spálne, obývacie izby (nie kúpeľne, chodby, WC)
   
   BUĎTE MAXIMÁLNE PRESNÝ S ČÍSLAMI!

3. AK JE TO EXTERIÉR:
   
   A) FASÁDA:
   - Typ fasády: klasická biela omietka, drevený obklad, antracitový plech, sivý plech, kombinovaná fasáda, sklenená, kamenný obklad, atď.
   - Farba fasády presne
   - Materiály fasády viditeľné na fotografii
   
   B) STREŠNÁ KRYTINA:
   - Typ: plechová krytina, betónové škridly, keramické škridly, bridlica, plochá strecha, zelená strecha, atď.
   - Farba strechy
   - Tvar strechy (sedlová, pultová, valbová, plochá)
   
   C) SLNEČNÁ EXPOZÍCIA:
   - Odhad orientácie domu: južná, severná, východná, západná, juhovýchodná, juhozápadná, severovýchodná, severozápadná
   - Ak nie je možné určiť, uveď "neidentifikovateľná"
   - Zdôvodni odhad (tiene, osvetlenie, vegetácia, atď.)
   
   D) TERÉN A OKOLIE:
   - Typ terénu: rovina, mierny svah, strmý svah, kopec
   - Okolie: les, lúka, pole, vodná plocha, jazero, rieka, záhrada, mestská zástavba, dedina, izolovaná poloha, atď.
   
   E) DETAILY:
   - Typ okien, dverí
   - Terasa, balkón, veranda
   - Oplotenie, plot
   - Vstup, prístupová cesta
   - Osvetlenie
   - Okolité stromy, vegetácia

4. AK JE TO INTERIÉR:
   
   A) MATERIÁLY:
   - Steny: drevo (aký typ - smrek, borovica, dub), sádrokarton, maľovaná omietka, obklad, tapeta, atď.
   - Podlaha: drevo, laminát, dlažba, vinyl, koberec, atď.
   - Strop: drevo, sádrokarton, napnutý, kazetový, atď.
   
   B) PRIESTOR:
   - Typ miestnosti: obývačka, kuchyňa, spálňa, kúpeľňa, chodba, atď.
   - Štýl zariadenia

5. VŠEOBECNÉ (pre exteriér aj interiér):
   - Architektonický ŠTÝL: moderný, tradičný, minimalistický, škandinávsky, industriálny, rustikálny, atď.
   - DOMINANTNÉ FARBY (3-5 hlavných farieb) - buď presný
   - TECHNICKÉ DETAILY viditeľné na fotografii

6. VIZUÁLNE ODPORÚČANIA:
   Navrhni 3-5 konkrétnych vylepšení:
   - Pre exteriér: zmena fasády, úprava strechy, osadenie zelene, moderné osvetlenie, atď.
   - Pre interiér: zmena materiálov, farebné riešenia, priestorové úpravy, atď.
   - Každé odporúčanie má byť konkrétne a realizovateľné

7. DETAILNÝ POPIS pre chatbota:
   - 200-300 slov
   - Profesionálny opis pre potenciálneho zákazníka
   - Všetky technické detaily
   - Zvýrazni výhody

Buď MAXIMÁLNE DETAILNÝ, PRESNÝ a KONKRÉTNY!
`;

            responseSchema = {
                type: "object",
                properties: {
                    extrahovaný_obsah: { type: "string" },
                    vizualna_analyza: {
                        type: "object",
                        properties: {
                            typ_obsahu: { 
                                type: "string",
                                enum: ["exterier", "interier", "podorys", "ine"]
                            },
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
                        if (Array.isArray(v) && v.length > 0) {
                            cleanedObj[k] = v;
                        } else if (typeof v === 'string' && v.trim() !== '') {
                            cleanedObj[k] = v;
                        } else if (typeof v === 'number') {
                            cleanedObj[k] = v;
                        } else if (typeof v === 'boolean') {
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

            // AUTOMATICKÁ AKTUALIZÁCIA ENTITY DOM Z PÔDORYSOV
            if (dokument.model_domu && result.vizualna_analyza?.podorys_analyza?.je_podorys) {
                try {
                    const podorys = result.vizualna_analyza.podorys_analyza;
                    const domy = await base44.asServiceRole.entities.Dom.filter({ 
                        nazov: dokument.model_domu 
                    });

                    if (domy && domy.length > 0) {
                        const dom = domy[0];
                        const domUpdate = {};

                        // Aktualizuj rozmery z pôdorysu
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

                        if (podorys.pocet_izieb) {
                            domUpdate.pocet_izieb = podorys.pocet_izieb;
                        }

                        // Urob update ak máme nejaké zmeny
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

            // AUTOMATICKÁ AKTUALIZÁCIA ENTITY DOM Z TEXTOVÝCH DOKUMENTOV
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
            dom_updated: !!dokument.model_domu,
            has_podorys: !!(isImage && result.vizualna_analyza?.podorys_analyza?.je_podorys)
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});