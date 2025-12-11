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

        // Extrahovanie údajov z HTML pomocou AI - KOMPLETNÁ EXTRAKCIA
        const aiExtract = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analyzuj túto HTML stránku detailu domu a extrahuj VŠETKY údaje z tabuľky "Základné parametre" a technickej špecifikácie.

HTML obsah:
${html.substring(0, 50000)}

EXTRAHUJ TIETO ÚDAJE Z TABUĽKY "Základné parametre":
1. Výrobca (presný text)
2. Typ domu (Modulárny dom / Montovaný dom / Mobilný dom)
3. Počet modulov (len číslo, ak je uvedené)
4. Počet izieb (len číslo)
5. Zastavaná plocha v m² (len číslo)
6. Úžitková plocha / Inštalačný priestor v m² (len číslo, ak je uvedené)
7. Plocha terasy v m² (ak je uvedené)
8. Energetická trieda (A0 alebo nie)
9. Vonkajšie rozmery (šírka x dľžka x výška v metroch)
10. Výška stropu
11. Celoročný (áno/nie)
12. Energetický certifikát dostupný (áno/nie)

EXTRAHUJ AJ Z POPISU A ŠPECIFIKÁCIE:
- Všetky technické detaily (izolácia, materiály, vybavenie)
- Kompletný zoznam toho čo je v základnej cene
- Kompletný zoznam doplnkov za príplatok
- Cenu základnej konfigurácie

PRAVIDLÁ:
- Ak údaj nie je v HTML = vráť null
- Použi len PRESNÉ hodnoty z webu
- NEšpekuluj ani nedopĺňaj
- Počet izieb = len z tabuľky, NIE z pôdorysu
- Terasa = len ak je explicitne uvedená v parametroch

Vráť JSON:
{
  "vyrobca": string | null,
  "typ_domu": "modularny" | "montovany" | "mobilny" | null,
  "pocet_modulov": number | null,
  "pocet_izieb": number | null,
  "zastavana_plocha": number | null,
  "uzitkova_plocha": number | null,
  "terasa_plocha": number | null,
  "energeticka_trieda": "A0" | null,
  "celorocny": boolean | null,
  "energeticky_certifikat": boolean | null,
  "rozmery": {"sirka": number, "dlzka": number, "vyska": number} | null,
  "vyska_stropu": string | null,
  "zakladna_konfiguracia_obsahuje": [string],
  "doplnky_za_priplatok": [string],
  "technicke_specifikacie": {
    "izolacia_podlaha": string | null,
    "izolacia_steny": string | null,
    "izolacia_strop": string | null,
    "okna": string | null,
    "dvere": string | null,
    "fasada": string | null,
    "strecha": string | null
  },
  "poznamky": string
}`,
          response_json_schema: {
            type: "object",
            properties: {
              vyrobca: { type: ["string", "null"] },
              typ_domu: { type: ["string", "null"] },
              pocet_modulov: { type: ["number", "null"] },
              pocet_izieb: { type: ["number", "null"] },
              zastavana_plocha: { type: ["number", "null"] },
              uzitkova_plocha: { type: ["number", "null"] },
              terasa_plocha: { type: ["number", "null"] },
              energeticka_trieda: { type: ["string", "null"] },
              celorocny: { type: ["boolean", "null"] },
              energeticky_certifikat: { type: ["boolean", "null"] },
              rozmery: {
                type: ["object", "null"],
                properties: {
                  sirka: { type: "number" },
                  dlzka: { type: "number" },
                  vyska: { type: "number" }
                }
              },
              vyska_stropu: { type: ["string", "null"] },
              zakladna_konfiguracia_obsahuje: { type: "array", items: { type: "string" } },
              doplnky_za_priplatok: { type: "array", items: { type: "string" } },
              technicke_specifikacie: {
                type: "object",
                properties: {
                  izolacia_podlaha: { type: ["string", "null"] },
                  izolacia_steny: { type: ["string", "null"] },
                  izolacia_strop: { type: ["string", "null"] },
                  okna: { type: ["string", "null"] },
                  dvere: { type: ["string", "null"] },
                  fasada: { type: ["string", "null"] },
                  strecha: { type: ["string", "null"] }
                }
              },
              poznamky: { type: "string" }
            }
          }
        });

        log.push(`  🤖 AI extrakcia dokončená`);

        // Priprav aktualizačný objekt pre databázu
        const updates = {};
        const rozdiely = [];
        
        // Základné parametre
        if (aiExtract.pocet_izieb !== null && aiExtract.pocet_izieb !== dom.pocet_izieb) {
          rozdiely.push(`Počet izieb: DB=${dom.pocet_izieb}, WEB=${aiExtract.pocet_izieb}`);
          updates.pocet_izieb = aiExtract.pocet_izieb;
        }

        if (aiExtract.zastavana_plocha !== null && Math.abs(aiExtract.zastavana_plocha - (dom.zastavana_plocha || 0)) > 1) {
          rozdiely.push(`Zastavaná plocha: DB=${dom.zastavana_plocha}, WEB=${aiExtract.zastavana_plocha}`);
          updates.zastavana_plocha = aiExtract.zastavana_plocha;
        }

        if (aiExtract.uzitkova_plocha !== null && Math.abs(aiExtract.uzitkova_plocha - (dom.uzitkova_plocha || 0)) > 1) {
          rozdiely.push(`Úžitková plocha: DB=${dom.uzitkova_plocha}, WEB=${aiExtract.uzitkova_plocha}`);
          updates.uzitkova_plocha = aiExtract.uzitkova_plocha;
        }

        if (aiExtract.pocet_modulov !== null && aiExtract.pocet_modulov !== dom.pocet_modulov) {
          rozdiely.push(`Počet modulov: DB=${dom.pocet_modulov}, WEB=${aiExtract.pocet_modulov}`);
          updates.pocet_modulov = aiExtract.pocet_modulov;
        }

        if (aiExtract.terasa_plocha !== null && aiExtract.terasa_plocha !== dom.terasa_plocha) {
          rozdiely.push(`Terasa: DB=${dom.terasa_plocha}, WEB=${aiExtract.terasa_plocha}`);
          updates.terasa_plocha = aiExtract.terasa_plocha;
        }

        if (aiExtract.celorocny !== null && aiExtract.celorocny !== dom.celorocny) {
          rozdiely.push(`Celoročný: DB=${dom.celorocny}, WEB=${aiExtract.celorocny}`);
          updates.celorocny = aiExtract.celorocny;
        }

        if (aiExtract.energeticky_certifikat !== null && aiExtract.energeticky_certifikat !== dom.energeticky_certifikat) {
          rozdiely.push(`Energetický certifikát: DB=${dom.energeticky_certifikat}, WEB=${aiExtract.energeticky_certifikat}`);
          updates.energeticky_certifikat = aiExtract.energeticky_certifikat;
        }

        if (aiExtract.rozmery !== null) {
          updates.rozmery = aiExtract.rozmery;
        }

        if (aiExtract.vyska_stropu !== null) {
          updates.vyska_stropu = aiExtract.vyska_stropu;
        }

        // Uložiť kompletné extrahované dáta do nového poľa pre chatbota
        const strukturovaneData = {
          zakladne_parametre: {
            vyrobca: aiExtract.vyrobca,
            typ_domu: aiExtract.typ_domu,
            pocet_modulov: aiExtract.pocet_modulov,
            pocet_izieb: aiExtract.pocet_izieb,
            zastavana_plocha: aiExtract.zastavana_plocha,
            uzitkova_plocha: aiExtract.uzitkova_plocha,
            terasa_plocha: aiExtract.terasa_plocha,
            energeticka_trieda: aiExtract.energeticka_trieda,
            celorocny: aiExtract.celorocny,
            energeticky_certifikat: aiExtract.energeticky_certifikat,
            rozmery: aiExtract.rozmery,
            vyska_stropu: aiExtract.vyska_stropu
          },
          vybavenie: {
            v_zakladnej_konfiguraci: aiExtract.zakladna_konfiguracia_obsahuje || [],
            doplnky_za_priplatok: aiExtract.doplnky_za_priplatok || []
          },
          technicke_specifikacie: aiExtract.technicke_specifikacie || {},
          ai_poznamky: aiExtract.poznamky,
          posledna_aktualizacia: new Date().toISOString()
        };

        // Vždy aktualizuj štruktúrované dáta
        updates.ai_strukturovane_data = strukturovaneData;

        if (rozdiely.length > 0 || Object.keys(updates).length > 0) {
          if (rozdiely.length > 0) {
            log.push(`  ⚠️ NÁJDENÉ ROZDIELY:`);
            rozdiely.forEach(r => log.push(`     - ${r}`));
          }
          log.push(`  📝 Ukladám ${Object.keys(updates).length} aktualizácií`);
          if (aiExtract.poznamky) {
            log.push(`  💡 Poznámka: ${aiExtract.poznamky}`);
          }
          
          problemy.push({
            dom: dom.nazov,
            url: detailUrl,
            rozdiely: rozdiely.length > 0 ? rozdiely : ['Aktualizácia štruktúrovaných dát']
          });

          opravy.push({
            dom_id: dom.id,
            nazov: dom.nazov,
            updates: updates
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
          await base44.asServiceRole.entities.Dom.update(oprava.dom_id, oprava.updates);
          log.push(`  ✅ ${oprava.nazov}: Aktualizovaných ${Object.keys(oprava.updates).length} polí`);
        } catch (error) {
          errors++;
          log.push(`  ❌ Chyba pri oprave ${oprava.nazov}: ${error.message}`);
        }
      }
    } else if (opravy.length > 0) {
      log.push('\n🧪 TEST MODE - Opravy sa neukladajú');
      log.push('\nNÁVRH OPRÁV:');
      opravy.forEach(o => {
        log.push(`\n  📦 ${o.nazov}:`);
        Object.keys(o.updates).forEach(key => {
          if (key === 'ai_strukturovane_data') {
            log.push(`    - ${key}: [kompletné štruktúrované dáta]`);
          } else {
            log.push(`    - ${key}: ${JSON.stringify(o.updates[key])}`);
          }
        });
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