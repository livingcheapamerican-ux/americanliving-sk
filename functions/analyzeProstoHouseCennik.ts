import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. HARDCODED MASTER DÁTA - ZDROJ PRAVDY (s presnými ID z databázy)
    const MASTER_DB_MAPPING = {
      // Barn House
      "691763198889980646c05872": {
        nazov: "Barn House",
        allowExtension: true,
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
          inziniering: 2590, projektACertifikacia: 3500, revizia: 500, siete: 1500, doprava: 0
        }
      },
      // Double Barn
      "6917631a8889980646c05875": {
        nazov: "Double Barn",
        allowExtension: true,
        data: {
          zakladna_cena: 36900, montaz: 9225,
          predlzenie_1_2m: 6600, predlzenie_2_4m: 13200, predlzenie_3_6m: 19800, predlzenie_4_8m: 26400,
          izolacia_standard: 0, izolacia_zvysena: 2700, izolacia_premium: 5400, izolacia_extra: 10125,
          zaklady_bez: 0, zaklady_vruty: 3400, zaklady_doska: 11000, zaklady_pasove: 10000,
          interier_bez: 0, interier_drevo: 8200, interier_sadrokarton: 9430,
          elektro_rozvody: 3900, voda: 1150, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 1600, rekuperacia: 3321, podlahove_kurenie: 3960,
          laminacia_okien: 1450, tonovanie_skla: 700,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 6371, podlahy_laminat: 1750,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0
        }
      },
      // A-Frame
      "6917631b8889980646c05878": {
        nazov: "A-Frame",
        allowExtension: true,
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
          inziniering: 2590, projektACertifikacia: 3500, revizia: 500, siete: 1500, doprava: 0
        }
      },
      // Flat Small
      "6917631c8889980646c0587b": {
        nazov: "Flat Small",
        allowExtension: false,
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
          inziniering: 2590, projektACertifikacia: 3500, revizia: 500, siete: 1500, doprava: 0
        }
      },
      // FlatHouse 2.2
      "6917631e8889980646c0587e": {
        nazov: "FlatHouse 2.2",
        allowExtension: false,
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
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0
        }
      },
      // Flat 1.5
      "6917631f8889980646c05881": {
        nazov: "Flat 1.5",
        allowExtension: false,
        data: {
          zakladna_cena: 31700, montaz: 7925,
          izolacia_standard: 0, izolacia_zvysena: 2950, izolacia_premium: 5900, izolacia_extra: 11063,
          zaklady_bez: 0, zaklady_vruty: 3100, zaklady_doska: 14000, zaklady_pasove: 8500,
          interier_bez: 0, interier_drevo: 8200, interier_sadrokarton: 8815,
          elektro_rozvody: 3900, voda: 1150, sanita: 1169, bojler: 246,
          tepelne_cerpadlo: 1600, rekuperacia: 3321, podlahove_kurenie: 3960,
          laminacia_okien: 1550, tonovanie_skla: 680,
          dvere_standard: 0, dvere_kovove: 720, dvere_plastove: 660,
          stresne_okno: 760, okno_fix_90_205: 500, okno_vyklopne_90_205: 540, okno_vyklopne_55_90: 225,
          fasada_standard: 0, fasada_omietka: 8499, podlahy_laminat: 1680,
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0
        }
      },
      // Double Flat
      "691763208889980646c05884": {
        nazov: "Double Flat",
        allowExtension: false,
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
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0
        }
      },
      // Nord
      "691763218889980646c05887": {
        nazov: "Nord",
        allowExtension: false,
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
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0
        }
      },
      // Fjord
      "691763228889980646c0588a": {
        nazov: "Fjord",
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
          inziniering: 2590, projektACertifikacia: 3500, revizia: 1000, siete: 1500, doprava: 0
        }
      }
    };

    const results = [];
    let foundCount = 0;
    let notFoundCount = 0;

    // 2. Iterácia cez páry [ID, MASTER_DATA]
    for (const [domId, modelInfo] of Object.entries(MASTER_DB_MAPPING)) {
      try {
        // Získame dom priamo podľa ID
        const existingDom = await base44.asServiceRole.entities.Dom.get(domId);
        
        if (existingDom) {
          foundCount++;
          const currentPrices = existingDom.konfigurator_custom_ceny_prosto_house || {};
          const polozky = [];

          // Porovnanie každej položky
          for (const [key, newValue] of Object.entries(modelInfo.data)) {
            // Predĺženie len pre Barn House, Double Barn a A-Frame
            if (key.startsWith('predlzenie_') && !modelInfo.allowExtension) {
              continue;
            }

            const oldValue = currentPrices[key] !== undefined ? currentPrices[key] : 0;
            const isChanged = oldValue !== newValue;
            
            const label = key.replace(/_/g, ' ').replace(/(^\w)/, c => c.toUpperCase());

            polozky.push({
              key: key,
              label: label,
              oldPrice: oldValue,
              newPrice: newValue,
              isChanged: isChanged
            });
          }

          results.push({
            domId: domId,
            domNazov: existingDom.nazov,
            vyrobca: "Prosto House",
            status: "ready",
            polozky: polozky,
            changesCount: polozky.filter(p => p.isChanged).length
          });

        } else {
          notFoundCount++;
          results.push({ 
            domId, 
            domNazov: modelInfo.nazov,
            status: "not_found", 
            vyrobca: "Prosto House" 
          });
        }
      } catch (e) {
        console.error(`Chyba pri spracovaní ${domId}:`, e);
        notFoundCount++;
        results.push({ 
          domId, 
          domNazov: modelInfo.nazov,
          status: "error", 
          error: e.message 
        });
      }
    }

    return Response.json({
      success: true,
      found: foundCount,
      not_found: notFoundCount,
      results: results
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