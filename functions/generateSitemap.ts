import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Získaj všetky verejné domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ verejny: true });
    
    // Získaj všetky publikované blogy
    const blogy = await base44.asServiceRole.entities.BlogPost.filter({ publikovany: true });
    
    const baseUrl = 'https://www.americanliving.sk';
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Statické stránky
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: 'Katalog', changefreq: 'daily', priority: '0.9' },
      { url: 'OdporucanieDomov', changefreq: 'weekly', priority: '0.8' },
      { url: 'ONas', changefreq: 'monthly', priority: '0.7' },
      { url: 'Blog', changefreq: 'weekly', priority: '0.8' },
      { url: 'Kontakt', changefreq: 'monthly', priority: '0.7' },
      { url: 'FAQ', changefreq: 'monthly', priority: '0.7' }
    ];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    // Pridaj statické stránky
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }
    
    // Pridaj detaily domov
    for (const dom of domy) {
      sitemap += `  <url>
    <loc>${baseUrl}/DetailDomu?id=${dom.id}</loc>
    <lastmod>${dom.updated_date?.split('T')[0] || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
    
    // Pridaj blog články
    for (const blog of blogy) {
      sitemap += `  <url>
    <loc>${baseUrl}/BlogDetail?id=${blog.id}</loc>
    <lastmod>${blog.updated_date?.split('T')[0] || currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    }
    
    sitemap += `</urlset>`;
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});