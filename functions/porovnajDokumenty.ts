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

        // Porovnanie typu
        const sameType = doc1.typ === doc2.typ ? 1 : 0;
        const sameManufacturer = doc1.vyrobca === doc2.vyrobca ? 1 : 0;
        const sameModel = doc1.model_domu === doc2.model_domu ? 1 : 0;

        // AI sémantické porovnanie
        let semanticSimilarity = 0;
        if (doc1.extrahovaný_obsah && doc2.extrahovaný_obsah) {
            const prompt = `
Porovnaj tieto dva dokumenty a urči ich sémantickú podobnosť (0-100%):

DOKUMENT 1:
Názov: ${doc1.nazov}
Typ: ${doc1.typ}
Obsah: ${doc1.extrahovaný_obsah.substring(0, 2000)}

DOKUMENT 2:
Názov: ${doc2.nazov}
Typ: ${doc2.typ}
Obsah: ${doc2.extrahovaný_obsah.substring(0, 2000)}

Urči:
1. Percentuálna podobnosť (0-100)
2. Spoločné témy
3. Hlavné rozdiely
4. Odporúčanie (či sú dokumenty duplicitné, podobné, alebo odlišné)

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
                        odporucanie: { type: "string" }
                    },
                    required: ["podobnost_percent", "odporucanie"]
                }
            });

            semanticSimilarity = result.podobnost_percent / 100;
        }

        // Celková podobnosť (vážený priemer)
        const totalSimilarity = (
            hashSimilarity * 0.2 +
            tagSimilarity * 0.25 +
            sameType * 0.15 +
            sameManufacturer * 0.1 +
            sameModel * 0.1 +
            semanticSimilarity * 0.2
        );

        const response = {
            document1: {
                id: doc1.id,
                nazov: doc1.nazov,
                typ: doc1.typ
            },
            document2: {
                id: doc2.id,
                nazov: doc2.nazov,
                typ: doc2.typ
            },
            similarity: {
                total: Math.round(totalSimilarity * 100),
                hash: Math.round(hashSimilarity * 100),
                tags: Math.round(tagSimilarity * 100),
                semantic: Math.round(semanticSimilarity * 100),
                same_type: sameType === 1,
                same_manufacturer: sameManufacturer === 1,
                same_model: sameModel === 1
            },
            common_tags: commonTags,
            is_similar: totalSimilarity >= (threshold || 0.7),
            recommendation: totalSimilarity > 0.9 ? "Dokumenty sú takmer identické - možná duplicita" :
                           totalSimilarity > 0.7 ? "Dokumenty sú veľmi podobné" :
                           totalSimilarity > 0.5 ? "Dokumenty majú spoločné prvky" :
                           "Dokumenty sa líšia"
        };

        return Response.json(response);

    } catch (error) {
        console.error('Error comparing documents:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});