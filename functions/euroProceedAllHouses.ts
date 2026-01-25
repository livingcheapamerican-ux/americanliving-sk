import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TARGET_LANGUAGES = ['sk', 'en', 'hu', 'pl', 'uk', 'de', 'fr', 'sr', 'hr', 'el'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('🌍 GLOBÁLNA AKTUALIZÁCIA: 10 JAZYKOV PRE VŠETKY DOMY');

    // Načítaj všetky domy
    const allDoms = await base44.asServiceRole.entities.Dom.filter({}, '', 500);
    const domsToProcess = Array.isArray(allDoms) ? allDoms : [];
    console.log(`📋 Domov na spracovanie: ${domsToProcess.length}\n`);

    let processed = 0;
    let failed = 0;
    const errors = [];
    const processed_houses = [];

    // POSTUPNE SPRACUJ VŠETKY DOMY
    for (let idx = 0; idx < domsToProcess.length; idx++) {
      const dom = domsToProcess[idx];
      const domId = dom.id || dom.data?.id;
      const domName = dom.data?.nazov || dom.nazov || 'Unknown';

      try {
        console.log(`\n[${idx + 1}/${domsToProcess.length}] 🏠 ${domName}`);

        // ========== 1. GENERUJ AEO (FAQ) ==========
        const contentForAnalysis = `${domName}. ${(dom.data?.popis || '').substring(0, 800)}`;

        if (!contentForAnalysis.trim()) {
          throw new Error('Žiadny obsah na analýzu');
        }

        console.log('   → Generiujem FAQ pre 10 jazykov...');

        // Vygeneruj Slovak FAQ
        const slovakResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Vytvor: a) 1-vetné zhrnutie max 300 znakov. b) 3 FAQ otázky a odpovede pre tento dom. Všetko v slovenčine. Text: ${contentForAnalysis}`,
          response_json_schema: {
            type: 'object',
            properties: {
              ai_summary: { type: 'string' },
              faq_schema_data: {
                type: 'object',
                properties: {
                  faqs: { 
                    type: 'array', 
                    items: { 
                      type: 'object',
                      properties: {
                        otazka: { type: 'string' },
                        odpoved: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        const faqMultiLang = {
          sk: slovakResponse.faq_schema_data || { faqs: [] }
        };

        // Preložiť do ostatných 9 jazykov
        const langNames = {
          en: 'angličtine', hu: 'maďarčine', pl: 'poľštine', uk: 'ukrajinčine',
          de: 'nemčine', fr: 'francúzštine', sr: 'srbčine', hr: 'chorvátčine', el: 'gréčtine'
        };

        for (const langCode of TARGET_LANGUAGES) {
          if (langCode === 'sk') continue;

          const translatedFaq = await base44.integrations.Core.InvokeLLM({
            prompt: `Prelož tento FAQ do ${langNames[langCode]}. FAQ: ${JSON.stringify(slovakResponse.faq_schema_data)}`,
            response_json_schema: {
              type: 'object',
              properties: {
                faq_schema_data: {
                  type: 'object',
                  properties: {
                    faqs: { 
                      type: 'array', 
                      items: { 
                        type: 'object',
                        properties: {
                          otazka: { type: 'string' },
                          odpoved: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          });

          faqMultiLang[langCode] = translatedFaq.faq_schema_data || { faqs: [] };
        }

        // ========== 2. OPTIMIZUJ OBRÁZKY ==========
        console.log('   → Optimiziujem SEO alt texty obrázkov...');

        const imageUrls = [];
        if (dom.data?.hlavny_obrazok) imageUrls.push(dom.data.hlavny_obrazok);
        if (dom.data?.zakladna_konfiguracia_obrazok) imageUrls.push(dom.data.zakladna_konfiguracia_obrazok);
        if (dom.data?.podorys_2d) imageUrls.push(dom.data.podorys_2d);
        if (dom.data?.podorys_3d) imageUrls.push(dom.data.podorys_3d);
        if (Array.isArray(dom.data?.galeria)) imageUrls.push(...dom.data.galeria.filter(u => u).slice(0, 5));
        if (Array.isArray(dom.data?.galerie)) {
          dom.data.galerie.forEach(gal => {
            if (Array.isArray(gal.fotky)) {
              imageUrls.push(...gal.fotky.slice(0, 3));
            }
          });
        }

        const seoMapMultiLang = {};

        for (const langCode of TARGET_LANGUAGES) {
          const langMap = {};
          const culturalTerms = {
            sk: 'montovaný dom, modulárny dom',
            en: 'prefab house, modular home',
            hu: 'moduláris ház',
            pl: 'dom modułowy',
            uk: 'модульний будинок',
            de: 'Fertighaus, Modulhaus',
            fr: 'maison préfabriquée',
            sr: 'модуларна кућа',
            hr: 'montažna kuća',
            el: 'προκατασκευασμένο σπίτι'
          };

          for (const imageUrl of imageUrls.slice(0, 5)) {
            if (!imageUrl) continue;

            try {
              const aiResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `Stručne popíš tento obrázok pre SEO alt. Použi ${langNames[langCode]} a: ${culturalTerms[langCode]}. Max 120 znakov.`,
                file_urls: [imageUrl],
                response_json_schema: {
                  type: 'object',
                  properties: { alt_text: { type: 'string' } }
                }
              });

              langMap[imageUrl] = (aiResponse.alt_text || '').substring(0, 160);
            } catch (e) {
              console.log(`      ⚠ Obrázok: ${imageUrl.substring(0, 50)}...`);
            }
          }

          seoMapMultiLang[langCode] = langMap;
        }

        // ========== 3. ULOŽ VŠETKY DÁTA ==========
        await base44.asServiceRole.entities.Dom.update(domId, {
          ai_summary: (slovakResponse.ai_summary || '').substring(0, 300),
          faq_schema_data: faqMultiLang,
          images_seo_map: seoMapMultiLang,
          geo_context_keywords: `${dom.data?.typ_domu || 'dom'}, modulárny`
        });

        processed++;
        processed_houses.push(domName);
        console.log(`   ✅ HOTOVO - Všetkých 10 jazykov aktivovaných`);

      } catch (error) {
        failed++;
        errors.push({ dom: domName, error: error.message });
        console.log(`   ❌ CHYBA: ${error.message}`);
      }
    }

    console.log(`\n\n🎉 GLOBALIZÁCIA DOKONČENÁ!`);
    console.log(`✅ Spracované: ${processed}/${domsToProcess.length}`);
    console.log(`❌ Chyby: ${failed}`);
    console.log(`\nCELÁ EURÓPA AKTIVOVANÁ! 🌍`);

    return Response.json({
      success: true,
      report: { processed, failed, processed_houses, errors, total: domsToProcess.length }
    });

  } catch (error) {
    console.error('KRITICKÁ CHYBA:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});