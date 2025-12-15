import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testMode = true } = await req.json();

    // Get settings
    const settings = await base44.asServiceRole.entities.SiteSettings.list();
    const watermarkSettings = settings.find(s => s.klic === 'watermark_settings');
    
    if (!watermarkSettings) {
      return Response.json({ error: 'Settings not found' }, { status: 404 });
    }

    const { watermark_text } = watermarkSettings;

    // Get houses
    const allDomy = await base44.asServiceRole.entities.Dom.list('poradie', 200);
    const filteredDomy = allDomy.filter(d => d.vyrobca === 'Ticab house' || d.vyrobca === 'Prosto House');
    const domy = testMode ? filteredDomy.slice(0, 3) : filteredDomy;

    const log = [];
    let processed = 0;
    let migrated = 0;
    let errors = 0;
    let skipped = 0;

    log.push(`🚀 Cloudinary batch watermark`);
    log.push(`📊 Houses: ${domy.length}`);
    log.push(`⚙️ Mode: ${testMode ? 'TEST' : 'LIVE'}`);
    log.push('');

    for (const dom of domy) {
      log.push(`\n📦 ${dom.nazov}`);
      processed++;
      const updates = {};

      // Main image
      if (dom.hlavny_obrazok && !dom.hlavny_obrazok.includes('cloudinary.com')) {
        try {
          const result = await base44.asServiceRole.functions.invoke('cloudinaryWatermark', {
            imageUrl: dom.hlavny_obrazok,
            watermarkText: watermark_text
          });

          if (result.data?.success) {
            updates.hlavny_obrazok = result.data.newImageUrl;
            migrated++;
            log.push(`  ✅ hlavny_obrazok`);
          } else {
            errors++;
            log.push(`  ❌ hlavny_obrazok: ${result.data?.error || JSON.stringify(result.data)}`);
            if (result.data?.cloudinaryResponse) {
              log.push(`     Cloudinary response: ${JSON.stringify(result.data.cloudinaryResponse)}`);
            }
          }
        } catch (err) {
          errors++;
          log.push(`  ❌ hlavny_obrazok: ${err.message}`);
          log.push(`     Full error: ${JSON.stringify(err)}`);
        }
      } else if (dom.hlavny_obrazok?.includes('cloudinary.com')) {
        skipped++;
        log.push(`  ⏭️ hlavny_obrazok: already on Cloudinary`);
      }

      // Gallery
      if (dom.galeria && Array.isArray(dom.galeria) && dom.galeria.length > 0) {
        const newGaleria = [];
        for (let i = 0; i < Math.min(dom.galeria.length, testMode ? 2 : 999); i++) {
          const url = dom.galeria[i];
          if (url && !url.includes('cloudinary.com')) {
            try {
              const result = await base44.asServiceRole.functions.invoke('cloudinaryWatermark', {
                imageUrl: url,
                watermarkText: watermark_text
              });

              if (result.data?.success) {
                newGaleria.push(result.data.newImageUrl);
                migrated++;
              } else {
                newGaleria.push(url);
                errors++;
              }
            } catch (err) {
              newGaleria.push(url);
              errors++;
            }
          } else {
            newGaleria.push(url);
            if (url) skipped++;
          }
        }
        if (newGaleria.length > 0) {
          updates.galeria = newGaleria;
        }
      }

      // Save updates
      if (Object.keys(updates).length > 0) {
        if (!testMode) {
          await base44.asServiceRole.entities.Dom.update(dom.id, updates);
          log.push(`  💾 Saved ${Object.keys(updates).length} updates`);
        } else {
          log.push(`  🧪 TEST: ${Object.keys(updates).length} updates (not saved)`);
        }
      }
    }

    log.push('\n' + '='.repeat(50));
    log.push(`✅ DONE`);
    log.push(`📊 Processed: ${processed}`);
    log.push(`🖼️ Migrated: ${migrated}`);
    log.push(`⏭️ Skipped: ${skipped}`);
    log.push(`❌ Errors: ${errors}`);

    return Response.json({
      success: true,
      testMode,
      results: { processed, migrated, skipped, errors },
      log
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});