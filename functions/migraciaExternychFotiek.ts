import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domId, testMode = true } = await req.json();

    const log = [];
    const results = {
      processed: 0,
      migrated: 0,
      errors: 0,
      skipped: 0
    };

    // Funkcia na kontrolu či je URL externá
    const isExternalUrl = (url) => {
      if (!url) return false;
      return url.startsWith('http://') || url.startsWith('https://');
    };

    // Funkcia na stiahnutie a upload fotky
    const migrateImage = async (url, fieldName) => {
      try {
        log.push(`📥 Sťahujem: ${url}`);
        
        // Stiahnuť fotku
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        
        // Získať typ súboru
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const extension = contentType.split('/')[1] || 'jpg';
        const fileName = `${fieldName}_${Date.now()}.${extension}`;

        // Upload do Base44
        const formData = new FormData();
        formData.append('file', new Blob([arrayBuffer], { type: contentType }), fileName);

        const uploadResult = await base44.integrations.Core.UploadFile({ 
          file: new Blob([arrayBuffer], { type: contentType })
        });

        log.push(`✅ Uploadované: ${uploadResult.file_url}`);
        return uploadResult.file_url;
      } catch (error) {
        log.push(`❌ Chyba pri ${fieldName}: ${error.message}`);
        throw error;
      }
    };

    // Spracovať jeden dom alebo všetky
    let domyNaSpracovanie = [];
    if (domId) {
      const dom = await base44.asServiceRole.entities.Dom.filter({ id: domId });
      domyNaSpracovanie = dom;
    } else {
      // Získať Tiny House domy od Ticabhouse a všetky domy od Domki z Gór
      const ticabTinyHouse = await base44.asServiceRole.entities.Dom.filter({ 
        vyrobca: 'Ticab house'
      });
      const domkiZGor = await base44.asServiceRole.entities.Dom.filter({ 
        vyrobca: 'Domki z Gór'
      });
      
      const tinyHouseDomy = ticabTinyHouse.filter(d => 
        d.nazov?.toLowerCase().includes('tiny house')
      );
      
      domyNaSpracovanie = [...tinyHouseDomy, ...domkiZGor];
    }

    log.push(`🔍 Nájdených domov na spracovanie: ${domyNaSpracovanie.length}`);

    for (const dom of domyNaSpracovanie) {
      log.push(`\n📦 Spracovávam: ${dom.nazov} (${dom.vyrobca})`);
      results.processed++;

      const updates = {};
      let hasMigrations = false;

      // Hlavný obrázok
      if (isExternalUrl(dom.hlavny_obrazok)) {
        try {
          const newUrl = await migrateImage(dom.hlavny_obrazok, 'hlavny_obrazok');
          updates.hlavny_obrazok = newUrl;
          hasMigrations = true;
          results.migrated++;
        } catch (error) {
          results.errors++;
        }
      }

      // Základná konfigurácia
      if (isExternalUrl(dom.zakladna_konfiguracia_obrazok)) {
        try {
          const newUrl = await migrateImage(dom.zakladna_konfiguracia_obrazok, 'zakladna_konfiguracia');
          updates.zakladna_konfiguracia_obrazok = newUrl;
          hasMigrations = true;
          results.migrated++;
        } catch (error) {
          results.errors++;
        }
      }

      // Galéria
      if (dom.galeria && Array.isArray(dom.galeria)) {
        const newGaleria = [];
        let galeriaChanged = false;
        
        for (let i = 0; i < dom.galeria.length; i++) {
          const url = dom.galeria[i];
          if (isExternalUrl(url)) {
            try {
              const newUrl = await migrateImage(url, `galeria_${i}`);
              newGaleria.push(newUrl);
              galeriaChanged = true;
              results.migrated++;
            } catch (error) {
              newGaleria.push(url); // Ponechať pôvodné
              results.errors++;
            }
          } else {
            newGaleria.push(url);
          }
        }
        
        if (galeriaChanged) {
          updates.galeria = newGaleria;
          hasMigrations = true;
        }
      }

      // Pôdorysy
      if (dom.podorysy && Array.isArray(dom.podorysy)) {
        const newPodorysy = [];
        let podorysyChanged = false;
        
        for (let i = 0; i < dom.podorysy.length; i++) {
          const url = dom.podorysy[i];
          if (isExternalUrl(url)) {
            try {
              const newUrl = await migrateImage(url, `podorys_${i}`);
              newPodorysy.push(newUrl);
              podorysyChanged = true;
              results.migrated++;
            } catch (error) {
              newPodorysy.push(url);
              results.errors++;
            }
          } else {
            newPodorysy.push(url);
          }
        }
        
        if (podorysyChanged) {
          updates.podorysy = newPodorysy;
          hasMigrations = true;
        }
      }

      // 2D a 3D pôdorysy
      if (isExternalUrl(dom.podorys_2d)) {
        try {
          const newUrl = await migrateImage(dom.podorys_2d, 'podorys_2d');
          updates.podorys_2d = newUrl;
          hasMigrations = true;
          results.migrated++;
        } catch (error) {
          results.errors++;
        }
      }

      if (isExternalUrl(dom.podorys_3d)) {
        try {
          const newUrl = await migrateImage(dom.podorys_3d, 'podorys_3d');
          updates.podorys_3d = newUrl;
          hasMigrations = true;
          results.migrated++;
        } catch (error) {
          results.errors++;
        }
      }

      // Pomenované galérie
      if (dom.galerie && Array.isArray(dom.galerie)) {
        const newGalerie = [];
        let galerieChanged = false;
        
        for (const galeria of dom.galerie) {
          if (galeria.fotky && Array.isArray(galeria.fotky)) {
            const newFotky = [];
            let fotkyChanged = false;
            
            for (let i = 0; i < galeria.fotky.length; i++) {
              const url = galeria.fotky[i];
              if (isExternalUrl(url)) {
                try {
                  const newUrl = await migrateImage(url, `galerie_${galeria.typ}_${i}`);
                  newFotky.push(newUrl);
                  fotkyChanged = true;
                  results.migrated++;
                } catch (error) {
                  newFotky.push(url);
                  results.errors++;
                }
              } else {
                newFotky.push(url);
              }
            }
            
            newGalerie.push({
              ...galeria,
              fotky: fotkyChanged ? newFotky : galeria.fotky
            });
            
            if (fotkyChanged) galerieChanged = true;
          } else {
            newGalerie.push(galeria);
          }
        }
        
        if (galerieChanged) {
          updates.galerie = newGalerie;
          hasMigrations = true;
        }
      }

      // Aktualizovať dom ak sú nejaké zmeny
      if (hasMigrations && !testMode) {
        await base44.asServiceRole.entities.Dom.update(dom.id, updates);
        log.push(`✅ Dom aktualizovaný: ${dom.nazov}`);
      } else if (hasMigrations && testMode) {
        log.push(`🧪 TEST MODE - Zmeny by boli aplikované (${Object.keys(updates).length} polí)`);
      } else {
        log.push(`⏭️ Žiadne externé fotky na migráciu`);
        results.skipped++;
      }
    }

    return Response.json({
      success: true,
      results,
      log,
      testMode,
      message: testMode 
        ? 'TEST MODE - Žiadne zmeny neboli uložené. Nastavte testMode=false pre skutočnú migráciu.'
        : 'Migrácia dokončená'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});