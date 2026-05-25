import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const baseUrl = 'https://americanliving.sk';
    
    // Načítaj všetky verejné domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ verejny: true });
    
    // Načítaj všetky publikované blogy
    const blogs = await base44.asServiceRole.entities.BlogPost.filter({ publikovany: true });
    
    // Statické stránky
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/katalog', priority: '1.0', changefreq: 'daily' },
      { url: '/katalog-ticab-house', priority: '0.95', changefreq: 'daily' },
      { url: '/katalog-prosto-house', priority: '0.95', changefreq: 'daily' },
      { url: '/katalog-domki-z-gor', priority: '0.95', changefreq: 'daily' },
      { url: '/katalog-modularne-domy', priority: '0.95', changefreq: 'daily' },
      { url: '/katalog-montovane-domy', priority: '0.95', changefreq: 'daily' },
      { url: '/katalog-mobilne-domy', priority: '0.95', changefreq: 'daily' },
      { url: '/katalog-rodinne-domy', priority: '0.95', changefreq: 'daily' },
      { url: '/o-nas', priority: '0.8', changefreq: 'monthly' },
      { url: '/kontakt', priority: '0.8', changefreq: 'monthly' },
      { url: '/ako-to-funguje', priority: '0.7', changefreq: 'monthly' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/faq', priority: '0.6', changefreq: 'monthly' },
      { url: '/odporucanie-domov', priority: '0.8', changefreq: 'weekly' }
    ];
    
    // Noindex prefixes to exclude - definované pred všetkými slučkami
    const noindexPrefixes = ['/AIMarketingInsights', '/AdminCennik', '/AutoSEOTrigger', '/AdminAnalyzaSessions', '/Admin', '/Test', '/Auto', '/Regeneruj', '/Marketing', '/SEODashboard', '/SEOEditor', '/SocialMediaDashboard', '/SrovnaniDomu', '/GrantovaKampan'];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    
    // Statické stránky (s filtrom noindex)
    for (const page of staticPages) {
      const isNoindex = noindexPrefixes.some(prefix => page.url.startsWith(prefix));
      if (isNoindex) continue;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `  </url>\n`;
    }
    
    // Domy – slug URL, s image sitemap pre Google Images
    for (const dom of domy) {
      if (!dom.verejny) continue;
      const domUrl = dom.slug
        ? `${baseUrl}/detail-domu?slug=${dom.slug}`
        : `${baseUrl}/detail-domu?id=${dom.id}`;
      xml += `  <url>\n`;
      xml += `    <loc>${domUrl}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `    <lastmod>${dom.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>\n`;
      if (dom.hlavny_obrazok) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${dom.hlavny_obrazok}</image:loc>\n`;
        xml += `      <image:title>${dom.nazov} – ${dom.vyrobca} | American Living</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    // Lokality – GEO stránky (kritické pre lokálne SEO)
    const lokality = await base44.asServiceRole.entities.LokaciaSEO.filter({ verejny: true });
    for (const lok of lokality) {
      if (!lok.slug) continue;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/lokalita/${lok.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `    <lastmod>${lok.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `  </url>\n`;
    }

    // Blogy (filter out noindex pages)
    for (const blog of blogs) {
      const blogPath = `/blog/${blog.slug}`;
      const isNoindex = noindexPrefixes.some(prefix => blogPath.startsWith(prefix));
      if (isNoindex) continue;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${blogPath}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `    <lastmod>${blog.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `  </url>\n`;
    }
    
    xml += '</urlset>';
    
    console.log(`✅ Sitemap generovaná: ${staticPages.length} statických stránok + ${domy.length} domov + ${blogs.length} blogov + ${lokality.length} lokalít`);
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('❌ Chyba:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});