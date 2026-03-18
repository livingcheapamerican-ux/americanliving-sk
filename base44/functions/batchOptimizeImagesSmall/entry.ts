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
    const domRecords = await base44.asServiceRole.entities.Dom.filter({ id: domId });
    const dom = domRecords[0];

    if (!dom) {
      return Response.json({ error: 'Dom not found' }, { status: 404 });
    }

    // Zbier všetky image URLs (s limitom na prvých 20)
    const imageUrls = [];
    if (dom.hlavny_obrazok) imageUrls.push(dom.hlavny_obrazok);
    if (dom.zakladna_konfiguracia_obrazok) imageUrls.push(dom.zakladna_konfiguracia_obrazok);
    if (dom.podorys_2d) imageUrls.push(dom.podorys_2d);
    if (dom.podorys_3d) imageUrls.push(dom.podorys_3d);
    if (Array.isArray(dom.galeria)) imageUrls.push(...dom.galeria.filter(u => u).slice(0, 10));
    if (Array.isArray(dom.galerie)) {
      dom.galerie.forEach(gal => {
        if (Array.isArray(gal.fotky)) {
          imageUrls.push(...gal.fotky.slice(0, 5));
        }
      });
    }

    const seoMapMultiLang = {};

    // Pre každý jazyk - batch procesovanie obrázkov
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

      // Batch obrázkov do skupín (max 5 súčasne na jazyk)
      for (let i = 0; i < imageUrls.length; i += 5) {
        const imageBatch = imageUrls.slice(i, Math.min(i + 5, imageUrls.length));

        const batchPromises = imageBatch.map(async (imageUrl) => {
          if (!imageUrl || !imageUrl.trim()) return null;

          try {
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

            return {
              url: imageUrl,
              text: (aiResponse.alt_text || '').substring(0, 160)
            };
          } catch (imgError) {
            console.error(`Image error for ${langCode}: ${imgError.message}`);
            return null;
          }
        });

        const results = await Promise.all(batchPromises);
        results.forEach(result => {
          if (result) {
            langMap[result.url] = result.text;
            report.total_images_optimized++;
          }
        });
      }

      seoMapMultiLang[langCode] = langMap;
      report.languagesGenerated.push(langCode);
    }

    // Ulož multi-language SEO mapu
    await base44.asServiceRole.entities.Dom.update(dom.id, {
      images_seo_map: seoMapMultiLang
    });

    report.dom_processed = 1;

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