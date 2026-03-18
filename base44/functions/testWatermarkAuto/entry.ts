import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = [];
    logs.push('🧪 AUTOMATICKÝ TEST WATERMARKU');
    logs.push('='.repeat(60));

    // Získať nastavenia
    const settings = await base44.asServiceRole.entities.SiteSettings.list();
    const watermarkSettings = settings.find(s => s.klic === 'watermark_settings');
    
    if (!watermarkSettings) {
      return Response.json({ error: 'Settings not found' }, { status: 404 });
    }

    const { watermark_text, watermark_position, watermark_opacity, watermark_size } = watermarkSettings;
    logs.push(`⚙️ Settings: "${watermark_text}", ${watermark_position}, ${watermark_opacity}, ${watermark_size}`);
    logs.push('');

    // Získať testovacie obrázky
    const domy = await base44.asServiceRole.entities.Dom.list('poradie', 10);
    const testImages = [];
    
    for (const dom of domy) {
      if (dom.hlavny_obrazok && !dom.hlavny_obrazok.includes('watermarked_')) {
        testImages.push({ url: dom.hlavny_obrazok, label: `${dom.nazov} - hlavný` });
      }
      if (testImages.length >= 7) break;
      
      if (dom.galeria && Array.isArray(dom.galeria)) {
        for (let i = 0; i < dom.galeria.length && testImages.length < 7; i++) {
          const url = dom.galeria[i];
          if (url && !url.includes('watermarked_')) {
            testImages.push({ url, label: `${dom.nazov} - galéria[${i}]` });
          }
        }
      }
    }

    logs.push(`📸 Testovacích obrázkov: ${testImages.length}`);
    logs.push('');

    let successCount = 0;
    let failCount = 0;
    const results = [];

    // Test každého obrázka
    for (let i = 0; i < testImages.length; i++) {
      const img = testImages[i];
      logs.push(`\n[${i + 1}/${testImages.length}] Testing: ${img.label}`);
      logs.push(`URL: ${img.url.substring(0, 70)}...`);
      
      try {
        const result = await base44.asServiceRole.functions.invoke('watermarkCanvas', {
          imageUrl: img.url,
          watermarkText: watermark_text,
          position: watermark_position,
          opacity: watermark_opacity,
          size: watermark_size
        });

        if (result.data?.success) {
          successCount++;
          logs.push(`✅ SUCCESS`);
          logs.push(`   New URL: ${result.data.newImageUrl.substring(0, 70)}...`);
          results.push({ 
            index: i + 1, 
            label: img.label, 
            status: 'success', 
            newUrl: result.data.newImageUrl,
            originalUrl: img.url
          });
        } else {
          failCount++;
          logs.push(`❌ FAIL: ${result.data?.error || 'Unknown error'}`);
          if (result.data?.logs) {
            result.data.logs.forEach(l => logs.push(`   ${l}`));
          }
          results.push({ 
            index: i + 1, 
            label: img.label, 
            status: 'error', 
            error: result.data?.error 
          });
        }
      } catch (error) {
        failCount++;
        logs.push(`❌ EXCEPTION: ${error.message}`);
        results.push({ 
          index: i + 1, 
          label: img.label, 
          status: 'exception', 
          error: error.message 
        });
      }
    }

    logs.push('\n' + '='.repeat(60));
    logs.push(`📊 VÝSLEDKY:`);
    logs.push(`   ✅ Úspešných: ${successCount}/${testImages.length}`);
    logs.push(`   ❌ Chybných: ${failCount}/${testImages.length}`);
    logs.push(`   📈 Úspešnosť: ${((successCount / testImages.length) * 100).toFixed(1)}%`);

    const allSuccess = successCount === testImages.length && testImages.length >= 7;
    
    if (allSuccess) {
      logs.push('\n🎉 VŠETKY TESTY ÚSPEŠNÉ! Watermark funguje!');
    } else if (successCount >= 7) {
      logs.push('\n✅ Aspoň 7 obrázkov úspešných - watermark funguje!');
    } else {
      logs.push(`\n⚠️ Len ${successCount} úspešných - potrebujeme aspoň 7`);
    }

    return Response.json({
      success: allSuccess || successCount >= 7,
      stats: {
        total: testImages.length,
        success: successCount,
        failed: failCount,
        successRate: ((successCount / testImages.length) * 100).toFixed(1) + '%'
      },
      results,
      logs,
      ready: successCount >= 7
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});