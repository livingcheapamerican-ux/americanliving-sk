import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * AUTOMATICKÉ SPRACOVANIE USER SESSIONS
 * Spúšťa sa každých 30 minút
 * Analyzuje ukončené sessions s frustráciou a volá AIService
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin check (scheduled tasks bežia pod service role, ale overíme pre manuálne volanie)
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin' && !user.super_admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('🔍 Hľadám sessions na analýzu...');

    // Nájdi ukončené sessions s frustráciou bez AI analýzy
    const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 500);
    
    console.log(`📊 DEBUG: Typ sessions = ${typeof sessions}, isArray = ${Array.isArray(sessions)}, length = ${sessions?.length}`);

    if (!Array.isArray(sessions)) {
      console.error('❌ CHYBA: sessions nie je pole!', sessions);
      return Response.json({ 
        error: 'Database nevrátila pole',
        received_type: typeof sessions,
        success: false
      }, { status: 500 });
    }

    const toAnalyze = sessions.filter(s => 
      s.is_active === false && 
      (s.frustration_score || 0) > 0 && 
      !s.ai_analysis
    );

    console.log(`📊 Našiel som ${toAnalyze.length} sessions na analýzu (z celkových ${sessions.length})`);

    if (toAnalyze.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'Žiadne sessions na analýzu',
        analyzed: 0
      });
    }

    let analyzed = 0;
    let failed = 0;

    // Analyzuj každú session (max 10 za beh)
    for (const session of toAnalyze.slice(0, 10)) {
      try {
        // Zavolaj AIService
        const response = await base44.asServiceRole.functions.invoke('AIService', {
          action: 'analyzeSessionUX',
          data: {
            sessionData: {
              session_id: session.session_id,
              duration_seconds: session.duration_seconds,
              clicks_count: session.clicks_count,
              rage_clicks: session.rage_clicks,
              console_errors: session.console_errors,
              frustration_score: session.frustration_score,
              pages_visited: session.pages_visited,
              conversions: session.conversions
            }
          }
        });

        if (response.data.success) {
          // Ulož výsledok späť do session
          await base44.asServiceRole.entities.UserSession.update(session.id, {
            ai_analysis: response.data.analysis,
            ai_analyzed_at: new Date().toISOString()
          });
          
          analyzed++;
          console.log(`✅ Analyzovaný session: ${session.session_id}`);
        }

      } catch (error) {
        console.error(`❌ Chyba pri analýze session ${session.session_id}:`, error);
        failed++;
      }

      // Delay medzi volaniami
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return Response.json({
      success: true,
      message: `Analyzovaných ${analyzed} sessions`,
      analyzed,
      failed,
      total_candidates: toAnalyze.length
    });

  } catch (error) {
    console.error('Process User Sessions Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});