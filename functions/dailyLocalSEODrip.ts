import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Find pending LokaciaSEO records - STRICT LIMIT TO 1 PER RUN to prevent timeout
    const allRecords = await base44.asServiceRole.entities.LokaciaSEO.list();
    const pendingRecords = allRecords
      .filter(record => !record.unikany_text_o_lokalite || record.unikany_text_o_lokalite.length < 100)
      .slice(0, 1);

    if (pendingRecords.length === 0) {
      console.log('✓ No pending LokaciaSEO records found');
      return Response.json({ 
        success: true, 
        processed: 0,
        message: 'No pending records to process'
      });
    }

    console.log(`📝 Processing ${pendingRecords.length} LokaciaSEO records...`);

    const results = [];

    for (const record of pendingRecords) {
      try {
        const cityName = record.nazov_mesta || record.slug || 'mesto';
        
        // Generate high-quality SEO article using AI
        const prompt = `Napíš profesionálny SEO článok o montovaných domoch v meste ${cityName} pre spoločnosť American Living.

KONTEXT:
- American Living je distribútor a staviteľ prefabrikovaných a montovaných domov na Slovensku
- Ponúkame domy od značiek: Ticab house, Prosto House, JAK Modules, Domki z Gór
- Špecializujeme sa na energeticky efektívne domy s certifikátom A0
- Poskytujeme komplexné služby: projektovanie, inžiniering, financovanie, hľadanie pozemkov

OBSAH ČLÁNKU:
1. Úvod (2-3 vety) - prečo sú montované domy ideálne pre ${cityName}
2. Výhody montovaných domov (5-6 bodov):
   - Rýchla výstavba (2-3 mesiace)
   - Energetická efektivita (A0 certifikát)
   - Moderný dizajn
   - Ekologické materiály
   - Dostupné financovanie
   - Komplexné služby

3. Prečo American Living v ${cityName}:
   - Lokálna podpora
   - Skúsený tím
   - Overení výrobcovia
   - Garancie kvality

4. Záver s výzvou na kontakt

ŠTÝL:
- Profesionálny, ale priateľský
- Prirodzené použitie kľúčových slov: "montované domy ${cityName}", "prefabrikované domy ${cityName}", "energeticky efektívny dom"
- Dĺžka: 500-700 slov
- Formátovanie: použiť HTML tagy (<h2>, <p>, <ul>, <li>, <strong>)

Vráť ČISTÝ HTML kód (bez markdown, bez \`\`\`html blokov).`;

        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: prompt,
          add_context_from_internet: false
        });

        // Safety check for AI response
        if (!aiResponse || (typeof aiResponse !== 'string' && !aiResponse.content)) {
          console.log(`⚠️ AI generation skipped - Empty Response for ${cityName}`);
          results.push({
            city: cityName,
            status: 'skipped',
            reason: 'Empty AI response'
          });
          continue;
        }

        const generatedContent = typeof aiResponse === 'string' ? aiResponse : aiResponse.content || '';

        // Update the record with generated content
        await base44.asServiceRole.entities.LokaciaSEO.update(record.id, {
          unikany_text_o_lokalite: generatedContent,
          verejny: true
        });

        console.log(`✓ Generated SEO content for ${cityName}`);
        
        results.push({
          city: cityName,
          status: 'success',
          content_length: generatedContent.length
        });

      } catch (error) {
        console.error(`✗ Failed to process ${record.nazov_mesta}:`, error);
        results.push({
          city: record.nazov_mesta || record.slug,
          status: 'failed',
          error: error.message
        });
      }
    }

    return Response.json({ 
      success: true, 
      processed: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results: results
    });

  } catch (error) {
    console.error('Error in dailyLocalSEODrip:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});