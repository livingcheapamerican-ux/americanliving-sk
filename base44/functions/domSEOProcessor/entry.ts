import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * DOM SEO PROCESSOR v2 (0 AI credits)
 * Modernizovaná verzia: silnejšie meta tagy, 5 FAQ, slug interné linky, bohatší alt text
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    const domId = event?.entity_id;
    if (!domId) return Response.json({ error: 'Missing entity_id' }, { status: 400 });

    // ── Loop protection ────────────────────────────────────────────────────
    const realContentFields = [
      'nazov', 'vyrobca', 'typ_domu', 'zakladna_cena',
      'zastavana_plocha', 'uzitkova_plocha', 'pocet_izieb',
      'hlavny_obrazok', 'zakladna_konfiguracia_obrazok',
      'galeria', 'podorys_2d', 'podorys_3d',
      'popis', 'rozmery', 'kategoria', 'celorocny', 'slug'
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

    const dom = data || await base44.asServiceRole.entities.Dom.get(domId);
    if (!dom) return Response.json({ error: 'Dom not found' }, { status: 404 });

    // ── SEO: Vylepšený Meta Title & Description ────────────────────────────
    const typMap = {
      modularny: 'Modulárny dom',
      montovany: 'Montovaný dom',
      mobilny: 'Mobilný dom'
    };
    const typText = typMap[dom.typ_domu] || 'Dom';
    const typTextLower = typText.toLowerCase();
    const cenaFormatted = dom.zakladna_cena ? dom.zakladna_cena.toLocaleString('sk-SK') : 'na vyžiadanie';
    const plocha = dom.zastavana_plocha || dom.uzitkova_plocha || 0;
    const izby = dom.pocet_izieb ? ` | ${dom.pocet_izieb}-izbový` : '';
    const certA0 = dom.energeticky_certifikat ? ' | Energetická trieda A0' : '';

    // Keyword-rich meta title (max 60 znakov)
    const meta_title = `${dom.nazov} – ${typText} ${plocha}m²${izby} | American Living`;

    // Keyword-rich meta description (max 160 znakov, obsahuje CTA + cenu)
    const meta_description = `${dom.nazov} od ${dom.vyrobca}: ${typText} ${plocha}m²${dom.uzitkova_plocha ? `, úžitková ${dom.uzitkova_plocha}m²` : ''}${certA0}. Cena od ${cenaFormatted} EUR s DPH. Montáž 60 dní. Získajte bezplatnú konzultáciu!`;

    // ── SEO: Rozšírené FAQ Schema (5 otázok = lepší E-E-A-T signál) ──────
    const faq_schema_data = {
      sk: {
        faqs: [
          {
            otazka: `Aká je cena ${typTextLower}u ${dom.nazov}?`,
            odpoved: `Základná cena ${typTextLower}u ${dom.nazov} od ${dom.vyrobca} je ${cenaFormatted} EUR s DPH. Cena zahŕňa základnú konfiguráciu. Presná cena závisí od zvolených možností v konfigurátore.`
          },
          {
            otazka: `Akú plochu má ${dom.nazov}?`,
            odpoved: `${dom.nazov} má zastavanú plochu ${plocha} m²${dom.uzitkova_plocha ? ` a úžitkovú plochu ${dom.uzitkova_plocha} m²` : ''}${dom.pocet_izieb ? `. Dom má ${dom.pocet_izieb} izbový dispozičný layout` : ''}.`
          },
          {
            otazka: `Kto vyrába dom ${dom.nazov} a kde ho dostanem na Slovensku?`,
            odpoved: `Dom ${dom.nazov} vyrába spoločnosť ${dom.vyrobca}. Na Slovensku je exkluzívnym distribútorom American Living s.r.o. Doručujeme po celom území SR vrátane inštalácie na vašom pozemku.`
          },
          {
            otazka: `Ako dlho trvá výstavba ${typTextLower}u ${dom.nazov}?`,
            odpoved: `Výstavba ${typTextLower}u ${dom.nazov} zvyčajne trvá 60–120 dní od podpisu zmluvy. Modulárna konštrukcia umožňuje rýchle a čisté zostavenie priamo na pozemku bez dlhých stavebných prác.`
          },
          {
            otazka: `Má ${dom.nazov} energetický certifikát?`,
            odpoved: dom.energeticky_certifikat
              ? `Áno, ${dom.nazov} spĺňa požiadavky energetickej triedy A0 – najvyššej možnej triedy. Dom je navrhnutý pre celoročné bývanie s minimálnymi nákladmi na vykurovanie.`
              : `Energetický certifikát pre ${dom.nazov} je dostupný na vyžiadanie. Kontaktujte nás pre aktuálne informácie o energetickej triede tohto modelu.`
          }
        ]
      }
    };

    // ── SEO: Deskriptívne alt texty (nie generické) ──────────────────────
    const imagesSeoMap = { sk: {} };
    const vyrobcaShort = dom.vyrobca?.split(' ')[0] || 'dom';

    if (dom.hlavny_obrazok) {
      imagesSeoMap.sk[dom.hlavny_obrazok] = `${dom.nazov} – ${typText} ${plocha}m² od ${dom.vyrobca}, pohľad zvonku`;
    }
    if (dom.zakladna_konfiguracia_obrazok) {
      imagesSeoMap.sk[dom.zakladna_konfiguracia_obrazok] = `${dom.nazov} – základná konfigurácia, exteriér ${vyrobcaShort}`;
    }
    if (Array.isArray(dom.galeria)) {
      dom.galeria.forEach((img, idx) => {
        const views = ['exteriér', 'bočný pohľad', 'terasa', 'interiér obývačka', 'interiér kúpeľňa', 'vstup'];
        const view = views[idx % views.length];
        imagesSeoMap.sk[img] = `${dom.nazov} ${vyrobcaShort} – ${view} – ${typText} na kľúč`;
      });
    }
    if (dom.podorys_2d) imagesSeoMap.sk[dom.podorys_2d] = `${dom.nazov} – 2D pôdorys ${plocha}m², ${dom.pocet_izieb || ''}izbový ${typTextLower}`;
    if (dom.podorys_3d) imagesSeoMap.sk[dom.podorys_3d] = `${dom.nazov} – 3D vizualizácia pôdorysu, dispozícia miestností`;

    // ── Product Schema JSON-LD (rozšírená verzia) ──────────────────────────
    const canonicalUrl = dom.slug
      ? `https://www.americanliving.sk/DetailDomu?slug=${dom.slug}`
      : `https://www.americanliving.sk/DetailDomu?id=${domId}`;

    const additionalProps = [
      dom.zastavana_plocha && { "@type": "PropertyValue", name: "Zastavaná plocha", value: `${dom.zastavana_plocha} m²`, unitText: "m²" },
      dom.uzitkova_plocha && { "@type": "PropertyValue", name: "Úžitková plocha", value: `${dom.uzitkova_plocha} m²`, unitText: "m²" },
      dom.pocet_izieb && { "@type": "PropertyValue", name: "Počet izieb", value: String(dom.pocet_izieb) },
      dom.rozmery?.sirka && { "@type": "PropertyValue", name: "Šírka", value: `${dom.rozmery.sirka} m` },
      dom.rozmery?.dlzka && { "@type": "PropertyValue", name: "Dĺžka", value: `${dom.rozmery.dlzka} m` },
      dom.energeticky_certifikat && { "@type": "PropertyValue", name: "Energetická trieda", value: "A0" },
      dom.celorocny && { "@type": "PropertyValue", name: "Typ využitia", value: "Celoročné bývanie" }
    ].filter(Boolean);

    const product_schema_json = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "@id": `${canonicalUrl}#product`,
      name: dom.nazov,
      description: meta_description,
      image: [dom.hlavny_obrazok, ...(dom.galeria || [])].filter(Boolean),
      brand: { "@type": "Brand", name: dom.vyrobca },
      manufacturer: {
        "@type": "Organization",
        "@id": "https://www.americanliving.sk/#organization",
        name: "American Living"
      },
      offers: {
        "@type": "Offer",
        url: canonicalUrl,
        priceCurrency: "EUR",
        price: dom.zakladna_cena || 0,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          "@id": "https://www.americanliving.sk/#organization",
          name: "American Living"
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "EUR" },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: ["SK", "CZ", "HU", "PL", "AT", "DE"]
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 60, maxValue: 120, unitCode: "DAY" }
          }
        }
      },
      ...(additionalProps.length > 0 ? { additionalProperty: additionalProps } : {})
    };

    // ── Jediný DB write ───────────────────────────────────────────────────
    await base44.asServiceRole.entities.Dom.update(domId, {
      meta_title,
      meta_description,
      faq_schema_data,
      images_seo_map: imagesSeoMap,
      product_schema_json
    });

    console.log(`✅ domSEOProcessor v2: ${dom.nazov} → title=${meta_title.length}ch, ${faq_schema_data.sk.faqs.length} FAQs, ${Object.keys(imagesSeoMap.sk).length} alt texty`);

    return Response.json({
      success: true,
      nazov: dom.nazov,
      generated: { meta_title, faq_count: 5, images_count: Object.keys(imagesSeoMap.sk).length }
    });

  } catch (error) {
    console.error('domSEOProcessor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});