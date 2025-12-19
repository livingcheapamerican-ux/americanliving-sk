import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { session_id, action, data } = await req.json();

    if (!session_id) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Načítať existujúce preferencie alebo vytvoriť nové
    let preferences = await base44.entities.UserPreferences.filter({ session_id }).then(r => r[0]);

    if (!preferences) {
      preferences = await base44.entities.UserPreferences.create({
        session_id,
        prehliadnute_domy: [],
        oblubene_vyrobcovia: [],
        konfigurator_interakcie: [],
        ai_skore: 0,
        odporucane_domy: [],
        posledna_aktivita: new Date().toISOString()
      });
    }

    // Aktualizovať preferencie na základe akcie
    let updatedData = { ...preferences };

    switch (action) {
      case 'view_house':
        // Pridať prehliadnutý dom
        const viewedHouses = [...(preferences.prehliadnute_domy || [])];
        viewedHouses.push({
          dom_id: data.dom_id,
          dom_nazov: data.dom_nazov,
          vyrobca: data.vyrobca,
          cas_straveny: data.cas_straveny || 0,
          timestamp: new Date().toISOString()
        });
        
        // Aktualizovať oblúbených výrobcov
        const vyrobcovia = [...(preferences.oblubene_vyrobcovia || [])];
        if (!vyrobcovia.includes(data.vyrobca)) {
          vyrobcovia.push(data.vyrobca);
        }

        updatedData = {
          ...updatedData,
          prehliadnute_domy: viewedHouses,
          oblubene_vyrobcovia: vyrobcovia,
          ai_skore: Math.min((preferences.ai_skore || 0) + 5, 100)
        };
        break;

      case 'configurator_interaction':
        // Zaznamenať interakciu s konfigurátorem
        const interactions = [...(preferences.konfigurator_interakcie || [])];
        interactions.push({
          dom_id: data.dom_id,
          konfiguracia: data.konfiguracia,
          finalna_cena: data.finalna_cena,
          dokoncene: data.dokoncene || false,
          timestamp: new Date().toISOString()
        });

        // Aktualizovať preferované cenové pásmo
        let cenove_pasmo = preferences.cenove_pasmo || {};
        if (data.finalna_cena) {
          cenove_pasmo = {
            min: Math.min(cenove_pasmo.min || data.finalna_cena, data.finalna_cena * 0.8),
            max: Math.max(cenove_pasmo.max || data.finalna_cena, data.finalna_cena * 1.2)
          };
        }

        updatedData = {
          ...updatedData,
          konfigurator_interakcie: interactions,
          cenove_pasmo,
          ai_skore: Math.min((preferences.ai_skore || 0) + (data.dokoncene ? 20 : 10), 100)
        };
        break;

      case 'set_preferences':
        // Nastaviť preferenčné filtre
        updatedData = {
          ...updatedData,
          preferovana_velkost: data.preferovana_velkost || preferences.preferovana_velkost,
          preferovany_typ: data.preferovany_typ || preferences.preferovany_typ,
          cenove_pasmo: data.cenove_pasmo || preferences.cenove_pasmo
        };
        break;
    }

    // Generovať AI odporúčania
    if (updatedData.ai_skore >= 30) {
      const recommendations = await generateRecommendations(base44, updatedData);
      updatedData.odporucane_domy = recommendations;
    }

    updatedData.posledna_aktivita = new Date().toISOString();

    // Uložiť aktualizované preferencie
    await base44.entities.UserPreferences.update(preferences.id, updatedData);

    return Response.json({ 
      success: true,
      preferences: updatedData
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Helper funkcia na generovanie odporúčaní
async function generateRecommendations(base44, preferences) {
  const recommendations = [];

  // 1. Odporúčať domy od obľúbených výrobcov
  if (preferences.oblubene_vyrobcovia && preferences.oblubene_vyrobcovia.length > 0) {
    const houses = await base44.entities.Dom.filter({ 
      vyrobca: preferences.oblubene_vyrobcovia[0],
      verejny: true
    });
    recommendations.push(...houses.slice(0, 2).map(h => h.id));
  }

  // 2. Odporúčať domy v preferovanom cenovom pásme
  if (preferences.cenove_pasmo) {
    const allHouses = await base44.entities.Dom.filter({ verejny: true });
    const inBudget = allHouses.filter(h => 
      h.zakladna_cena >= (preferences.cenove_pasmo.min || 0) &&
      h.zakladna_cena <= (preferences.cenove_pasmo.max || Infinity)
    );
    recommendations.push(...inBudget.slice(0, 2).map(h => h.id));
  }

  // 3. Populárne domy ako fallback
  if (recommendations.length < 3) {
    const popular = await base44.entities.Dom.filter({ popularny: true, verejny: true });
    recommendations.push(...popular.slice(0, 3 - recommendations.length).map(h => h.id));
  }

  // Vrátiť unikátne ID
  return [...new Set(recommendations)].slice(0, 3);
}