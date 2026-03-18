import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // Načítať všetky Prosto House domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ 
      vyrobca: 'Prosto House' 
    });

    if (!domy || domy.length === 0) {
      return Response.json({ error: 'Žiadne Prosto House domy neboli nájdené' }, { status: 404 });
    }

    const report = {
      timestamp: new Date().toISOString(),
      total_houses: domy.length,
      opravy: [],
      errors: [],
      summary: {
        total_fixes: 0,
        total_errors: 0
      }
    };

    // Mapovanie domov na súbory a ručné (hardcoded) ceny v kóde
    const MAPOVANIE_DOMOV = {
      'Fjord': {
        file: 'KonfiguratorFjord',
        hardcoded_prices: {
          interier_drevo: 16400,
          interier_sadrokarton: 21075,
          elektro_rozvody: 7799,
          voda: 3649,
          tepelne_cerpadlo: 7749,
          rekuperacia: 3600,
          okno_fix_90_205: 501,
          fasada_omietka: 12213,
          podlahy_laminat: 4200,
          inziniering: 2592
        }
      },
      'Nord': {
        file: 'KonfiguratorNord',
        hardcoded_prices: {} // Nord používa dynamické ceny z DB
      },
      'Flat 1.5': {
        file: 'KonfiguratorFlat15',
        hardcoded_prices: {
          izolacia_zvysena: 4400,
          izolacia_premium: 8799,
          elektro_rozvody: 5200,
          voda: 2100,
          bojler: 264,
          tepelne_cerpadlo: 4428,
          rekuperacia: 2200,
          zaklady_vruty: 6189,
          zaklady_doska: 11909,
          zaklady_pasove: 11860,
          siete: 1501,
          inziniering: 2592,
          interier_drevo: 12700,
          interier_sadrokarton: 14545,
          fasada_omietka: 10395,
          laminacia_okien: 2400,
          podlahy_laminat: 2640,
          podlahove_kurenie: 4316,
          revizia: 501,
          okno_fix_90_205: 501
        }
      },
      'Flat 72': {
        file: 'KonfiguratorFlat72',
        hardcoded_prices: {} // Flat 72 používa dynamické ceny z DB
      },
      'Flat Small': {
        file: 'KonfiguratorFlatSmall',
        hardcoded_prices: {} // Flat Small používa dynamické ceny z DB
      },
      'Flat Double': {
        file: 'KonfiguratorFlatDouble',
        hardcoded_prices: {
          montaz: 17970,
          izolacia_zvysena: 5799,
          izolacia_premium: 11600,
          elektro_rozvody: 7400,
          voda: 2380,
          tepelne_cerpadlo: 5535,
          rekuperacia: 2700,
          zaklady_vruty: 8140,
          zaklady_doska: 17946,
          zaklady_pasove: 21079,
          siete: 1501,
          inziniering: 2592,
          interier_drevo: 16400,
          interier_sadrokarton: 19475,
          fasada_omietka: 12841,
          laminacia_okien: 3100,
          podlahy_laminat: 3351,
          podlahove_kurenie: 5525,
          tonovanie_skla: 1300,
          okno_fix_90_205: 501,
          okno_vyklopne_55_90: 325
        }
      }
    };

    // Pre každý dom skontroluj ceny
    for (const dom of domy) {
      const houseName = dom.nazov.split(',')[0].trim();
      const houseMapping = MAPOVANIE_DOMOV[houseName];
      
      if (!houseMapping) {
        report.errors.push({
          dom: dom.nazov,
          error: `Nenájdené mapovanie pre dom: ${houseName}`
        });
        report.summary.total_errors++;
        continue;
      }

      const ceny_z_db = dom.konfigurator_custom_ceny_prosto_house || {};
      const hardcoded = houseMapping.hardcoded_prices;
      const opravy_domu = [];

      // Porovnaj každú hardcoded cenu s cenou z DB
      for (const [key, hardcoded_value] of Object.entries(hardcoded)) {
        const db_value = ceny_z_db[key];
        
        if (db_value !== undefined && db_value !== hardcoded_value) {
          opravy_domu.push({
            polozka: key,
            stara_cena: hardcoded_value,
            nova_cena: db_value,
            rozdiel: db_value - hardcoded_value
          });
        }
      }

      if (opravy_domu.length > 0) {
        report.opravy.push({
          dom: dom.nazov,
          file: houseMapping.file,
          pocet_oprav: opravy_domu.length,
          opravy: opravy_domu
        });
        report.summary.total_fixes += opravy_domu.length;
      }
    }

    return Response.json(report, { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});