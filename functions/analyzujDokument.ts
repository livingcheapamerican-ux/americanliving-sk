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
            analysisPrompt = `DETAILNÁ VIZUÁLNA ANALÝZA OBRÁZKA MODULÁRNEHO DOMU

KONTEXT DOKUMENTU:
- Názov súboru: ${dok.nazov}
- Aktuálny výrobca: ${dok.vyrobca}
- Aktuálny model: ${dok.model_domu || 'neurčený'}
- Podpriečinok: ${dok.podpriecinok || 'neurčený'}

ÚLOHA 1 - IDENTIFIKÁCIA (KRITICKÉ):
Urči SPRÁVNEHO výrobcu a PRESNÝ model z obrázka:
- Výrobca: JAK Modules | Ticab house | Prosto House | Domki z Gór
- Model: presný názov (napr. "Modul 50", "70 Barcelona", "Capri 51")
- Typ obsahu: exterier | interier | podorys | ine

ÚLOHA 2 - EXTERIER (ak typ=exterier):
Fasáda:
- Materiály: [drevo, omietka, obklad, sklo, kov, panel, ...]
- Farby: [biela, sivá, hnedá, čierna, prírodná, ...]
- Typ drevin (ak drevo): [smrek, borovica, céder, ...]
- Povrchové úpravy: [matná, lesklá, štrukturovaná, ...]

Detaily:
- Okná: typ, farba rámov
- Dvere: typ, farba
- Strecha: typ, materiál, farba, sklon
- Terasa/balkón: áno/nie, materiál
- Okolie: typ terénu, vegetácia

ÚLOHA 3 - INTERIER (ak typ=interier):
- Materiály: podlahy, steny, stropy
- Štýl: moderný, rustikálny, minimalistický, ...
- Farby: dominantné farby
- Miestnosť: obývačka, kuchyňa, spálňa, ...
- Vybavenie: áno/nie

ÚLOHA 4 - PÔDORYS (ak typ=podorys):
- Je to pôdorys: áno/nie
- Počet izieb: číslo
- Celková plocha: m²
- Rozmery: dĺžka x šírka
- Miestnosti: zoznam s rozmermi

ÚLOHA 5 - AI GENEROVANIE:
- Popis pre chatbot (150-200 slov, slovensky)
- Tagy (8-12 kľúčových slov)
- Technická analýza (čo všetko vidíš na obrázku)`;

            responseSchema = {
                type: "object",
                properties: {
                    extrahovaný_obsah: { 
                        type: "string",
                        description: "Detailný popis pre chatbot, 150-200 slov"
                    },
                    ai_generovany_popis: { 
                        type: "string",
                        description: "Krátky popis 2-3 vety"
                    },
                    ai_generovane_tagy: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "8-12 relevantných tagov"
                    },
                    vizualna_analyza: {
                        type: "object",
                        properties: {
                            spravny_vyrobca: { 
                                type: "string",
                                enum: ["JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"]
                            },
                            spravny_model: { type: "string" },
                            typ_obsahu: { 
                                type: "string",
                                enum: ["exterier", "interier", "podorys", "ine"]
                            },
                            fasada_materialy: { 
                                type: "array", 
                                items: { type: "string" }
                            },
                            fasada_farby: { 
                                type: "array", 
                                items: { type: "string" }
                            },
                            fasada_typy_drevin: {
                                type: "array",
                                items: { type: "string" }
                            },
                            fasada_povrchove_upravy: {
                                type: "array",
                                items: { type: "string" }
                            },
                            okna_typ: { type: "string" },
                            okna_farba: { type: "string" },
                            dvere_typ: { type: "string" },
                            dvere_farba: { type: "string" },
                            strecha_typ: { type: "string" },
                            strecha_material: { type: "string" },
                            strecha_farba: { type: "string" },
                            interier_materialy: {
                                type: "array",
                                items: { type: "string" }
                            },
                            podorys_analyza: {
                                type: "object",
                                properties: {
                                    je_podorys: { type: "boolean" },
                                    pocet_izieb: { type: "number" },
                                    uzitkova_plocha: { type: "string" },
                                    celkove_rozmery: {
                                        type: "object",
                                        properties: {
                                            sirka: { type: "string" },
                                            dlzka: { type: "string" }
                                        }
                                    },
                                    miestnosti: {
                                        type: "array",
                                        items: { type: "string" }
                                    }
                                }
                            },
                            technicka_analyza: { 
                                type: "string",
                                description: "Detailný technický popis toho čo vidíš"
                            },
                            styl: { type: "string" },
                            farby: { type: "array", items: { type: "string" } }
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
            // Pre PDF a dokumenty
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

══════════════════════════════════════════════
DOKUMENT:
- Názov: ${dok.nazov}
- Aktuálny typ: ${dok.typ}
- Výrobca: ${dok.vyrobca}
- Obsah (prvých 30000 znakov):

${fileContent}
══════════════════════════════════════════════

ÚLOHA 1 - PRESNÁ DETEKCIA TYPU:

Analyzuj obsah a urči PRESNÝ typ dokumentu:

A) **zmluva** - ak obsahuje:
   ✓ Slová: "zmluva", "zmluvné strany", "článok", "bod"
   ✓ Právne formulácie
   ✓ Podpisy, pečiatky
   ✓ Identifikácia zmluvných strán

B) **faktúra** - ak obsahuje:
   ✓ Slová: "faktúra", "invoice", "fa", "daňový doklad"
   ✓ VS (variabilný symbol)
   ✓ Suma, DPH, splatnosť
   ✓ Dodávateľ, odberateľ
   ✓ Položky s cenami

C) **ponuka** - ak obsahuje:
   ✓ Slová: "cenová ponuka", "ponúkame", "cena"
   ✓ Zoznam produktov/služieb s cenami
   ✓ Platnosť ponuky
   ✓ Podmienky

D) **objednávka** - ak obsahuje:
   ✓ Slová: "objednávka", "objednávam"
   ✓ Zoznam objednaných položiek
   ✓ Množstvá, ceny
   ✓ Termín dodania

E) **cenník** - systematický zoznam cien

F) **technická_špecifikácia** - technické parametre, normy

G) **návod** - postup, kroky, inštrukcie

H) **certifikát** - osvedčenie, certifikát kvality

I) **FAQ** - často kladené otázky

J) **blog** - článok, blog post

K) **iné** - ak nepadá do vyššie uvedených

══════════════════════════════════════════════
ÚLOHA 2 - EXTRAKCIA KĽÚČOVÝCH DÁT:

PRE ZMLUVU extrahuj:
- cislo_zmluvy: "2024/123" (presný formát)
- datum_podpisu: "2024-11-17" (ISO formát)
- zmluvne_strany: ["Firma A, s.r.o., IČO: 12345678", "Firma B, a.s., IČO: 87654321"]
- predmet_zmluvy: "stručný popis čo je predmetom zmluvy"
- platnost_od: "2024-11-17"
- platnost_do: "2025-11-17" (alebo null)

PRE FAKTÚRU extrahuj:
- cislo_faktury: "2024001234" (presné číslo)
- datum_vystavenia: "2024-11-17"
- datum_splatnosti: "2024-12-17"
- dodavatel: "Názov firmy dodávateľa, IČO"
- odberatel: "Názov firmy odberateľa, IČO"
- suma_bez_dph: "1000.00 EUR"
- dph: "200.00 EUR (20%)"
- suma_s_dph: "1200.00 EUR"
- polozky: ["Položka 1: 500 EUR", "Položka 2: 500 EUR"]

PRE PONUKU extrahuj:
- cislo_ponuky: "P-2024-001"
- datum_ponuky: "2024-11-17"
- platnost_do: "2024-12-17"
- ponukane_produkty: ["Produkt A", "Produkt B", "Služba X"]
- celkova_cena: "5000.00 EUR s DPH"

PRE OBJEDNÁVKU extrahuj:
- cislo_objednavky: "OBJ-2024-001"
- datum_objednavky: "2024-11-17"
- pozadovany_termin: "2024-12-01"
- objednavatel: "Názov firmy"
- objednane_polozky: ["Položka A: 10 ks", "Položka B: 5 ks"]
- celkova_suma: "3000.00 EUR"

PRE VŠETKY TYPY:
- modely_domov: ["všetky zmienené modely domov"]
- cenové_informácie: ["všetky zmienené ceny"]
- technické_údaje: ["všetky technické parametre"]

══════════════════════════════════════════════
ÚLOHA 3 - AI GENEROVANIE:

1. extrahovaný_obsah: Optimalizovaný text pre AI chatbot (300-500 slov)
   - Súhrn dokumentu
   - Kľúčové informácie
   - Dôležité body
   
2. ai_generovany_popis: Krátky popis (2-3 vety)

3. ai_generovane_tagy: 10-15 kľúčových slov/fráz

4. zhrnutie: Ak dokument > 1000 slov, vytvor zhrnutie

══════════════════════════════════════════════
POZNÁMKY:
- Buď PRESNÝ pri extrakcii čísel, dátumov a súm
- Zachovaj formát čísel a mien
- Extrahuj IČO, DIČ ak sú dostupné
- Pri neurčitých dátach použi null
- Všetky sumy uvádzaj s menou (EUR, CZK, ...)`;

            responseSchema = {
                type: "object",
                properties: {
                    odporucana_kategoria: { 
                        type: "string",
                        enum: ["cenník", "technická_špecifikácia", "návod", "certifikát", "FAQ", "blog", "zmluva", "faktúra", "ponuka", "objednávka", "iné"]
                    },
                    extrahovaný_obsah: { 
                        type: "string",
                        description: "Optimalizovaný text pre chatbot, 300-500 slov"
                    },
                    ai_generovany_popis: { 
                        type: "string",
                        description: "Krátky popis 2-3 vety"
                    },
                    ai_generovane_tagy: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "10-15 relevantných tagov"
                    },
                    zhrnutie: { 
                        type: "string",
                        description: "Zhrnutie ak dokument dlhší ako 1000 slov"
                    },
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
                            modely_domov: { 
                                type: "array", 
                                items: { type: "string" },
                                description: "Všetky zmienené modely domov"
                            },
                            cenové_informácie: { 
                                type: "array", 
                                items: { type: "string" },
                                description: "Všetky zmienené ceny"
                            },
                            technické_údaje: {
                                type: "array",
                                items: { type: "string" },
                                description: "Technické parametre"
                            },
                            rozmery: {
                                type: "object",
                                properties: {
                                    sirka: { type: "string" },
                                    dlzka: { type: "string" },
                                    vyska: { type: "string" },
                                    plocha: { type: "string" }
                                }
                            }
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