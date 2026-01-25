import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();
    
    if (!event || !data) {
      return Response.json({ error: 'Missing event or data' }, { status: 400 });
    }

    const { entity_name, entity_id } = event;
    const results = { optimized: 0, failed: 0, errors: [] };

    // Zoznam možných polí s obrázkmi
    const imageFields = {
      Dom: ['hlavny_obrazok', 'zakladna_konfiguracia_obrazok', 'podorys_2d', 'podorys_3d', 'galeria'],
      Referencia: ['obrazky'],
      Fotka: ['url']
    };

    const fieldsToCheck = imageFields[entity_name] || [];
    const imageUrls = [];

    // Zbierz všetky URL obrázkov
    for (const field of fieldsToCheck) {
      if (Array.isArray(data[field])) {
        imageUrls.push(...data[field].filter(url => url && typeof url === 'string'));
      } else if (data[field] && typeof data[field] === 'string') {
        imageUrls.push(data[field]);
      }
    }

    // Optimalizuj každý obrázok
    for (const imageUrl of imageUrls) {
      try {
        if (!imageUrl.trim()) continue;

        console.log(`[${entity_name}] Analyzing image: ${imageUrl}`);

        // AI analýza obrázka - Vision model
        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Stručne popíš tento obrázok pre SEO atribút alt. Použi slovenčinu a relevantné kľúčové slová ako: montovaný dom, drevostavba, modulárny dom, interiér, exteriér, terasa, balkón, okno, dvere. Maximálne 1 veta, 80-120 znakov.`,
          file_urls: [imageUrl],
          response_json_schema: {
            type: 'object',
            properties: {
              alt_text: { type: 'string' },
              keywords: { type: 'array', items: { type: 'string' } }
            }
          }
        });

        const altText = (aiResponse.alt_text || '').substring(0, 160);

        // WebP Konverzia cez Cloudinary
        const cloudinaryUrl = imageUrl.replace(/upload\//, 'upload/f_webp,q_auto/');
        
        // Vlož alt text ako metadáta do Cloudinary URL (ak je to Cloudinary URL)
        let optimizedImageUrl = imageUrl;
        if (imageUrl.includes('cloudinary.com')) {
          optimizedImageUrl = cloudinaryUrl;
        }

        // Ulož metadata
        const updatePayload = {};
        
        // Ak je to Fotka entita, priamo ulož alt_text
        if (entity_name === 'Fotka') {
          updatePayload.popis = altText;
          await base44.asServiceRole.entities.Fotka.update(entity_id, updatePayload);
        } else {
          // Pre Dom a Referencia, aktualizuj relevantné polia
          for (const field of fieldsToCheck) {
            if (Array.isArray(data[field])) {
              const idx = data[field].indexOf(imageUrl);
              if (idx !== -1) {
                data[field][idx] = optimizedImageUrl;
              }
            } else if (data[field] === imageUrl) {
              updatePayload[field] = optimizedImageUrl;
            }
          }
          
          if (Object.keys(updatePayload).length > 0) {
            await base44.asServiceRole.entities[entity_name].update(entity_id, updatePayload);
          }
        }

        results.optimized++;
        console.log(`✅ Optimized: ${altText}`);

      } catch (error) {
        results.failed++;
        results.errors.push(`Image ${imageUrl}: ${error.message}`);
        console.error(`❌ Failed to optimize image:`, error);
      }
    }

    return Response.json({
      success: true,
      entity_name,
      entity_id,
      results: {
        total_images: imageUrls.length,
        optimized: results.optimized,
        failed: results.failed,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('Image optimization error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});