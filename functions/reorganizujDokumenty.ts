import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

async function log(base44, userId, message, metadata = {}) {
  try {
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message,
      severity: metadata.severity || 'info',
      read: false,
      user_id: userId,
      metadata: {
        type: 'reorganization_log',
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
    console.log(`📝 ${message}`);
  } catch (err) {
    console.error('Log error:', err);
  }
}

async function checkStop(base44, userId) {
  try {
    const stopFlags = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.should_stop': true,
      'metadata.type': 'reorganization_control'
    });
    return stopFlags.length > 0;
  } catch {
    return false;
  }
}

function getNewPath(dok) {
  const va = dok.vizualna_analyza;
  if (!va?.spravny_vyrobca || !va?.spravny_model) return null;

  const vyrobca = va.spravny_vyrobca;
  const model = va.spravny_model;
  const typ = va.typ_obsahu || 'ine';

  let material = '';
  if (typ === 'exterier' && va.fasada_materialy?.length > 0) {
    const mat = va.fasada_materialy[0].toLowerCase();
    if (mat.includes('drevo')) material = 'drevený';
    else if (mat.includes('omietk')) material = `${va.fasada_farby?.[0] || 'biela'} omietka`;
    else if (mat.includes('kameň')) material = 'kamenný';
    else material = va.fasada_materialy[0];
  } else if (typ === 'interier' && va.interier_materialy?.length > 0) {
    const mat = va.interier_materialy[0].toLowerCase();
    if (mat.includes('drevo')) material = 'drevený';
    else if (mat.includes('sádro')) material = 'sádrokartón';
    else material = va.interier_materialy[0];
  }

  const podpriecinok = typ === 'podorys' 
    ? `${model} pôdorys`
    : `${model} ${typ}${material ? ' ' + material : ''}`;

  return {
    cesta_priecinku: `${vyrobca}/${model}/${podpriecinok}`,
    vyrobca,
    model_domu: model,
    podpriecinok
  };
}

Deno.serve(async (req) => {
  console.log('🚀 === REORGANIZÁCIA START ===');
  const startTime = Date.now();

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin' && !user?.super_admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    if (body.action === 'stop') {
      await log(base44, user.id, '⏸️ Stop príkaz prijatý', {
        type: 'reorganization_control',
        should_stop: true,
        severity: 'warning'
      });
      return Response.json({ success: true });
    }

    await log(base44, user.id, '🚀 Spustené - načítavam dokumenty...', { status: 'running' });

    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky',
      'vizualna_analyza': { $exists: true },
      'podrobna_analyza_datum': { $exists: true }
    });

    console.log(`✅ Loaded ${dokumenty.length} docs`);

    if (!dokumenty || dokumenty.length === 0) {
      await log(base44, user.id, '⚠️ Žiadne dokumenty', { status: 'completed', severity: 'warning' });
      return Response.json({ success: true, presunute: 0, nezmenene: 0, chyby: 0 });
    }

    await log(base44, user.id, `✅ Načítaných ${dokumenty.length} dokumentov`, {
      status: 'running',
      total: dokumenty.length,
      processed: 0,
      percent: 0
    });

    let presunute = 0;
    let nezmenene = 0;
    let chyby = 0;
    const nameMap = new Map();

    for (let i = 0; i < dokumenty.length; i++) {
      if (i % 10 === 0) {
        const shouldStop = await checkStop(base44, user.id);
        if (shouldStop) {
          await log(base44, user.id, `⏸️ Zastavené na ${i}/${dokumenty.length}`, {
            status: 'stopped',
            presunute, nezmenene, chyby,
            severity: 'warning'
          });
          return Response.json({ success: true, stopped: true, presunute, nezmenene, chyby });
        }
      }

      const dok = dokumenty[i];
      
      try {
        const newPath = getNewPath(dok);
        
        if (!newPath) {
          nezmenene++;
          continue;
        }

        const { cesta_priecinku, vyrobca, model_domu, podpriecinok } = newPath;

        const origName = dok.nazov.split('.')[0];
        const ext = dok.nazov.split('.').pop();
        const key = `${cesta_priecinku}/${origName}`;
        
        let novyNazov = dok.nazov;
        if (nameMap.has(key)) {
          const ver = nameMap.get(key) + 1;
          nameMap.set(key, ver);
          novyNazov = `${origName} Verzia ${ver}.${ext}`;
        } else {
          nameMap.set(key, 1);
        }

        if (dok.cesta_priecinku === cesta_priecinku && dok.nazov === novyNazov && dok.reorganizovany) {
          nezmenene++;
        } else {
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            cesta_priecinku,
            nazov: novyNazov,
            vyrobca,
            model_domu,
            podpriecinok,
            reorganizovany: true,
            reorganizovany_datum: new Date().toISOString()
          });
          presunute++;
        }

        if ((i + 1) % 5 === 0 || i === dokumenty.length - 1) {
          const percent = Math.round(((i + 1) / dokumenty.length) * 100);
          await log(base44, user.id, `📊 ${percent}% | ${i + 1}/${dokumenty.length} | ✓${presunute} ≈${nezmenene} ✗${chyby}`, {
            status: 'running',
            processed: i + 1,
            total: dokumenty.length,
            percent,
            presunute,
            nezmenene,
            chyby
          });
        }

      } catch (err) {
        console.error(`Error ${dok.id}:`, err);
        chyby++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    await log(base44, user.id, `🎉 HOTOVO za ${duration}s | ✓${presunute} ≈${nezmenene} ✗${chyby}`, {
      status: 'completed',
      severity: 'success',
      presunute,
      nezmenene,
      chyby,
      total: dokumenty.length,
      duration
    });

    console.log('✅ === REORGANIZÁCIA DONE ===');

    return Response.json({
      success: true,
      presunute,
      nezmenene,
      chyby,
      total: dokumenty.length,
      duration
    });

  } catch (error) {
    console.error('💥 FATAL:', error);
    
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me();
      await log(base44, user.id, `💥 CHYBA: ${error.message}`, {
        status: 'error',
        severity: 'error',
        error: error.message
      });
    } catch {}
    
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});