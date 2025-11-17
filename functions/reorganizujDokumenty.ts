import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json().catch(() => ({}));

    // Ak je akcia 'stop', nastav flag na zastavenie
    if (action === 'stop') {
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

    // Vytvor inicializačný log
    console.log('🚀 Reorganizácia spustená');
    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message: '🚀 Reorganizácia spustená - načítavam dokumenty...',
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

    // Načítaj všetky analyzované dokumenty
    const dokumenty = await base44.asServiceRole.entities.Dokument.filter({
      typ: 'fotky',
      vizualna_analyza: { $exists: true },
      podrobna_analyza_datum: { $exists: true }
    });

    console.log(`📊 Načítané dokumenty: ${dokumenty.length}`);

    await base44.asServiceRole.entities.GoogleDriveNotification.create({
      notification_type: 'sync_completed',
      message: `📊 Načítaných ${dokumenty.length} dokumentov - začínam spracovanie...`,
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

    if (dokumenty.length === 0) {
      await base44.asServiceRole.entities.GoogleDriveNotification.create({
        notification_type: 'sync_completed',
        message: '✅ Žiadne dokumenty na reorganizáciu',
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

    for (let i = 0; i < dokumenty.length; i++) {
      const dok = dokumenty[i];
      
      console.log(`[${i + 1}/${dokumenty.length}] Spracúvam: ${dok.nazov}`);
      
      try {
        // Kontrola stop flagu každých 10 súborov
        if (i % 10 === 0 && i > 0) {
          const stopCheck = await base44.asServiceRole.entities.GoogleDriveNotification.filter({
            user_id: user.id,
            'metadata.type': 'reorganization_control',
            'metadata.should_stop': true
          });
          
          if (stopCheck.length > 0) {
            await base44.asServiceRole.entities.GoogleDriveNotification.create({
              notification_type: 'sync_failed',
              message: `⏸️ Reorganizácia zastavená používateľom (${presunute} presunute)`,
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
          console.log(`  ⏭️ Preskakujem - chýba výrobca/model`);
          continue;
        }

        const vyrobca = analyza.spravny_vyrobca;
        const model = analyza.spravny_model;
        const typObsahu = analyza.typ_obsahu || 'ine';

        // Urč hlavný materiál pre podpriečinok
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

        // Vytvor názov podpriečinka
        let podpriecinok = '';
        if (typObsahu === 'podorys') {
          podpriecinok = `${model} pôdorys`;
        } else {
          podpriecinok = `${model} ${typObsahu}${hlavnyMaterial ? ' ' + hlavnyMaterial : ''}`;
        }

        const novaCesta = `${vyrobca}/${model}/${podpriecinok}`;

        // Vytvor nový názov súboru
        const originalName = dok.nazov.split('.')[0];
        const extension = dok.nazov.split('.').pop();
        
        const verziaKey = `${novaCesta}/${originalName}`;
        
        let novyNazov = dok.nazov;
        if (verzieMap.has(verziaKey)) {
          const verzia = verzieMap.get(verziaKey) + 1;
          verzieMap.set(verziaKey, verzia);
          novyNazov = `${originalName} Verzia ${verzia}.${extension}`;
        } else {
          const existujuce = await base44.asServiceRole.entities.Dokument.filter({
            cesta_priecinku: novaCesta,
            nazov: { $regex: `^${originalName}` }
          });
          
          if (existujuce.length > 0) {
            let maxVerzia = 0;
            for (const ex of existujuce) {
              const match = ex.nazov.match(/Verzia (\d+)/);
              if (match) {
                maxVerzia = Math.max(maxVerzia, parseInt(match[1]));
              }
            }
            
            if (maxVerzia > 0 || existujuce.length > 0) {
              const verzia = maxVerzia + 1;
              verzieMap.set(verziaKey, verzia);
              novyNazov = `${originalName} Verzia ${verzia}.${extension}`;
            } else {
              verzieMap.set(verziaKey, 1);
            }
          } else {
            verzieMap.set(verziaKey, 1);
          }
        }

        if (dok.cesta_priecinku === novaCesta && dok.nazov === novyNazov) {
          nezmenene++;
          console.log(`  ✓ Nezmenené`);
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
          console.log(`  ✓ Presunuté: ${novaCesta}/${novyNazov}`);
        }

        // LOG KAŽDÝ SÚBOR - REAL TIME
        const percent = Math.round(((i + 1) / dokumenty.length) * 100);
        const logMsg = `📊 ${percent}% | ${i + 1}/${dokumenty.length} | ✓${presunute} ≈${nezmenene} ✗${chyby}`;
        
        console.log(logMsg);
        
        await base44.asServiceRole.entities.GoogleDriveNotification.create({
          notification_type: 'sync_completed',
          message: logMsg,
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
            percent,
            timestamp: new Date().toISOString()
          }
        });

      } catch (error) {
        console.error(`❌ Chyba pri ${dok.nazov}:`, error);
        chyby++;
      }
    }

    // Finálny log
    const finalMsg = `✅ Dokončené! ✓${presunute} ≈${nezmenene} ✗${chyby}`;
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
        total: dokumenty.length,
        timestamp: new Date().toISOString()
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
    console.error('💥 FATAL ERROR:', error);
    
    try {
      const base44 = createClientFromRequest(req);
      const user = await base44.auth.me();
      
      await base44.asServiceRole.entities.GoogleDriveNotification.create({
        notification_type: 'sync_failed',
        message: `❌ Kritická chyba: ${error.message}`,
        severity: 'error',
        read: false,
        user_id: user.id,
        metadata: { type: 'reorganization_log', status: 'error', error: error.message }
      });
    } catch {}
    
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});