import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { entity_type, entity_id } = await req.json();

    if (!entity_type || !entity_id) {
      return Response.json({ error: 'Missing entity_type or entity_id' }, { status: 400 });
    }

    let entity = null;
    if (entity_type === 'Dom') {
      const results = await base44.asServiceRole.entities.Dom.filter({ id: entity_id });
      entity = results[0];
    } else if (entity_type === 'Referencia') {
      const results = await base44.asServiceRole.entities.Referencia.filter({ id: entity_id });
      entity = results[0];
    }

    if (!entity) {
      return Response.json({ error: 'Entity not found' }, { status: 404 });
    }

    const seoMap = entity.data?.images_seo_map || {};
    const imageCount = Object.keys(seoMap).length;

    return Response.json({
      success: true,
      entity_name: entity_type,
      entity_id,
      entity_name_value: entity.data?.nazov || entity.data?.meno_klienta,
      total_images_with_seo: imageCount,
      images_seo_map: seoMap,
      sample_images: Object.entries(seoMap).slice(0, 5).map(([url, altText]) => ({
        url,
        alt_text: altText
      }))
    });

  } catch (error) {
    console.error('Get SEO Map error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});