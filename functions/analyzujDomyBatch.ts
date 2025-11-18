import { createClientFromRequest, createServiceRoleClient } from 'npm:@base44/sdk@0.8.4';

const BATCH_STATE_KEY = 'house_analysis_batch_state';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        const { action, filters } = body;

        if (action === 'start') {
            // Získať dokumenty na analýzu
            const query = { typ: 'fotky', analyzovaný: false };
            
            if (filters?.vyrobca && filters.vyrobca !== 'all') {
                query.vyrobca = filters.vyrobca;
            }
            if (filters?.model_domu && filters.model_domu !== 'all') {
                query.model_domu = filters.model_domu;
            }

            const documents = await base44.asServiceRole.entities.Dokument.filter(query);

            if (documents.length === 0) {
                return Response.json({
                    success: false,
                    message: 'No documents to analyze'
                });
            }

            // Uložiť stav analýzy do user data
            await base44.auth.updateMe({
                [BATCH_STATE_KEY]: {
                    status: 'running',
                    total: documents.length,
                    current: 0,
                    successful: [],
                    failed: [],
                    started_at: new Date().toISOString(),
                    filters: filters
                }
            });

            // Spustiť analýzu v pozadí (async, bez čakania)
            runBatchAnalysisInBackground(documents, user.id).catch(err => {
                console.error('Background analysis failed:', err);
            });

            return Response.json({
                success: true,
                message: 'Batch analysis started in background',
                total: documents.length
            });
        }

        if (action === 'status') {
            // Získať aktuálny stav
            const currentUser = await base44.auth.me();
            const state = currentUser[BATCH_STATE_KEY];

            return Response.json({
                success: true,
                state: state || null
            });
        }

        if (action === 'stop') {
            // Zastaviť analýzu
            const currentState = user[BATCH_STATE_KEY] || {};
            await base44.auth.updateMe({
                [BATCH_STATE_KEY]: {
                    ...currentState,
                    status: 'stopped',
                    stopped_at: new Date().toISOString()
                }
            });

            return Response.json({
                success: true,
                message: 'Analysis stopped'
            });
        }

        if (action === 'reset') {
            // Reset stavu
            await base44.auth.updateMe({
                [BATCH_STATE_KEY]: null
            });

            return Response.json({
                success: true,
                message: 'State reset'
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Batch analysis error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

// Background processing function - beží na serveri nezávisle
async function runBatchAnalysisInBackground(documents, userId) {
    const serviceClient = createServiceRoleClient();

    for (let i = 0; i < documents.length; i++) {
        try {
            // Kontrola či má pokračovať - načíta user data
            const users = await serviceClient.entities.User.list();
            const currentUser = users.find(u => u.id === userId);
            const currentState = currentUser?.[BATCH_STATE_KEY];

            if (!currentState || currentState.status === 'stopped') {
                console.log('Analysis stopped by user');
                break;
            }

            const doc = documents[i];

            try {
                // Zavolať analyzujDokument - používame InvokeLLM priamo
                const result = await serviceClient.integrations.Core.InvokeLLM({
                    prompt: generateAnalysisPrompt(doc),
                    file_urls: [doc.subor_url],
                    response_json_schema: getAnalysisSchema()
                });

                // Uložiť výsledky
                const updateData = {
                    extrahovaný_obsah: result.extrahovaný_obsah,
                    ai_generovany_popis: result.ai_generovany_popis,
                    ai_generovane_tagy: result.ai_generovane_tagy || [],
                    vizualna_analyza: result.vizualna_analyza,
                    analyzovaný: true,
                    podrobna_analyza_datum: new Date().toISOString()
                };

                // Hash
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

                await serviceClient.entities.Dokument.update(doc.id, updateData);

                // Aktualizovať stav - úspech
                const users2 = await serviceClient.entities.User.list();
                const latestUser = users2.find(u => u.id === userId);
                const latestState = latestUser?.[BATCH_STATE_KEY] || currentState;
                
                await serviceClient.entities.User.update(userId, {
                    [BATCH_STATE_KEY]: {
                        ...latestState,
                        current: i + 1,
                        successful: [...(latestState.successful || []), {
                            id: doc.id,
                            name: doc.nazov
                        }]
                    }
                });
                
                console.log(`✅ Analyzed ${i + 1}/${documents.length}: ${doc.nazov}`);

                // Delay medzi analýzami
                await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (error) {
                console.error(`Failed to analyze ${doc.nazov}:`, error);

                // Aktualizovať stav - chyba
                const updatedUser = await serviceClient.entities.User.filter({ id: userId });
                const latestState = updatedUser[0]?.[BATCH_STATE_KEY] || currentState;

                await serviceClient.entities.User.update(userId, {
                    [BATCH_STATE_KEY]: {
                        ...latestState,
                        current: i + 1,
                        failed: [...(latestState.failed || []), {
                            id: doc.id,
                            name: doc.nazov,
                            error: error.message
                        }]
                    }
                });
            }

        } catch (stateError) {
            console.error('State check/update error:', stateError);
            break;
        }
    }

    // Označiť ako dokončené
    try {
        const finalUser = await serviceClient.entities.User.filter({ id: userId });
        const finalState = finalUser[0]?.[BATCH_STATE_KEY];

        if (finalState) {
            await serviceClient.entities.User.update(userId, {
                [BATCH_STATE_KEY]: {
                    ...finalState,
                    status: 'completed',
                    completed_at: new Date().toISOString()
                }
            });
        }
    } catch (finalError) {
        console.error('Failed to mark as completed:', finalError);
    }

    console.log('Batch analysis completed');
}

function generateAnalysisPrompt(dok) {
    return `KOMPLEXNÁ VIZUÁLNA ANALÝZA MODULÁRNEHO DOMU - VŠETKY KRITÉRIÁ

════════════════════════════════════════════════════════════════
KONTEXT DOKUMENTU:
- Názov súboru: ${dok.nazov}
- Aktuálny výrobca: ${dok.vyrobca}
- Aktuálny model: ${dok.model_domu || 'neurčený'}
- Podpriečinok: ${dok.podpriecinok || 'neurčený'}
════════════════════════════════════════════════════════════════

HLAVNÁ ÚLOHA: Analyzuj VŠETKY aspekty obrázka.

1️⃣ ZÁKLADNÁ IDENTIFIKÁCIA:
- Urči SPRÁVNEHO výrobcu (JAK Modules / Ticab house / Prosto House / Domki z Gór)
- Urči PRESNÝ model domu
- Typ obsahu: exterier / interier / podorys / ine

2️⃣ FASÁDA (ak exterier):
- Materiály fasády (všetky)
- Farby fasády (všetky)
- Typy drevín (ak drevo)
- Povrchové úpravy

3️⃣ DETAILY (ak exterier):
- Okná: typ, farba
- Dvere: typ, farba
- Strecha: typ, materiál, farba
- Terén a okolie
- Slnečná expozícia

4️⃣ AI GENEROVANIE (POVINNÉ):
- Extrahovaný obsah (300-400 slov pre chatbot)
- AI popis (50-80 slov)
- AI tagy (10-15 tagov v slovenčine)
- Technická analýza (200-300 slov detailne)

Buď PRESNÝ a DETAILNÝ. Výstup v SLOVENČINE!`;
}

function getAnalysisSchema() {
    return {
        type: "object",
        properties: {
            extrahovaný_obsah: { type: "string" },
            ai_generovany_popis: { type: "string" },
            ai_generovane_tagy: { type: "array", items: { type: "string" } },
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
                    fasada_materialy: { type: "array", items: { type: "string" } },
                    fasada_farby: { type: "array", items: { type: "string" } },
                    fasada_typy_drevin: { type: "array", items: { type: "string" } },
                    fasada_povrchove_upravy: { type: "array", items: { type: "string" } },
                    okna_typ: { type: "string" },
                    okna_farba: { type: "string" },
                    dvere_typ: { type: "string" },
                    dvere_farba: { type: "string" },
                    strecha_typ: { type: "string" },
                    strecha_material: { type: "string" },
                    strecha_farba: { type: "string" },
                    slnecna_expoziacia: { type: "string" },
                    teren_okolie: {
                        type: "object",
                        properties: {
                            typ_terenu: { type: "string" },
                            okolie: { type: "array", items: { type: "string" } }
                        }
                    },
                    interier_materialy: { type: "array", items: { type: "string" } },
                    styl: { type: "string" },
                    farby: { type: "array", items: { type: "string" } },
                    technicka_analyza: { type: "string" }
                },
                required: ["spravny_vyrobca", "spravny_model", "typ_obsahu", "technicka_analyza"]
            }
        },
        required: ["extrahovaný_obsah", "ai_generovany_popis", "ai_generovane_tagy", "vizualna_analyza"]
    };
}