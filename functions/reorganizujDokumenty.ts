import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítaj všetky dokumenty s vizuálnou analýzou
    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      vizualna_analyza: { $exists: true },
      podrobna_analyza_datum: { $exists: true }
    });

    const results = [];
    let presunute = 0;
    let chyby = 0;
    let nezmenene = 0;

    for (const dok of dokumenty) {
      try {
        const analyza = dok.vizualna_analyza;
        
        if (!analyza.spravny_vyrobca || !analyza.spravny_model) {
          results.push({
            id: dok.id,
            nazov: dok.nazov,
            status: 'skipped',
            reason: 'Chýbajúce údaje z analýzy (výrobca alebo model)'
          });
          continue;
        }

        // Vytvor typ priečinka podľa typu obsahu
        let typPriecinok = '';
        if (analyza.typ_obsahu === 'exterier') {
          typPriecinok = '/exterier';
        } else if (analyza.typ_obsahu === 'interier') {
          typPriecinok = '/interier';
        } else if (analyza.typ_obsahu === 'podorys') {
          typPriecinok = '/podorysy';
        } else if (analyza.typ_obsahu === 'detail') {
          typPriecinok = '/detaily';
        }

        // Nová cesta priečinka: Výrobca/Model/Typ
        const novaCesta = `${analyza.spravny_vyrobca}/${analyza.spravny_model}${typPriecinok}`;
        const staraCesta = dok.cesta_priecinku;

        // Ak je cesta už správna, preskočíme
        if (staraCesta === novaCesta && 
            dok.vyrobca === analyza.spravny_vyrobca && 
            dok.model_domu === analyza.spravny_model) {
          results.push({
            id: dok.id,
            nazov: dok.nazov,
            status: 'unchanged',
            cesta: novaCesta
          });
          nezmenene++;
          continue;
        }

        // Aktualizuj dokument
        await base44.asServiceRole.entities.Dokument.update(dok.id, {
          cesta_priecinku: novaCesta,
          vyrobca: analyza.spravny_vyrobca,
          model_domu: analyza.spravny_model,
          podpriecinok: typPriecinok ? typPriecinok.substring(1) : '',
          reorganizovany: true,
          reorganizovany_datum: new Date().toISOString()
        });

        results.push({
          id: dok.id,
          nazov: dok.nazov,
          status: 'moved',
          stara_cesta: staraCesta,
          nova_cesta: novaCesta,
          stary_vyrobca: dok.vyrobca,
          novy_vyrobca: analyza.spravny_vyrobca,
          stary_model: dok.model_domu,
          novy_model: analyza.spravny_model,
          typ_obsahu: analyza.typ_obsahu
        });

        presunute++;

      } catch (error) {
        results.push({
          id: dok.id,
          nazov: dok.nazov,
          status: 'error',
          error: error.message
        });
        chyby++;
      }
    }

    return Response.json({
      success: true,
      total: dokumenty.length,
      presunute,
      chyby,
      nezmenene,
      preskocene: results.filter(r => r.status === 'skipped').length,
      results
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});