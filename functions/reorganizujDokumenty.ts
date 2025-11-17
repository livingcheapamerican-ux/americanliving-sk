import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  console.log('🔵 FUNCTION CALLED - reorganizujDokumenty');
  
  try {
    const base44 = createClientFromRequest(req);
    console.log('🔵 Base44 client created');
    
    const user = await base44.auth.me();
    console.log('🔵 User authenticated:', user?.email);

    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      console.log('❌ Unauthorized user');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json().catch(() => ({}));
    console.log('🔵 Action:', action);

    if (action === 'stop') {
      console.log('⏸️ Stop action received');
      await base44.asServiceRole.entities.GoogleDriveNotification.create({
        notification_type: 'sync_completed',
        message: '⏸️ Zastavovací príkaz prijatý',
        severity: 'info',
        read: false,
        user_id: user.id,
        metadata: { type: 'reorganization_control', should_stop: true }
      });
      return Response.json({ success: true, message: 'Reorganizácia bude zastavená' });
    }

    // CREATE INITIAL LOG - IMMEDIATELY
    console.log('🔵 Creating initial log...');
    try {
      await base44.asServiceRole.entities.GoogleDriveNotification.create({
        notification_type: 'sync_completed',
        message: '🚀 ŠTART - Funkcia sa spustila, načítavam dokumenty...',
        severity: 'info',
        read: false,
        user_id: user.id,
        metadata: { 
          type: 'reorganization_log',
          status: 'running',
          processed: 0,
          total: 0,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ Initial log created');
    } catch (logError) {
      console.error('❌ Failed to create initial log:', logError);
    }

    console.log('🔵 Fetching documents...');
    let dokumenty;
    try {
      dokumenty = await base44.asServiceRole.entities.Dokument.filter({
        typ: 'fotky',
        vizualna_analyza: { $exists: true },
        podrobna_analyza_datum: { $exists: true }
      });
      console.log(`✅ Fetched ${dokumenty.length} documents`);
    } catch (fetchError) {
      console.error('❌ Failed to fetch documents:', fetchError);
      throw fetchError;
    }

    // LOG AFTER FETCH
    try {
      await base44.asServiceRole.entities.GoogleDriveNotification.create({
        notification_type: 'sync_completed',
        message: `✅ Načítaných ${dokumenty.length} dokumentov - pripravujem spracovanie`,
        severity: 'info',
        read: false,
        user_id: user.id,
        metadata: { 
          type: 'reorganization_log',
          status: 'running',
          total: dokumenty.length,
          processed: 0,
          presunute: 0,
          nezmenene: 0,
          chyby: 0,
          percent: 0
        }
      });
      console.log('✅ Post-fetch log created');
    } catch (logError) {
      console.error('❌ Failed to create post-fetch log:', logError);
    }

    if (dokumenty.length === 0) {
      console.log('⚠️ No documents to process');
      await base44.asServiceRole.entities.GoogleDriveNotification.create({
        notification_type: 'sync_completed',
        message: '⚠️ Žiadne dokumenty na reorganizáciu',
        severity: 'success',
        read: false,
        user_id: user.id,
        metadata: { type: 'reorganization_log', status: 'completed' }
      });
      
      return Response.json({
        success: true,
        message: 'Žiadne dokumenty na reorganizáciu',
        presunute: 0,
        nezmenene: 0,
        chyby: 0
      });
    }

    let presunute = 0;
    let nezmenene = 0;
    let chyby = 0;
    const verzieMap = new Map();

    console.log(`🔵 Starting loop for ${dokumenty.length} documents`);

    for (let i = 0; i < dokumenty.length; i++) {
      const dok = dokumenty[i];
      
      try {
        const percent = Math.round(((i + 1) / dokumenty.length) * 100);
        const shortName = dok.nazov.substring(0, 30);
        
        console.log(`[${i + 1}/${dokumenty.length}] Processing: ${shortName}`);
        
        // LOG EVERY FILE
        try {
          await base44.asServiceRole.entities.GoogleDriveNotification.create({
            notification_type: 'sync_completed',
            message: `⏳ [${i + 1}/${dokumenty.length}] ${shortName}... (${percent}%)`,
            severity: 'info',
            read: false,
            user_id: user.id,
            metadata: { 
              type: 'reorganization_log',
              status: 'running',
              processed: i,
              total: dokumenty.length,
              presunute,
              nezmenene,
              chyby,
              percent: Math.round((i / dokumenty.length) * 100)
            }
          });
        } catch (logErr) {
          console.error('Failed to create file log:', logErr);
        }

        // Check stop flag every 10 files
        if (i % 10 === 0 && i > 0) {
          const stopCheck = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
            user_id: user.id,
            'metadata.type': 'reorganization_control',
            'metadata.should_stop': true
          });
          
          if (stopCheck.length > 0) {
            console.log('⏸️ Stop flag detected');
            await base44.asServiceRole.entities.GoogleDriveNotification.create({
              notification_type: 'sync_failed',
              message: `⏸️ Zastavené na ${i}/${dokumenty.length}`,
              severity: 'warning',
              read: false,
              user_id: user.id,
              metadata: { type: 'reorganization_log', status: 'stopped', presunute, nezmenene, chyby }
            });
            
            return Response.json({
              success: true,
              message: 'Reorganizácia zastavená',
              presunute,
              nezmenene,
              chyby,
              stopped: true
            });
          }
        }

        const analyza = dok.vizualna_analyza;

        if (!analyza.spravny_vyrobca || !analyza.spravny_model) {
          nezmenene++;
          continue;
        }

        const vyrobca = analyza.spravny_vyrobca;
        const model = analyza.spravny_model;
        const typObsahu = analyza.typ_obsahu || 'ine';

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
        } else if (typObsahu === 'podorys') {
          hlavnyMaterial = '';
        } else {
          hlavnyMaterial = 'detaily';
        }

        let podpriecinok = '';
        if (typObsahu === 'podorys') {
          podpriecinok = `${model} pôdorys`;
        } else {
          podpriecinok = `${model} ${typObsahu}${hlavnyMaterial ? ' ' + hlavnyMaterial : ''}`;
        }

        const novaCesta = `${vyrobca}/${model}/${podpriecinok}`;
        const originalName = dok.nazov.split('.')[0];
        const extension = dok.nazov.split('.').pop();
        const verziaKey = `${novaCesta}/${originalName}`;
        
        let novyNazov = dok.nazov;
        
        if (verzieMap.has(verziaKey)) {
          const verzia = verzieMap.get(verziaKey) + 1;
          verzieMap.set(verziaKey, verzia);
          novyNazov = `${originalName} Verzia ${verzia}.${extension}`;
        } else {
          verzieMap.set(verziaKey, 1);
        }

        if (dok.cesta_priecinku === novaCesta && dok.nazov === novyNazov) {
          nezmenene++;
        } else {
          await base44.asServiceRole.entities.Dokument.update(dok.id, {
            cesta_priecinku: novaCesta,
            nazov: novyNazov,
            vyrobca: vyrobca,
            model_domu: model,
            podpriecinok: podpriecinok,
            reorganizovany: true,
            reorganizovany_datum: new Date().toISOString()
          });
          presunute++;
        }

        // PROGRESS LOG
        const finishLogMsg = `✅ ${percent}% | ${i + 1}/${dokumenty.length} | ✓${presunute} ≈${nezmenene} ✗${chyby}`;
        
        try {
          await base44.asServiceRole.entities.GoogleDriveNotification.create({
            notification_type: 'sync_completed',
            message: finishLogMsg,
            severity: 'info',
            read: false,
            user_id: user.id,
            metadata: { 
              type: 'reorganization_log',
              status: 'running',
              processed: i + 1,
              total: dokumenty.length,
              presunute,
              nezmenene,
              chyby,
              percent
            }
          });
        } catch (logErr) {
          console.error('Failed to create progress log:', logErr);
        }

      } catch (error) {
        console.error(`❌ Error processing file ${i}:`, error);
        chyby++;
        
        try {
          await base44.asServiceRole.entities.GoogleDriveNotification.create({
            notification_type: 'sync_failed',
            message: `❌ Chyba: ${error.message}`,
            severity: 'error',
            read: false,
            user_id: user.id,
            metadata: { 
              type: 'reorganization_log',
              status: 'running',
              error: error.message
            }
          });
        } catch {}
      }
    }

    const finalMsg = `🎉 DOKONČENÉ! ✓${presunute} ≈${nezmenene} ✗${chyby}`;
    console.log(finalMsg);
    
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message: finalMsg,
      severity: 'success',
      read: false,
      user_id: user.id,
      metadata: { 
        type: 'reorganization_log',
        status: 'completed',
        presunute,
        nezmenene,
        chyby,
        total: dokumenty.length
      }
    });

    return Response.json({
      success: true,
      message: 'Reorganizácia dokončená',
      presunute,
      nezmenene,
      chyby,
      total: dokumenty.length
    });

  } catch (error) {
    console.error('💥 FATAL:', error);
    console.error('Stack:', error.stack);
    
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me();
      
      await base44.asServiceRole.entities.GoogleDriveNotification.create({
        notification_type: 'sync_failed',
        message: `💥 FATAL: ${error.message}`,
        severity: 'error',
        read: false,
        user_id: user.id,
        metadata: { type: 'reorganization_log', status: 'error', error: error.message }
      });
    } catch (logError) {
      console.error('Failed to log fatal error:', logError);
    }
    
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});