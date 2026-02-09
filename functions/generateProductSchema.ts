import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    // Skip if not create or update
    if (event.type !== 'create' && event.type !== 'update') {
      return Response.json({ skipped: true, reason: 'Not a create/update event' });
    }

    const domId = event.entity_id;

    // For updates: check if price or name changed
    if (event.type === 'update' && old_data && data) {
      const priceChanged = old_data.zakladna_cena !== data.zakladna_cena;
      const nameChanged = old_data.nazov !== data.nazov;
      
      if (!priceChanged && !nameChanged) {
        return Response.json({ 
          skipped: true, 
          reason: 'Price and name unchanged',
          entity_id: domId 
        });
      }
    }

    // Generate Product Schema using pure JavaScript (0 credits)
    const truncatedDescription = (data.popis || '').substring(0, 160);
    const canonicalUrl = `https://americanliving.sk/detail-domu?id=${domId}`;
    
    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": data.nazov || 'Dom',
      "description": truncatedDescription || `${data.nazov} - ${data.vyrobca}`,
      "image": data.hlavny_obrazok || '',
      "brand": {
        "@type": "Brand",
        "name": data.vyrobca || 'American Living'
      },
      "offers": {
        "@type": "Offer",
        "url": canonicalUrl,
        "priceCurrency": "EUR",
        "price": data.zakladna_cena || 0,
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "American Living"
        }
      }
    };

    // Add additional properties if available
    if (data.zastavana_plocha || data.uzitkova_plocha || data.pocet_izieb) {
      productSchema.additionalProperty = [];
      
      if (data.zastavana_plocha) {
        productSchema.additionalProperty.push({
          "@type": "PropertyValue",
          "name": "Zastavaná plocha",
          "value": `${data.zastavana_plocha} m²`
        });
      }
      
      if (data.uzitkova_plocha) {
        productSchema.additionalProperty.push({
          "@type": "PropertyValue",
          "name": "Úžitková plocha",
          "value": `${data.uzitkova_plocha} m²`
        });
      }
      
      if (data.pocet_izieb) {
        productSchema.additionalProperty.push({
          "@type": "PropertyValue",
          "name": "Počet izieb",
          "value": data.pocet_izieb
        });
      }
    }

    // Save to product_schema_json field (new field, not faq_schema_data)
    await base44.asServiceRole.entities.Dom.update(domId, {
      product_schema_json: productSchema
    });

    console.log(`✓ Product Schema generated for Dom ${domId} (${data.nazov})`);

    return Response.json({ 
      success: true, 
      entity_id: domId,
      schema_generated: true 
    });
  } catch (error) {
    console.error('Error generating product schema:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});