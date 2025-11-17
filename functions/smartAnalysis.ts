import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

let processMemory = {
  currentBatch: [],
  failedItems: [],
  successCount: 0,
  errorCount: 0,
  lastCleanup: Date.now()
};

function cleanMemory() {
  processMemory.currentBatch = [];
  processMemory.failedItems = [];
  if (typeof global !== 'undefined' && global.gc) {
    global.gc();
  }
  processMemory.lastCleanup = Date.now();
  console.log('🧹 Memory cleaned');
}

async function log(base44, userId, message, data = {}) {
  try {
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message: String(message),
      severity: data.severity || 'info',
      read: false,
      user_id: String(userId),
      metadata: {
        type: 'smart_analysis_log',
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
      'metadata.stop_analysis': true,
      'metadata.type': 'stop_command'
    });
    return flags && flags.length > 0;
  } catch {
    return false;
  }
}

async function analyzeSingle(base44, dok, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const popis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Krátky slovenský popis tohto modulárneho domu (max 2 vety). Súbor: ${dok.nazov}`,
        file_urls: [dok.subor_url]
      });

      const vizAnalyza = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Detailná analýza obrázka modulárneho domu.

POVINNÉ POLIA:
- spravny_vyrobca: ["JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"]
- spravny_model: presný model (napr. "Modul 50")
- typ_obsahu: "exterier" alebo "interier" alebo "podorys"

FASÁDA (len exterier):
- fasada_materialy: pole materiálov
- fasada_farby: pole farieb

Kontext: ${dok.nazov}, ${dok.vyrobca}, ${dok.model_domu}`,
        file_urls: [dok.subor_url],
        response_json_schema: {
          type: "object",
          properties: {
            spravny_vyrobca: { type: "string" },
            spravny_model: { type: "string" },
            typ_obsahu: { type: "string" },
            fasada_materialy: { type: "array", items: { type: "string" } },
            fasada_farby: { type: "array", items: { type: "string" } }
          },
          required: ["spravny_vyrobca", "spravny_model", "typ_obsahu"]
        }
      });

      await base44.asServiceRole.entities.Dokument.update(dok.id, {
        podrobna_analyza_datum: new Date().toISOString(),
        ai_generovany_popis: popis,
        vizualna_analyza: vizAnalyza,
        analyzovany: true
      });

      return { success: true, data: vizAnalyza };
    } catch (error) {
      console.error(`Attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt === retries) {
        return { success: false, error: error.message };
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

Deno.serve(async (req) => {
  const start = Date.now();
  console.log('\n🚀 SMART ANALYSIS START');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oldLogs = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.type': 'smart_analysis_log'
    });
    for (const log of oldLogs) {
      await base44.asServiceRole.entities.GoogleDriveNotification.delete(log.id);
    }

    await log(base44, user.id, '🎯 Štart smart analýzy', { status: 'starting' });

    const allPhotos = await base44.asServiceRole.entities.Dokument.filter({ typ: 'fotky' });
    const needAnalysis = allPhotos.filter(d => !d.vizualna_analyza?.spravny_vyrobca);
    
    const total = needAnalysis.length;
    
    if (total === 0) {
      await log(base44, user.id, '✅ Všetky fotky analyzované', { 
        status: 'completed',
        total: 0 
      });
      return Response.json({ success: true, total: 0, message: 'Nothing to analyze' });
    }

    await log(base44, user.id, `📊 Našlo sa ${total} fotiek na analýzu`, {
      status: 'running',
      total,
      processed: 0,
      percent: 0
    });

    const BATCH_SIZE = 10;
    let processed = 0;
    let success = 0;
    let failed = 0;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      if (await checkStopFlag(base44)) {
        await log(base44, user.id, `⏸️ ZASTAVENÉ na ${processed}/${total}`, {
          status: 'stopped',
          severity: 'warning',
          total,
          processed,
          success,
          failed
        });
        return Response.json({ success: true, stopped: true, processed, total, success, failed });
      }

      const batch = needAnalysis.slice(i, Math.min(i + BATCH_SIZE, total));
      processMemory.currentBatch = batch;

      for (const dok of batch) {
        if (await checkStopFlag(base44)) {
          await log(base44, user.id, `⏸️ ZASTAVENÉ na ${processed}/${total}`, {
            status: 'stopped',
            severity: 'warning',
            total,
            processed,
            success,
            failed
          });
          return Response.json({ success: true, stopped: true, processed, total, success, failed });
        }

        const result = await analyzeSingle(base44, dok);
        
        if (result.success) {
          success++;
          processMemory.successCount++;
          await log(base44, user.id, `✅ ${processed + 1}/${total} | ${dok.nazov}`, {
            status: 'running',
            total,
            processed: processed + 1,
            percent: Math.round(((processed + 1) / total) * 100),
            success,
            failed
          });
        } else {
          failed++;
          processMemory.errorCount++;
          processMemory.failedItems.push({ id: dok.id, error: result.error });
          await log(base44, user.id, `❌ ${processed + 1}/${total} | ${dok.nazov} | ${result.error}`, {
            status: 'running',
            total,
            processed: processed + 1,
            percent: Math.round(((processed + 1) / total) * 100),
            success,
            failed,
            severity: 'error'
          });
        }
        
        processed++;
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      cleanMemory();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);

    await log(base44, user.id, `🎉 ANALÝZA HOTOVÁ za ${duration}s | ✅ ${success} | ❌ ${failed}`, {
      status: 'completed',
      severity: 'success',
      total,
      processed,
      success,
      failed,
      duration
    });

    if (success > 0) {
      await log(base44, user.id, '🔄 Spúšťam reorganizáciu...', {
        status: 'reorganizing'
      });

      const reorgResult = await base44.asServiceRole.functions.invoke('smartReorganization', {});
      
      await log(base44, user.id, '✅ Reorganizácia dokončená', {
        status: 'completed',
        severity: 'success',
        reorganization: reorgResult.data
      });
    }

    return Response.json({
      success: true,
      total,
      processed,
      success,
      failed,
      duration
    });

  } catch (error) {
    console.error('FATAL:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});