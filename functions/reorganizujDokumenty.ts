import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Helper na bezpečné logovanie
async function log(base44, userId, message, metadata = {}) {
  try {
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message: String(message),
      severity: metadata.severity || 'info',
      read: false,
      user_id: String(userId),
      metadata: {
        type: 'reorganization_log',
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
    console.log(`[LOG] ${message}`);
  } catch (err) {
    console.error('[LOG ERROR]', err.message);
  }
}

// Check stop flag
async function checkStopFlag(base44) {
  try {
    const flags = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.should_stop': true,
      'metadata.type': 'reorganization_control'
    });
    return flags && flags.length > 0;
  } catch {
    return false;
  }
}

// Bezpečné získanie novej cesty
function getNewPath(dok) {
  try {
    const va = dok?.vizualna_analyza;
    if (!va || !va.spravny_vyrobca || !va.spravny_model) {
      return null;
    }

    const vyrobca = String(va.spravny_vyrobca).trim();
    const model = String(va.spravny_model).trim();
    const typ = String(va.typ_obsahu || 'ine').trim();

    let material = '';
    if (typ === 'exterier' && Array.isArray(va.fasada_materialy) && va.fasada_materialy.length > 0) {
      material = String(va.fasada_materialy[0]).trim();
    } else if (typ === 'interier' && Array.isArray(va.interier_materialy) && va.interier_materialy.length > 0) {
      material = String(va.interier_materialy[0]).trim();
    }

    const podpriecinok = material ? `${typ}-${material}` : typ;
    const cesta = `${vyrobca}/${model}/${podpriecinok}`;

    return {
      cesta_priecinku: cesta,
      vyrobca: vyrobca,
      model_domu: model,
      podpriecinok: podpriecinok
    };
  } catch (err) {
    console.error('[PATH ERROR]', err.message);
    return null;
  }
}

// Hlavná funkcia
Deno.serve(async (req) => {
  console.log('\n🚀 ========== REORGANIZÁCIA START ==========');
  const startTime = Date.now();
  
  let base44;
  let user;
  
  try {
    // Inicializácia
    base44 = createClientFromRequest(req);
    user = await base44.auth.me();

    console.log(`User: ${user?.email} (${user?.role})`);

    if (!user || (user.role !== 'admin' && user.super_admin !== true)) {
      console.log('❌ Unauthorized');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle stop command
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (body.action === 'stop') {
      console.log('⏸️ Stop command received');
      await log(base44, user.id, '⏸️ Stop príkaz prijatý', {
        type: 'reorganization_control',
        should_stop: true,
        severity: 'warning'
      });
      return Response.json({ success: true, stopped: true });
    }

    // Start
    await log(base44, user.id, '🚀 Reorganizácia spustená', { status: 'running' });
    console.log('📥 Loading documents...');

    // Načítaj dokumenty
    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky',
      podrobna_analyza_datum: { $exists: true }
    });

    console.log(`✅ Loaded ${dokumenty?.length || 0} documents`);

    if (!dokumenty || !Array.isArray(dokumenty) || dokumenty.length === 0) {
      await log(base44, user.id, '⚠️ Žiadne dokumenty na spracovanie', {
        status: 'completed',
        severity: 'warning'
      });
      return Response.json({ success: true, presunute: 0, nezmenene: 0, chyby: 0 });
    }

    await log(base44, user.id, `📦 Načítaných ${dokumenty.length} dokumentov`, {
      status: 'running',
      total: dokumenty.length,
      processed: 0,
      percent: 0
    });

    let presunute = 0;
    let nezmenene = 0;
    let chyby = 0;

    // Spracuj dokumenty JEDEN PO JEDNOM
    console.log('🔄 Processing documents...');
    
    for (let i = 0; i < dokumenty.length; i++) {
      // Check stop každých 10
      if (i > 0 && i % 10 === 0) {
        const shouldStop = await checkStopFlag(base44);
        if (shouldStop) {
          console.log(`⏸️ Stopped at ${i}/${dokumenty.length}`);
          await log(base44, user.id, `⏸️ Zastavené na ${i}/${dokumenty.length}`, {
            status: 'stopped',
            severity: 'warning',
            presunute,
            nezmenene,
            chyby
          });
          return Response.json({ success: true, stopped: true, presunute, nezmenene, chyby });
        }
      }

      const dok = dokumenty[i];

      try {
        // Získaj novú cestu
        const newPath = getNewPath(dok);

        if (!newPath) {
          nezmenene++;
          continue;
        }

        // Check ak už je správne
        if (dok.cesta_priecinku === newPath.cesta_priecinku && dok.reorganizovany === true) {
          nezmenene++;
          continue;
        }

        // Update dokument
        await base44.asServiceRole.entities.Dokument.update(dok.id, {
          cesta_priecinku: newPath.cesta_priecinku,
          vyrobca: newPath.vyrobca,
          model_domu: newPath.model_domu,
          podpriecinok: newPath.podpriecinok,
          reorganizovany: true,
          reorganizovany_datum: new Date().toISOString()
        });

        presunute++;

      } catch (err) {
        console.error(`❌ Error ${dok?.id}:`, err.message);
        chyby++;
      }

      // Progress log každých 5
      if ((i + 1) % 5 === 0 || i === dokumenty.length - 1) {
        const processed = i + 1;
        const percent = Math.round((processed / dokumenty.length) * 100);
        
        console.log(`📊 ${percent}% (${processed}/${dokumenty.length}) | ✓${presunute} ≈${nezmenene} ✗${chyby}`);
        
        await log(base44, user.id, `📊 ${percent}% | ${processed}/${dokumenty.length}`, {
          status: 'running',
          processed,
          total: dokumenty.length,
          percent,
          presunute,
          nezmenene,
          chyby
        });
      }
    }

    // Done
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const finalMsg = `✅ HOTOVO za ${duration}s | ✓${presunute} ≈${nezmenene} ✗${chyby}`;
    
    console.log(finalMsg);
    console.log('========== REORGANIZÁCIA END ==========\n');

    await log(base44, user.id, finalMsg, {
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
    console.error('💥 FATAL ERROR:', error);
    console.error('Stack:', error.stack);

    try {
      if (base44 && user) {
        await log(base44, user.id, `💥 FATAL: ${error.message}`, {
          status: 'error',
          severity: 'error',
          error: error.message,
          stack: error.stack
        });
      }
    } catch (logErr) {
      console.error('Failed to log error:', logErr);
    }

    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    }, { status: 500 });
  }
});