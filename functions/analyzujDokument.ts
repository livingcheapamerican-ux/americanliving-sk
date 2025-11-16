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
        
        let fileContent = '';
        const isTextFile = dokument.typ_suboru?.includes('text') || 
                          dokument.typ_suboru?.includes('pdf') ||
                          dokument.typ_suboru?.includes('document');
        
        if (isTextFile) {
            try {
                const response = await fetch(dokument.subor_url);
                fileContent = await response.text();
            } catch (error) {
                console.error('Error fetching file content:', error);
            }
        }

        const analysisPrompt = `
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
   - Urči najpresnejší typ dokumentu: cenník, technická_špecifikácia, návod, certifikát, FAQ, blog, fotky, alebo iné
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
   - Ak dokument > 200 slov: vytvor stručné zhrnutie (max 150 slov)
   - Zhrň najdôležitejšie fakty
   
5. CHATBOT OBSAH:
   - Optimalizovaný text (max 1000 slov)
   - Pre fotky: detailný popis na základe názvu a kontextu
   - Všetky čísla a parametre
   - Prirodzený, dobre štruktúrovaný text

VÝSTUP (JSON):
{
  "odporucana_kategoria": "typ",
  "extrahovaný_obsah": "text pre chatbota",
  "zhrnutie": "stručné zhrnutie alebo null",
  "kľúčové_informácie": {
    "modely_domov": ["zoznam"],
    "cenové_informácie": ["detailné položky s cenami"],
    "technické_údaje": ["všetky parametre"],
    "rozmery": {
      "sirka": "X m",
      "dlzka": "Y m", 
      "vyska": "Z m",
      "plocha": "XY m²",
      "uzitkova_plocha": "XY m²",
      "zastavana_plocha": "XY m²"
    },
    "materialy": ["detailné materiály so značkami"],
    "energia": {
      "trieda": "A0/A/B...",
      "spotreba": "XXX kWh/m²/rok",
      "u_hodnoty": "údaje o izolácii",
      "vykurovanie": "typ systému",
      "fotovoltaika": "áno/nie, špecifikácia"
    },
    "instalácie": ["voda, elektrina, vykurovanie..."],
    "doprava_montaz": ["informácie o doprave a montáži"],
    "zaruky": ["záručné podmienky"],
    "odporucania": ["pre koho je vhodný, výhody"],
    "ostatné": ["ostatné dôležité info"]
  }
}

PRAVIDLÁ:
- Buď MAXIMÁLNE detailný
- Čísla a hodnoty PRESNE ako v dokumente
- Model z priečinka MUSÍ byť v modely_domov
- Ak údaje chýbajú, vynechaj ich
- Nepoužívaj null hodnoty, iba reálne dáta
`;
        
        const result = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    odporucana_kategoria: { 
                        type: "string",
                        enum: ["cenník", "technická_špecifikácia", "návod", "certifikát", "FAQ", "blog", "fotky", "iné"]
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
            }
        });

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

        const updateData = {
            extrahovaný_obsah: result.extrahovaný_obsah,
            kľúčové_informácie: cleanedInfo,
            odporucana_kategoria: result.odporucana_kategoria,
            analyzovaný: true
        };

        if (result.zhrnutie) {
            updateData.zhrnutie = result.zhrnutie;
        }

        await base44.asServiceRole.entities.Dokument.update(document_id, updateData);

        return Response.json({
            success: true,
            analysis: result,
            auto_category: result.odporucana_kategoria,
            has_summary: !!result.zhrnutie
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});