import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Nájdi všetky running logy
    const runningLogs = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.status': 'running',
      'metadata.type': 'reorganization_log'
    });

    console.log(`Found ${runningLogs.length} running processes`);

    // Aktualizuj všetky na stopped
    for (const log of runningLogs) {
      await base44.asServiceRole.entities.GoogleDriveNotification.update(log.id, {
        metadata: {
          ...log.metadata,
          status: 'stopped'
        },
        message: log.message + ' [FORCE STOPPED]'
      });
    }

    // Vytvor stop control log
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_failed',
      message: '🛑 Všetky procesy zastavené administratorom',
      severity: 'warning',
      read: false,
      user_id: user.id,
      metadata: {
        type: 'reorganization_control',
        should_stop: true,
        forced: true
      }
    });

    return Response.json({
      success: true,
      stopped: runningLogs.length,
      message: `Zastavených ${runningLogs.length} procesov`
    });

  } catch (error) {
    console.error('Error stopping processes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});