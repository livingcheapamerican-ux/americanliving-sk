import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
            await base44.auth.updateMe({
                [BATCH_STATE_KEY]: {
                    ...user[BATCH_STATE_KEY],
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

// Background processing function
async function runBatchAnalysisInBackground(documents, userId) {
    // Vytvoríme service role client pre background processing
    const base44Url = Deno.env.get('BASE44_API_URL') || 'https://base44.app/api';
    const appId = Deno.env.get('BASE44_APP_ID');
    const serviceKey = Deno.env.get('BASE44_SERVICE_ROLE_KEY');

    for (let i = 0; i < documents.length; i++) {
        // Kontrola či má pokračovať
        const stateCheck = await fetch(`${base44Url}/apps/${appId}/entities/User/${userId}`, {
            headers: { 'Authorization': `Bearer ${serviceKey}` }
        });
        const userData = await stateCheck.json();
        const currentState = userData.data?.[BATCH_STATE_KEY];

        if (!currentState || currentState.status === 'stopped') {
            console.log('Analysis stopped by user');
            break;
        }

        const doc = documents[i];

        try {
            // Zavolať analyzujDokument funkciu
            const response = await fetch(`${base44Url}/apps/${appId}/functions/analyzujDokument`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceKey}`
                },
                body: JSON.stringify({ document_id: doc.id })
            });

            const result = await response.json();

            // Aktualizovať stav - úspech
            await fetch(`${base44Url}/apps/${appId}/entities/User/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceKey}`
                },
                body: JSON.stringify({
                    data: {
                        [BATCH_STATE_KEY]: {
                            ...currentState,
                            current: i + 1,
                            successful: [...(currentState.successful || []), {
                                id: doc.id,
                                name: doc.nazov
                            }]
                        }
                    }
                })
            });

            // Delay medzi analýzami
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`Failed to analyze ${doc.nazov}:`, error);

            // Aktualizovať stav - chyba
            await fetch(`${base44Url}/apps/${appId}/entities/User/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${serviceKey}`
                },
                body: JSON.stringify({
                    data: {
                        [BATCH_STATE_KEY]: {
                            ...currentState,
                            current: i + 1,
                            failed: [...(currentState.failed || []), {
                                id: doc.id,
                                name: doc.nazov,
                                error: error.message
                            }]
                        }
                    }
                })
            });
        }
    }

    // Označiť ako dokončené
    const finalState = await fetch(`${base44Url}/apps/${appId}/entities/User/${userId}`, {
        headers: { 'Authorization': `Bearer ${serviceKey}` }
    });
    const finalUserData = await finalState.json();
    const finalBatchState = finalUserData.data?.[BATCH_STATE_KEY];

    await fetch(`${base44Url}/apps/${appId}/entities/User/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({
            data: {
                [BATCH_STATE_KEY]: {
                    ...finalBatchState,
                    status: 'completed',
                    completed_at: new Date().toISOString()
                }
            }
        })
    });

    console.log('Batch analysis completed');
}