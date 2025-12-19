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

    // Admin IP adresy na vylúčenie
    const ADMIN_IPS = [
      '109.230.104.122', // Admin IP - pridajte ďalšie podľa potreby
    ];

    // 1. Načítať len verejné domy
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    const domy = allDomy.filter(dom => dom.verejny === true);
    console.log(`📊 Načítaných ${domy.length} verejných domov (z ${allDomy.length} celkovo)`);

    // 2. Načítať všetky sessions a vyfiltrovať admin sessions a admin IP
    const allSessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 1000);
    const sessions = allSessions.filter(session => {
      // Vylúčiť admin a super_admin používateľov
      if (session.user_email === 'living.cheap.american@gmail.com') return false;
      if (session.is_authenticated && user && session.user_email === user.email) return false;

      // Vylúčiť admin IP adresy
      if (session.location_info?.ip && ADMIN_IPS.includes(session.location_info.ip)) return false;

      return true;
    });
    console.log(`📊 Načítaných ${sessions.length} sessions (po filtrovaní adminov a admin IP: ${allSessions.length - sessions.length} vylúčených)`);

    // 3. Načítať používateľské preferencie (cookies data)
    const userPreferences = await base44.asServiceRole.entities.UserPreferences.list('', 1000);
    console.log(`🍪 Načítaných ${userPreferences.length} používateľských preferencií`);

    const insights = [];

    // 4. Pre každý dom vytvoriť analýzu
    for (const dom of domy) {
      console.log(`🏠 Analyzujem dom: ${dom.nazov}`);

      // Filtrovať sessions pre tento dom
      const domSessions = sessions.filter(session => {
        // Kontrola v pages_visited - všetky možné URL formáty
        const visitedDom = session.pages_visited?.some(page => 
          page.page_url?.toLowerCase().includes(`/detail-domu?id=${dom.id}`) ||
          page.page_url?.toLowerCase().includes(`/detail-domu/${dom.slug}`) ||
          page.page_url?.toLowerCase().includes(`detaildomu?id=${dom.id}`) ||
          page.page_url?.toLowerCase().includes(`detaildomu/${dom.slug}`) ||
          page.page_url?.toLowerCase().includes(dom.slug) ||
          page.page_name_sk?.includes(dom.nazov)
        );
        
        // Kontrola v dom_interactions
        const interactedDom = session.dom_interactions?.some(interaction => 
          interaction.dom_id === dom.id || interaction.dom_nazov === dom.nazov
        );

        // Kontrola v konfigurator_interactions
        const configuredDom = session.configurator_interactions?.some(interaction =>
          interaction.dom_nazov === dom.nazov || interaction.dom_id === dom.id
        );

        return visitedDom || interactedDom || configuredDom;
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

      // Načítať predchádzajúce metriky pre detekciu zmien
      const existingInsights = await base44.asServiceRole.entities.MarketingInsight.filter({ 
        dom_id: dom.id 
      });
      const previousMetrics = existingInsights.length > 0 ? {
        pocet_zobrazeni: existingInsights[0].celkovy_zajem?.pocet_zobrazeni || 0,
        miera_konverzie: existingInsights[0].celkovy_zajem?.miera_konverzie || 0,
        confidence_score: existingInsights[0].confidence_score || 0
      } : null;

      // Pripraviť rozšírený prompt pre AI
      const aiPrompt = `Analyzuj tieto marketingové dáta pre dom "${dom.nazov}" od výrobcu ${dom.vyrobca} a vytvor komplexné odporúčania pre reklamné kampane.

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

Vytvor ULTRA-DETAILNÉ odporúčania v slovenčine obsahujúce:

1. Konkrétne nastavenia pre Facebook/Instagram kampane (cieľová skupina, záujmy, umiestnenia, formát, budget) + RETARGETING stratégie pomocou cookies

2. Konkrétne nastavenia pre Google Ads (typ kampane, kľúčové slová, geografické cielenie, budget) + REMARKETING pomocou Google Ads cookies

3. Hodnotenie vhodnosti pre TikTok

4. Cookie-based RETARGETING stratégie (Lookalike audiences, Custom audiences, Retargeting pixels)

5. A/B TESTOVACIE STRATÉGIE:
   - Facebook: minimálne 2 A/B testy s KONKRÉTNYMI HYPOTÉZAMI
   - Google Ads: 3 špecifické testy PRE TEXTY REKLÁM (nadpis, popis) + 3 testy PRE KREATÍVY (obrázky/video)

6. ROI PREDIKCIA + OPTIMÁLNE ROZDELENIE BUDGETU + SCALING ODPORÚČANIA:
   - Odhadni dosah, CTR, konverzie a ROI pre každú platformu
   - Percentuálne rozdelenie budgetu medzi Facebook a Google Ads
   - Príklad s konkrétnymi číslami
   - SCALING PLÁNY pre obe platformy (ako zvyšovať budget bez straty efektivity)

7. KREATÍVNE ODPORÚČANIA - navrhni 3 reklamné obrazky (popis), 3 reklamné texty (nadpis + text + CTA) a 2 video koncepty

8. AI PREDIKCIA KONVERZIE - analyzuj ktorý typ používateľa (prieskumníci ${behavioralna.typ_navstevnika.prieskumnici}%, rozhodovatelia ${behavioralna.typ_navstevnika.rozhodovatelia}%, vracajúci sa ${behavioralna.typ_navstevnika.vracajuci_sa}%) má najvyššiu pravdepodobnosť konverzie a PREČO. Poskytni konkrétne odporúčania ako cieliť každý typ.
   - Pre KAŽDÝ TYP cieľovej skupiny navrhni 3 KONKRÉTNE KREATÍVNE VARIANTY (obrazok/video popis + nadpis + text + CTA)

9. KONKURENČNÁ ANALÝZA:
   - Identifikuj 3 hlavných online konkurentov na základe kľúčových slov: ${klucoveSlova.join(', ')}
   - Pre každého konkurenta odhadni: mesačný budget, najčastejšie kanály, typické kreatívy
   - Analyzuj ich silné a slabé stránky
   - Definuj naše konkurenčné výhody a príležitosti

10. Zrozumiteľný súhrn pre marketéra s presnými inštrukciami

Odpovedz iba v slovenčine s praktickými a konkrétnymi radami.`;

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
            ab_testing_strategie: {
              type: "object",
              properties: {
                facebook_testy: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nazov: { type: "string" },
                      varianta_a: { type: "string" },
                      varianta_b: { type: "string" },
                      odporucany_budget: { type: "string" },
                      meratelne_metriky: { type: "array", items: { type: "string" } },
                      hypoteza: { type: "string" },
                      ocakavany_vysledok: { type: "string" }
                    }
                  }
                },
                google_ads_testy: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nazov: { type: "string" },
                      varianta_a: { type: "string" },
                      varianta_b: { type: "string" },
                      odporucany_budget: { type: "string" },
                      meratelne_metriky: { type: "array", items: { type: "string" } },
                      hypoteza: { type: "string" },
                      ocakavany_vysledok: { type: "string" }
                    }
                  }
                },
                google_ads_texty_testy: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nazov: { type: "string" },
                      hypoteza: { type: "string" },
                      varianta_a_nadpis: { type: "string" },
                      varianta_a_popis: { type: "string" },
                      varianta_b_nadpis: { type: "string" },
                      varianta_b_popis: { type: "string" },
                      ocakavany_vysledok: { type: "string" }
                    }
                  }
                },
                google_ads_kreativy_testy: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nazov: { type: "string" },
                      hypoteza: { type: "string" },
                      varianta_a_popis: { type: "string" },
                      varianta_b_popis: { type: "string" },
                      ocakavany_vysledok: { type: "string" }
                    }
                  }
                }
              }
            },
            roi_predikcia: {
              type: "object",
              properties: {
                facebook_instagram_roi: {
                  type: "object",
                  properties: {
                    odhadovany_dosah: { type: "number" },
                    ocakavany_ctr: { type: "number" },
                    predpokladane_konverzie: { type: "number" },
                    roi_percento: { type: "number" },
                    break_even_cas: { type: "string" }
                  }
                },
                google_ads_roi: {
                  type: "object",
                  properties: {
                    odhadovany_dosah: { type: "number" },
                    ocakavany_ctr: { type: "number" },
                    predpokladane_konverzie: { type: "number" },
                    roi_percento: { type: "number" },
                    break_even_cas: { type: "string" }
                  }
                },
                celkova_roi_prognoza: { type: "string" },
                optimalne_rozdelenie_budgetu: {
                  type: "object",
                  properties: {
                    facebook_percent: { type: "number" },
                    google_ads_percent: { type: "number" },
                    zdovodnenie: { type: "string" },
                    priklad_rozdelenia: {
                      type: "object",
                      properties: {
                        celkovy_budget_mesacne: { type: "number" },
                        facebook_eur: { type: "number" },
                        google_ads_eur: { type: "number" },
                        ocakavane_konverzie_facebook: { type: "number" },
                        ocakavane_konverzie_google: { type: "number" },
                        celkove_ocakavane_roi: { type: "number" }
                      }
                    }
                  }
                },
                scaling_odporucania: {
                  type: "object",
                  properties: {
                    facebook_scaling: {
                      type: "object",
                      properties: {
                        aktualny_budget: { type: "string" },
                        odporucany_scaling_plan: { type: "string" },
                        maximalne_zvysenie: { type: "string" },
                        varovanie: { type: "string" }
                      }
                    },
                    google_ads_scaling: {
                      type: "object",
                      properties: {
                        aktualny_budget: { type: "string" },
                        odporucany_scaling_plan: { type: "string" },
                        maximalne_zvysenie: { type: "string" },
                        varovanie: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            ai_predikcia_konverzie: {
              type: "object",
              properties: {
                najpravdepodobnejsi_typ: { 
                  type: "string",
                  enum: ["prieskumnici", "rozhodovatelia", "vracajuci_sa"]
                },
                pravdepodobnost_konverzie: { type: "number" },
                dovod: { type: "string" },
                odporucania_pre_typ: { type: "string" },
                detailna_analyza_typov: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      typ: { type: "string" },
                      konverzna_pravdepodobnost: { type: "number" },
                      charakteristiky: { type: "string" },
                      ako_cielit: { type: "string" }
                    }
                  }
                },
                kreativne_varianty_pre_typy: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      typ_skupiny: { type: "string" },
                      varianty: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            nazov: { type: "string" },
                            obrazok_popis: { type: "string" },
                            video_koncept: { type: "string" },
                            nadpis: { type: "string" },
                            text: { type: "string" },
                            cta: { type: "string" }
                          }
                        }
                      }
                    }
                  }
                }
                }
                },
                konkurencna_analyza: {
                type: "object",
                properties: {
                hlavni_konkurenti: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      nazov: { type: "string" },
                      odhadovany_budget_mesacne: { type: "string" },
                      najcastejsie_kanaly: { type: "array", items: { type: "string" } },
                      typicke_kreativy: { type: "string" },
                      silne_stranky: { type: "array", items: { type: "string" } },
                      slabe_stranky: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                nase_konkurencne_vyhody: { type: "array", items: { type: "string" } },
                prilezitosti: { type: "array", items: { type: "string" } },
                sumar: { type: "string" }
                }
                },
            kreativne_odporucania: {
              type: "object",
              properties: {
                reklamne_obrazky: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      typ: { type: "string" },
                      popis: { type: "string" },
                      odporucany_obsah: { type: "string" }
                    }
                  }
                },
                reklamne_texty: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      nadpis: { type: "string" },
                      text: { type: "string" },
                      cta: { type: "string" }
                    }
                  }
                },
                video_koncepty: { type: "array", items: { type: "string" } },
                najuspesnejsie_prvky: { type: "array", items: { type: "string" } }
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
      const currentMieraKonverzie = stats.pocet_konfiguracii > 0 
        ? Math.round((stats.pocet_konfiguracii / stats.pocet_zobrazeni) * 100) 
        : 0;

      const insight = {
        dom_id: dom.id,
        dom_nazov: dom.nazov,
        vyrobca: dom.vyrobca,
        celkovy_zajem: {
          pocet_zobrazeni: stats.pocet_zobrazeni,
          pocet_konfiguracii: stats.pocet_konfiguracii,
          priemerny_cas_na_stranke: stats.priemerny_cas,
          miera_konverzie: currentMieraKonverzie
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
        behavioralna_segmentacia: {
          ...behavioralna,
          ai_predikcia_konverzie: aiResponse.ai_predikcia_konverzie || {}
        },
        ab_testing_strategie: {
          facebook_testy: aiResponse.ab_testing_strategie?.facebook_testy || [],
          google_ads_testy: aiResponse.ab_testing_strategie?.google_ads_testy || [],
          google_ads_texty_testy: aiResponse.ab_testing_strategie?.google_ads_texty_testy || [],
          google_ads_kreativy_testy: aiResponse.ab_testing_strategie?.google_ads_kreativy_testy || []
        },
        roi_predikcia: {
          ...aiResponse.roi_predikcia,
          scaling_odporucania: aiResponse.roi_predikcia?.scaling_odporucania || {}
        },
        konkurencna_analyza: aiResponse.konkurencna_analyza || {},
        kreativne_odporucania: aiResponse.kreativne_odporucania || {
          reklamne_obrazky: [],
          reklamne_texty: [],
          video_koncepty: [],
          najuspesnejsie_prvky: []
        },
        sumar_odporucani: aiResponse.sumar || '',
        ai_generovany_text: aiResponse.detailny_navod || '',
        confidence_score: confidenceScore,
        pocet_analyzovanych_sessions: domSessions.length,
        datum_generovania: new Date().toISOString(),
        posledna_aktualizacia: new Date().toISOString(),
        predchadzajuce_metriky: previousMetrics
      };

      insights.push(insight);

      // Uložiť do databázy a vytvoriť notifikácie
      let savedInsight;
      if (existingInsights.length > 0) {
        // Aktualizovať existujúci
        savedInsight = await base44.asServiceRole.entities.MarketingInsight.update(
          existingInsights[0].id,
          insight
        );
        console.log(`✅ Aktualizovaný insight pre ${dom.nazov}`);

        // Detekcia zmien a vytvorenie notifikácií
        if (previousMetrics) {
          // Pokles konverzie
          if (previousMetrics.miera_konverzie > 0 && 
              currentMieraKonverzie < previousMetrics.miera_konverzie * 0.8) {
            await base44.asServiceRole.entities.MarketingNotification.create({
              typ: 'zmena_konverzie',
              dom_id: dom.id,
              dom_nazov: dom.nazov,
              title: `⚠️ Pokles konverzie: ${dom.nazov}`,
              message: `Konverzia klesla z ${previousMetrics.miera_konverzie}% na ${currentMieraKonverzie}%`,
              severity: 'warning',
              metadata: {
                stara_hodnota: previousMetrics.miera_konverzie,
                nova_hodnota: currentMieraKonverzie,
                pokles_percent: Math.round(((previousMetrics.miera_konverzie - currentMieraKonverzie) / previousMetrics.miera_konverzie) * 100)
              }
            });
          }

          // Nárast zobrazení
          if (stats.pocet_zobrazeni > previousMetrics.pocet_zobrazeni * 1.5) {
            await base44.asServiceRole.entities.MarketingNotification.create({
              typ: 'zmena_zobrazeni',
              dom_id: dom.id,
              dom_nazov: dom.nazov,
              title: `📈 Nárast zobrazení: ${dom.nazov}`,
              message: `Zobrazenia vzrástli z ${previousMetrics.pocet_zobrazeni} na ${stats.pocet_zobrazeni}`,
              severity: 'success',
              metadata: {
                stara_hodnota: previousMetrics.pocet_zobrazeni,
                nova_hodnota: stats.pocet_zobrazeni,
                narast_percent: Math.round(((stats.pocet_zobrazeni - previousMetrics.pocet_zobrazeni) / previousMetrics.pocet_zobrazeni) * 100)
              }
            });
          }

          // Nízka kvalita dát
          if (confidenceScore < 40) {
            await base44.asServiceRole.entities.MarketingNotification.create({
              typ: 'nizka_kvalita',
              dom_id: dom.id,
              dom_nazov: dom.nazov,
              title: `⚠️ Nízka kvalita dát: ${dom.nazov}`,
              message: `Confidence skóre je len ${confidenceScore}%. Potrebných viac dát pre presné odporúčania.`,
              severity: 'warning',
              metadata: {
                confidence_score: confidenceScore,
                pocet_sessions: domSessions.length
              }
            });
          }
        }
      } else {
        // Vytvoriť nový
        savedInsight = await base44.asServiceRole.entities.MarketingInsight.create(insight);
        console.log(`✅ Vytvorený nový insight pre ${dom.nazov}`);

        // Notifikácia o novej analýze
        await base44.asServiceRole.entities.MarketingNotification.create({
          typ: 'nova_analyza',
          dom_id: dom.id,
          dom_nazov: dom.nazov,
          title: `🎉 Nová AI analýza: ${dom.nazov}`,
          message: `Úspešne vygenerovaná nová marketingová analýza s confidence ${confidenceScore}%`,
          severity: 'success',
          metadata: {
            pocet_sessions: domSessions.length,
            confidence_score: confidenceScore
          }
        });

        // High quality insight
        if (confidenceScore >= 80) {
          await base44.asServiceRole.entities.MarketingNotification.create({
            typ: 'vysoka_kvalita',
            dom_id: dom.id,
            dom_nazov: dom.nazov,
            title: `✅ Vysoká kvalita dát: ${dom.nazov}`,
            message: `Analýza má vysokú dôveryhodnosť ${confidenceScore}%. Odporúčania sú veľmi presné.`,
            severity: 'success',
            metadata: {
              confidence_score: confidenceScore
            }
          });
        }
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