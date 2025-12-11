import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.super_admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testMode = true } = await req.json();

    const log = [];
    const problemy = [];
    const opravy = [];

    log.push('🔍 HLBKOVÁ KONTROLA ÚDAJOV O DOMOCH\n');

    // Načítať všetky domy Ticabhouse
    const domy = await base44.asServiceRole.entities.Dom.filter({ 
      vyrobca: 'Ticab house' 
    });

    log.push(`📊 Našiel som ${domy.length} domov Ticabhouse\n`);

    for (const dom of domy) {
      log.push(`\n🏠 Kontrolujem: ${dom.nazov}`);

      // Vytvor URL detail stránky
      const detailUrl = `https://americanliving.sk/p/${dom.slug || ''}`;
      
      try {
        // Stiahni HTML stránku
        const htmlResponse = await fetch(detailUrl);
        if (!htmlResponse.ok) {
          log.push(`  ⚠️ URL nedostupná: ${detailUrl}`);
          continue;
        }

        const html = await htmlResponse.text();

        // Extrahovanie údajov z HTML pomocou AI
        const aiExtract = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyzuj túto HTML stránku detailu domu a extrahuj PRESNÉ údaje z tabuľky "Základné parametre".

HTML obsah:
${html.substring(0, 50000)}

Extrahuj tieto údaje (použi len to čo je EXPLICITNE uvedené v tabuľke, NEŠPEKULUJ):
- Počet izieb (len číslo, napr. 3, 4, 5)
- Zastavaná plocha v m² (len číslo)
- Úžitková plocha v m² (len číslo)
- Počet modulov (ak je uvedené, len číslo)
- Plocha terasy v m² (ak je uvedené, len číslo)
- Vonkajšie rozmery (ak sú uvedené)
- Výška stropu (ak je uvedená)

KRITICKY DÔLEŽITÉ:
- Ak v HTML nie je údaj uvedený = vráť null
- Počet izieb = hľadaj len v tabuľke "Základné parametre" alebo v špecifikácii
- NEpočítaj izoby z dispozície/pôdorysu
- Skontroluj či je v popisoch zmienka o počte izieb

Vráť JSON s týmito kľúčmi (null ak údaj nie je):
{
  "pocet_izieb": number | null,
  "zastavana_plocha": number | null,
  "uzitkova_plocha": number | null,
  "pocet_modulov": number | null,
  "terasa_plocha": number | null,
  "rozmery": {"sirka": number, "dlzka": number, "vyska": number} | null,
  "vyska_stropu": string | null,
  "poznamky": "Akékoľvek dôležité poznámky o údajoch"
}`,
          response_json_schema: {
            type: "object",
            properties: {
              pocet_izieb: { type: ["number", "null"] },
              zastavana_plocha: { type: ["number", "null"] },
              uzitkova_plocha: { type: ["number", "null"] },
              pocet_modulov: { type: ["number", "null"] },
              terasa_plocha: { type: ["number", "null"] },
              rozmery: {
                type: ["object", "null"],
                properties: {
                  sirka: { type: "number" },
                  dlzka: { type: "number" },
                  vyska: { type: "number" }
                }
              },
              vyska_stropu: { type: ["string", "null"] },
              poznamky: { type: "string" }
            }
          }
        });

        log.push(`  🤖 AI extrakcia dokončená`);

        // Porovnaj s databázou
        const rozdiely = [];
        
        if (aiExtract.pocet_izieb !== null && aiExtract.pocet_izieb !== dom.pocet_izieb) {
          rozdiely.push(`Počet izieb: DB=${dom.pocet_izieb}, WEB=${aiExtract.pocet_izieb}`);
          opravy.push({
            dom_id: dom.id,
            nazov: dom.nazov,
            pole: 'pocet_izieb',
            stara_hodnota: dom.pocet_izieb,
            nova_hodnota: aiExtract.pocet_izieb
          });
        }

        if (aiExtract.zastavana_plocha !== null && Math.abs(aiExtract.zastavana_plocha - (dom.zastavana_plocha || 0)) > 1) {
          rozdiely.push(`Zastavaná plocha: DB=${dom.zastavana_plocha}, WEB=${aiExtract.zastavana_plocha}`);
          opravy.push({
            dom_id: dom.id,
            nazov: dom.nazov,
            pole: 'zastavana_plocha',
            stara_hodnota: dom.zastavana_plocha,
            nova_hodnota: aiExtract.zastavana_plocha
          });
        }

        if (aiExtract.uzitkova_plocha !== null && Math.abs(aiExtract.uzitkova_plocha - (dom.uzitkova_plocha || 0)) > 1) {
          rozdiely.push(`Úžitková plocha: DB=${dom.uzitkova_plocha}, WEB=${aiExtract.uzitkova_plocha}`);
          opravy.push({
            dom_id: dom.id,
            nazov: dom.nazov,
            pole: 'uzitkova_plocha',
            stara_hodnota: dom.uzitkova_plocha,
            nova_hodnota: aiExtract.uzitkova_plocha
          });
        }

        if (aiExtract.pocet_modulov !== null && aiExtract.pocet_modulov !== dom.pocet_modulov) {
          rozdiely.push(`Počet modulov: DB=${dom.pocet_modulov}, WEB=${aiExtract.pocet_modulov}`);
          opravy.push({
            dom_id: dom.id,
            nazov: dom.nazov,
            pole: 'pocet_modulov',
            stara_hodnota: dom.pocet_modulov,
            nova_hodnota: aiExtract.pocet_modulov
          });
        }

        if (aiExtract.terasa_plocha !== null && aiExtract.terasa_plocha !== dom.terasa_plocha) {
          rozdiely.push(`Terasa: DB=${dom.terasa_plocha}, WEB=${aiExtract.terasa_plocha}`);
          opravy.push({
            dom_id: dom.id,
            nazov: dom.nazov,
            pole: 'terasa_plocha',
            stara_hodnota: dom.terasa_plocha,
            nova_hodnota: aiExtract.terasa_plocha
          });
        }

        if (rozdiely.length > 0) {
          log.push(`  ⚠️ NÁJDENÉ ROZDIELY:`);
          rozdiely.forEach(r => log.push(`     - ${r}`));
          if (aiExtract.poznamky) {
            log.push(`  📝 Poznámka: ${aiExtract.poznamky}`);
          }
          problemy.push({
            dom: dom.nazov,
            url: detailUrl,
            rozdiely: rozdiely
          });
        } else {
          log.push(`  ✅ Údaje v poriadku`);
        }

      } catch (error) {
        log.push(`  ❌ Chyba: ${error.message}`);
      }

      // Delay medzi requestmi
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    log.push('\n' + '='.repeat(60));
    log.push(`\n📊 SÚHRN KONTROLY:`);
    log.push(`✅ Skontrolované: ${domy.length} domov`);
    log.push(`⚠️ Problémy nájdené: ${problemy.length} domov`);
    log.push(`🔧 Opravy potrebné: ${opravy.length} polí`);

    // Aplikuj opravy ak nie je test mode
    if (!testMode && opravy.length > 0) {
      log.push('\n🔧 APLIKUJEM OPRAVY...\n');
      
      for (const oprava of opravy) {
        try {
          await base44.asServiceRole.entities.Dom.update(oprava.dom_id, {
            [oprava.pole]: oprava.nova_hodnota
          });
          log.push(`  ✅ ${oprava.nazov}: ${oprava.pole} = ${oprava.nova_hodnota}`);
        } catch (error) {
          log.push(`  ❌ Chyba pri oprave ${oprava.nazov}: ${error.message}`);
        }
      }
    } else if (opravy.length > 0) {
      log.push('\n🧪 TEST MODE - Opravy sa neukladajú');
      log.push('\nNÁVRH OPRÁV:');
      opravy.forEach(o => {
        log.push(`  ${o.nazov} - ${o.pole}: ${o.stara_hodnota} → ${o.nova_hodnota}`);
      });
    }

    return Response.json({
      success: true,
      testMode,
      summary: {
        skontrolovane: domy.length,
        problemy: problemy.length,
        opravy: opravy.length
      },
      problemy,
      opravy,
      log
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});