import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const BASE_URL = 'https://americanliving.sk';
    
    // Získaj všetky verejné domy
    const domy = await base44.asServiceRole.entities.Dom.list('poradie', 500);
    const verejneDomy = domy.filter(d => d.verejny !== false);
    
    // Získaj publikované blogy
    const blogs = await base44.asServiceRole.entities.BlogPost.filter({ publikovany: true }, '-datum_publikacie', 100);
    
    // Statické stránky
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/katalog', priority: '0.9', changefreq: 'daily' },
      { url: '/kontakt', priority: '0.8', changefreq: 'monthly' },
      { url: '/o-nas', priority: '0.7', changefreq: 'monthly' },
      { url: '/blog', priority: '0.7', changefreq: 'weekly' },
      { url: '/faq', priority: '0.7', changefreq: 'monthly' },
      { url: '/odporucanie-domov', priority: '0.6', changefreq: 'weekly' },
    ];
    
    // Generuj XML sitemap
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Pridaj statické stránky
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }
    
    // Pridaj domy
    for (const dom of verejneDomy) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/detail-domu?id=${dom.id}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    }
    
    // Pridaj blogy
    for (const blog of blogs) {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/blog/${blog.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(blog.datum_publikacie).toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});