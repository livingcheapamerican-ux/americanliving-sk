import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TARGET_LANGUAGES = ['sk', 'en', 'hu', 'pl', 'uk', 'de', 'fr', 'sr', 'hr', 'el'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { domId } = await req.json();

    if (!domId) {
      return Response.json({ error: 'domId is required' }, { status: 400 });
    }

    const report = {
      dom_processed: 0,
      dom_failed: 0,
      total_images_optimized: 0,
      languagesGenerated: [],
      errors: []
    };

    // Načítaj Dom záznam
    console.log(`Loading Dom record: ${domId}`);
    const domRecords = await base44.asServiceRole.entities.Dom.filter({ id: domId });
    const dom = domRecords[0];

    if (!dom) {
      return Response.json({ error: 'Dom not found' }, { status: 404 });
    }

    const imageUrls = [];
    if (dom.hlavny_obrazok) imageUrls.push(dom.hlavny_obrazok);
    if (dom.zakladna_konfiguracia_obrazok) imageUrls.push(dom.zakladna_konfiguracia_obrazok);
    if (dom.podorys_2d) imageUrls.push(dom.podorys_2d);
    if (dom.podorys_3d) imageUrls.push(dom.podorys_3d);
    if (Array.isArray(dom.galeria)) imageUrls.push(...dom.galeria.filter(u => u));

    const seoMapMultiLang = {};

    // Pre každý jazyk
    for (const langCode of TARGET_LANGUAGES) {
      const langMap = {};
      
      const langNames = {
        sk: 'slovenčine',
        en: 'angličtine',
        hu: 'maďarčine',
        pl: 'poľštine',
        uk: 'ukrajinčine',
        de: 'nemčine',
        fr: 'francúzštine',
        sr: 'srbčine',
        hr: 'chorvátčine',
        el: 'gréčtine'
      };

      const culturalTerms = {
        sk: 'montovaný dom, drevostavba, modulárny dom',
        en: 'prefab house, modular home, timber frame',
        hu: 'előregyártott ház, moduláris ház',
        pl: 'dom prefabrykowany, dom modułowy',
        uk: 'збірний будинок, модульний будинок',
        de: 'Fertighaus, Modulhaus',
        fr: 'maison préfabriquée, maison modulaire',
        sr: 'монтажна кућа, модуларна кућа',
        hr: 'montažna kuća, modularna kuća',
        el: 'προκατασκευασμένο σπίτι, αρθρωτό σπίτι'
      };

      for (const imageUrl of imageUrls) {
        if (!imageUrl || !imageUrl.trim()) continue;

        try {
          console.log(`Analyzing image for ${langCode}: ${imageUrl}`);

          const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `Stručne popíš tento obrázok pre SEO atribút alt. Použi ${langNames[langCode]} a kultúrne relevantné kľúčové slová: ${culturalTerms[langCode]}, ${dom.typ_domu}, interiér, exteriér, terasa, balkón. Maximálne 1 veta, 80-120 znakov.`,
            file_urls: [imageUrl],
            response_json_schema: {
              type: 'object',
              properties: {
                alt_text: { type: 'string' }
              }
            }
          });

          const altText = (aiResponse.alt_text || '').substring(0, 160);
          langMap[imageUrl] = altText;
          
          report.total_images_optimized++;
          console.log(`✅ ${langCode} image optimized: ${altText}`);

        } catch (imgError) {
          console.error(`Image error for ${langCode} ${imageUrl}:`, imgError.message);
          report.errors.push(`Dom ${dom.nazov} ${langCode} image: ${imgError.message}`);
        }
      }

      seoMapMultiLang[langCode] = langMap;
      report.languagesGenerated.push(langCode);
    }

    // Ulož multi-language SEO mapu
    await base44.asServiceRole.entities.Dom.update(dom.id, {
      images_seo_map: seoMapMultiLang
    });

    report.dom_processed = 1;
    console.log(`✅ Dom updated: ${dom.nazov} with multi-language SEO map`);

    return Response.json({
      success: true,
      report: {
        ...report,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Batch image optimization error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});