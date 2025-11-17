import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// ===== KONFIGURÁCIA =====
const BATCH_SIZE = 5; // Spracovať 5 súborov naraz
const LOG_INTERVAL = 3; // Logovať každé 3 súbory
const MAX_RETRIES = 3;

// ===== HELPER FUNKCIE =====
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
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
    console.log(`📝 LOG: ${message}`);
  } catch (error) {
    console.error('❌ Failed to create log:', error);
  }
}

async function shouldStop(base44, userId) {
  try {
    const stopFlags = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      user_id: userId,
      'metadata.type': 'reorganization_control',
      'metadata.should_stop': true,
      created_date: { $gte: new Date(Date.now() - 60000).toISOString() } // Posledná minúta
    });
    return stopFlags.length > 0;
  } catch (error) {
    console.error('⚠️ Error checking stop flag:', error);
    return false;
  }
}

function determineNewPath(dokument) {
  const analyza = dokument.vizualna_analyza;
  
  if (!analyza?.spravny_vyrobca || !analyza?.spravny_model) {
    return null; // Nemôžeme určiť cestu
  }

  const vyrobca = analyza.spravny_vyrobca;
  const model = analyza.spravny_model;
  const typObsahu = analyza.typ_obsahu || 'ine';

  // Určiť hlavný materiál
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
  }

  // Určiť podpriečinok
  let podpriecinok = '';
  if (typObsahu === 'podorys') {
    podpriecinok = `${model} pôdorys`;
  } else {
    podpriecinok = `${model} ${typObsahu}${hlavnyMaterial ? ' ' + hlavnyMaterial : ''}`;
  }

  const novaCesta = `${vyrobca}/${model}/${podpriecinok}`;
  
  return {
    cesta_priecinku: novaCesta,
    vyrobca,
    model_domu: model,
    podpriecinok,
    typObsahu,
    hlavnyMaterial
  };
}

async function processDocument(base44, dokument, verzieMap) {
  const newPathData = determineNewPath(dokument);
  
  if (!newPathData) {
    return { status: 'skipped', reason: 'Chýbajú údaje o výrobcovi/modeli' };
  }

  const { cesta_priecinku, vyrobca, model_domu, podpriecinok } = newPathData;

  // Kontrola verzie názvu súboru
  const originalName = dokument.nazov.split('.')[0];
  const extension = dokument.nazov.split('.').pop();
  const verziaKey = `${cesta_priecinku}/${originalName}`;
  
  let novyNazov = dokument.nazov;
  
  if (verzieMap.has(verziaKey)) {
    const verzia = verzieMap.get(verziaKey) + 1;
    verzieMap.set(verziaKey, verzia);
    novyNazov = `${originalName} Verzia ${verzia}.${extension}`;
  } else {
    verzieMap.set(verziaKey, 1);
  }

  // Skontrolovať, či sa niečo zmenilo
  if (
    dokument.cesta_priecinku === cesta_priecinku &&
    dokument.nazov === novyNazov &&
    dokument.reorganizovany === true
  ) {
    return { status: 'unchanged' };
  }

  // Aktualizovať dokument
  try {
    await base44.asServiceRole.entities.Dokument.update(dokument.id, {
      cesta_priecinku,
      nazov: novyNazov,
      vyrobca,
      model_domu,
      podpriecinok,
      reorganizovany: true,
      reorganizovany_datum: new Date().toISOString()
    });
    
    return { status: 'moved', newPath: cesta_priecinku, newName: novyNazov };
  } catch (error) {
    console.error(`❌ Error updating document ${dokument.id}:`, error);
    return { status: 'error', error: error.message };
  }
}

async function processBatch(base44, dokumenty, startIdx, verzieMap, stats, userId) {
  const endIdx = Math.min(startIdx + BATCH_SIZE, dokumenty.length);
  const batch = dokumenty.slice(startIdx, endIdx);
  
  const results = await Promise.allSettled(
    batch.map(dok => processDocument(base44, dok, verzieMap))
  );
  
  results.forEach((result, idx) => {
    const dokument = batch[idx];
    
    if (result.status === 'fulfilled') {
      const res = result.value;
      
      if (res.status === 'moved') {
        stats.presunute++;
      } else if (res.status === 'unchanged') {
        stats.nezmenene++;
      } else if (res.status === 'skipped') {
        stats.preskocene++;
      } else if (res.status === 'error') {
        stats.chyby++;
      }
    } else {
      stats.chyby++;
      console.error(`❌ Promise rejected for ${dokument.nazov}:`, result.reason);
    }
  });
  
  return endIdx;
}

// ===== HLAVNÁ FUNKCIA =====
Deno.serve(async (req) => {
  const startTime = Date.now();
  console.log('🚀 ============ REORGANIZÁCIA ŠTART ============');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json().catch(() => ({}));

    // STOP ACTION
    if (action === 'stop') {
      console.log('⏸️ Stop request received');
      await createLog(base44, user.id, '⏸️ Zastavovací príkaz prijatý', {
        type: 'reorganization_control',
        should_stop: true,
        severity: 'warning'
      });
      return Response.json({ success: true, message: 'Stop signal sent' });
    }

    // ŠTART LOGU
    await createLog(base44, user.id, '🚀 Reorganizácia spustená - načítavam dokumenty...', {
      status: 'running',
      processed: 0,
      total: 0,
      percent: 0
    });

    // NAČÍTANIE DOKUMENTOV
    console.log('📥 Fetching documents...');
    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky',
      vizualna_analyza: { $exists: true },
      podrobna_analyza_datum: { $exists: true }
    });

    console.log(`✅ Loaded ${dokumenty.length} documents`);

    if (dokumenty.length === 0) {
      await createLog(base44, user.id, '⚠️ Žiadne dokumenty na spracovanie', {
        status: 'completed',
        severity: 'warning'
      });
      return Response.json({
        success: true,
        message: 'No documents to process',
        presunute: 0,
        nezmenene: 0,
        chyby: 0
      });
    }

    await createLog(base44, user.id, `✅ Načítaných ${dokumenty.length} dokumentov - začínam spracovanie`, {
      status: 'running',
      total: dokumenty.length,
      processed: 0,
      percent: 0
    });

    // INICIALIZÁCIA ŠTATISTÍK
    const stats = {
      presunute: 0,
      nezmenene: 0,
      chyby: 0,
      preskocene: 0,
      total: dokumenty.length
    };

    const verzieMap = new Map();
    let processedCount = 0;

    // BATCH PROCESSING LOOP
    while (processedCount < dokumenty.length) {
      // Kontrola stop flagu
      if (await shouldStop(base44, user.id)) {
        await createLog(base44, user.id, `⏸️ Proces zastavený na ${processedCount}/${dokumenty.length}`, {
          status: 'stopped',
          processed: processedCount,
          total: dokumenty.length,
          ...stats,
          severity: 'warning'
        });
        
        return Response.json({
          success: true,
          stopped: true,
          ...stats,
          processed: processedCount
        });
      }

      // Spracovať batch
      const previousCount = processedCount;
      processedCount = await processBatch(base44, dokumenty, processedCount, verzieMap, stats, user.id);
      
      const percent = Math.round((processedCount / dokumenty.length) * 100);
      
      // Logovať progress každých LOG_INTERVAL súborov
      if (processedCount % LOG_INTERVAL === 0 || processedCount === dokumenty.length) {
        const batchMsg = `📊 ${percent}% | ${processedCount}/${dokumenty.length} | ✓${stats.presunute} ≈${stats.nezmenene} ✗${stats.chyby}`;
        
        await createLog(base44, user.id, batchMsg, {
          status: 'running',
          processed: processedCount,
          total: dokumenty.length,
          percent,
          presunute: stats.presunute,
          nezmenene: stats.nezmenene,
          chyby: stats.chyby,
          preskocene: stats.preskocene
        });
      }
    }

    // FINÁLNY LOG
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const finalMsg = `🎉 DOKONČENÉ za ${duration}s | ✓${stats.presunute} ≈${stats.nezmenene} ✗${stats.chyby}`;
    
    await createLog(base44, user.id, finalMsg, {
      status: 'completed',
      severity: 'success',
      ...stats,
      duration: `${duration}s`
    });

    console.log('✅ ============ REORGANIZÁCIA DOKONČENÁ ============');

    return Response.json({
      success: true,
      message: 'Reorganization completed',
      ...stats,
      duration: `${duration}s`
    });

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    console.error('Stack:', error.stack);
    
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me();
      
      await createLog(base44, user.id, `💥 FATAL: ${error.message}`, {
        status: 'error',
        severity: 'error',
        error: error.message,
        stack: error.stack
      });
    } catch (logError) {
      console.error('Failed to log fatal error:', logError);
    }
    
    return Response.json({ 
      error: error.message, 
      success: false,
      stack: error.stack 
    }, { status: 500 });
  }
});