import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Overiť, či je používateľ admin
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Spúšťam generovanie AI Marketing Insights...');

    // 1. Načítať len verejné domy
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    const domy = allDomy.filter(dom => dom.verejny !== false);
    console.log(`📊 Načítaných ${domy.length} verejných domov (z ${allDomy.length} celkovo)`);

    // 2. Načítať všetky sessions (posledných 1000)
    const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 1000);
    console.log(`📊 Načítaných ${sessions.length} sessions`);

    // 3. Načítať používateľské preferencie (cookies data)
    const userPreferences = await base44.asServiceRole.entities.UserPreferences.list('', 1000);
    console.log(`🍪 Načítaných ${userPreferences.length} používateľských preferencií`);

    const insights = [];

    // 4. Pre každý dom vytvoriť analýzu
    for (const dom of domy) {
      console.log(`🏠 Analyzujem dom: ${dom.nazov}`);

      // Filtrovať sessions pre tento dom
      const domSessions = sessions.filter(session => {
        // Kontrola v pages_visited
        const visitedDom = session.pages_visited?.some(page => 
          page.page_url?.includes(`/detail-domu?id=${dom.id}`) ||
          page.page_url?.includes(`/detail-domu/${dom.slug}`)
        );
        
        // Kontrola v dom_interactions
        const interactedDom = session.dom_interactions?.some(interaction => 
          interaction.dom_id === dom.id || interaction.dom_nazov === dom.nazov
        );

        return visitedDom || interactedDom;
      });

      if (domSessions.length < 1) {
        console.log(`⚠️ Nedostatok dát pre ${dom.nazov} (${domSessions.length} sessions), preskakujem...`);
        continue;
      }
      
      console.log(`✅ Našiel som ${domSessions.length} sessions pre ${dom.nazov}`);

      // Získať preferencie používateľov, ktorí prezerali tento dom
      const domUserPreferences = userPreferences.filter(pref => 
        pref.prehliadnute_domy?.some(d => d.dom_id === dom.id || d.dom_nazov === dom.nazov)
      );
      console.log(`🍪 Našiel som ${domUserPreferences.length} používateľských preferencií pre ${dom.nazov}`);

      // Analýza cookies a preferencií
      const cookieData = {
        vracajuci_sa_pouzivatelia: domUserPreferences.filter(p => 
          p.prehliadnute_domy?.length > 1
        ).length,
        oblubeni_vyrobcovia: {},
        cenove_rozlozenie_preferencie: {
          do_50k: 0,
          '50k_100k': 0,
          '100k_150k': 0,
          nad_150k: 0
        },
        related_houses_viewed: {},
        konfigurator_usage: domUserPreferences.filter(p => 
          p.konfigurator_interakcie?.some(k => k.dokoncene)
        ).length
      };

      // Analyzovať preferencie výrobcov
      domUserPreferences.forEach(pref => {
        pref.oblubene_vyrobcovia?.forEach(vyrobca => {
          cookieData.oblubeni_vyrobcovia[vyrobca] = 
            (cookieData.oblubeni_vyrobcovia[vyrobca] || 0) + 1;
        });

        // Cenové preferencie
        if (pref.cenove_pasmo) {
          if (pref.cenove_pasmo.max < 50000) cookieData.cenove_rozlozenie_preferencie.do_50k++;
          else if (pref.cenove_pasmo.max < 100000) cookieData.cenove_rozlozenie_preferencie['50k_100k']++;
          else if (pref.cenove_pasmo.max < 150000) cookieData.cenove_rozlozenie_preferencie['100k_150k']++;
          else cookieData.cenove_rozlozenie_preferencie.nad_150k++;
        }

        // Súvisiace prezerané domy
        pref.prehliadnute_domy?.forEach(house => {
          if (house.dom_nazov !== dom.nazov) {
            cookieData.related_houses_viewed[house.dom_nazov] = 
              (cookieData.related_houses_viewed[house.dom_nazov] || 0) + 1;
          }
        });
      });

      const topRelatedHouses = Object.entries(cookieData.related_houses_viewed)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nazov]) => nazov);

      const topPreferredManufacturers = Object.entries(cookieData.oblubeni_vyrobcovia)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([vyrobca]) => vyrobca);

      // Zber štatistík
      const stats = {
        pocet_zobrazeni: domSessions.length,
        pocet_konfiguracii: domSessions.filter(s => 
          s.configurator_interactions?.some(i => i.dom_nazov === dom.nazov)
        ).length,
        priemerny_cas: Math.round(
          domSessions.reduce((sum, s) => {
            const domPage = s.pages_visited?.find(p => 
              p.page_url?.includes(`/detail-domu?id=${dom.id}`) ||
              p.page_url?.includes(`/detail-domu/${dom.slug}`)
            );
            return sum + (domPage?.time_spent_seconds || 0);
          }, 0) / domSessions.length
        )
      };

      // Geografická analýza
      const locationStats = {};
      const regionStats = {};
      const cityStats = {};

      domSessions.forEach(session => {
        if (session.location_info?.country) {
          locationStats[session.location_info.country] = 
            (locationStats[session.location_info.country] || 0) + 1;
        }
        if (session.location_info?.region) {
          regionStats[session.location_info.region] = 
            (regionStats[session.location_info.region] || 0) + 1;
        }
        if (session.location_info?.city) {
          cityStats[session.location_info.city] = 
            (cityStats[session.location_info.city] || 0) + 1;
        }
      });

      const topKrajiny = Object.entries(locationStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([krajina, pocet]) => ({
          krajina,
          pocet_navstev: pocet,
          percento: Math.round((pocet / domSessions.length) * 100)
        }));

      const topRegiony = Object.entries(regionStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([region, pocet]) => ({
          region,
          pocet_navstev: pocet,
          percento: Math.round((pocet / domSessions.length) * 100)
        }));

      const topMesta = Object.entries(cityStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([mesto, pocet]) => ({
          mesto,
          pocet_navstev: pocet,
          percento: Math.round((pocet / domSessions.length) * 100)
        }));

      // Analýza zariadení
      const deviceStats = { desktop: 0, mobile: 0, tablet: 0 };
      const browserStats = {};

      domSessions.forEach(session => {
        const deviceType = session.device_info?.device_type || 'desktop';
        deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1;
        
        if (session.device_info?.browser) {
          browserStats[session.device_info.browser] = 
            (browserStats[session.device_info.browser] || 0) + 1;
        }
      });

      const totalDevices = domSessions.length;
      const zariadenia = {
        desktop: Math.round((deviceStats.desktop / totalDevices) * 100),
        mobile: Math.round((deviceStats.mobile / totalDevices) * 100),
        tablet: Math.round((deviceStats.tablet / totalDevices) * 100),
        top_prehliadace: Object.entries(browserStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([browser]) => browser),
        odporucane_platformy: []
      };

      // Určiť odporúčané platformy
      if (zariadenia.mobile > 50) {
        zariadenia.odporucane_platformy.push('Instagram', 'TikTok', 'Facebook Mobile');
      }
      if (zariadenia.desktop > 40) {
        zariadenia.odporucane_platformy.push('Facebook Desktop', 'Google Search', 'YouTube');
      }

      // Analýza konfigurátora
      const fasadyStats = {};
      const interieryStats = {};
      const doplnkyStats = {};
      const ceny = [];

      domSessions.forEach(session => {
        session.configurator_interactions?.forEach(interaction => {
          if (interaction.dom_nazov === dom.nazov) {
            // Analýza fasád
            if (interaction.option_selected?.includes('fasada')) {
              fasadyStats[interaction.option_selected] = 
                (fasadyStats[interaction.option_selected] || 0) + 1;
            }
            // Analýza interiérov
            if (interaction.option_selected?.includes('obklad') || 
                interaction.option_selected?.includes('sadrokarton')) {
              interieryStats[interaction.option_selected] = 
                (interieryStats[interaction.option_selected] || 0) + 1;
            }
            // Analýza doplnkov
            if (interaction.option_selected?.includes('kurenie') || 
                interaction.option_selected?.includes('rekuperacia') ||
                interaction.option_selected?.includes('klimatizacia')) {
              doplnkyStats[interaction.option_selected] = 
                (doplnkyStats[interaction.option_selected] || 0) + 1;
            }
            
            if (interaction.price_at_time) {
              ceny.push(interaction.price_at_time);
            }
          }
        });
      });

      const konfPreferencie = {
        popularne_fasady: Object.entries(fasadyStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([typ, pocet]) => ({
            typ,
            pocet,
            percento: Math.round((pocet / domSessions.length) * 100)
          })),
        popularne_interiery: Object.entries(interieryStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([typ, pocet]) => ({
            typ,
            pocet,
            percento: Math.round((pocet / domSessions.length) * 100)
          })),
        popularne_doplnky: Object.entries(doplnkyStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([nazov, pocet]) => ({
            nazov,
            pocet,
            percento: Math.round((pocet / domSessions.length) * 100)
          })),
        priemerna_koncova_cena: ceny.length > 0 
          ? Math.round(ceny.reduce((a, b) => a + b, 0) / ceny.length)
          : dom.zakladna_cena || 0,
        cenove_rozlozenie: {
          do_50k: ceny.filter(c => c < 50000).length,
          "50k_100k": ceny.filter(c => c >= 50000 && c < 100000).length,
          "100k_150k": ceny.filter(c => c >= 100000 && c < 150000).length,
          nad_150k: ceny.filter(c => c >= 150000).length
        }
      };

      // Behaviorálna segmentácia
      const vracajuciSa = domSessions.filter(s => 
        s.session_tags?.includes('vracajuci_sa')
      ).length;
      const prieskumnici = domSessions.filter(s => 
        s.pages_visited?.length > 5
      ).length;
      const rozhodovatelia = domSessions.filter(s => 
        s.configurator_interactions?.length > 3
      ).length;

      const behavioralna = {
        typ_navstevnika: {
          prieskumnici: Math.round((prieskumnici / domSessions.length) * 100),
          rozhodovatelia: Math.round((rozhodovatelia / domSessions.length) * 100),
          vracajuci_sa: Math.round((vracajuciSa / domSessions.length) * 100)
        },
        priemerny_pocet_zobrazeni_pred_konverziou: Math.round(
          domSessions.filter(s => s.conversions?.length > 0).length > 0
            ? domSessions.reduce((sum, s) => sum + (s.pages_visited?.length || 0), 0) /
              domSessions.filter(s => s.conversions?.length > 0).length
            : 0
        ),
        oblubene_blogovepPrispevky: []
      };

      // Generovať kľúčové slová
      const klucoveSlova = [
        dom.nazov,
        dom.vyrobca,
        dom.typ_domu,
        `${dom.typ_domu} domy`,
        `${dom.vyrobca} ${dom.nazov}`,
        konfPreferencie.popularne_fasady[0]?.typ,
        konfPreferencie.popularne_interiery[0]?.typ,
        topMesta[0]?.mesto ? `domy ${topMesta[0].mesto}` : null,
        dom.celorocny ? 'celoro čné bývanie' : 'rekreačné domy'
      ].filter(Boolean);

      // Pripraviť dáta pre AI
      const aiPrompt = `Analyzuj tieto marketingové dáta pre dom "${dom.nazov}" od výrobcu ${dom.vyrobca} a vytvor presné odporúčania pre reklamné kampane na sociálnych sieťach.

ZÁKLADNÉ DÁTA:
- Počet zobrazení: ${stats.pocet_zobrazeni}
- Počet konfigurácií: ${stats.pocet_konfiguracii}
- Priemerný čas na stránke: ${stats.priemerny_cas}s
- Top krajiny: ${topKrajiny.map(k => `${k.krajina} (${k.percento}%)`).join(', ')}
- Top mestá: ${topMesta.map(m => `${m.mesto} (${m.percento}%)`).join(', ')}
- Zariadenia: Desktop ${zariadenia.desktop}%, Mobile ${zariadenia.mobile}%, Tablet ${zariadenia.tablet}%
- Populárne fasády: ${konfPreferencie.popularne_fasady.map(f => f.typ).join(', ')}
- Populárne interiéry: ${konfPreferencie.popularne_interiery.map(i => i.typ).join(', ')}
- Priemerná cena: ${konfPreferencie.priemerna_koncova_cena}€
- Typ návštevníkov: ${behavioralna.typ_navstevnika.prieskumnici}% prieskumníci, ${behavioralna.typ_navstevnika.rozhodovatelia}% rozhodovatelia, ${behavioralna.typ_navstevnika.vracajuci_sa}% vracajúci sa

COOKIES & POUŽÍVATEĽSKÉ PREFERENCIE:
- Vracajúci sa používatelia: ${cookieData.vracajuci_sa_pouzivatelia} (${domUserPreferences.length > 0 ? Math.round((cookieData.vracajuci_sa_pouzivatelia / domUserPreferences.length) * 100) : 0}%)
- Top preferovaní výrobcovia: ${topPreferredManufacturers.join(', ') || 'žiadne dáta'}
- Súvisiace prezerané domy: ${topRelatedHouses.join(', ') || 'žiadne'}
- Používatelia s dokončeným konfigurátorom: ${cookieData.konfigurator_usage}
- Cenové preferencie: ${cookieData.cenove_rozlozenie_preferencie.do_50k} do 50k, ${cookieData.cenove_rozlozenie_preferencie['50k_100k']} 50-100k, ${cookieData.cenove_rozlozenie_preferencie['100k_150k']} 100-150k, ${cookieData.cenove_rozlozenie_preferencie.nad_150k} nad 150k

Vytvor DETAILNÉ odporúčania v slovenčine obsahujúce:
1. Konkrétne nastavenia pre Facebook/Instagram kampane (cieľová skupina, záujmy, umiestnenia, formát, budget) + RETARGETING stratégie pomocou cookies
2. Konkrétne nastavenia pre Google Ads (typ kampane, kľúčové slová, geografické cielenie, budget) + REMARKETING pomocou Google Ads cookies
3. Hodnotenie vhodnosti pre TikTok
4. Cookie-based RETARGETING stratégie (Lookalike audiences, Custom audiences, Retargeting pixels)
5. Zrozumiteľný súhrn pre marketéra s presnými inštrukciami

Odpovedz iba v slovenčine s praktickými a konkrétnymi radami vrátane využitia cookies pre retargeting.`;

      console.log('🤖 Posielam dáta na AI analýzu...');

      // Zavolať AI na vytvorenie odporúčaní
      let aiResponse;
      try {
        aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: aiPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            facebook_instagram: {
              type: "object",
              properties: {
                cielova_skupina: { type: "string" },
                zaujmy: { type: "array", items: { type: "string" } },
                umiestnenia: { type: "array", items: { type: "string" } },
                format_reklamy: { type: "array", items: { type: "string" } },
                budget_odporucanie: { type: "string" }
              }
            },
            google_ads: {
              type: "object",
              properties: {
                typ_kampane: { type: "string" },
                klucove_slova: { type: "array", items: { type: "string" } },
                geograficke_cielenie: { type: "array", items: { type: "string" } },
                budget_odporucanie: { type: "string" }
              }
            },
            tiktok: {
              type: "object",
              properties: {
                vhodnost: { type: "string" },
                dovod: { type: "string" }
              }
            },
            retargeting_strategie: {
              type: "object",
              properties: {
                facebook_pixel: { type: "string" },
                google_remarketing: { type: "string" },
                lookalike_audiences: { type: "string" },
                custom_audiences: { type: "string" },
                email_retargeting: { type: "string" }
              }
            },
            sumar: { type: "string" },
            detailny_navod: { type: "string" }
          }
        }
      });
        console.log('✅ AI analýza dokončená');
      } catch (aiError) {
        console.error('❌ Chyba pri AI analýze:', aiError.message);
        // Použiť predvolené hodnoty ak AI zlyhá
        aiResponse = {
          facebook_instagram: {
            cielova_skupina: "Záujemcovia o bývanie",
            zaujmy: ["Nehnuteľnosti", "Bývanie", "Rodinné domy"],
            umiestnenia: ["News Feed", "Instagram Feed", "Stories"],
            format_reklamy: ["Carousel", "Single Image", "Video"],
            budget_odporucanie: "20-50€ denne"
          },
          google_ads: {
            typ_kampane: "Search",
            klucove_slova: klucoveSlova.slice(0, 5),
            geograficke_cielenie: topMesta.map(m => m.mesto).slice(0, 3),
            budget_odporucanie: "30-70€ denne"
          },
          tiktok: {
            vhodnost: "Stredne vhodný",
            dovod: "Závisí od cieľovej skupiny"
          },
          retargeting_strategie: {
            facebook_pixel: "Nastaviť Facebook Pixel pre sledovanie návštev a vytvorenie Custom Audiences",
            google_remarketing: "Použiť Google Remarketing tag pre zobrazovanie reklám návštevníkom webu",
            lookalike_audiences: "Vytvoriť Lookalike Audiences na základe konvertujúcich zákazníkov",
            custom_audiences: "Segmentovať audiences podľa prezeraných domov a interakcií s konfigurátorom",
            email_retargeting: "Retargetovať používateľov, ktorí zanechali email cez kontaktný formulár"
          },
          sumar: `Pre dom ${dom.nazov} odporúčame zamerať sa na ${topMesta[0]?.mesto || 'miestny trh'} s dôrazom na ${zariadenia.mobile > 50 ? 'mobilné' : 'desktop'} zariadenia a využiť retargeting pre ${cookieData.vracajuci_sa_pouzivatelia} vracajúcich sa používateľov.`,
          detailny_navod: `Kompletný marketingový plán pre ${dom.nazov} vrátane retargeting stratégií sa generuje...`
        };
      }

      // Vypočítať confidence score
      const confidenceScore = Math.min(100, Math.round(
        (domSessions.length / 10) * 30 +
        (stats.pocet_konfiguracii / domSessions.length) * 40 +
        (topKrajiny.length > 0 ? 15 : 0) +
        (konfPreferencie.popularne_fasady.length > 0 ? 15 : 0)
      ));

      // Vytvoriť insight objekt
      const insight = {
        dom_id: dom.id,
        dom_nazov: dom.nazov,
        vyrobca: dom.vyrobca,
        celkovy_zajem: {
          pocet_zobrazeni: stats.pocet_zobrazeni,
          pocet_konfiguracii: stats.pocet_konfiguracii,
          priemerny_cas_na_stranke: stats.priemerny_cas,
          miera_konverzie: stats.pocet_konfiguracii > 0 
            ? Math.round((stats.pocet_konfiguracii / stats.pocet_zobrazeni) * 100) 
            : 0
        },
        geograficke_cielenie: {
          top_krajiny: topKrajiny,
          top_regiony: topRegiony,
          top_mesta: topMesta
        },
        zariadenia_a_platforma: zariadenia,
        konfigurator_preferencie: konfPreferencie,
        behavioralna_segmentacia: behavioralna,
        klucove_slova: klucoveSlova,
        odporucania_kampane: {
          facebook_instagram: aiResponse.facebook_instagram || {},
          google_ads: aiResponse.google_ads || {},
          tiktok: aiResponse.tiktok || {},
          retargeting_strategie: aiResponse.retargeting_strategie || {}
        },
        cookie_analytics: {
          vracajuci_sa_pouzivatelia: cookieData.vracajuci_sa_pouzivatelia,
          top_preferovani_vyrobcovia: topPreferredManufacturers,
          suvisiace_prezerane_domy: topRelatedHouses,
          dokoncene_konfiguracie: cookieData.konfigurator_usage,
          cenove_preferencie: cookieData.cenove_rozlozenie_preferencie
        },
        sumar_odporucani: aiResponse.sumar || '',
        ai_generovany_text: aiResponse.detailny_navod || '',
        confidence_score: confidenceScore,
        pocet_analyzovanych_sessions: domSessions.length,
        datum_generovania: new Date().toISOString(),
        posledna_aktualizacia: new Date().toISOString()
      };

      insights.push(insight);

      // Uložiť do databázy
      // Najprv skontrolovať, či už existuje insight pre tento dom
      const existingInsights = await base44.asServiceRole.entities.MarketingInsight.filter({ 
        dom_id: dom.id 
      });

      if (existingInsights.length > 0) {
        // Aktualizovať existujúci
        await base44.asServiceRole.entities.MarketingInsight.update(
          existingInsights[0].id,
          insight
        );
        console.log(`✅ Aktualizovaný insight pre ${dom.nazov}`);
      } else {
        // Vytvoriť nový
        await base44.asServiceRole.entities.MarketingInsight.create(insight);
        console.log(`✅ Vytvorený nový insight pre ${dom.nazov}`);
      }
    }

    console.log(`🎉 Dokončené! Vygenerovaných ${insights.length} marketing insights`);

    return Response.json({
      success: true,
      message: `Úspešne vygenerovaných ${insights.length} marketingových poznatkov`,
      insights_count: insights.length,
      analyzed_houses: domy.length,
      total_sessions: sessions.length
    });

  } catch (error) {
    console.error('❌ Chyba pri generovaní insights:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});