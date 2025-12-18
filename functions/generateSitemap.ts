import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const baseUrl = 'https://www.americanliving.sk';
    
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
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Statické stránky
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `  </url>\n`;
    }
    
    // Domy
    for (const dom of domy) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/detail-domu?id=${dom.id}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `    <lastmod>${dom.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `  </url>\n`;
    }
    
    // Blogy
    for (const blog of blogs) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${blog.slug}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `    <lastmod>${blog.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `  </url>\n`;
    }
    
    xml += '</urlset>';
    
    console.log(`✅ Sitemap generovaná: ${staticPages.length} statických stránok + ${domy.length} domov + ${blogs.length} blogov`);
    
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