import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Only flag on update events, not create (create events are handled by the main AEO automation)
    if (event.type !== 'update') {
      return Response.json({ success: true, message: 'Not an update event, skipping' });
    }

    const domId = event.entity_id;

    // Simply flag the record for batch processing - no AI, zero credits
    await base44.asServiceRole.entities.Dom.update(domId, {
      aeo_update_pending: true
    });

    console.log(`✓ Dom ${domId} flagged for AEO update`);

    return Response.json({ success: true, flagged: domId });
  } catch (error) {
    console.error('Error flagging Dom for AEO update:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});