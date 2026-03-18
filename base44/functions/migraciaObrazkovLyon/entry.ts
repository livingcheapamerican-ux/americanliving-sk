import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const IMAGE_MAPPINGS = [
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/4.jpg",
    itemName: "Šúchaná omietka",
    vyrobca: "Ticab house",
    polozka_id: "fasada_omietka"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-15-17.10.22-400x258.jpg",
    itemName: "Drevo smrek - tmavý",
    vyrobca: "Ticab house",
    polozka_id: "fasada_drevo_tmavy"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-15-17.07.17-400x260.jpg",
    itemName: "Drevo smrek - svetlý",
    vyrobca: "Ticab house",
    polozka_id: "fasada_drevo_svetly"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/natural-wood.jpg",
    itemName: "Thermowood",
    vyrobca: "Ticab house",
    polozka_id: "fasada_thermowood"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.30.14-400x258.jpg",
    itemName: "Panely z kompozitného materiálu",
    vyrobca: "Ticab house",
    polozka_id: "fasada_kompozit"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.21.53-400x254.jpg",
    itemName: "Falcované panely",
    vyrobca: "Ticab house",
    polozka_id: "fasada_falcovane"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.20.03-400x257.jpg",
    itemName: "Smrekovec",
    vyrobca: "Ticab house",
    polozka_id: "fasada_smrekovec"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/pasove.jpg",
    itemName: "Pásové betónové základy",
    vyrobca: "Ticab house",
    polozka_id: "zaklady_pasove"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/vruty.jpg",
    itemName: "Zemné vruty",
    vyrobca: "Ticab house",
    polozka_id: "zaklady_vruty"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/patky.jpg",
    itemName: "Betónové pätky",
    vyrobca: "Ticab house",
    polozka_id: "zaklady_patky"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.10.40-400x255.jpg",
    itemName: "Korugovaný plech",
    vyrobca: "Ticab house",
    polozka_id: "strecha_korugovan"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.07.22-400x240.jpg",
    itemName: "Falcované panely strecha",
    vyrobca: "Ticab house",
    polozka_id: "strecha_falcovane"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.06.43-400x255.jpg",
    itemName: "Odkvapy",
    vyrobca: "Ticab house",
    polozka_id: "strecha_odkvapy"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.03.17-400x268.jpg",
    itemName: "Izolácia stien 200mm",
    vyrobca: "Ticab house",
    polozka_id: "izolacia_stien_200"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.04.05-400x268.jpg",
    itemName: "Izolácia stien 250mm",
    vyrobca: "Ticab house",
    polozka_id: "izolacia_stien_250"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-19.59.05-400x293.jpg",
    itemName: "Izolácia podlahy 200mm",
    vyrobca: "Ticab house",
    polozka_id: "izolacia_podlahy_200"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-19.57.30-400x222.jpg",
    itemName: "Izolácia stropu 200mm",
    vyrobca: "Ticab house",
    polozka_id: "izolacia_stropu_200"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-19.53.01-400x230.jpg",
    itemName: "Tepelné čerpadlo",
    vyrobca: "Ticab house",
    polozka_id: "vykurovanie_cerpadlo"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-19.54.03-400x222.jpg",
    itemName: "Rekuperácia",
    vyrobca: "Ticab house",
    polozka_id: "vykurovanie_rekuperacia"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-19.51.32-400x267.jpg",
    itemName: "Podlahové kúrenie",
    vyrobca: "Ticab house",
    polozka_id: "vykurovanie_podlahove"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-19.49.55-400x267.jpg",
    itemName: "Príprava na krb",
    vyrobca: "Ticab house",
    polozka_id: "vykurovanie_krb"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-19.48.21-400x225.jpg",
    itemName: "Ochrana na kachle",
    vyrobca: "Ticab house",
    polozka_id: "vykurovanie_kachle"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.14.12-400x255.jpg",
    itemName: "Okná biele",
    vyrobca: "Ticab house",
    polozka_id: "okna_biele"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.14.58-400x255.jpg",
    itemName: "Okná antracit",
    vyrobca: "Ticab house",
    polozka_id: "okna_antracit"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.15.53-400x255.jpg",
    itemName: "Okná hnedé",
    vyrobca: "Ticab house",
    polozka_id: "okna_hnede"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.16.43-400x257.jpg",
    itemName: "Kovovo-plastové dvere",
    vyrobca: "Ticab house",
    polozka_id: "dvere_plastove"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.17.39-400x257.jpg",
    itemName: "Kovové dvere",
    vyrobca: "Ticab house",
    polozka_id: "dvere_kovove"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.24.19-400x229.jpg",
    itemName: "Smrek 8cm",
    vyrobca: "Ticab house",
    polozka_id: "obklad_smrek_8cm"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.25.18-400x229.jpg",
    itemName: "Smrek bez uzlov 12cm",
    vyrobca: "Ticab house",
    polozka_id: "obklad_smrek_bez_uzlov"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.26.10-400x227.jpg",
    itemName: "Sadrokarton + tapeta",
    vyrobca: "Ticab house",
    polozka_id: "obklad_sadrokarton"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.27.13-400x225.jpg",
    itemName: "OSB panel",
    vyrobca: "Ticab house",
    polozka_id: "obklad_osb"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.28.05-400x225.jpg",
    itemName: "Laminát",
    vyrobca: "Ticab house",
    polozka_id: "podlaha_laminat"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.31.39-400x223.jpg",
    itemName: "Krídlové dvere",
    vyrobca: "Ticab house",
    polozka_id: "dvere_kridlove"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.32.32-400x225.jpg",
    itemName: "Posuvné dvere",
    vyrobca: "Ticab house",
    polozka_id: "dvere_posuvne"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.34.45-400x284.jpg",
    itemName: "EU štandard elektro",
    vyrobca: "Ticab house",
    polozka_id: "elektro_eu"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.35.29-400x284.jpg",
    itemName: "CZ/SK štandard elektro",
    vyrobca: "Ticab house",
    polozka_id: "elektro_cz"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.36.20-400x284.jpg",
    itemName: "GE štandard elektro",
    vyrobca: "Ticab house",
    polozka_id: "elektro_ge"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.37.29-400x284.jpg",
    itemName: "Bleskozvod",
    vyrobca: "Ticab house",
    polozka_id: "elektro_bleskozvod"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.38.17-400x284.jpg",
    itemName: "Prepäťová ochrana",
    vyrobca: "Ticab house",
    polozka_id: "elektro_prepat"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.40.16-400x268.jpg",
    itemName: "Sprcha + WC Geberit",
    vyrobca: "Ticab house",
    polozka_id: "kupelna_sprcha_standard"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.41.10-400x268.jpg",
    itemName: "Sprcha Radaway",
    vyrobca: "Ticab house",
    polozka_id: "kupelna_sprcha_radaway"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.42.08-400x268.jpg",
    itemName: "Batéria štandard",
    vyrobca: "Ticab house",
    polozka_id: "kupelna_bateria_standard"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.42.43-400x268.jpg",
    itemName: "Batéria Grohe",
    vyrobca: "Ticab house",
    polozka_id: "kupelna_bateria_grohe"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.43.37-400x268.jpg",
    itemName: "Strop drevo",
    vyrobca: "Ticab house",
    polozka_id: "kupelna_strop_drevo"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.44.28-400x267.jpg",
    itemName: "Strop sadrokarton",
    vyrobca: "Ticab house",
    polozka_id: "kupelna_strop_sadrokarton"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.45.20-400x268.jpg",
    itemName: "Vaňa",
    vyrobca: "Ticab house",
    polozka_id: "kupelna_vana"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.46.04-400x268.jpg",
    itemName: "Skrinka",
    vyrobca: "Ticab house",
    polozka_id: "kupelna_skrinka"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.48.22-400x223.jpg",
    itemName: "Montáž domu",
    vyrobca: "Ticab house",
    polozka_id: "realizacia_montaz"
  },
  {
    oldUrl: "https://www.americanliving.sk/wp-content/uploads/2024/11/Kepernyofoto-2024-11-23-20.49.09-400x223.jpg",
    itemName: "Doprava modulov",
    vyrobca: "Ticab house",
    polozka_id: "realizacia_doprava"
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.super_admin) {
      return Response.json({ error: 'Unauthorized - super admin only' }, { status: 401 });
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    for (const mapping of IMAGE_MAPPINGS) {
      try {
        // Skontroluj či už existuje záznam pre túto položku
        const existingRecords = await base44.asServiceRole.entities.KonfiguratorText.filter({
          vyrobca: mapping.vyrobca,
          polozka_id: mapping.polozka_id
        });

        // Stiahni obrázok z pôvodnej URL
        const imageResponse = await fetch(mapping.oldUrl);
        if (!imageResponse.ok) {
          results.failed.push({ 
            polozka_id: mapping.polozka_id, 
            error: `Failed to fetch image: ${imageResponse.status}` 
          });
          continue;
        }

        const imageBlob = await imageResponse.blob();
        
        // Vytvor FormData pre upload
        const formData = new FormData();
        formData.append('file', imageBlob, `${mapping.polozka_id}.jpg`);

        // Nahraj obrázok do Base44
        const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
          file: imageBlob
        });

        if (!uploadResult || !uploadResult.file_url) {
          results.failed.push({ 
            polozka_id: mapping.polozka_id, 
            error: 'Upload failed - no file_url returned' 
          });
          continue;
        }

        // Ak záznam existuje, aktualizuj ho, inak vytvor nový
        if (existingRecords && existingRecords.length > 0) {
          await base44.asServiceRole.entities.KonfiguratorText.update(
            existingRecords[0].id,
            { image_url: uploadResult.file_url }
          );
          results.success.push({
            polozka_id: mapping.polozka_id,
            action: 'updated',
            new_url: uploadResult.file_url
          });
        } else {
          // Vytvor nový záznam
          await base44.asServiceRole.entities.KonfiguratorText.create({
            vyrobca: mapping.vyrobca,
            polozka_id: mapping.polozka_id,
            nazov: mapping.itemName,
            image_url: uploadResult.file_url
          });
          results.success.push({
            polozka_id: mapping.polozka_id,
            action: 'created',
            new_url: uploadResult.file_url
          });
        }

      } catch (error) {
        results.failed.push({
          polozka_id: mapping.polozka_id,
          error: error.message
        });
      }
    }

    return Response.json({
      message: 'Migration completed',
      summary: {
        total: IMAGE_MAPPINGS.length,
        success: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      details: results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});