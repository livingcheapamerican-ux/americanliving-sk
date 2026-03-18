import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Helper funkcia - zaloguje volanie integrácie do IntegrationLog entity.
 * Volajte ju z každej backend funkcie PRED alebo PO volaní AI integrácie.
 * 
 * Použitie z inej funkcie:
 *   await base44.functions.invoke('logIntegrationCall', {
 *     function_name: 'generateAEOOnSave',
 *     integration_type: 'InvokeLLM',
 *     entity_name: 'Dom',
 *     entity_id: domId,
 *     trigger: 'automation_entity',
 *     status: 'success',
 *     estimated_credits: 5
 *   });
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.json();

        const {
            function_name,
            integration_type = 'InvokeLLM',
            entity_name,
            entity_id,
            trigger = 'automation_entity',
            status = 'success',
            estimated_credits = 1,
            details
        } = body;

        if (!function_name) {
            return Response.json({ error: 'function_name is required' }, { status: 400 });
        }

        await base44.asServiceRole.entities.IntegrationLog.create({
            function_name,
            integration_type,
            entity_name: entity_name || null,
            entity_id: entity_id || null,
            trigger,
            status,
            estimated_credits,
            details: details || null
        });

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});