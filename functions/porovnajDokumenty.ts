import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { document_id1, document_id2, threshold } = await req.json();
        
        if (!document_id1 || !document_id2) {
            return Response.json({ error: 'Missing document IDs' }, { status: 400 });
        }

        // Načítaj dokumenty
        const docs = await base44.entities.Dokument.filter({
            id: { $in: [document_id1, document_id2] }
        });

        if (!docs || docs.length !== 2) {
            return Response.json({ error: 'One or both documents not found' }, { status: 404 });
        }

        const doc1 = docs.find(d => d.id === document_id1);
        const doc2 = docs.find(d => d.id === document_id2);

        // Rýchle porovnanie pomocou hash
        let hashSimilarity = 0;
        if (doc1.podobnost_hash && doc2.podobnost_hash) {
            const hash1 = doc1.podobnost_hash;
            const hash2 = doc2.podobnost_hash;
            let matches = 0;
            for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
                if (hash1[i] === hash2[i]) matches++;
            }
            hashSimilarity = matches / Math.min(hash1.length, hash2.length);
        }

        // Porovnanie tagov
        const tags1 = [...(doc1.tags || []), ...(doc1.ai_generovane_tagy || [])];
        const tags2 = [...(doc2.tags || []), ...(doc2.ai_generovane_tagy || [])];
        const commonTags = tags1.filter(tag => tags2.includes(tag));
        const tagSimilarity = tags1.length > 0 && tags2.length > 0 
            ? commonTags.length / Math.max(tags1.length, tags2.length)
            : 0;

        // Porovnanie typu a metadát
        const sameType = doc1.typ === doc2.typ ? 1 : 0;
        const sameManufacturer = doc1.vyrobca === doc2.vyrobca ? 1 : 0;
        const sameModel = doc1.model_domu === doc2.model_domu ? 1 : 0;

        // Špeciálne porovnanie pre faktúry, zmluvy, ponuky
        let structuredSimilarity = 0;
        let structuredComparison = null;

        if (doc1.kľúčové_informácie && doc2.kľúčové_informácie) {
            const info1 = doc1.kľúčové_informácie;
            const info2 = doc2.kľúčové_informácie;

            // Faktúry
            if (info1.faktura_info && info2.faktura_info) {
                const f1 = info1.faktura_info;
                const f2 = info2.faktura_info;
                let score = 0;
                let total = 0;

                if (f1.cislo_faktury && f2.cislo_faktury) {
                    total++;
                    if (f1.cislo_faktury === f2.cislo_faktury) score++;
                }
                if (f1.dodavatel && f2.dodavatel) {
                    total++;
                    if (f1.dodavatel === f2.dodavatel) score++;
                }
                if (f1.suma_s_dph && f2.suma_s_dph) {
                    total++;
                    if (f1.suma_s_dph === f2.suma_s_dph) score++;
                }

                structuredSimilarity = total > 0 ? score / total : 0;
                structuredComparison = {
                    type: 'faktura',
                    same_number: f1.cislo_faktury === f2.cislo_faktury,
                    same_supplier: f1.dodavatel === f2.dodavatel,
                    same_amount: f1.suma_s_dph === f2.suma_s_dph
                };
            }

            // Zmluvy
            if (info1.zmluva_info && info2.zmluva_info) {
                const z1 = info1.zmluva_info;
                const z2 = info2.zmluva_info;
                let score = 0;
                let total = 0;

                if (z1.cislo_zmluvy && z2.cislo_zmluvy) {
                    total++;
                    if (z1.cislo_zmluvy === z2.cislo_zmluvy) score++;
                }
                if (z1.predmet_zmluvy && z2.predmet_zmluvy) {
                    total++;
                    if (z1.predmet_zmluvy === z2.predmet_zmluvy) score++;
                }

                structuredSimilarity = total > 0 ? score / total : 0;
                structuredComparison = {
                    type: 'zmluva',
                    same_number: z1.cislo_zmluvy === z2.cislo_zmluvy,
                    same_subject: z1.predmet_zmluvy === z2.predmet_zmluvy
                };
            }

            // Ponuky
            if (info1.ponuka_info && info2.ponuka_info) {
                const p1 = info1.ponuka_info;
                const p2 = info2.ponuka_info;
                let score = 0;
                let total = 0;

                if (p1.cislo_ponuky && p2.cislo_ponuky) {
                    total++;
                    if (p1.cislo_ponuky === p2.cislo_ponuky) score++;
                }
                if (p1.celkova_cena && p2.celkova_cena) {
                    total++;
                    if (p1.celkova_cena === p2.celkova_cena) score++;
                }

                structuredSimilarity = total > 0 ? score / total : 0;
                structuredComparison = {
                    type: 'ponuka',
                    same_number: p1.cislo_ponuky === p2.cislo_ponuky,
                    same_price: p1.celkova_cena === p2.celkova_cena
                };
            }
        }

        // AI sémantické porovnanie
        let semanticSimilarity = 0;
        let aiAnalysis = null;
        
        if (doc1.extrahovaný_obsah && doc2.extrahovaný_obsah) {
            const prompt = `
Porovnaj tieto dva dokumenty a urči ich sémantickú podobnosť:

DOKUMENT 1:
Názov: ${doc1.nazov}
Typ: ${doc1.typ}
${doc1.ai_generovany_popis || ''}
Obsah: ${doc1.extrahovaný_obsah.substring(0, 2000)}

DOKUMENT 2:
Názov: ${doc2.nazov}
Typ: ${doc2.typ}
${doc2.ai_generovany_popis || ''}
Obsah: ${doc2.extrahovaný_obsah.substring(0, 2000)}

Urči:
1. Percentuálna podobnosť (0-100)
2. Spoločné témy
3. Hlavné rozdiely
4. Kľúčové zistenia
5. Odporúčanie (duplicitné, podobné, príbuzné, alebo odlišné)

Výstup v JSON.
`;

            const result = await base44.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        podobnost_percent: { type: "number" },
                        spolocne_temy: { type: "array", items: { type: "string" } },
                        hlavne_rozdiely: { type: "array", items: { type: "string" } },
                        klucove_zistenia: { type: "array", items: { type: "string" } },
                        odporucanie: { type: "string" }
                    },
                    required: ["podobnost_percent", "odporucanie"]
                }
            });

            semanticSimilarity = result.podobnost_percent / 100;
            aiAnalysis = result;
        }

        // Celková podobnosť (vážený priemer)
        const weights = {
            hash: 0.15,
            tags: 0.2,
            type: 0.1,
            manufacturer: 0.05,
            model: 0.05,
            structured: 0.25,
            semantic: 0.2
        };

        const totalSimilarity = (
            hashSimilarity * weights.hash +
            tagSimilarity * weights.tags +
            sameType * weights.type +
            sameManufacturer * weights.manufacturer +
            sameModel * weights.model +
            structuredSimilarity * weights.structured +
            semanticSimilarity * weights.semantic
        );

        const response = {
            document1: {
                id: doc1.id,
                nazov: doc1.nazov,
                typ: doc1.typ,
                vyrobca: doc1.vyrobca,
                model_domu: doc1.model_domu
            },
            document2: {
                id: doc2.id,
                nazov: doc2.nazov,
                typ: doc2.typ,
                vyrobca: doc2.vyrobca,
                model_domu: doc2.model_domu
            },
            similarity: {
                total: Math.round(totalSimilarity * 100),
                hash: Math.round(hashSimilarity * 100),
                tags: Math.round(tagSimilarity * 100),
                semantic: Math.round(semanticSimilarity * 100),
                structured: Math.round(structuredSimilarity * 100),
                same_type: sameType === 1,
                same_manufacturer: sameManufacturer === 1,
                same_model: sameModel === 1
            },
            common_tags: commonTags,
            structured_comparison: structuredComparison,
            ai_analysis: aiAnalysis,
            is_similar: totalSimilarity >= (threshold || 0.7),
            recommendation: totalSimilarity > 0.95 ? "⚠️ Dokumenty sú takmer identické - pravdepodobná duplicita" :
                           totalSimilarity > 0.8 ? "🔍 Dokumenty sú veľmi podobné - skontrolujte či nejde o duplikát" :
                           totalSimilarity > 0.6 ? "📋 Dokumenty majú spoločné prvky - príbuzné dokumenty" :
                           totalSimilarity > 0.4 ? "📄 Čiastočná podobnosť - niektoré spoločné témy" :
                           "✅ Dokumenty sa výrazne líšia"
        };

        return Response.json(response);

    } catch (error) {
        console.error('Error comparing documents:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});