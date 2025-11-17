import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

async function createLog(base44, userId, message, metadata = {}) {
  try {
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message,
      severity: metadata.severity || 'info',
      read: false,
      user_id: userId,
      metadata: {
        type: 'reorganization_log',
        ...metadata
      }
    });
    console.log(message);
  } catch (err) {
    console.error('Log error:', err);
  }
}

async function shouldStop(base44) {
  try {
    const flags = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.should_stop': true
    });
    return flags.length > 0;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Stop príkaz
    if (body.action === 'stop') {
      await createLog(base44, user.id, '⏸️ Stop príkaz', {
        type: 'reorganization_control',
        should_stop: true,
        severity: 'warning'
      });
      return Response.json({ success: true });
    }

    await createLog(base44, user.id, '🚀 Reorganizácia začala', { status: 'running' });

    // Načítaj dokumenty
    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky',
      podrobna_analyza_datum: { $exists: true }
    });

    if (!dokumenty || dokumenty.length === 0) {
      await createLog(base44, user.id, '⚠️ Žiadne dokumenty na spracovanie', { 
        status: 'completed',
        severity: 'warning' 
      });
      return Response.json({ success: true, message: 'No documents' });
    }

    await createLog(base44, user.id, `📦 Nájdených ${dokumenty.length} dokumentov`, {
      status: 'running',
      total: dokumenty.length
    });

    let presunute = 0;
    let nezmenene = 0;
    let chyby = 0;

    // Spracuj dokumenty jeden po druhom
    for (let i = 0; i < dokumenty.length; i++) {
      // Check stop každých 10 dokumentov
      if (i % 10 === 0 && await shouldStop(base44)) {
        await createLog(base44, user.id, `⏸️ Zastavené na ${i}/${dokumenty.length}`, {
          status: 'stopped',
          severity: 'warning',
          presunute,
          nezmenene,
          chyby
        });
        return Response.json({ success: true, stopped: true });
      }

      const dok = dokumenty[i];

      try {
        const va = dok.vizualna_analyza;

        // Skip ak nie je analýza
        if (!va || !va.spravny_vyrobca || !va.spravny_model) {
          nezmenene++;
          continue;
        }

        const vyrobca = va.spravny_vyrobca;
        const model = va.spravny_model;
        const typ = va.typ_obsahu || 'ine';

        // Vytvor cestu
        let podpriecinok = typ;
        if (typ === 'exterier' && va.fasada_materialy?.length > 0) {
          podpriecinok = `${typ}-${va.fasada_materialy[0]}`;
        } else if (typ === 'interier' && va.interier_materialy?.length > 0) {
          podpriecinok = `${typ}-${va.interier_materialy[0]}`;
        }

        const novaCesta = `${vyrobca}/${model}/${podpriecinok}`;

        // Update len ak je iná cesta
        if (dok.cesta_priecinku === novaCesta && dok.reorganizovany) {
          nezmenene++;
        } else {
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            cesta_priecinku: novaCesta,
            vyrobca: vyrobca,
            model_domu: model,
            podpriecinok: podpriecinok,
            reorganizovany: true,
            reorganizovany_datum: new Date().toISOString()
          });
          presunute++;
        }

      } catch (err) {
        console.error(`Error processing ${dok.id}:`, err);
        chyby++;
      }

      // Progress update každých 5 súborov
      if ((i + 1) % 5 === 0 || i === dokumenty.length - 1) {
        const percent = Math.round(((i + 1) / dokumenty.length) * 100);
        await createLog(base44, user.id, `Progress: ${i + 1}/${dokumenty.length} (${percent}%)`, {
          status: 'running',
          processed: i + 1,
          total: dokumenty.length,
          percent,
          presunute,
          nezmenene,
          chyby
        });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    await createLog(base44, user.id, `✅ Dokončené za ${duration}s | Presunuté: ${presunute}, Nezmenené: ${nezmenene}, Chyby: ${chyby}`, {
      status: 'completed',
      severity: 'success',
      presunute,
      nezmenene,
      chyby,
      total: dokumenty.length,
      duration
    });

    return Response.json({
      success: true,
      presunute,
      nezmenene,
      chyby,
      total: dokumenty.length,
      duration
    });

  } catch (error) {
    console.error('FATAL ERROR:', error);
    
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me();
      await createLog(base44, user.id, `❌ Chyba: ${error.message}`, {
        status: 'error',
        severity: 'error'
      });
    } catch {}
    
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});