import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all Dom entities
    const allDoms = await base44.asServiceRole.entities.Dom.list();
    
    const fixed = [];
    const errors = [];

    for (const dom of allDoms) {
      try {
        // Check if nazov is an object (broken)
        if (typeof dom.nazov === 'object' && dom.nazov !== null) {
          // Get the original name from slug or set a default
          let fixedName = '';
          
          // Try to reconstruct from slug
          if (dom.slug) {
            fixedName = dom.slug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
          
          // Update the entity
          await base44.asServiceRole.entities.Dom.update(dom.id, {
            nazov: fixedName || 'Unknown'
          });
          
          fixed.push({ id: dom.id, slug: dom.slug, newName: fixedName });
        }
      } catch (err) {
        errors.push({ id: dom.id, error: err.message });
      }
    }

    return Response.json({
      success: true,
      fixed: fixed.length,
      errors: errors.length,
      details: { fixed, errors }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});