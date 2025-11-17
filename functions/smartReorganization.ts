import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

async function log(base44, userId, message, data = {}) {
  try {
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message: String(message),
      severity: data.severity || 'info',
      read: false,
      user_id: String(userId),
      metadata: {
        type: 'smart_reorg_log',
        timestamp: new Date().toISOString(),
        ...data
      }
    });
  } catch (err) {
    console.error('[LOG ERROR]', err.message);
  }
}

async function checkStopFlag(base44) {
  try {
    const flags = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.stop_reorg': true,
      'metadata.type': 'stop_command'
    });
    return flags && flags.length > 0;
  } catch {
    return false;
  }
}

function getNewPath(dok) {
  const va = dok?.vizualna_analyza;
  if (!va?.spravny_vyrobca || !va?.spravny_model) return null;

  const vyrobca = String(va.spravny_vyrobca).trim();
  const model = String(va.spravny_model).trim();
  const typ = String(va.typ_obsahu || 'ine').trim();

  let material = '';
  if (typ === 'exterier' && va.fasada_materialy?.[0]) {
    material = String(va.fasada_materialy[0]).trim();
  }

  const podpriecinok = material ? `${typ}-${material}` : typ;
  return {
    cesta_priecinku: `${vyrobca}/${model}/${podpriecinok}`,
    vyrobca,
    model_domu: model,
    podpriecinok
  };
}

Deno.serve(async (req) => {
  const start = Date.now();
  console.log('\n📁 SMART REORGANIZATION START');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oldLogs = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.type': 'smart_reorg_log'
    });
    for (const log of oldLogs) {
      await base44.asServiceRole.entities.GoogleDriveNotification.delete(log.id);
    }

    await log(base44, user.id, '📁 Štart reorganizácie', { status: 'starting' });

    const allPhotos = await base44.asServiceRole.entities.Dokument.filter({ typ: 'fotky' });
    const needReorg = allPhotos.filter(d => {
      if (d.reorganizovany) return false;
      return d.vizualna_analyza?.spravny_vyrobca && d.vizualna_analyza?.spravny_model;
    });

    const total = needReorg.length;

    if (total === 0) {
      await log(base44, user.id, '✅ Všetky fotky reorganizované', {
        status: 'completed',
        total: 0
      });
      return Response.json({ success: true, total: 0, moved: 0 });
    }

    await log(base44, user.id, `📊 ${total} fotiek na reorganizáciu`, {
      status: 'running',
      total,
      processed: 0,
      percent: 0
    });

    let moved = 0;
    let unchanged = 0;
    let errors = 0;

    for (let i = 0; i < total; i++) {
      if (i > 0 && i % 10 === 0) {
        if (await checkStopFlag(base44)) {
          await log(base44, user.id, `⏸️ ZASTAVENÉ na ${i}/${total}`, {
            status: 'stopped',
            severity: 'warning',
            total,
            processed: i,
            moved,
            unchanged,
            errors
          });
          return Response.json({ success: true, stopped: true, total, processed: i, moved, unchanged, errors });
        }
      }

      const dok = needReorg[i];
      
      try {
        const newPath = getNewPath(dok);
        
        if (!newPath) {
          unchanged++;
          continue;
        }

        if (dok.cesta_priecinku === newPath.cesta_priecinku) {
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            reorganizovany: true,
            reorganizovany_datum: new Date().toISOString()
          });
          unchanged++;
        } else {
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            ...newPath,
            reorganizovany: true,
            reorganizovany_datum: new Date().toISOString()
          });
          moved++;
        }

        if ((i + 1) % 10 === 0 || i === total - 1) {
          const percent = Math.round(((i + 1) / total) * 100);
          await log(base44, user.id, `📦 ${percent}% | ${i + 1}/${total} | ✅${moved} ≈${unchanged} ❌${errors}`, {
            status: 'running',
            total,
            processed: i + 1,
            percent,
            moved,
            unchanged,
            errors
          });
        }
      } catch (error) {
        errors++;
        console.error(`Error on ${dok.id}:`, error.message);
      }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);

    await log(base44, user.id, `✅ HOTOVO za ${duration}s | ✅${moved} ≈${unchanged} ❌${errors}`, {
      status: 'completed',
      severity: 'success',
      total,
      moved,
      unchanged,
      errors,
      duration
    });

    return Response.json({
      success: true,
      total,
      moved,
      unchanged,
      errors,
      duration
    });

  } catch (error) {
    console.error('FATAL:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});