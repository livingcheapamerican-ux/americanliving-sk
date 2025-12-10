import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !user.super_admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = [];
    const addLog = (message) => {
      console.log(message);
      logs.push(message);
    };

    // Načítať všetky Ticabhouse domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ vyrobca: 'Ticab house' });
    addLog(`Načítaných ${domy.length} Ticabhouse domov`);

    const languages = [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'German' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'pl', name: 'Polish' },
      { code: 'uk', name: 'Ukrainian' },
      { code: 'fr', name: 'French' },
      { code: 'sr', name: 'Serbian' },
      { code: 'hr', name: 'Croatian' },
      { code: 'el', name: 'Greek' }
    ];

    let processedCount = 0;
    let skippedCount = 0;
    let translatedCount = 0;

    for (const dom of domy) {
      // Preskočiť Lyon a Happy Wife
      if (dom.nazov === 'Lyon' || dom.nazov === 'Happy Wife' || 
          dom.nazov?.includes('Lyon') || dom.nazov?.includes('Happy Wife')) {
        addLog(`⏭️ Preskakujem ${dom.nazov}`);
        skippedCount++;
        continue;
      }

      addLog(`\n📝 Spracovávam ${dom.nazov}...`);
      const updateData = {};
      let domTranslatedCount = 0;

      // Preklad popisu
      if (dom.popis && dom.popis.trim()) {
        for (const lang of languages) {
          const field = `popis_${lang.code}`;
          if (!dom[field] || dom[field].trim() === '') {
            addLog(`  🔄 Prekladám popis do ${lang.name}...`);
            
            const prompt = `Translate this Slovak house description to ${lang.name}. Preserve exact formatting, symbols (✔, ✅, ❌), bullet points, line breaks, and all numerical values. Keep technical terms accurate.

Slovak text:
${dom.popis}

Return ONLY the translated text, no explanations.`;

            const response = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
            updateData[field] = response.trim();
            domTranslatedCount++;
            translatedCount++;
            
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      // Preklad špecifikácie
      if (dom.specifikacia && dom.specifikacia.trim()) {
        for (const lang of languages) {
          const field = `specifikacia_${lang.code}`;
          if (!dom[field] || dom[field].trim() === '') {
            addLog(`  🔄 Prekladám špecifikáciu do ${lang.name}...`);
            
            const prompt = `Translate this Slovak house specification to ${lang.name}. Preserve exact formatting, symbols (✔, ✅, ❌), bullet points, line breaks, and all numerical values. Keep technical terms accurate.

Slovak text:
${dom.specifikacia}

Return ONLY the translated text, no explanations.`;

            const response = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
            updateData[field] = response.trim();
            domTranslatedCount++;
            translatedCount++;
            
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      // Aktualizovať dom
      if (Object.keys(updateData).length > 0) {
        await base44.asServiceRole.entities.Dom.update(dom.id, updateData);
        addLog(`✅ ${dom.nazov} - preložených ${domTranslatedCount} textov`);
        processedCount++;
      } else {
        addLog(`✓ ${dom.nazov} - všetky preklady už existujú`);
        skippedCount++;
      }
    }

    addLog(`\n🎉 DOKONČENÉ!`);
    addLog(`Spracovaných: ${processedCount}`);
    addLog(`Preskočených: ${skippedCount}`);
    addLog(`Celkovo preložených: ${translatedCount}`);

    return Response.json({ 
      success: true, 
      logs,
      stats: {
        processed: processedCount,
        skipped: skippedCount,
        translated: translatedCount
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});