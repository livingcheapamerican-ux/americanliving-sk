import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const ANALYSIS_STATE_KEY = 'house_analysis_state';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, filters, resume_state } = await req.json();

        if (action === 'start') {
            // Načítaj fotky na analýzu podľa filtrov
            let query = { typ: 'fotky' };
            
            if (filters?.vyrobca && filters.vyrobca !== 'all') {
                query.vyrobca = filters.vyrobca;
            }
            
            if (filters?.model_domu) {
                query.model_domu = filters.model_domu;
            }

            if (filters?.only_unanalyzed) {
                query.analyzovaný = { $ne: true };
            }

            const documents = await base44.asServiceRole.entities.Dokument.filter(query, '-created_date', 1000);
            
            const photosToAnalyze = documents.filter(dok => {
                const mimeType = dok.typ_suboru || '';
                return mimeType.includes('image');
            });

            return Response.json({
                success: true,
                total: photosToAnalyze.length,
                documents: photosToAnalyze.map(d => ({ id: d.id, nazov: d.nazov }))
            });
        }

        if (action === 'analyze_next') {
            const { document_id } = await req.json();
            
            if (!document_id) {
                return Response.json({ error: 'Missing document_id' }, { status: 400 });
            }

            // Zavolaj existujúcu analýzu
            const analysisResponse = await base44.functions.invoke('analyzujDokument', { 
                document_id 
            });

            return Response.json({
                success: true,
                result: analysisResponse.data
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('❌ Batch analysis error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});