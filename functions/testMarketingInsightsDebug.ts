import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 DEBUG: Testujem marketing insights systém...');

    // Test 1: Načítať domy
    const domy = await base44.asServiceRole.entities.Dom.list();
    console.log(`✅ Načítaných ${domy.length} domov`);

    // Test 2: Načítať sessions
    const sessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 100);
    console.log(`✅ Načítaných ${sessions.length} sessions`);

    // Test 3: Načítať preferencie
    const prefs = await base44.asServiceRole.entities.UserPreferences.list('', 100);
    console.log(`✅ Načítaných ${prefs.length} používateľských preferencií`);

    // Test 4: Skúsiť vytvoriť testovací insight
    const testDom = domy[0];
    if (!testDom) {
      return Response.json({
        error: 'Žiadne domy nenájdené',
        debug: { domy: domy.length, sessions: sessions.length, prefs: prefs.length }
      });
    }

    console.log(`🧪 Testujem vytvorenie insight pre dom: ${testDom.nazov}`);

    const testInsight = {
      dom_id: testDom.id,
      dom_nazov: testDom.nazov,
      vyrobca: testDom.vyrobca,
      celkovy_zajem: {
        pocet_zobrazeni: 10,
        pocet_konfiguracii: 2,
        priemerny_cas_na_stranke: 120,
        miera_konverzie: 20
      },
      geograficke_cielenie: {
        top_krajiny: [{ krajina: 'Slovakia', pocet_navstev: 10, percento: 100 }],
        top_regiony: [],
        top_mesta: []
      },
      zariadenia_a_platforma: {
        desktop: 60,
        mobile: 40,
        tablet: 0,
        top_prehliadace: ['Chrome'],
        odporucane_platformy: ['Facebook', 'Google Ads']
      },
      konfigurator_preferencie: {
        popularne_fasady: [],
        popularne_interiery: [],
        popularne_doplnky: [],
        priemerna_koncova_cena: testDom.zakladna_cena || 0,
        cenove_rozlozenie: { do_50k: 0, '50k_100k': 0, '100k_150k': 0, nad_150k: 0 }
      },
      behavioralna_segmentacia: {
        typ_navstevnika: { prieskumnici: 50, rozhodovatelia: 30, vracajuci_sa: 20 },
        priemerny_pocet_zobrazeni_pred_konverziou: 3,
        oblubene_blogovepPrispevky: []
      },
      klucove_slova: [testDom.nazov, testDom.vyrobca],
      odporucania_kampane: {
        facebook_instagram: {
          cielova_skupina: 'Test audience',
          zaujmy: ['Domy', 'Nehnuteľnosti'],
          umiestnenia: ['News Feed'],
          format_reklamy: ['Image'],
          budget_odporucanie: '20€ denne'
        },
        google_ads: {
          typ_kampane: 'Search',
          klucove_slova: [testDom.nazov],
          geograficke_cielenie: ['Slovakia'],
          budget_odporucanie: '30€ denne'
        },
        tiktok: { vhodnost: 'Testuje sa', dovod: 'Debug test' },
        retargeting_strategie: {
          facebook_pixel: 'Test pixel',
          google_remarketing: 'Test remarketing',
          lookalike_audiences: 'Test lookalike',
          custom_audiences: 'Test custom',
          email_retargeting: 'Test email'
        }
      },
      cookie_analytics: {
        vracajuci_sa_pouzivatelia: 0,
        top_preferovani_vyrobcovia: [],
        suvisiace_prezerane_domy: [],
        dokoncene_konfiguracie: 0,
        cenove_preferencie: { do_50k: 0, '50k_100k': 0, '100k_150k': 0, nad_150k: 0 }
      },
      sumar_odporucani: 'Test súhrn',
      ai_generovany_text: 'Test AI text',
      confidence_score: 50,
      pocet_analyzovanych_sessions: sessions.length,
      datum_generovania: new Date().toISOString(),
      posledna_aktualizacia: new Date().toISOString()
    };

    const created = await base44.asServiceRole.entities.MarketingInsight.create(testInsight);
    console.log('✅ TEST INSIGHT VYTVORENÝ:', created.id);

    return Response.json({
      success: true,
      message: 'Debug test úspešný',
      debug: {
        domy_count: domy.length,
        sessions_count: sessions.length,
        prefs_count: prefs.length,
        test_insight_id: created.id,
        test_dom: testDom.nazov
      }
    });

  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});