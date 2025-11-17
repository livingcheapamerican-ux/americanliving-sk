import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítaj všetky analyzované dokumenty
    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky',
      vizualna_analyza: { $exists: true },
      podrobna_analyza_datum: { $exists: true }
    });

    if (dokumenty.length === 0) {
      return Response.json({
        success: true,
        message: 'Žiadne dokumenty na reorganizáciu',
        presunute: 0,
        nezmenene: 0,
        chyby: 0
      });
    }

    let presunute = 0;
    let nezmenene = 0;
    let chyby = 0;

    // Mapa pre sledovanie verzií súborov
    const verzieMap = new Map();

    for (const dok of dokumenty) {
      try {
        const analyza = dok.vizualna_analyza;

        if (!analyza.spravny_vyrobca || !analyza.spravny_model) {
          nezmenene++;
          continue;
        }

        const vyrobca = analyza.spravny_vyrobca;
        const model = analyza.spravny_model;
        const typObsahu = analyza.typ_obsahu || 'ine';

        // Urč hlavný materiál pre podpriečinok
        let hlavnyMaterial = '';
        
        if (typObsahu === 'exterier') {
          if (analyza.fasada_materialy && analyza.fasada_materialy.length > 0) {
            const material = analyza.fasada_materialy[0].toLowerCase();
            
            if (material.includes('drevo') || material.includes('drevený')) {
              hlavnyMaterial = 'drevený';
            } else if (material.includes('omietk')) {
              const farba = analyza.fasada_farby?.[0] || 'biela';
              hlavnyMaterial = `${farba} omietka`;
            } else if (material.includes('kameň')) {
              hlavnyMaterial = 'kamenný';
            } else if (material.includes('skl')) {
              hlavnyMaterial = 'sklený';
            } else {
              hlavnyMaterial = analyza.fasada_materialy[0];
            }
          } else {
            hlavnyMaterial = 'štandard';
          }
        } else if (typObsahu === 'interier') {
          if (analyza.interier_materialy && analyza.interier_materialy.length > 0) {
            const material = analyza.interier_materialy[0].toLowerCase();
            
            if (material.includes('drevo') || material.includes('drevený')) {
              hlavnyMaterial = 'drevený';
            } else if (material.includes('sádrokart') || material.includes('sadrokart')) {
              hlavnyMaterial = 'sádrokartón';
            } else if (material.includes('obklad')) {
              hlavnyMaterial = 'obklad';
            } else {
              hlavnyMaterial = analyza.interier_materialy[0];
            }
          } else {
            hlavnyMaterial = 'štandard';
          }
        } else if (typObsahu === 'podorys') {
          hlavnyMaterial = ''; // pôdorys nemá materiál v názve
        } else {
          hlavnyMaterial = 'detaily';
        }

        // Vytvor názov podpriečinka
        let podpriecinok = '';
        if (typObsahu === 'podorys') {
          podpriecinok = `${model} pôdorys`;
        } else {
          podpriecinok = `${model} ${typObsahu}${hlavnyMaterial ? ' ' + hlavnyMaterial : ''}`;
        }

        // Vytvor novú cestu
        const novaCesta = `${vyrobca}/${model}/${podpriecinok}`;

        // Vytvor nový názov súboru
        const originalName = dok.nazov.split('.')[0];
        const extension = dok.nazov.split('.').pop();
        
        // Klúč pre sledovanie verzií
        const verziaKey = `${novaCesta}/${originalName}`;
        
        // Skontroluj či už existuje tento súbor v tejto ceste
        let novyNazov = dok.nazov;
        if (verzieMap.has(verziaKey)) {
          const verzia = verzieMap.get(verziaKey) + 1;
          verzieMap.set(verziaKey, verzia);
          novyNazov = `${originalName} Verzia ${verzia}.${extension}`;
        } else {
          // Skontroluj v databáze či už existuje
          const existujuce = await base44.asServiceRole.entities.Dokument.filter({
            cesta_priecinku: novaCesta,
            nazov: { $regex: `^${originalName}` }
          });
          
          if (existujuce.length > 0) {
            // Nájdi najvyššie číslo verzie
            let maxVerzia = 0;
            for (const ex of existujuce) {
              const match = ex.nazov.match(/Verzia (\d+)/);
              if (match) {
                maxVerzia = Math.max(maxVerzia, parseInt(match[1]));
              }
            }
            
            if (maxVerzia > 0 || existujuce.length > 0) {
              const verzia = maxVerzia + 1;
              verzieMap.set(verziaKey, verzia);
              novyNazov = `${originalName} Verzia ${verzia}.${extension}`;
            } else {
              verzieMap.set(verziaKey, 1);
            }
          } else {
            verzieMap.set(verziaKey, 1);
          }
        }

        // Skontroluj či sa cesta zmenila
        if (dok.cesta_priecinku === novaCesta && dok.nazov === novyNazov) {
          nezmenene++;
          continue;
        }

        // Update dokumentu
        await base44.asServiceRole.entities.Dokument.update(dok.id, {
          cesta_priecinku: novaCesta,
          nazov: novyNazov,
          vyrobca: vyrobca,
          model_domu: model,
          podpriecinok: podpriecinok,
          reorganizovany: true,
          reorganizovany_datum: new Date().toISOString()
        });

        presunute++;

      } catch (error) {
        console.error(`Chyba pri reorganizácii ${dok.nazov}:`, error);
        chyby++;
      }
    }

    return Response.json({
      success: true,
      message: 'Reorganizácia dokončená',
      presunute,
      nezmenene,
      chyby,
      total: dokumenty.length
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});