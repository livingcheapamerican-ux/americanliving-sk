import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Helper na real-time logovanie
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
        ...metadata
      }
    });
    console.log(`[LOG] ${message}`);
  } catch (err) {
    console.error('[LOG ERROR]', err.message);
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

    const { action } = await req.json();

    // Stop príkaz
    if (action === 'stop') {
      await logProgress(base44, user.id, '⏸️ Stop príkaz prijatý', {
        type: 'analysis_control',
        should_stop: true,
        severity: 'warning'
      });
      return Response.json({ success: true, message: 'Analýza bude zastavená' });
    }

    // Načítaj VŠETKY fotky
    const vsetkyFotky = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky'
    });

    console.log(`📊 Celkom fotiek: ${vsetkyFotky.length}`);
    await logProgress(base44, user.id, `📊 Načítané: ${vsetkyFotky.length} fotiek`, {
      status: 'running',
      total: vsetkyFotky.length
    });

    // Filtruj tie bez vizuálnej analýzy
    const bezAnalyzy = vsetkyFotky.filter(d => !d.vizualna_analyza || !d.vizualna_analyza.spravny_vyrobca);
    
    console.log(`🔍 Na analýzu: ${bezAnalyzy.length}`);
    await logProgress(base44, user.id, `🔍 ${bezAnalyzy.length} fotiek potrebuje vizuálnu analýzu`, {
      status: 'running',
      total: bezAnalyzy.length,
      percent: 0
    });

    if (bezAnalyzy.length === 0) {
      // Už všetko analyzované - iba spusti reorganizáciu
      await logProgress(base44, user.id, '✅ Všetky fotky už analyzované, spúšťam reorganizáciu...', {
        status: 'running',
        severity: 'success'
      });
      
      const reorganizaciaResponse = await base44.asServiceRole.functions.invoke('reorganizujDokumenty', {});
      
      await logProgress(base44, user.id, `✅ Reorganizácia dokončená`, {
        status: 'completed',
        severity: 'success',
        reorganizacia: reorganizaciaResponse.data
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

    // Spracuj každú fotku INDIVIDUÁLNE
    for (let i = 0; i < bezAnalyzy.length; i++) {
      const dok = bezAnalyzy[i];
      const current = i + 1;
      const percent = Math.round((current / bezAnalyzy.length) * 100);

      console.log(`\n[${current}/${bezAnalyzy.length}] ${dok.nazov}`);

      try {
        // Check stop flag každých 5 fotiek
        if (i > 0 && i % 5 === 0) {
          const stopFlags = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
            'metadata.should_stop': true,
            'metadata.type': 'analysis_control'
          });
          
          if (stopFlags && stopFlags.length > 0) {
            await logProgress(base44, user.id, `⏸️ Zastavené na ${current}/${bezAnalyzy.length}`, {
              status: 'stopped',
              severity: 'warning',
              processed,
              failed,
              skipped
            });
            return Response.json({
              success: true,
              stopped: true,
              processed,
              failed,
              skipped
            });
          }
        }

        // Popis
        const popis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyzuj tento obrázok modulárneho domu a vytvor krátky slovenský popis (2-3 vety).
          
Súbor: ${dok.nazov}
Výrobca: ${dok.vyrobca || 'neznámy'}
Model: ${dok.model_domu || 'neznámy'}`,
          file_urls: [dok.subor_url]
        });

        // Vizuálna analýza
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
- strecha_typ: "sedlová/plochá/..."
- strecha_farba, strecha_material

KVALITA:
- stav_fasady: "výborný", "dobrý", "potrebuje údržbu"

Kontext z metadát súboru:
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

        // Ulož výsledky
        await base44.asServiceRole.entities.Dokument.update(dok.id, {
          podrobna_analyza_datum: new Date().toISOString(),
          ai_generovany_popis: popis,
          vizualna_analyza: vizAnalyza,
          analyzovaný: true
        });

        processed++;
        
        // Log každú fotku
        await logProgress(base44, user.id, `✓ ${current}/${bezAnalyzy.length} | ${dok.nazov} | ${vizAnalyza.spravny_vyrobca} - ${vizAnalyza.spravny_model}`, {
          status: 'running',
          processed: current,
          total: bezAnalyzy.length,
          percent,
          current_file: dok.nazov,
          success_count: processed
        });

        console.log(`✓ OK | ${vizAnalyza.spravny_vyrobca} - ${vizAnalyza.spravny_model}`);

      } catch (error) {
        const errorMsg = error.message || error.toString();
        
        console.error(`✗ CHYBA: ${errorMsg}`);
        
        if (errorMsg.includes('unsupported image') || errorMsg.includes('ImageURL')) {
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            podrobna_analyza_datum: new Date().toISOString(),
            ai_generovany_popis: 'Problémový obrázok - nepodporovaný formát'
          });
          skipped++;
          
          await logProgress(base44, user.id, `⊘ ${current}/${bezAnalyzy.length} | ${dok.nazov} | Preskočené`, {
            status: 'running',
            processed: current,
            total: bezAnalyzy.length,
            percent,
            current_file: dok.nazov,
            skipped_count: skipped
          });
        } else {
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            podrobna_analyza_datum: new Date().toISOString(),
            ai_generovany_popis: `Chyba analýzy: ${errorMsg}`
          });
          failed++;
          
          await logProgress(base44, user.id, `✗ ${current}/${bezAnalyzy.length} | ${dok.nazov} | Chyba: ${errorMsg}`, {
            status: 'running',
            processed: current,
            total: bezAnalyzy.length,
            percent,
            current_file: dok.nazov,
            error_count: failed,
            severity: 'error'
          });
        }
      }

      // Krátka pauza
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Analýza hotová
    const analysisDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    await logProgress(base44, user.id, `✅ ANALÝZA HOTOVÁ za ${analysisDuration}s | ✓${processed} ⊘${skipped} ✗${failed}`, {
      status: 'analysis_completed',
      severity: 'success',
      processed,
      failed,
      skipped,
      duration: analysisDuration
    });

    console.log(`\n✅ Analýza hotová, spúšťam reorganizáciu...`);

    // Teraz spusti reorganizáciu
    await logProgress(base44, user.id, '🔄 Spúšťam reorganizáciu súborov...', {
      status: 'reorganizing',
      severity: 'info'
    });

    const reorganizaciaResponse = await base44.asServiceRole.functions.invoke('reorganizujDokumenty', {});
    
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    await logProgress(base44, user.id, `🎉 HOTOVO za ${totalDuration}s | Analýza + Reorganizácia dokončené`, {
      status: 'completed',
      severity: 'success',
      analysis: { processed, failed, skipped },
      reorganizacia: reorganizaciaResponse.data,
      total_duration: totalDuration
    });

    console.log('========== KONIEC ==========\n');

    return Response.json({
      success: true,
      message: 'Analýza a reorganizácia dokončené',
      analysis: {
        total: bezAnalyzy.length,
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