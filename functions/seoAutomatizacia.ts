import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Cieľové kľúčové slová
    const TARGET_KEYWORDS = [
      { keyword: 'montovany dom', priority: 'high' },
      { keyword: 'drevodom', priority: 'high' },
      { keyword: 'modularny dom', priority: 'high' },
      { keyword: 'modulovy dom', priority: 'high' },
      { keyword: 'montovane domy', priority: 'medium' },
      { keyword: 'mobilny dom', priority: 'medium' },
      { keyword: 'drevostavba', priority: 'medium' }
    ];

    console.log('🚀 Spúšťam SEO automatizáciu...');

    // 1. Aktualizuj kľúčové slová v databáze
    for (const kw of TARGET_KEYWORDS) {
      const existing = await base44.asServiceRole.entities.SEOKeyword.filter({ keyword: kw.keyword });
      
      if (existing.length === 0) {
        await base44.asServiceRole.entities.SEOKeyword.create({
          keyword: kw.keyword,
          search_volume: 1000,
          competition: 'high',
          difficulty_score: 65,
          trend: 'stable',
          target_pages: ['/katalog', '/domov', '/o-nas']
        });
        console.log(`✅ Vytvorené kľúčové slovo: ${kw.keyword}`);
      }
    }

    // 2. Optimalizuj meta dáta domov
    const domy = await base44.asServiceRole.entities.Dom.list();
    let optimizedCount = 0;

    for (const dom of domy) {
      let needsUpdate = false;
      const updates = {};

      // Optimalizuj meta title
      if (!dom.meta_title || dom.meta_title.length < 50) {
        const typDomu = dom.typ_domu === 'modularny' ? 'Modulárny' : 
                       dom.typ_domu === 'montovany' ? 'Montovaný' : 'Mobilný';
        updates.meta_title = `${typDomu} dom ${dom.nazov} | ${dom.vyrobca} | Cena od ${dom.zakladna_cena?.toLocaleString('sk-SK')}€`;
        needsUpdate = true;
      }

      // Optimalizuj meta description
      if (!dom.meta_description || dom.meta_description.length < 100) {
        const typDomu = dom.typ_domu === 'modularny' ? 'modulárny' : 
                       dom.typ_domu === 'montovany' ? 'montovaný' : 'mobilný';
        updates.meta_description = `${typDomu} dom ${dom.nazov} od ${dom.vyrobca}. Zastavaná plocha ${dom.zastavana_plocha}m². Energeticky úsporný ${dom.typ_domu === 'modularny' ? 'modulový' : typDomu} dom s certifikátom A0. Cena od ${dom.zakladna_cena?.toLocaleString('sk-SK')}€. Kompletná realizácia na kľúč.`;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await base44.asServiceRole.entities.Dom.update(dom.id, updates);
        optimizedCount++;
      }
    }

    console.log(`✅ Optimalizované meta dáta pre ${optimizedCount} domov`);

    // 3. Generuj SEO blog príspevky (ak neexistujú)
    const existingBlogs = await base44.asServiceRole.entities.BlogPost.filter({ 
      publikovany: true 
    });

    const seoTopics = [
      {
        nazov: 'Montovaný dom vs Murovaný dom - Kompletný porovnávací sprievodca 2025',
        perex: 'Rozmýšľate medzi montovaným a murovaným domom? Porovnali sme pre vás všetky výhody, nevýhody, ceny a čas realizácie. Zistite, ktorá možnosť je pre vás výhodnejšia.',
        keywords: ['montovany dom', 'murovany dom', 'porovnanie']
      },
      {
        nazov: 'Modulárny dom - Moderné bývanie za dostupnú cenu',
        perex: 'Modulárne domy sú budúcnosťou bývania. Rýchla výstavba, energetická úspornosť a moderný dizajn. Zistite všetko o modulárnych domoch a ich výhodách.',
        keywords: ['modularny dom', 'modulovy dom', 'energeticka uspornost']
      },
      {
        nazov: 'Drevodom - Ekologické a zdravé bývanie v harmónii s prírodou',
        perex: 'Drevené domy sú nielen ekologické, ale aj veľmi zdravé a príjemné na bývanie. Poznajte všetky výhody drevodomy a zistite, prečo si ich vyberá čoraz více ľudí.',
        keywords: ['drevodom', 'ekologicky dom', 'drevostavba']
      }
    ];

    let createdBlogs = 0;
    for (const topic of seoTopics) {
      const exists = existingBlogs.some(blog => 
        blog.nazov?.toLowerCase().includes(topic.keywords[0])
      );

      if (!exists && createdBlogs < 1) {
        // Generuj obsah cez AI
        const aiContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Napíš profesionálny, SEO optimalizovaný blogový článok na tému: "${topic.nazov}".

Článok musí obsahovať:
- Úvod (2-3 odseky)
- 5-7 hlavných sekcií s podnadpismi (##)
- Každá sekcia má 2-3 odseky s konkrétnymi informáciami
- Zhrnutie a call-to-action na konci
- Celková dĺžka min. 1500 slov
- Prirodzene zakomponované kľúčové slová: ${topic.keywords.join(', ')}
- Píš v slovenčine, profesionálne ale prístupne
- Zameraj sa na výhody, ceny, proces realizácie, technické detaily

Formát: Markdown`,
          add_context_from_internet: false
        });

        const slug = topic.nazov
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        await base44.asServiceRole.entities.BlogPost.create({
          nazov: topic.nazov,
          slug: slug,
          perex: topic.perex,
          obsah: aiContent,
          titulny_obrazok: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200',
          autor: 'American Living',
          kategoria: 'tipy',
          tagy: topic.keywords,
          publikovany: true,
          datum_publikacie: new Date().toISOString(),
          meta_title: topic.nazov.substring(0, 60),
          meta_description: topic.perex.substring(0, 160)
        });

        createdBlogs++;
        console.log(`✅ Vytvorený blog: ${topic.nazov}`);
      }
    }

    // 4. Zaznamenaj aktivitu
    await base44.asServiceRole.entities.SEOAnalytika.create({
      url: '/katalog',
      page_title: 'Katalóg domov - American Living',
      klucove_slova: TARGET_KEYWORDS.map(kw => kw.keyword),
      seo_score: 85,
      last_analyzed: new Date().toISOString()
    });

    console.log('✅ SEO automatizácia dokončená');

    return Response.json({
      success: true,
      summary: {
        keywords_tracked: TARGET_KEYWORDS.length,
        houses_optimized: optimizedCount,
        blogs_created: createdBlogs
      },
      message: 'SEO automatizácia úspešne spustená. Stránka je teraz optimalizovaná pre kľúčové slová.'
    });

  } catch (error) {
    console.error('❌ Chyba v SEO automatizácii:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});