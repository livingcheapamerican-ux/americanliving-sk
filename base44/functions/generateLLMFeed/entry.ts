import { createClientFromRequest } from 'npm:@base44/sdk@0.8.30';

const CACHE_KEY = "llm_feed_data_cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

// Global variable for in-memory caching fallback
let memoryCache: { data: any, timestamp: number } | null = null;

async function getCache() {
  // 1. Try Deno.openKv
  try {
    const kv = await Deno.openKv();
    const result = await kv.get([CACHE_KEY]);
    await kv.close();
    if (result && result.value) {
      const cached = result.value as { data: any, timestamp: number };
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("⚡ [Cache] Loaded LLM Feed from Deno.KV");
        return cached.data;
      }
    }
  } catch (e) {
    console.log(`⚠️ [Cache] Deno.openKv failed: ${e.message}`);
  }

  // 2. Try in-memory fallback
  if (memoryCache && (Date.now() - memoryCache.timestamp < CACHE_TTL)) {
    console.log("⚡ [Cache] Loaded LLM Feed from In-Memory Cache");
    return memoryCache.data;
  }

  return null;
}

async function setCache(data: any) {
  const cacheValue = { data, timestamp: Date.now() };

  // 1. Try Deno.openKv
  try {
    const kv = await Deno.openKv();
    await kv.set([CACHE_KEY], cacheValue);
    await kv.close();
    console.log("💾 [Cache] Saved LLM Feed to Deno.KV");
  } catch (e) {
    console.log(`⚠️ [Cache] Deno.openKv save failed: ${e.message}`);
  }

  // 2. In-memory cache save
  memoryCache = cacheValue;
  console.log("💾 [Cache] Saved LLM Feed to In-Memory Cache");
}

Deno.serve(async (req) => {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check cache
    const cachedData = await getCache();
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT'
        }
      });
    }

    const base44 = createClientFromRequest(req);

    // Fetch data
    console.log("📡 [LLM Feed] Fetching fresh data from Supabase/base44...");
    const [domy, lokality, blogs] = await Promise.all([
      base44.asServiceRole.entities.Dom.filter({ verejny: true }),
      base44.asServiceRole.entities.LokaciaSEO.filter({ verejny: true }),
      base44.asServiceRole.entities.BlogPost.filter({ publikovany: true })
    ]);

    const feedData = {
      meta: {
        domain: "americanliving.sk",
        title: "American Living - LLM Knowledge Feed",
        generatedAt: new Date().toISOString(),
        version: "1.0"
      },
      company: {
        name: "American Living s.r.o.",
        url: "https://americanliving.sk",
        description: "Predaj a výstavba nízkoenergetických modulárnych, montovaných a mobilných domov na Slovensku. Výhradný zástupca značiek Ticab house a Prosto House.",
        telephone: "+421905138124",
        email: "info@americanliving.sk",
        address: {
          street: "Športová 1",
          city: "Bratislava",
          postalCode: "82109",
          country: "Slovensko"
        }
      },
      houses: domy.map(dom => {
        const galleryImages = [
          dom.hlavny_obrazok,
          ...(dom.galeria || []),
          ...(dom.galerie ? dom.galerie.flatMap((g: any) => g.fotky || []) : [])
        ].filter(Boolean);

        return {
          id: dom.id,
          name: dom.nazov,
          slug: dom.slug,
          manufacturer: dom.vyrobca,
          house_type: dom.typ_domu,
          rooms: dom.pocet_izieb,
          built_area_sqm: dom.zastavana_plocha,
          usable_area_sqm: dom.uzitkova_plocha,
          base_price_vat: dom.zakladna_cena,
          description: dom.popis,
          year_round: dom.celorocny,
          energy_class: dom.energeticky_certifikat || "A0",
          url: `https://americanliving.sk/detail-domu?slug=${dom.slug || dom.id}`,
          main_image: dom.hlavny_obrazok,
          gallery: galleryImages,
          faqs: dom.faq_schema_data?.sk?.faqs || dom.faq_schema_data?.faqs || []
        };
      }),
      locations: lokality.map(lok => ({
        id: lok.id,
        city: lok.nazov_mesta,
        slug: lok.slug,
        title: lok.meta_title,
        description: lok.meta_description,
        url: `https://americanliving.sk/lokalita/${lok.slug}`
      })),
      blogs: blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        summary: blog.summary,
        content: blog.content,
        url: `https://americanliving.sk/blog/${blog.slug}`,
        published_date: blog.published_date || blog.created_date
      }))
    };

    // Save to cache
    await setCache(feedData);

    return new Response(JSON.stringify(feedData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error("❌ [LLM Feed] Error generating feed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
