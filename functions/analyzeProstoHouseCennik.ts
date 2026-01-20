import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. MASTER DÁTA (Bezpečné Hardcoded Ceny)
    const MASTER_DATA = {
      "barn_house": {
        data: {
          zakladna_cena: 20900, montaz: 4875,
          predlzenie_1_2m: 3300, predlzenie_2_4m: 6606, predlzenie_3_6m: 9900, predlzenie_4_8m: 15880,
          izolacia_standard: 0, izolacia_zvysena: 1400, izolacia_premium: 2800, izolacia_extra: 5250,
          zaklady_bez: 0, zaklady_vruty: 3077, zaklady_doska: 6595, zaklady_pasove: 6782,
          interier_bez: 0, interier_drevo: 4100, interier_sadrokarton: 4715,
          elektro_rozvody: 2300, voda: 980, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 1100, rekuperacia: 2214, podlahove_kurenie: 2819,
          laminacia_okien: 790, tonovanie_skla: 375,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 4321, podlahy_laminat: 850,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 500, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      },
      "double_barn": {
        data: {
          zakladnaCena: 36900,
          montaz_nie: 0, montaz_ano: 9225,
          predlzenie_1_2m: 6600, predlzenie_2_4m: 13200, predlzenie_3_6m: 19800, predlzenie_4_8m: 26400,
          dvere_ziadne: 0, dvere_kovove: 720, dvere_plastove: 660,
          izolacia_standard: 0, izolacia_zvysena: 2700, izolacia_premium: 5400, izolacia_ultra: 10125,
          elektroinstalacia: 3900,
          vodaKanalizacia: 1150,
          sanitaKomplet: 1169,
          bojler: 246,
          tepelneCerpadlo: 1600,
          rekuperacia: 3321,
          zaklady_bez: 0, zaklady_skrutky: 3400, zaklady_doska: 11000, zaklady_pasove: 10000,
          pripojkaSiete: 1500,
          inziniering: 2590,
          projektA0: 3500,
          interierFinis_ziadne: 0, interierFinis_drevo: 8200, interierFinis_sadrokarton: 9430,
          vonkajsiaFasada_standard: 0, vonkajsiaFasada_suchana: 6371,
          povrchokaOkien: 1450,
          vnutornePodlahy: 1750,
          podlahovVykurovanie: 3960,
          pergola: 0,
          interieroveDvere: 0,
          tonovaneSkla: 700,
          doprava: 0,
          revizna: 1000,
          stresneOkno: 760,
          bocneOknoFixne: 500,
          bocneOknoVyklopne90: 540,
          bocneOknoVyklopne55: 225
        }
      },
      "a_frame": {
        data: {
          zakladna_cena: 22700, montaz: 5675,
          predlzenie_1_2m: 3550, predlzenie_2_4m: 7100, predlzenie_3_6m: 10650, predlzenie_4_8m: 14200,
          izolacia_standard: 0, izolacia_zvysena: 1600, izolacia_premium: 3200, izolacia_extra: 6000,
          zaklady_bez: 0, zaklady_vruty: 2100, zaklady_doska: 7000, zaklady_pasove: 6000,
          interier_bez: 0, interier_drevo: 4400, interier_sadrokarton: 5015,
          elektro_rozvody: 2300, voda: 980, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 1100, rekuperacia: 2214, podlahove_kurenie: 2819,
          laminacia_okien: 850, tonovanie_skla: 420,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 2414, podlahy_laminat: 980,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 500, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      },
      "flat_small": {
        data: {
          zakladna_cena: 19500, montaz: 4875,
          izolacia_standard: 0, izolacia_zvysena: 1400, izolacia_premium: 2800, izolacia_extra: 5250,
          zaklady_bez: 0, zaklady_vruty: 2808, zaklady_doska: 6000, zaklady_pasove: 5000,
          interier_bez: 0, interier_drevo: 3800, interier_sadrokarton: 4414,
          elektro_rozvody: 2300, voda: 980, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 600, rekuperacia: 1105, podlahove_kurenie: 2819,
          laminacia_okien: 750, tonovanie_skla: 340,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 4742, podlahy_laminat: 840,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 500, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      },
      "flathouse_2_7": {
        data: {
          zakladna_cena: 31700, montaz: 7925,
          izolacia_standard: 0, izolacia_zvysena: 2950, izolacia_premium: 5900, izolacia_extra: 11063,
          zaklady_bez: 0, zaklady_vruty: 3100, zaklady_doska: 10000, zaklady_pasove: 8500,
          interier_bez: 0, interier_drevo: 8200, interier_sadrokarton: 8815,
          elektro_rozvody: 3900, voda: 1150, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 1600, rekuperacia: 3321, podlahove_kurenie: 3960,
          laminacia_okien: 1550, tonovanie_skla: 680,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 8499, podlahy_laminat: 1680,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      },
      "flathouse_2_2": {
        data: {
          zakladna_cena: 27800, montaz: 6950,
          izolacia_standard: 0, izolacia_zvysena: 2500, izolacia_premium: 5000, izolacia_extra: 9375,
          zaklady_bez: 0, zaklady_vruty: 3100, zaklady_doska: 10000, zaklady_pasove: 8500,
          interier_bez: 0, interier_drevo: 7600, interier_sadrokarton: 8830,
          elektro_rozvody: 3900, voda: 1150, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 1600, rekuperacia: 3321, podlahove_kurenie: 3960,
          laminacia_okien: 1550, tonovanie_skla: 680,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 8499, podlahy_laminat: 1680,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      },
      "flat_1_5": {
        data: {
          zakladna_cena: 44900, montaz: 13470,
          izolacia_standard: 0, izolacia_zvysena: 4400, izolacia_premium: 8800, izolacia_extra: 16500,
          zaklady_bez: 0, zaklady_vruty: 6348, zaklady_doska: 14000, zaklady_pasove: 12000,
          interier_bez: 0, interier_drevo: 12700, interier_sadrokarton: 14545,
          elektro_rozvody: 5200, voda: 2100, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 2200, rekuperacia: 4428, podlahove_kurenie: 4316,
          laminacia_okien: 2400, tonovanie_skla: 840,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 10384, podlahy_laminat: 2640,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      },
      "double_flat": {
        data: {
          zakladna_cena: 59900, montaz: 17970,
          izolacia_standard: 0, izolacia_zvysena: 5800, izolacia_premium: 11600, izolacia_extra: 21750,
          zaklady_bez: 0, zaklady_vruty: 8141, zaklady_doska: 18000, zaklady_pasove: 15500,
          interier_bez: 0, interier_drevo: 16400, interier_sadrokarton: 19475,
          elektro_rozvody: 7400, voda: 2380, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 2700, rekuperacia: 5535, podlahove_kurenie: 5525,
          laminacia_okien: 3100, tonovanie_skla: 1300,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 12841, podlahy_laminat: 3350,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      },
      "nord": {
        display: "Nord",
        allowExtension: false,
        data: {
          zakladna_cena: 49500, montaz: 14850,
          izolacia_standard: 0, izolacia_zvysena: 3200, izolacia_premium: 6400, izolacia_extra: 12000,
          zaklady_bez: 0, zaklady_vruty: 7655, zaklady_doska: 13000, zaklady_pasove: 11500,
          interier_bez: 0, interier_drevo: 9800, interier_sadrokarton: 11655,
          elektro_rozvody: 3900, voda: 1150, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 1600, rekuperacia: 3321, podlahove_kurenie: 3913,
          laminacia_okien: 2100, tonovanie_skla: 840,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 9507, podlahy_laminat: 1577,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      },
      "fjord": {
        display: "Fjord",
        allowExtension: false,
        data: {
          zakladna_cena: 59000, montaz: 17700,
          izolacia_standard: 0, izolacia_zvysena: 5660, izolacia_premium: 9106, izolacia_extra: 0,
          zaklady_bez: 0, zaklady_vruty: 7655, zaklady_doska: 13000, zaklady_pasove: 11500,
          interier_bez: 0, interier_drevo: 18000, interier_sadrokarton: 21086,
          elektro_rozvody: 7800, voda: 3650, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 3600, rekuperacia: 7749, podlahove_kurenie: 6101,
          laminacia_okien: 3400, tonovanie_skla: 1550,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 12211, podlahy_laminat: 3415,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0,
          interierove_dvere: 0, pergola: 0
        }
      }
    };

    const results = [];
    let foundCount = 0;
    const unmatched = [];

    const allDoms = await base44.asServiceRole.entities.Dom.filter({});

    for (const dom of allDoms) {
      const dbName = (dom.nazov || "").toLowerCase();
      let matchedKey = null;

      // INTELIGENTNÉ PÁROVANIE (Keyword Matching)
      // 1. Špeciálne prípady - Flat 72 = Flathouse 2.7 ceny (stĺpec O)
      if (dbName.includes("72")) matchedKey = "flathouse_2_7";
      else if ((dbName.includes("flathouse") || dbName.includes("flat")) && (dbName.includes("2.2") || dbName.includes("2,2"))) {
        matchedKey = "flathouse_2_7";
      }
      else if (dbName.includes("2.7") || dbName.includes("2,7")) matchedKey = "flathouse_2_7";
      
      // 2. Štandardné modely
      else if (dbName.includes("double") && dbName.includes("barn")) matchedKey = "double_barn";
      else if (dbName.includes("barn")) matchedKey = "barn_house";
      else if (dbName.includes("frame")) matchedKey = "a_frame";
      else if (dbName.includes("double") && dbName.includes("flat")) matchedKey = "double_flat";
      else if (dbName.includes("small")) matchedKey = "flat_small";
      else if (dbName.includes("1.5") || dbName.includes("1,5")) matchedKey = "flat_1_5";
      else if (dbName.includes("nord")) matchedKey = "nord";
      else if (dbName.includes("fjord")) matchedKey = "fjord";

      // Ak sme našli zhodu
      if (matchedKey && MASTER_DATA[matchedKey]) {
        foundCount++;
        const modelInfo = MASTER_DATA[matchedKey];
        
        const polozky = [];
        
        // Filter pre predĺženie (Povolené len pre Barn, Double, A-Frame)
        const allowExtension = ["barn_house", "double_barn", "a_frame"].includes(matchedKey);

        for (const [key, newValue] of Object.entries(modelInfo.data)) {
          if (key.startsWith('predlzenie_') && !allowExtension) continue;

          // Špeciálne base fields, ktoré sa ukladajú priamo do entity (nie do konfigurátor polí)
          const isBaseField = ['zakladna_cena', 'zastavana_plocha', 'uzitkova_plocha'].includes(key);
          const actualKey = isBaseField ? `__${key}` : key;

          // Hľadanie aktuálnej ceny vo viacerých poliach
          let oldValue = null;
          
          if (isBaseField) {
            // Pre base fields čítame z hlavných polí entity
            if (dom[key] !== undefined && dom[key] !== null) {
              oldValue = dom[key];
            } else {
              oldValue = newValue;
            }
          } else {
            // Pre konfigurátor položky
            // 1. Priorita: konfigurator_custom_ceny_prosto_house
            if (dom.konfigurator_custom_ceny_prosto_house?.[key] !== undefined && dom.konfigurator_custom_ceny_prosto_house[key] !== null) {
              oldValue = dom.konfigurator_custom_ceny_prosto_house[key];
            }
            // 2. Fallback: konfigurator_ceny
            else if (dom.konfigurator_ceny?.[key] !== undefined && dom.konfigurator_ceny[key] !== null) {
              oldValue = dom.konfigurator_ceny[key];
            }
            // 3. Default: použiť master data ako aktuálnu cenu
            else {
              oldValue = newValue;
            }
          }
          
          polozky.push({
            key: actualKey,
            label: key.replace(/_/g, ' ').replace(/(^\w)/, c => c.toUpperCase()),
            oldPrice: oldValue,
            newPrice: newValue,
            finalPrice: newValue,
            isChanged: oldValue !== newValue
          });
        }

        results.push({
          domId: dom.id,
          domNazov: dom.nazov,
          vyrobca: "Prosto House",
          status: "ready",
          polozky: polozky,
          debug_raw_data: JSON.stringify({
            konfigurator_custom_ceny_prosto_house: dom.konfigurator_custom_ceny_prosto_house || {},
            konfigurator_ceny: dom.konfigurator_ceny || {},
            custom_ceny: dom.custom_ceny || {},
            zakladna_cena: dom.zakladna_cena
          }),
          changesCount: polozky.filter(p => p.isChanged).length
        });
      } else {
        unmatched.push(dom.nazov);
      }
    }

    return Response.json({
      success: true,
      found: foundCount,
      results: results,
      debug_unmatched: unmatched
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