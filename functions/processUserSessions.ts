import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * CREDIT SAVER MODE - AI ANALÝZA VYPNUTÁ
 * Pôvodná funkcia volala drahé AI modely na analýzu sessions.
 * Zber dát (kliky, scroll, video) funguje nezávisle cez frontend (SessionRecorder).
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin check
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin' && !user.super_admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('💰 Credit Saver: Preskakujem AI analýzu sessions.');

    // Vrátime úspešný status, aby automatizácia nehlásila chybu
    return Response.json({
      success: true,
      message: 'AI analýza bola vypnutá kvôli úspore kreditov.',
      processed: 0
    });

  } catch (error) {
    console.error('Process User Sessions Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});