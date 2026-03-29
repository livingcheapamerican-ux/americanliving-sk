import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * DOM SEO PROCESSOR (0 AI credits)
 * Zlúčená náhrada za generateBasicSEO + generateProductSchema
 * Spúšťa sa len pri CREATE alebo keď sa zmenia skutočné content polia.
 * Jeden DB write namiesto dvoch – šetrí overhead aj kredity.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    const domId = event?.entity_id;
    if (!domId) {
      return Response.json({ error: 'Missing entity_id' }, { status: 400 });
    }

    // ── Loop protection ─────────────────────────────────────────────────────
    // Spúšťame sa len ak sa zmenili skutočné content polia (nie naše vlastné SEO/meta polia)
    const realContentFields = [
      'nazov', 'vyrobca', 'typ_domu', 'zakladna_cena',
      'zastavana_plocha', 'uzitkova_plocha', 'pocet_izieb',
      'hlavny_obrazok', 'zakladna_konfiguracia_obrazok',
      'galeria', 'podorys_2d', 'podorys_3d',
      'popis', 'rozmery', 'kategoria', 'celorocny'
    ];

    if (event.type === 'update' && old_data && data) {
      const hasRealChange = realContentFields.some(
        f => JSON.stringify(old_data[f]) !== JSON.stringify(data[f])
      );
      if (!hasRealChange) {
        console.log(`⏭️ domSEOProcessor: skipping ${data?.nazov} – only meta fields changed`);
        return Response.json({ success: true, skipped: true, reason: 'only_meta_changed' });
      }
    }

    // Použi data z payloadu, ak chýba načítaj z DB
    const dom = data || await base44.asServiceRole.entities.Dom.get(domId);
    if (!dom) return Response.json({ error: 'Dom not found' }, { status: 404 });

    // ── SEO: Meta Title & Description ────────────────────────────────────────
    const typMap = {
      modularny: 'Modulárny dom',
      montovany: 'Montovaný dom',
      mobilny: 'Mobilný dom'
    };
    const typText = typMap[dom.typ_domu] || 'Dom';
    const cena = dom.zakladna_cena ? dom.zakladna_cena.toLocaleString('sk-SK') : 'na vyžiadanie';
    const plocha = dom.zastavana_plocha || dom.uzitkova_plocha || 0;

    const meta_title = `${dom.nazov} | ${typText} | American Living`;
    const meta_description = `Hľadáte ${typText.toLowerCase()} ${dom.nazov}? Dom od ${dom.vyrobca} má plochu ${plocha} m² a cenu od ${cena} EUR. Energetická trieda A0.`;

    // ── SEO: FAQ Schema (SK) ─────────────────────────────────────────────────
    const faq_schema_data = {
      sk: {
        faqs: [
          { otazka: `Aká je cena domu ${dom.nazov}?`, odpoved: `Cena modelu ${dom.nazov} začína od ${cena} EUR s DPH.` },
          { otazka: `Akú plochu má ${dom.nazov}?`, odpoved: `Tento ${typText.toLowerCase()} má zastavanú plochu ${plocha} m².` },
          { otazka: `Kto je výrobca domu ${dom.nazov}?`, odpoved: `Dom ${dom.nazov} vyrába spoločnosť ${dom.vyrobca}.` }
        ]
      }
    };

    // ── SEO: Images alt texty ────────────────────────────────────────────────
    const imagesSeoMap = { sk: {} };
    if (dom.hlavny_obrazok) imagesSeoMap.sk[dom.hlavny_obrazok] = `${dom.nazov} - moderný ${typText.toLowerCase()} na kľúč od ${dom.vyrobca}`;
    if (dom.zakladna_konfiguracia_obrazok) imagesSeoMap.sk[dom.zakladna_konfiguracia_obrazok] = `${dom.nazov} - základná konfigurácia`;
    if (Array.isArray(dom.galeria)) {
      dom.galeria.forEach((img, idx) => {
        imagesSeoMap.sk[img] = `${dom.nazov} - ${typText.toLowerCase()} - pohľad ${idx + 1}`;
      });
    }
    if (dom.podorys_2d) imagesSeoMap.sk[dom.podorys_2d] = `${dom.nazov} - 2D pôdorys domu`;
    if (dom.podorys_3d) imagesSeoMap.sk[dom.podorys_3d] = `${dom.nazov} - 3D vizualizácia pôdorysu`;

    // ── Product Schema JSON-LD ───────────────────────────────────────────────
    const canonicalUrl = dom.slug
      ? `https://americanliving.sk/DetailDomu?slug=${dom.slug}`
      : `https://americanliving.sk/DetailDomu?id=${domId}`;

    const product_schema_json = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "@id": `${canonicalUrl}#product`,
      name: dom.nazov,
      description: (dom.popis || meta_description).substring(0, 160),
      image: [dom.hlavny_obrazok, ...(dom.galeria || [])].filter(Boolean),
      brand: { "@type": "Brand", name: dom.vyrobca },
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: "EUR",
        price: dom.zakladna_cena || 0,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "American Living" }
      },
      ...(dom.zastavana_plocha || dom.uzitkova_plocha || dom.pocet_izieb ? {
        additionalProperty: [
          dom.zastavana_plocha && { "@type": "PropertyValue", name: "Zastavaná plocha", value: `${dom.zastavana_plocha} m²` },
          dom.uzitkova_plocha && { "@type": "PropertyValue", name: "Úžitková plocha", value: `${dom.uzitkova_plocha} m²` },
          dom.pocet_izieb && { "@type": "PropertyValue", name: "Počet izieb", value: dom.pocet_izieb }
        ].filter(Boolean)
      } : {})
    };

    // ── Jediný DB write (namiesto dvoch) ─────────────────────────────────────
    await base44.asServiceRole.entities.Dom.update(domId, {
      meta_title,
      meta_description,
      faq_schema_data,
      images_seo_map: imagesSeoMap,
      product_schema_json
    });

    console.log(`✅ domSEOProcessor: SEO + Product Schema generated for ${dom.nazov}`);

    return Response.json({
      success: true,
      nazov: dom.nazov,
      generated: { meta_title, faq_count: 3, images_count: Object.keys(imagesSeoMap.sk).length, product_schema: true }
    });

  } catch (error) {
    console.error('domSEOProcessor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});