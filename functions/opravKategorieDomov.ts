import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.super_admin !== true)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Začínam opravu kategórií domov...');

    // Načítaj všetky domy
    const domy = await base44.asServiceRole.entities.Dom.list('', 200);
    console.log(`📊 Našiel som ${domy.length} domov`);

    const opravy = [];
    let opraveneRodinne = 0;
    let opraveneMobilne = 0;
    let chyby = 0;

    for (const dom of domy) {
      try {
        let novaKategoria = null;

        // Logika pre určenie kategórie
        if (dom.typ_domu === 'mobilny') {
          novaKategoria = 'mobilne_domy';
        } else if (dom.typ_domu === 'modularny' || dom.typ_domu === 'montovany') {
          novaKategoria = 'rodinne_domy';
        } else {
          // Fallback podľa výrobcu
          novaKategoria = 'rodinne_domy';
        }

        // Ak kategória nie je správna, aktualizuj
        if (dom.kategoria !== novaKategoria) {
          console.log(`🔨 Opravujem dom: ${dom.nazov} (${dom.typ_domu}) -> ${novaKategoria}`);
          
          await base44.asServiceRole.entities.Dom.update(dom.id, {
            kategoria: novaKategoria,
            verejny: true // Uisti sa, že je verejný
          });

          opravy.push({
            id: dom.id,
            nazov: dom.nazov,
            stara_kategoria: dom.kategoria,
            nova_kategoria: novaKategoria,
            typ_domu: dom.typ_domu
          });

          if (novaKategoria === 'rodinne_domy') {
            opraveneRodinne++;
          } else {
            opraveneMobilne++;
          }
        }
      } catch (error) {
        console.error(`❌ Chyba pri dome ${dom.nazov}:`, error.message);
        chyby++;
      }
    }

    // Verifikácia
    console.log('🔍 Verifikujem opravu...');
    const verifikacia = await base44.asServiceRole.entities.Dom.list('', 200);
    const bezKategorieVerifikacia = verifikacia.filter(d => !d.kategoria).length;
    const rodinneDomyVerifikacia = verifikacia.filter(d => d.kategoria === 'rodinne_domy').length;
    const mobilneDomyVerifikacia = verifikacia.filter(d => d.kategoria === 'mobilne_domy').length;

    const vysledok = {
      success: true,
      timestamp: new Date().toISOString(),
      statistika: {
        celkovo_domov: domy.length,
        opravene_rodinne: opraveneRodinne,
        opravene_mobilne: opraveneMobilne,
        chyby: chyby
      },
      verifikacia: {
        celkovo: verifikacia.length,
        rodinne_domy: rodinneDomyVerifikacia,
        mobilne_domy: mobilneDomyVerifikacia,
        bez_kategorie: bezKategorieVerifikacia
      },
      opravy: opravy,
      status: bezKategorieVerifikacia === 0 ? '✅ ÚSPECH - Všetky domy majú kategóriu' : `⚠️ PROBLÉM - ${bezKategorieVerifikacia} domov stále bez kategórie`
    };

    console.log('✅ Hotovo!');
    console.log(JSON.stringify(vysledok, null, 2));

    return Response.json(vysledok);

  } catch (error) {
    console.error('❌ Kritická chyba:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});