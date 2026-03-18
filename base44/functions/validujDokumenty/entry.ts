import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Načítaj všetky analyzované ale nevalidované dokumenty
    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky',
      podrobna_analyza_datum: { $exists: true },
      validovany: { $ne: true }
    });

    if (dokumenty.length === 0) {
      return Response.json({
        success: true,
        message: 'Žiadne dokumenty na validáciu',
        total: 0
      });
    }

    let validated = 0;
    let warnings = 0;
    let errors = 0;
    let manual_review_needed = 0;

    const validacneProblemy = [];

    for (const dok of dokumenty) {
      const analyza = dok.vizualna_analyza;
      const problemy = [];
      let status = 'ok';

      if (!analyza) {
        problemy.push('Chýba vizuálna analýza');
        status = 'error';
      } else {
        // Kontrola 1: Typ fasády vs materiály
        if (analyza.typ_obsahu === 'exterier') {
          if (!analyza.fasada_materialy || analyza.fasada_materialy.length === 0) {
            problemy.push('Exteriér nemá definované materiály fasády');
            status = status === 'ok' ? 'warning' : status;
          }

          // Kontrola konzistencie - drevená fasáda by mala mať typy drevín
          const maDrevo = analyza.fasada_materialy?.some(m => 
            m.toLowerCase().includes('drevo') || 
            m.toLowerCase().includes('drevené')
          );
          
          if (maDrevo && (!analyza.fasada_typy_drevin || analyza.fasada_typy_drevin.length === 0)) {
            problemy.push('Drevená fasáda nemá špecifikované typy drevín');
            status = status === 'ok' ? 'warning' : status;
          }
        }

        // Kontrola 2: Farby v bežných rozsahoch
        const bezneFarby = [
          'biela', 'čierna', 'sivá', 'hnedá', 'tmavohnedá', 'béžová',
          'prírodná', 'antracitová', 'grafitová', 'tmavosivá', 'svetlosivá',
          'červená', 'oranžová', 'zelená', 'modrá', 'žltá'
        ];

        if (analyza.fasada_farby && analyza.fasada_farby.length > 0) {
          const nebezneFarby = analyza.fasada_farby.filter(f => 
            !bezneFarby.some(bf => f.toLowerCase().includes(bf))
          );

          if (nebezneFarby.length > 0) {
            problemy.push(`Neštandardné farby: ${nebezneFarby.join(', ')}`);
            status = status === 'ok' ? 'warning' : status;
          }
        }

        // Kontrola 3: Typ obsahu vs prítomnosť dát
        if (analyza.typ_obsahu === 'podorys') {
          if (!analyza.podorys_analyza || !analyza.podorys_analyza.je_podorys) {
            problemy.push('Označené ako pôdorys, ale analýza pôdorysu chýba');
            status = 'error';
          }
        }

        // Kontrola 4: Okná a dvere na exteriéri
        if (analyza.typ_obsahu === 'exterier') {
          if (!analyza.okna_typ && !analyza.dvere_typ) {
            problemy.push('Exteriér nemá špecifikované okná ani dvere');
            status = status === 'ok' ? 'warning' : status;
          }
        }

        // Kontrola 5: Strecha na exteriéri
        if (analyza.typ_obsahu === 'exterier') {
          if (!analyza.strecha_typ && !analyza.strecha_material) {
            problemy.push('Exteriér nemá špecifikovanú strechu');
            status = status === 'ok' ? 'warning' : status;
          }
        }

        // Kontrola 6: Výrobca a model
        if (!analyza.spravny_vyrobca || !analyza.spravny_model) {
          problemy.push('Chýba výrobca alebo model domu');
          status = 'error';
        }

        // Kontrola 7: Stav fasády
        if (analyza.typ_obsahu === 'exterier' && !analyza.stav_fasady) {
          problemy.push('Chýba hodnotenie stavu fasády');
          status = status === 'ok' ? 'warning' : status;
        }
      }

      // Urči či je potrebná manuálna kontrola
      const potrebujeManKontrolu = status === 'error' || problemy.length >= 3;

      // Urči či je ready pre produkciu
      const prodReady = status === 'ok' || (status === 'warning' && !potrebujeManKontrolu);

      // Update dokumentu
      await base44.asServiceRole.entities.Dokument.update(dok.id, {
        validovany: true,
        validacia_datum: new Date().toISOString(),
        validacia_status: status,
        validacia_problemy: problemy,
        manualna_kontrola_potrebna: potrebujeManKontrolu,
        prod_ready: prodReady
      });

      validated++;
      if (status === 'warning') warnings++;
      if (status === 'error') errors++;
      if (potrebujeManKontrolu) {
        manual_review_needed++;
        validacneProblemy.push({
          dokument: dok.nazov,
          problemy: problemy
        });
      }
    }

    // Pošli notifikáciu ak sú nejaké problémy
    if (manual_review_needed > 0) {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      
      for (const admin of admins) {
        await base44.asServiceRole.entities.GoogleDriveNotification.create({
          notification_type: 'sync_failed',
          message: `Validácia dokumentov dokončená: ${manual_review_needed} fotiek vyžaduje manuálnu kontrolu`,
          severity: 'warning',
          read: false,
          user_id: admin.id,
          metadata: {
            total: dokumenty.length,
            validated,
            warnings,
            errors,
            manual_review_needed,
            problemy: validacneProblemy
          }
        });
      }
    }

    return Response.json({
      success: true,
      message: 'Validácia dokončená',
      total: dokumenty.length,
      validated,
      warnings,
      errors,
      manual_review_needed,
      problemy: validacneProblemy
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});