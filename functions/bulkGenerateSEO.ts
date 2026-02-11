import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Overenie admin prístupu
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Načítaj všetky domy
    const domy = await base44.asServiceRole.entities.Dom.list('poradie', 200);
    
    console.log(`Starting bulk SEO generation for ${domy.length} houses...`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Spracuj každý dom
    for (const dom of domy) {
      try {
        const updateData = {};

        // 1. Meta Title
        const typMap = {
          'modularny': 'Modulárny dom',
          'montovany': 'Montovaný dom',
          'mobilny': 'Mobilný dom'
        };
        const typText = typMap[dom.typ_domu] || 'Dom';
        updateData.meta_title = `${dom.nazov} | ${typText} | American Living`;

        // 2. Meta Description
        const cena = dom.zakladna_cena ? dom.zakladna_cena.toLocaleString('sk-SK') : 'na vyžiadanie';
        const plocha = dom.zastavana_plocha || dom.uzitkova_plocha || 0;
        updateData.meta_description = `Hľadáte ${typText.toLowerCase()} ${dom.nazov}? Tento dom od výrobcu ${dom.vyrobca} má plochu ${plocha} m² a cenu ${cena} EUR. Energetická trieda A0.`;

        // 3. FAQ Schema - Multi-language
        const faqSchema = {
          sk: {
            faqs: [
              {
                otazka: `Aká je cena domu ${dom.nazov}?`,
                odpoved: `Cena modelu ${dom.nazov} začína od ${cena} EUR s DPH.`
              },
              {
                otazka: `Akú plochu má ${dom.nazov}?`,
                odpoved: `Tento ${typText.toLowerCase()} má zastavaná plochu ${plocha} m².`
              },
              {
                otazka: `Kto je výrobca domu ${dom.nazov}?`,
                odpoved: `Dom ${dom.nazov} vyrába spoločnosť ${dom.vyrobca}.`
              }
            ]
          }
        };
        updateData.faq_schema_data = faqSchema;

        // 4. Images SEO Map - Alt texty pre obrázky
        const imagesSeoMap = { sk: {} };
        
        if (dom.hlavny_obrazok) {
          imagesSeoMap.sk[dom.hlavny_obrazok] = `${dom.nazov} - moderný ${typText.toLowerCase()} na kľúč od ${dom.vyrobca}`;
        }
        
        if (dom.zakladna_konfiguracia_obrazok) {
          imagesSeoMap.sk[dom.zakladna_konfiguracia_obrazok] = `${dom.nazov} - základná konfigurácia v drevenom dizajne`;
        }
        
        if (Array.isArray(dom.galeria)) {
          dom.galeria.forEach((img, idx) => {
            imagesSeoMap.sk[img] = `${dom.nazov} - ${typText.toLowerCase()} - detailný pohľad ${idx + 1}`;
          });
        }
        
        if (dom.podorys_2d) {
          imagesSeoMap.sk[dom.podorys_2d] = `${dom.nazov} - 2D pôdorys domu`;
        }
        if (dom.podorys_3d) {
          imagesSeoMap.sk[dom.podorys_3d] = `${dom.nazov} - 3D vizualizácia pôdorysu`;
        }

        updateData.images_seo_map = imagesSeoMap;

        // Ulož zmeny
        await base44.asServiceRole.entities.Dom.update(dom.id, updateData);
        
        successCount++;
        results.push({
          id: dom.id,
          nazov: dom.nazov,
          status: 'success',
          images_count: Object.keys(imagesSeoMap.sk).length
        });
        
        console.log(`✅ ${successCount}/${domy.length} - ${dom.nazov}`);
        
      } catch (error) {
        errorCount++;
        results.push({
          id: dom.id,
          nazov: dom.nazov,
          status: 'error',
          error: error.message
        });
        console.error(`❌ Error processing ${dom.nazov}:`, error);
      }
    }

    return Response.json({
      success: true,
      message: `Bulk SEO generation completed`,
      summary: {
        total: domy.length,
        success: successCount,
        errors: errorCount
      },
      results
    });

  } catch (error) {
    console.error('Bulk SEO generation failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});