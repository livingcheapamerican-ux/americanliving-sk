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
            analysisPrompt = `KOMPLEXNÁ VIZUÁLNA ANALÝZA MODULÁRNEHO DOMU - VŠETKY KRITÉRIÁ

════════════════════════════════════════════════════════════════
KONTEXT DOKUMENTU:
- Názov súboru: ${dok.nazov}
- Aktuálny výrobca: ${dok.vyrobca}
- Aktuálny model: ${dok.model_domu || 'neurčený'}
- Podpriečinok: ${dok.podpriecinok || 'neurčený'}
════════════════════════════════════════════════════════════════

HLAVNÁ ÚLOHA: Analyzuj VŠETKY aspekty obrázka podľa nižšie uvedených kritérií.

════════════════════════════════════════════════════════════════
1️⃣ ZÁKLADNÁ IDENTIFIKÁCIA (POVINNÉ):
════════════════════════════════════════════════════════════════

A) Urči SPRÁVNEHO výrobcu:
   - JAK Modules (pozor na logo, dizajn, typické pre nich)
   - Ticab house (ich charakteristický dizajn)
   - Prosto House (ich štýl)
   - Domki z Gór (poľský výrobca)

B) Urči PRESNÝ model domu:
   - Názov modelu (napr. "Modul 50", "70 Barcelona", "Capri 51")
   - Hľadaj v texte, na fasáde, v kontexte

C) Typ obsahu:
   - exterier (vonkajší pohľad na dom)
   - interier (vnútorné priestory)
   - podorys (plán rozloženia miestností)
   - ine (ostatné)

════════════════════════════════════════════════════════════════
2️⃣ AK JE TYP = EXTERIER - FASÁDA (detailne):
════════════════════════════════════════════════════════════════

A) MATERIÁLY FASÁDY (zoznam):
   - drevo, omietka, obklad, sklo, kov, panel, composite, cement, tehla
   - Uveď VŠETKY viditeľné materiály

B) FARBY FASÁDY (zoznam):
   - biela, sivá, hnedá, čierna, prírodná, tmavá, svetlá
   - Uveď VŠETKY dominantné farby

C) TYPY DREVÍN (ak je drevo):
   - smrek, borovica, céder, dub, modřín, thermowood
   - Len ak je viditeľné drevo na fasáde

D) POVRCHOVÉ ÚPRAVY:
   - matná, lesklá, štrukturovaná, hladká, hrubá, natieraná

════════════════════════════════════════════════════════════════
3️⃣ AK JE TYP = EXTERIER - DETAILY:
════════════════════════════════════════════════════════════════

A) OKNÁ:
   - Typ: plastové / drevené / hliníkové / drevo-hliníkové
   - Farba rámov: biela / čierna / hnedá / sivá / antracit

B) DVERE:
   - Typ: vstupné / posuvné / francúzske / presklené
   - Farba: biela / čierna / hnedá / sivá / prírodná

C) STRECHA:
   - Typ: sedlová / pultová / plochá / valbová
   - Materiál: plechová / škridla / šindel / bitumen
   - Farba: čierna / hnedá / sivá / červená / zelená

D) TERASA/BALKÓN:
   - Materiál: drevo / kompozit / kameň / betón
   - Prítomnosť: áno / nie

E) OKOLIE A TERÉN:
   - Typ terénu: rovný / svah / kopec / les
   - Okolie: lúka / les / mesto / dedina / jazero

F) SLNEČNÁ EXPOZÍCIA:
   - juh / sever / východ / západ / neurčená
   - Na základe tieňov a osvetlenia

════════════════════════════════════════════════════════════════
4️⃣ AK JE TYP = INTERIER:
════════════════════════════════════════════════════════════════

A) MATERIÁLY (zoznam):
   - Podlahy: parkety / laminát / dlažba / vinyl / koberec
   - Steny: sadrokartón / drevo / omietka / tapeta / obklad
   - Stropy: sadrokartón / drevo / napínané

B) ŠTÝL:
   - moderný / rustikálny / minimalistický / škandinávsky / industriálny / klasický

C) FARBY (zoznam):
   - Dominantné farby interiéru

D) MIESTNOSŤ:
   - obývačka / kuchyňa / spálňa / kúpeľňa / chodba / WC

════════════════════════════════════════════════════════════════
5️⃣ AK JE TYP = PODORYS:
════════════════════════════════════════════════════════════════

A) Je to pôdorys? (áno/nie)

B) Ak ÁNO, extrahuj:
   - Počet izieb (číslo)
   - Celková plocha (m²)
   - Rozmery: dĺžka x šírka (m)
   - Zoznam miestností s rozmermi
   - Úžitková plocha
   - Terasa/balkón plocha

════════════════════════════════════════════════════════════════
6️⃣ AI GENEROVANIE (POVINNÉ PRE VŠETKY):
════════════════════════════════════════════════════════════════

A) EXTRAHOVANÝ OBSAH (300-400 slov):
   - Detailný popis pre AI chatbot
   - Čo sa nachádza na obrázku
   - Kľúčové vlastnosti
   - Technické detaily
   - MUSÍ obsahovať dostatok informácií pre chatbot

B) AI GENEROVANÝ POPIS (50-80 slov):
   - Krátky ale výstižný popis
   - Pre zobrazenie v katalógu

C) AI GENEROVANÉ TAGY (10-15 tagov):
   - Kľúčové slová a frázy
   - Zahrnúť: výrobca, model, typ, materiály, farby, štýl

D) TECHNICKÁ ANALÝZA (200-300 slov):
   - Čo PRESNE vidíš na obrázku
   - Architektonické detaily
   - Konštrukčné prvky
   - Estetické prvky
   - Technické špecifikácie ktoré je možné odhadnúť

════════════════════════════════════════════════════════════════
DÔLEŽITÉ POZNÁMKY:
════════════════════════════════════════════════════════════════
- Buď PRESNÝ a DETAILNÝ
- Neodhadzuj prázdne polia - radšej nezaplň ako hádzať
- Ak niečo NEVIDÍŠ alebo si NEISTÝ, použi null/[]
- VŽDY vyplň required polia
- Tagy musia byť v slovenčine
- Technická analýza musí byť DETAILNÁ

VÝSTUP MÁ BYŤ V SLOVENČINE!`;

            responseSchema = {
                type: "object",
                properties: {
                    extrahovaný_obsah: { 
                        type: "string",
                        description: "Detailný popis pre chatbot, 300-400 slov, SLOVENSKY"
                    },
                    ai_generovany_popis: { 
                        type: "string",
                        description: "Krátky popis 50-80 slov, SLOVENSKY"
                    },
                    ai_generovane_tagy: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "10-15 relevantných tagov v SLOVENČINE"
                    },
                    vizualna_analyza: {
                        type: "object",
                        properties: {
                            // ZÁKLADNÁ IDENTIFIKÁCIA
                            spravny_vyrobca: { 
                                type: "string",
                                enum: ["JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"],
                                description: "KRITICKÉ: Správny výrobca podľa vizuálnej analýzy"
                            },
                            spravny_model: { 
                                type: "string",
                                description: "KRITICKÉ: Presný názov modelu"
                            },
                            typ_obsahu: { 
                                type: "string",
                                enum: ["exterier", "interier", "podorys", "ine"],
                                description: "KRITICKÉ: Typ obsahu"
                            },
                            
                            // FASÁDA - MATERIÁLY
                            fasada_materialy: { 
                                type: "array", 
                                items: { type: "string" },
                                description: "VŠETKY viditeľné materiály fasády"
                            },
                            fasada_farby: { 
                                type: "array", 
                                items: { type: "string" },
                                description: "VŠETKY dominantné farby fasády"
                            },
                            fasada_typy_drevin: {
                                type: "array",
                                items: { type: "string" },
                                description: "Typy drevín ak je drevo viditeľné"
                            },
                            fasada_povrchove_upravy: {
                                type: "array",
                                items: { type: "string" },
                                description: "Povrchové úpravy fasády"
                            },
                            
                            // EXTERIER DETAILY
                            okna_typ: { 
                                type: "string",
                                description: "Typ okien: plastové/drevené/hliníkové/drevo-hliníkové"
                            },
                            okna_farba: { 
                                type: "string",
                                description: "Farba rámov okien"
                            },
                            dvere_typ: { 
                                type: "string",
                                description: "Typ dverí: vstupné/posuvné/francúzske/presklené"
                            },
                            dvere_farba: { 
                                type: "string",
                                description: "Farba dverí"
                            },
                            strecha_typ: { 
                                type: "string",
                                description: "Typ strechy: sedlová/pultová/plochá/valbová"
                            },
                            strecha_material: { 
                                type: "string",
                                description: "Materiál strechy: plechová/škridla/šindel/bitumen"
                            },
                            strecha_farba: { 
                                type: "string",
                                description: "Farba strechy"
                            },
                            
                            // OKOLIE
                            slnecna_expoziacia: {
                                type: "string",
                                description: "Slnečná expozícia podľa tieňov: juh/sever/východ/západ"
                            },
                            teren_okolie: {
                                type: "object",
                                properties: {
                                    typ_terenu: { 
                                        type: "string",
                                        description: "rovný/svah/kopec/les"
                                    },
                                    okolie: { 
                                        type: "array", 
                                        items: { type: "string" },
                                        description: "lúka/les/mesto/dedina/jazero/..."
                                    }
                                }
                            },
                            
                            // INTERIER
                            interier_materialy: {
                                type: "array",
                                items: { type: "string" },
                                description: "Materiály interiéru: podlahy, steny, stropy"
                            },
                            styl: { 
                                type: "string",
                                description: "Architektonický štýl"
                            },
                            farby: { 
                                type: "array", 
                                items: { type: "string" },
                                description: "Dominantné farby"
                            },
                            
                            // PÔDORYS
                            podorys_analyza: {
                                type: "object",
                                properties: {
                                    je_podorys: { 
                                        type: "boolean",
                                        description: "Je to pôdorys?"
                                    },
                                    pocet_izieb: { 
                                        type: "number",
                                        description: "Počet izieb ak je pôdorys"
                                    },
                                    uzitkova_plocha: { 
                                        type: "string",
                                        description: "Úžitková plocha napr. '65 m²'"
                                    },
                                    celkove_rozmery: {
                                        type: "object",
                                        properties: {
                                            sirka: { type: "string", description: "napr. '8 m'" },
                                            dlzka: { type: "string", description: "napr. '12 m'" },
                                            zastavana_plocha: { type: "string", description: "napr. '96 m²'" }
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
                                        },
                                        description: "Zoznam miestností s rozmermi"
                                    },
                                    terasa_balkon: {
                                        type: "string",
                                        description: "Plocha terasy/balkónu"
                                    }
                                }
                            },
                            
                            // TECHNICKÁ ANALÝZA
                            technicka_analyza: { 
                                type: "string",
                                description: "DETAILNÝ technický popis 200-300 slov - ČO PRESNE VIDÍŠ, architektonické prvky, konštrukcia, materiály, detaily"
                            }
                        },
                        required: ["spravny_vyrobca", "spravny_model", "typ_obsahu", "technicka_analyza"]
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
            // Pre PDF a dokumenty - zachované z pôvodnej verzie
            let fileContent = '';
            try {
                const response = await fetch(dok.subor_url);
                const text = await response.text();
                fileContent = text.substring(0, 30000);
            } catch (e) {
                console.error('Fetch error:', e);
                fileContent = '';
            }

            analysisPrompt = `SMART ANALÝZA A EXTRAKCIA DÁT Z DOKUMENTU

DOKUMENT:
- Názov: ${dok.nazov}
- Aktuálny typ: ${dok.typ}
- Výrobca: ${dok.vyrobca}
- Obsah: ${fileContent}

Analyzuj a extrahuj kľúčové informácie vrátane typu dokumentu, dát, cien, technických údajov.`;

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
                            modely_domov: { type: "array", items: { type: "string" } },
                            cenové_informácie: { type: "array", items: { type: "string" } },
                            technické_údaje: { type: "array", items: { type: "string" } }
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
            analyzed: true,
            data: result
        });

    } catch (error) {
        console.error('❌ Analysis error:', error);
        
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