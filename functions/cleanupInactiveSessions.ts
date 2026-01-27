import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    console.log('🧹 Starting cleanup...', {
      now: now.toISOString(),
      threshold: fiveMinutesAgo.toISOString()
    });

    // Načítaj všetky aktívne sessions
    const activeSessions = await base44.asServiceRole.entities.UserSession.filter({
      is_active: true
    });

    console.log(`📊 Found ${activeSessions.length} active sessions`);

    // Filter sessions ktoré nemajú last_activity update viac ako 5 minút
    const staleSessionIds = [];
    
    for (const session of activeSessions) {
      const lastActivity = session.last_activity ? new Date(session.last_activity) : new Date(session.start_time);
      
      if (lastActivity < fiveMinutesAgo) {
        staleSessionIds.push(session.id);
        console.log(`⏰ Session ${session.session_id} is stale`, {
          last_activity: lastActivity.toISOString(),
          user: session.user_email
        });
      }
    }

    console.log(`🔄 Marking ${staleSessionIds.length} sessions as inactive`);

    // Bulk update - nastav is_active na false a end_time
    let updatedCount = 0;
    for (const sessionId of staleSessionIds) {
      await base44.asServiceRole.entities.UserSession.update(sessionId, {
        is_active: false,
        end_time: now.toISOString()
      });
      updatedCount++;
    }

    console.log(`✅ Cleanup complete: ${updatedCount} sessions marked inactive`);

    return Response.json({
      success: true,
      total_active: activeSessions.length,
      marked_inactive: updatedCount,
      still_active: activeSessions.length - updatedCount,
      threshold_time: fiveMinutesAgo.toISOString()
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});