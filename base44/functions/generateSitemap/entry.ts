import { createClientFromRequest } from 'npm:@base44/sdk@0.8.30';

const SITEMAP_CACHE_KEY = "sitemap_xml_cache";
const SITEMAP_HASH_KEY = "sitemap_xml_hash";
const SITEMAP_TS_KEY = "sitemap_xml_timestamp";
const SITEMAP_TTL = 24 * 60 * 60 * 1000; // 24 hours

let memCache: { xml: string, hash: string, timestamp: number } | null = null;

async function getCache() {
  try {
    const kv = await Deno.openKv();
    const [xmlRes, hashRes, tsRes] = await Promise.all([
      kv.get([SITEMAP_CACHE_KEY]),
      kv.get([SITEMAP_HASH_KEY]),
      kv.get([SITEMAP_TS_KEY])
    ]);
    await kv.close();
    
    if (xmlRes.value && hashRes.value && tsRes.value) {
      const timestamp = tsRes.value as number;
      if (Date.now() - timestamp < SITEMAP_TTL) {
        return {
          xml: xmlRes.value as string,
          hash: hashRes.value as string,
          timestamp
        };
      }
    }
  } catch (e) {
    console.log(`⚠️ [Cache] Deno.openKv get failed: ${e.message}`);
  }

  if (memCache && (Date.now() - memCache.timestamp < SITEMAP_TTL)) {
    return memCache;
  }

  return null;
}

async function setCache(xml: string, hash: string) {
  const timestamp = Date.now();
  try {
    const kv = await Deno.openKv();
    await Promise.all([
      kv.set([SITEMAP_CACHE_KEY], xml),
      kv.set([SITEMAP_HASH_KEY], hash),
      kv.set([SITEMAP_TS_KEY], timestamp)
    ]);
    await kv.close();
  } catch (e) {
    console.log(`⚠️ [Cache] Deno.openKv set failed: ${e.message}`);
  }

  memCache = { xml, hash, timestamp };
}

Deno.serve(async (req) => {
  try {
    // 1. Check if cache is valid (under 24 hours)
    const cached = await getCache();
    const url = new URL(req.url);
    const forceRefresh = url.searchParams.get("force") === "true";

    if (cached && !forceRefresh) {
      console.log("⚡ [Sitemap] Serving sitemap from cache");
      return new Response(cached.xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT'
        }
      });
    }

    const base44 = createClientFromRequest(req);
    const baseUrl = 'https://americanliving.sk';
    
    console.log("📡 [Sitemap] Querying database for fresh sitemap content...");
    // Načítaj všetky dáta
    const [domy, blogs, lokality] = await Promise.all([
      base44.asServiceRole.entities.Dom.filter({ verejny: true }),
      base44.asServiceRole.entities.BlogPost.filter({ publikovany: true }),
      base44.asServiceRole.entities.LokaciaSEO.filter({ verejny: true })
    ]);

    // Vypočítaj hash zmien (vrátane všetkých fotiek a dátumov aktualizácie)
    const newHash = [
      domy.map(d => [d.hlavny_obrazok, ...(d.galeria || []), ...(d.galerie ? d.galerie.flatMap((g: any) => g.fotky || []) : [])].join(',')).join(';'),
      blogs.map(b => b.slug + (b.updated_date || '')).join(';'),
      lokality.map(l => l.slug + (l.updated_date || '')).join(';')
    ].join('|');

    // Ak sa hash zhoduje a máme nejaký cache zaznam, predĺžime platnosť a vrátime cache bez opätovného zápisu
    if (cached && cached.hash === newHash && !forceRefresh) {
      console.log("⚡ [Sitemap] No changes detected in databases. Renewing cache TTL.");
      await setCache(cached.xml, newHash);
      return new Response(cached.xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT-RENEWED'
        }
      });
    }
    
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
    
    // Noindex prefixes to exclude
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
    
    // Domy – vrátane všetkých obrázkov z galérií
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
      
      // Zoznam všetkých obrázkov
      const galleryImages = [
        dom.hlavny_obrazok,
        ...(dom.galeria || []),
        ...(dom.galerie ? dom.galerie.flatMap((g: any) => g.fotky || []) : [])
      ].filter(Boolean);

      for (const img of galleryImages) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${img}</image:loc>\n`;
        xml += `      <image:title>${dom.nazov} – ${dom.vyrobca} | American Living</image:title>\n`;
        xml += `    </image:image>\n`;
      }
      
      xml += `  </url>\n`;
    }

    // Lokality
    for (const lok of lokality) {
      if (!lok.slug) continue;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/lokalita/${lok.slug}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `    <lastmod>${lok.updated_date?.split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += `  </url>\n`;
    }

    // Blogy
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
    
    console.log(`💾 [Sitemap] Sitemap regenerated successfully. Updating cache.`);
    await setCache(xml, newHash);
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'MISS'
      }
    });
    
  } catch (error) {
    console.error('❌ [Sitemap] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});