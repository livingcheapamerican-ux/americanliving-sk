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

        // Získaj dokument
        const documents = await base44.entities.Dokument.filter({ id: document_id });
        
        if (!documents || documents.length === 0) {
            return Response.json({ error: 'Document not found' }, { status: 404 });
        }
        
        const dokument = documents[0];
        
        // Načítaj obsah súboru ak je to text alebo PDF
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

        // Rozšírená analýza dokumentu pomocou AI
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
${fileContent ? `Obsah súboru: ${fileContent.substring(0, 15000)}` : ''}

ÚLOHY:

1. AUTOMATICKÁ KATEGORIZÁCIA
   - Urči najpresnejší typ dokumentu: cenník, technická_špecifikácia, návod, certifikát, FAQ, blog, fotky, alebo iné
   - Zohľadni názov súboru, cestu priečinka a obsah

2. EXTRAKCIA KĽÚČOVÝCH INFORMÁCIÍ (VEĽMI DETAILNE)
   
   A) MODELY DOMOV:
   - Extrahuj VŠETKY spomenuté modely/typy domov
   - Zahrň aj model z názvu priečinka
   - Formát: "Názov modelu" alebo "Séria - Model"
   
   B) CENOVÉ INFORMÁCIE (ak sú):
   - Extrahuj VŠETKY ceny s presným popisom
   - Formát: "Model/Položka: XXXX EUR (s/bez DPH) - popis"
   - Zahrň aj prirážky, zľavy, balíčky
   
   C) TECHNICKÉ ÚDAJE:
   - Rozmery (šírka x dĺžka x výška)
   - Plocha (úžitková, zastavaná)
   - Počet izieb/miestností
   - Konštrukcia a materiály
   - Energetická trieda
   - Izolačné hodnoty
   - Hmotnosť
   - Doprava a montáž
   - Záruky
   
   D) ROZMERY (ak sú):
   - Šírka, dĺžka, výška, plocha
   - Vo formáte s jednotkami (m, m², atď.)
   
   E) MATERIÁLY:
   - Všetky použité materiály
   - Výrobcovia/značky
   - Certifikáty
   
   F) ENERGIA (ak sú):
   - Energetická trieda (A0, A, B, atď.)
   - Spotreba energie
   - Typ vykurovania/chladenia

3. INTELIGENTNÉ ZHRNUTIE
   - Ak je dokument dlhší ako 200 slov, vytvor STRUČNÉ zhrnutie (max 150 slov)
   - Zhrnutie musí obsahovať najdôležitejšie informácie
   - Ak je dokument krátky, zhrnutie nemusí byť
   
4. EXTRAHOVANÝ OBSAH PRE CHATBOTA
   - Vytvor OPTIMALIZOVANÝ text pre chatbota (max 800 slov)
   - Pre fotky: popíš čo by mohla zobrazovať na základe názvu, priečinka a kontextu
   - Zahrň všetky dôležité detaily, čísla, technické údaje
   - Formát: prirodzený text, dobre štruktúrovaný
   - Ak je to fotka: "Fotografia: [typ fotky] domu ${dokument.model_domu || ''}, ${dokument.podpriecinok || 'zobrazenie'}. [Popis na základe kontextu]"

VÝSTUP (JSON):
Vráť JSON objekt s týmito poľami:
- odporucana_kategoria: najpresnejší typ (cenník / technická_špecifikácia / atď.)
- extrahovaný_obsah: optimalizovaný text pre chatbota (max 800 slov)
- zhrnutie: stručné zhrnutie ak dokument >200 slov, inak null
- kľúčové_informácie: {
    modely_domov: [zoznam modelov - zahrň model z priečinka],
    cenové_informácie: [detailné cenové údaje s popisom],
    technické_údaje: [všetky technické parametre],
    rozmery: {
      sirka: "X m",
      dlzka: "Y m", 
      vyska: "Z m",
      plocha: "XY m²"
    },
    materialy: [zoznam materiálov a značiek],
    energia: {
      trieda: "A0/A/B/...",
      spotreba: "XXX kWh/m²"
    },
    ostatné: [ostatné dôležité info]
  }

PRAVIDLÁ:
- Buď MAXIMÁLNE detailný pri extrakcii
- Ak niektoré údaje chýbajú, vynechaj ich (nedávaj null hodnoty)
- Čísla a hodnoty extrahuj PRESNE ako sú v dokumente
- Model domu z priečinka MUSÍ byť v modely_domov
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
                                    plocha: { type: "string" }
                                }
                            },
                            materialy: { type: "array", items: { type: "string" } },
                            energia: {
                                type: "object",
                                properties: {
                                    trieda: { type: "string" },
                                    spotreba: { type: "string" }
                                }
                            },
                            ostatné: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                required: ["odporucana_kategoria", "extrahovaný_obsah", "kľúčové_informácie"]
            }
        });

        // Vyčisti prázdne hodnoty z kľúčových informácií
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

        // Aktualizuj dokument s analyzovanými dátami
        const updateData = {
            extrahovaný_obsah: result.extrahovaný_obsah,
            kľúčové_informácie: cleanedInfo,
            odporucana_kategoria: result.odporucana_kategoria,
            analyzovaný: true
        };

        // Pridaj zhrnutie len ak existuje
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