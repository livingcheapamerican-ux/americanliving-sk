import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    const domId = payload.event?.entity_id;
    const eventType = payload?.event?.type;
    const oldData = payload?.old_data;
    const newData = payload?.data;

    if (!domId) {
      return Response.json({ error: 'Missing entity_id' }, { status: 400 });
    }

    // Loop protection: skip if only meta/SEO fields changed (prevent write loop)
    if (eventType === 'update' && oldData && newData) {
      const realContentFields = ['nazov', 'vyrobca', 'typ_domu', 'zakladna_cena', 'zastavana_plocha', 'uzitkova_plocha', 'pocet_izieb', 'hlavny_obrazok', 'zakladna_konfiguracia_obrazok', 'galeria', 'podorys_2d', 'podorys_3d', 'popis', 'rozmery', 'kategoria', 'celorocny'];
      const hasRealChange = realContentFields.some(f => JSON.stringify(oldData[f]) !== JSON.stringify(newData[f]));
      if (!hasRealChange) {
        console.log(`⏭️ Skipping generateBasicSEO for ${newData?.nazov} - only meta fields changed (loop protection)`);
        return Response.json({ success: true, skipped: true, reason: 'only_meta_changed' });
      }
    }

    // Použi newData z payload ak je k dispozícii (šetrí DB read)
    let dom = newData || null;
    if (!dom) {
      dom = await base44.asServiceRole.entities.Dom.get(domId);
    }
    if (!dom) {
      return Response.json({ error: 'Dom not found' }, { status: 404 });
    }

    // Loop protection: skip if SEO data already matches current dom data
    const expectedTitle = `${dom.nazov} | ${{ 'modularny': 'Modulárny dom', 'montovany': 'Montovaný dom', 'mobilny': 'Mobilný dom' }[dom.typ_domu] || 'Dom'} | American Living`;
    if (dom.meta_title === expectedTitle && dom.faq_schema_data?.sk && dom.images_seo_map?.sk) {
      console.log(`⏭️ Skipping ${dom.nazov} - SEO data already up to date (loop protection)`);
      return Response.json({ success: true, skipped: true, reason: 'seo_already_current' });
    }

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
    
    // Hlavný obrázok
    if (dom.hlavny_obrazok) {
      imagesSeoMap.sk[dom.hlavny_obrazok] = `${dom.nazov} - moderný ${typText.toLowerCase()} na kľúč od ${dom.vyrobca}`;
    }
    
    // Základná konfigurácia
    if (dom.zakladna_konfiguracia_obrazok) {
      imagesSeoMap.sk[dom.zakladna_konfiguracia_obrazok] = `${dom.nazov} - základná konfigurácia v drevenom dizajne`;
    }
    
    // Galéria
    if (Array.isArray(dom.galeria)) {
      dom.galeria.forEach((img, idx) => {
        imagesSeoMap.sk[img] = `${dom.nazov} - ${typText.toLowerCase()} - detailný pohľad ${idx + 1}`;
      });
    }
    
    // Pôdorysy
    if (dom.podorys_2d) {
      imagesSeoMap.sk[dom.podorys_2d] = `${dom.nazov} - 2D pôdorys domu`;
    }
    if (dom.podorys_3d) {
      imagesSeoMap.sk[dom.podorys_3d] = `${dom.nazov} - 3D vizualizácia pôdorysu`;
    }

    updateData.images_seo_map = imagesSeoMap;

    // Ulož zmeny
    await base44.asServiceRole.entities.Dom.update(domId, updateData);

    return Response.json({ 
      success: true, 
      message: `SEO metadata generated for ${dom.nazov}`,
      generated: {
        meta_title: updateData.meta_title,
        meta_description: updateData.meta_description,
        faq_count: faqSchema.sk.faqs.length,
        images_count: Object.keys(imagesSeoMap.sk).length
      }
    });

  } catch (error) {
    console.error('Error generating SEO:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});