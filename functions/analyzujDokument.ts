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

        // Analyzuj dokument pomocou AI
        const analysisPrompt = `
Analyzuj tento dokument pre slovenský web o modulárnych domoch.

DOKUMENT:
Názov: ${dokument.nazov}
Typ: ${dokument.typ}
Výrobca: ${dokument.vyrobca}
${dokument.model_domu ? `Model domu (z priečinka): ${dokument.model_domu}` : ''}
${dokument.podpriecinok ? `Podpriečinok: ${dokument.podpriecinok}` : ''}
${dokument.cesta_priecinku ? `Cesta: ${dokument.cesta_priecinku}` : ''}
Popis: ${dokument.popis || 'N/A'}
${fileContent ? `Obsah súboru: ${fileContent.substring(0, 10000)}` : ''}

ÚLOHA:
1. Extrahuj všetky kľúčové informácie relevantné pre chatbota
2. Identifikuj modely domov spomenuté v dokumente (vrátane tých z názvu priečinka)
3. Extrahuj cenové informácie
4. Extrahuj technické parametre (rozmery, plocha, počet izieb, materiály, atď.)
5. Identifikuj ostatné dôležité informácie
6. Využi informácie zo štruktúry priečinkov na lepšie pochopenie obsahu

VÝSTUP:
Vráť JSON objekt s týmito poľami:
- extrahovaný_obsah: Stručné zhrnutie obsahu dokumentu (max 500 slov) v slovenčine, optimalizované pre chatbota. 
  Ak je to fotka, popíš čo by mohla zobrazovať na základe názvu súboru, priečinka a kontextu (napr. "Exteriér domu ${dokument.model_domu || ''}, ${dokument.podpriecinok || 'fotografie'}").
- kľúčové_informácie: {
    modely_domov: [zoznam modelov domov - určite zahrň model z názvu priečinka ak existuje],
    cenové_informácie: [cenové údaje vo formáte "Model X: 50000 EUR" alebo podobne],
    technické_údaje: [technické parametre ako "Plocha: 50m²", "Počet izieb: 3", atď.],
    ostatné: [ostatné dôležité info, vrátane informácií o type fotky ak je to fotka (exteriér, interiér, atď.)]
  }

Dôležité: Ak má dokument model_domu z priečinka, určite ho zahrň do modely_domov a do extrahovaného obsahu.
`;

        const result = await base44.integrations.Core.InvokeLLM({
            prompt: analysisPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    extrahovaný_obsah: { type: "string" },
                    kľúčové_informácie: {
                        type: "object",
                        properties: {
                            modely_domov: { type: "array", items: { type: "string" } },
                            cenové_informácie: { type: "array", items: { type: "string" } },
                            technické_údaje: { type: "array", items: { type: "string" } },
                            ostatné: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                required: ["extrahovaný_obsah", "kľúčové_informácie"]
            }
        });

        // Aktualizuj dokument s analyzovanými dátami
        await base44.asServiceRole.entities.Dokument.update(document_id, {
            extrahovaný_obsah: result.extrahovaný_obsah,
            kľúčové_informácie: result.kľúčové_informácie,
            analyzovaný: true
        });

        return Response.json({
            success: true,
            analysis: result
        });

    } catch (error) {
        console.error('Error analyzing document:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});