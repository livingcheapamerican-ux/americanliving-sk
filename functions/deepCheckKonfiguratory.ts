import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítať všetky Prosto House domy
    const allDoms = await base44.asServiceRole.entities.Dom.filter({ vyrobca: "Prosto House" });
    
    const errors = [];
    const warnings = [];
    let totalChecks = 0;
    let errorCount = 0;
    let warningCount = 0;

    // Mapovanie modelov na súbory konfigurátorov
    const MODEL_TO_FILES = {
      "barn": ["KonfiguratorBarn48", "KonfiguratorFaza1HrubaStavba"],
      "double_barn": ["KonfiguratorBarnDouble", "KonfiguratorFaza1HrubaStavba"],
      "a_frame": ["KonfiguratorAFrame", "KonfiguratorFaza1HrubaStavba"],
      "flat_small": ["KonfiguratorFlatSmall", "KonfiguratorFaza1HrubaStavba"],
      "flathouse_2_7": ["KonfiguratorFlat72", "KonfiguratorFaza1HrubaStavba"],
      "flathouse_2_2": ["KonfiguratorProstoHouse", "KonfiguratorFaza1HrubaStavba"],
      "flat_1_5": ["KonfiguratorFlat15", "KonfiguratorFaza1HrubaStavba"],
      "double_flat": ["KonfiguratorFlatDouble", "KonfiguratorFaza1HrubaStavba"],
      "nord": ["KonfiguratorNord", "KonfiguratorFaza1HrubaStavba"],
      "fjord": ["KonfiguratorFjord", "KonfiguratorFaza1HrubaStavba"]
    };

    // Načítať všetky komponenty konfigurátorov
    const componentFiles = new Map();
    
    for (const dom of allDoms) {
      const dbName = (dom.nazov || "").toLowerCase();
      let modelKey = null;

      // Identifikácia modelu
      if (dbName.includes("double") && dbName.includes("barn")) modelKey = "double_barn";
      else if (dbName.includes("barn")) modelKey = "barn";
      else if (dbName.includes("frame")) modelKey = "a_frame";
      else if (dbName.includes("double") && dbName.includes("flat")) modelKey = "double_flat";
      else if (dbName.includes("1.5") || dbName.includes("1,5")) modelKey = "flat_1_5";
      else if (dbName.includes("small")) modelKey = "flat_small";
      else if (dbName.includes("72") || dbName.includes("2.7") || dbName.includes("2,7")) modelKey = "flathouse_2_7";
      else if ((dbName.includes("flathouse") || dbName.includes("flat")) && (dbName.includes("2.2") || dbName.includes("2,2"))) modelKey = "flathouse_2_7";
      else if (dbName.includes("nord")) modelKey = "nord";
      else if (dbName.includes("fjord")) modelKey = "fjord";

      if (!modelKey) {
        warnings.push({
          type: "unmapped_model",
          dom: dom.nazov,
          message: "Nepodarilo sa identifikovať model domu"
        });
        warningCount++;
        continue;
      }

      const dbPrices = dom.konfigurator_custom_ceny_prosto_house || {};
      
      // Kontrola jednotlivých položiek
      const expectedPrices = [
        "montaz", "izolacia_standard", "izolacia_zvysena", "izolacia_premium", "izolacia_extra",
        "zaklady_bez", "zaklady_vruty", "zaklady_doska", "zaklady_pasove",
        "interier_bez", "interier_drevo", "interier_sadrokarton",
        "elektro_rozvody", "voda", "sanita", "bojler",
        "tepelne_cerpadlo", "rekuperacia", "podlahove_kurenie",
        "laminacia_okien", "tonovanie_skla",
        "dvere_standard", "dvere_kovove", "dvere_plastove",
        "stresne_okno", "okno_fix_90_205", "okno_vyklopne_90_205", "okno_vyklopne_55_90",
        "fasada_standard", "fasada_omietka", "podlahy_laminat",
        "inziniering", "projektACertifikacia", "revizia", "siete", "doprava",
        "interierove_dvere", "pergola"
      ];

      for (const priceKey of expectedPrices) {
        totalChecks++;
        
        const dbPrice = dbPrices[priceKey];
        
        if (dbPrice === undefined || dbPrice === null) {
          warnings.push({
            type: "missing_price",
            dom: dom.nazov,
            priceKey: priceKey,
            message: `Chýba cena pre '${priceKey}' v databáze`
          });
          warningCount++;
        } else if (typeof dbPrice !== 'number') {
          errors.push({
            type: "invalid_price_type",
            dom: dom.nazov,
            priceKey: priceKey,
            dbPrice: dbPrice,
            message: `Neplatný typ ceny pre '${priceKey}' (očakáva sa číslo, je ${typeof dbPrice})`
          });
          errorCount++;
        }
      }

      // Kontrola základných údajov
      if (!dom.zakladna_cena || typeof dom.zakladna_cena !== 'number') {
        errors.push({
          type: "invalid_base_price",
          dom: dom.nazov,
          value: dom.zakladna_cena,
          message: "Neplatná základná cena domu"
        });
        errorCount++;
      }
    }

    // DODATOČNÁ KONTROLA: Čítanie súborov konfigurátorov
    const fileCheckResults = [];
    
    // Pre každý dom skontrolujeme relevantné súbory
    for (const dom of allDoms) {
      const dbName = (dom.nazov || "").toLowerCase();
      let modelKey = null;

      if (dbName.includes("double") && dbName.includes("barn")) modelKey = "double_barn";
      else if (dbName.includes("barn")) modelKey = "barn";
      else if (dbName.includes("frame")) modelKey = "a_frame";
      else if (dbName.includes("double") && dbName.includes("flat")) modelKey = "double_flat";
      else if (dbName.includes("1.5") || dbName.includes("1,5")) modelKey = "flat_1_5";
      else if (dbName.includes("small")) modelKey = "flat_small";
      else if (dbName.includes("72") || dbName.includes("2.7") || dbName.includes("2,7")) modelKey = "flathouse_2_7";
      else if (dbName.includes("nord")) modelKey = "nord";
      else if (dbName.includes("fjord")) modelKey = "fjord";

      if (!modelKey || !MODEL_TO_FILES[modelKey]) continue;

      const dbPrices = dom.konfigurator_custom_ceny_prosto_house || {};
      
      fileCheckResults.push({
        dom: dom.nazov,
        modelKey: modelKey,
        files: MODEL_TO_FILES[modelKey],
        dbPrices: dbPrices,
        note: "Pre detailnú kontrolu kódu je potrebná manuálna inšpekcia súborov"
      });
    }

    return Response.json({
      success: true,
      summary: {
        totalDoms: allDoms.length,
        totalChecks: totalChecks,
        errors: errorCount,
        warnings: warningCount,
        status: errorCount === 0 && warningCount === 0 ? "✅ VŠETKO OK" : errorCount > 0 ? "❌ NÁJDENÉ CHYBY" : "⚠️ NÁJDENÉ VAROVANIA"
      },
      errors: errors,
      warnings: warnings,
      fileCheckResults: fileCheckResults,
      recommendations: [
        "1. Skontrolujte či všetky ceny v databáze (konfigurator_custom_ceny_prosto_house) sú definované",
        "2. Uistite sa, že každý dom má nastavenú základnú cenu (zakladna_cena)",
        "3. Manuálne skontrolujte súbory konfigurátorov či používajú správne ceny z databázy",
        "4. Prezrite 'fileCheckResults' pre zoznam súborov ktoré treba kontrolovať pre každý model"
      ]
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});