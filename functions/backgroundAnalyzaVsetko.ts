import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

async function logProgress(base44, userId, message, metadata = {}) {
  try {
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message: String(message),
      severity: metadata.severity || 'info',
      read: false,
      user_id: String(userId),
      metadata: {
        type: 'analysis_log',
        timestamp: new Date().toISOString(),
        ...metadata,
        // Ensure numbers are numbers
        total: Number(metadata.total) || 0,
        processed: Number(metadata.processed) || 0,
        percent: Number(metadata.percent) || 0
      }
    });
    console.log(`[LOG] ${message}`);
  } catch (err) {
    console.error('[LOG ERROR]', err.message);
  }
}

async function checkStopFlag(base44) {
  try {
    const flags = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.should_stop': true,
      'metadata.type': 'analysis_control'
    });
    return flags && flags.length > 0;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  console.log('\n🚀 ========== ANALÝZA + REORGANIZÁCIA START ==========');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {}

    if (body.action === 'stop') {
      await logProgress(base44, user.id, '⏸️ Stop príkaz prijatý', {
        type: 'analysis_control',
        should_stop: true,
        severity: 'warning'
      });
      return Response.json({ success: true, message: 'Analýza bude zastavená' });
    }

    // Vyčistiť staré logy pri štarte
    console.log('🧹 Čistím staré logy...');
    const oldLogs = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
      'metadata.type': 'analysis_log'
    });
    for (const log of oldLogs) {
      await base44.asServiceRole.entities.GoogleDriveNotification.delete(log.id);
    }
    console.log(`✓ Vymazané ${oldLogs.length} starých logov`);

    const vsetkyFotky = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky'
    });

    const pocet = vsetkyFotky.length;
    console.log(`📊 Celkom fotiek: ${pocet}`);
    
    await logProgress(base44, user.id, `📊 Načítané: ${pocet} fotiek`, {
      status: 'running',
      total: pocet
    });

    const bezAnalyzy = vsetkyFotky.filter(d => !d.vizualna_analyza || !d.vizualna_analyza.spravny_vyrobca);
    const naAnalyzu = bezAnalyzy.length;
    
    console.log(`🔍 Na analýzu: ${naAnalyzu}`);
    await logProgress(base44, user.id, `🔍 ${naAnalyzu} fotiek potrebuje vizuálnu analýzu`, {
      status: 'running',
      total: naAnalyzu,
      processed: 0,
      percent: 0
    });

    if (naAnalyzu === 0) {
      await logProgress(base44, user.id, '✅ Všetky fotky už analyzované, spúšťam reorganizáciu...', {
        status: 'running',
        severity: 'success',
        total: 0,
        processed: 0
      });
      
      const reorganizaciaResponse = await base44.asServiceRole.functions.invoke('reorganizujDokumenty', {});
      
      await logProgress(base44, user.id, `✅ Reorganizácia dokončená`, {
        status: 'completed',
        severity: 'success',
        reorganizacia: reorganizaciaResponse.data,
        total: 0,
        processed: 0
      });

      return Response.json({
        success: true,
        message: 'Všetky fotky už analyzované, reorganizácia dokončená',
        total: 0,
        processed: 0,
        reorganizacia: reorganizaciaResponse.data
      });
    }

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < naAnalyzu; i++) {
      const dok = bezAnalyzy[i];
      const current = i + 1;
      const percent = Math.round((current / naAnalyzu) * 100);

      console.log(`\n[${current}/${naAnalyzu}] ${dok.nazov}`);

      // Check stop každých 5
      if (i > 0 && i % 5 === 0) {
        const shouldStop = await checkStopFlag(base44);
        if (shouldStop) {
          await logProgress(base44, user.id, `⏸️ Zastavené na ${current}/${naAnalyzu}`, {
            status: 'stopped',
            severity: 'warning',
            total: naAnalyzu,
            processed: current,
            percent,
            failed,
            skipped,
            last_index: i
          });
          return Response.json({
            success: true,
            stopped: true,
            processed: current,
            total: naAnalyzu,
            failed,
            skipped,
            last_index: i
          });
        }
      }

      // Retry mechanizmus
      let retries = 0;
      let success = false;
      
      while (retries < 3 && !success) {
        try {
          const popis = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Analyzuj tento obrázok modulárneho domu a vytvor krátky slovenský popis (2-3 vety).
            
Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model: ${dok.model_domu || 'neznámy'}`,
            file_urls: [dok.subor_url]
          });

          const vizAnalyza = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `Analyzuj obrázok modulárneho domu a extrahuj PRESNÉ detailné informácie.

DÔLEŽITÉ:
- spravny_vyrobca: presný názov výrobcu z ["JAK Modules", "Ticab house", "Prosto House", "Domki z Gór"]
- spravny_model: presný model domu (napr. "Modul 50", "70 Barcelona", "Dom A1")

ZÁKLADNÉ:
- typ_obsahu: "exterier", "interier", "podorys", "detail"
- specificka_kategoria: kategória obsahu

FASÁDA (ak exterier):
- fasada_materialy: ["drevo", "kovový obklad", "omietka", ...]
- fasada_typy_drevin: ["smrek", "borovica", "céder", ...]
- fasada_povrchove_upravy: ["lazúra", "lak", "farba", ...]
- fasada_prvky: ["okná", "dvere", "terasa", ...]
- fasada_farby: ["tmavo hnedá", "biela", ...]

OKNÁ/DVERE:
- okna_typ, okna_farba
- dvere_typ, dvere_farba

STRECHA:
- strecha_typ, strecha_farba, strecha_material

KVALITA:
- stav_fasady: "výborný", "dobrý", "potrebuje údržbu"

Kontext:
- Súbor: ${dok.nazov}
- Aktuálny výrobca: ${dok.vyrobca}
- Aktuálny model: ${dok.model_domu}
- Priečinok: ${dok.cesta_priecinku}`,
            file_urls: [dok.subor_url],
            response_json_schema: {
              type: "object",
              properties: {
                typ_obsahu: { type: "string" },
                specificka_kategoria: { type: "string" },
                fasada_materialy: { type: "array", items: { type: "string" } },
                fasada_typy_drevin: { type: "array", items: { type: "string" } },
                fasada_povrchove_upravy: { type: "array", items: { type: "string" } },
                fasada_prvky: { type: "array", items: { type: "string" } },
                fasada_farby: { type: "array", items: { type: "string" } },
                okna_typ: { type: "string" },
                okna_farba: { type: "string" },
                dvere_typ: { type: "string" },
                dvere_farba: { type: "string" },
                strecha_typ: { type: "string" },
                strecha_farba: { type: "string" },
                strecha_material: { type: "string" },
                stav_fasady: { type: "string" },
                spravny_vyrobca: { type: "string" },
                spravny_model: { type: "string" }
              }
            }
          });

          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            podrobna_analyza_datum: new Date().toISOString(),
            ai_generovany_popis: popis,
            vizualna_analyza: vizAnalyza,
            analyzovaný: true
          });

          processed++;
          success = true;
          
          await logProgress(base44, user.id, `✓ ${current}/${naAnalyzu} | ${dok.nazov} | ${vizAnalyza.spravny_vyrobca} - ${vizAnalyza.spravny_model}`, {
            status: 'running',
            total: naAnalyzu,
            processed: current,
            percent,
            current_file: dok.nazov,
            success_count: processed
          });

          console.log(`✓ OK | ${vizAnalyza.spravny_vyrobca} - ${vizAnalyza.spravny_model}`);

        } catch (error) {
          retries++;
          const errorMsg = error.message || error.toString();
          
          if (retries >= 3) {
            console.error(`✗ CHYBA po ${retries} pokusoch: ${errorMsg}`);
            
            if (errorMsg.includes('unsupported image') || errorMsg.includes('ImageURL')) {
              await base44.asServiceRole.entities.Dokument.update(dok.id, {
                podrobna_analyza_datum: new Date().toISOString(),
                ai_generovany_popis: 'Problémový obrázok - nepodporovaný formát'
              });
              skipped++;
            } else {
              await base44.asServiceRole.entities.Dokument.update(dok.id, {
                podrobna_analyza_datum: new Date().toISOString(),
                ai_generovany_popis: `Chyba analýzy: ${errorMsg}`
              });
              failed++;
            }
            
            await logProgress(base44, user.id, `✗ ${current}/${naAnalyzu} | ${dok.nazov} | Chyba: ${errorMsg}`, {
              status: 'running',
              total: naAnalyzu,
              processed: current,
              percent,
              current_file: dok.nazov,
              error_count: failed,
              severity: 'error'
            });
          } else {
            console.log(`⚠️ Retry ${retries}/3...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const analysisDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    await logProgress(base44, user.id, `✅ ANALÝZA HOTOVÁ za ${analysisDuration}s | ✓${processed} ⊘${skipped} ✗${failed}`, {
      status: 'analysis_completed',
      severity: 'success',
      total: naAnalyzu,
      processed: naAnalyzu,
      percent: 100,
      duration: analysisDuration
    });

    console.log(`\n✅ Analýza hotová, spúšťam reorganizáciu...`);

    await logProgress(base44, user.id, '🔄 Spúšťam reorganizáciu súborov...', {
      status: 'reorganizing',
      severity: 'info',
      total: 0,
      processed: 0
    });

    const reorganizaciaResponse = await base44.asServiceRole.functions.invoke('reorganizujDokumenty', {});
    
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    await logProgress(base44, user.id, `🎉 HOTOVO za ${totalDuration}s | Analýza + Reorganizácia dokončené`, {
      status: 'completed',
      severity: 'success',
      total: 0,
      processed: 0,
      analysis: { processed, failed, skipped },
      reorganizacia: reorganizaciaResponse.data,
      total_duration: totalDuration
    });

    console.log('========== KONIEC ==========\n');

    return Response.json({
      success: true,
      message: 'Analýza a reorganizácia dokončené',
      analysis: {
        total: naAnalyzu,
        processed,
        failed,
        skipped
      },
      reorganizacia: reorganizaciaResponse.data,
      duration: totalDuration
    });

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});