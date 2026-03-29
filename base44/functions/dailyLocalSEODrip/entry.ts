import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Find pending LokaciaSEO records - ones without content yet
    const allRecords = await base44.asServiceRole.entities.LokaciaSEO.list();
    const pendingRecords = allRecords
      .filter(record => 
        // Preskočiť záznamy kde už existuje obsah (content ALEBO unikany_text_o_lokalite)
        (!record.content || record.content.length < 100) &&
        (!record.unikany_text_o_lokalite || record.unikany_text_o_lokalite.length < 100)
      )
      .slice(0, 5); // Process up to 5 per run (0 credits each)

    if (pendingRecords.length === 0) {
      console.log('✓ No pending LokaciaSEO records found');
      return Response.json({
        success: true,
        processed: 0,
        message: 'No pending records to process',
        credits_used: 0
      });
    }

    console.log(`📝 Processing ${pendingRecords.length} LokaciaSEO records (0-credit mode)...`);

    const results = [];

    for (const record of pendingRecords) {
      const mesto = record.nazov_mesta || record.slug || 'vašom meste';
      const okres = record.okres || record.nazov_mesta || 'okolí';

      const intro = [
        `<h1>Montované domy na kľúč ${mesto} a okolie</h1><p>Snívate o vlastnom rodinnom dome v meste ${mesto}? Zabudnite na nekonečné vybavovačky a stresujúce jednania s úradmi.</p>`,
        `<h1>Nové bývanie v lokalite ${mesto}: Drevodomy s dotáciou</h1><p>Plánujete stavbu domu v okrese ${okres}? Prinášame revolúciu na realitný trh priamo k vám. Bývajte vo vlastnom rýchlo a bez starostí.</p>`,
        `<h1>Výstavba rodinných domov ${mesto}</h1><p>Hľadáte spoľahlivého partnera pre stavbu domu v meste ${mesto}? Sme tu pre vás od prvého nápadu až po odovzdanie kľúčov.</p>`
      ];

      const body = [
        `<p>S naším exkluzívnym dotačným programom GRANTAMERICANA získate nielen finančný grant pri podpise zmluvy, ale prevezmeme na seba úplne všetko. Náš 8-krokový proces pokrýva predaj vašej starej nehnuteľnosti, výber ideálneho pozemku, vybavenie najvýhodnejšej hypotéky, kompletnú projektovú dokumentáciu, stavebné povolenie, samotnú výstavbu, napojenie na siete a bezproblémovú kolaudáciu.</p>`,
        `<p>Už nemusíte obiehať úrady a banky. Všetko vybavíte pod jednou strechou. Pomôžeme vám predať starý byt, nájdeme pozemok v lokalite ${mesto}, zariadime financovanie a dom vám postavíme na kľúč vrátane inžinierskych sietí a kolaudácie. Navyše, vďaka programu GRANTAMERICANA máte možnosť získať preplatenie nákladov na energie a grant priamo pri podpise.</p>`,
        `<p>Zabezpečujeme kompletný full-servis. Vyberieme pozemok v okrese ${okres}, prefinancujeme stavbu s najlepšou hypotékou na trhu, vyriešime stavebné povolenie a postavíme vám moderný drevodom s energetickým certifikátom A0. Všetko končí úspešnou kolaudáciou. Využite náš dotačný program a ušetrite tisíce eur hneď na začiatku.</p>`
      ];

      const outro = [
        `<p><strong>Neváhajte a pozrite si náš katalóg domov. Bývanie v meste ${mesto} nebolo nikdy dostupnejšie. Kontaktujte nás pre nezáväznú konzultáciu.</strong></p>`,
        `<p><strong>Začnite svoj projekt ešte dnes. Prezrite si naše modely a zistite, akú výšku dotácie môžete získať pre vašu stavbu v lokalite ${mesto}.</strong></p>`,
        `<p><strong>Vyberte si svoj vysnívaný dom z nášho katalógu a o všetko ostatné v okrese ${okres} sa postaráme my. Zanechajte nám kontakt a my sa vám ozveme.</strong></p>`
      ];

      const seo_html = intro[Math.floor(Math.random() * intro.length)]
        + body[Math.floor(Math.random() * body.length)]
        + outro[Math.floor(Math.random() * outro.length)];

      const metaTitle = `Montované domy ${mesto} | Výstavba na kľúč - American Living`;
      const metaDescription = `Objavte výhody stavby montovaného domu v ${mesto}. Rýchla výstavba, kvalita a dostupnosť. American Living - oficiálny distribútor.`;

      // ── Interné linky (0 credits – RegEx) ───────────────────────────────
      const allDomy = await base44.asServiceRole.entities.Dom.list();
      const domy = allDomy.filter(d => d.verejny !== false && d.nazov && d.id);
      domy.sort((a, b) => b.nazov.length - a.nazov.length);

      let linkedHtml = seo_html;
      for (const dom of domy) {
        const nazov = dom.nazov.trim();
        if (!nazov) continue;
        const escaped = nazov.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const placeholders = [];
        const withPlaceholders = linkedHtml.replace(/<a[\s\S]*?<\/a>/gi, (m) => {
          const i = placeholders.length;
          placeholders.push(m);
          return `__LP_${i}__`;
        });
        const regex = new RegExp(`(${escaped})`);
        if (regex.test(withPlaceholders)) {
          const replaced = withPlaceholders.replace(regex,
            `<a href="/DetailDomu?id=${dom.id}" class="internal-link" title="${nazov} - American Living">$1</a>`
          );
          linkedHtml = replaced.replace(/__LP_(\d+)__/g, (_, i) => placeholders[parseInt(i)]);
        }
      }

      const faq_schema_data = {
        sk: {
          faqs: [
            { otazka: `Kde stavia American Living v okolí ${mesto}?`, odpoved: `American Living realizuje výstavbu montovaných a modulárnych domov priamo v meste ${mesto} a okolí okresu ${okres}.` },
            { otazka: `Aká je cena montovaného domu v ${mesto}?`, odpoved: `Ceny montovaných domov v lokalite ${mesto} začínajú od 19 500 EUR s DPH. Presná cena závisí od modelu a konfigurácie.` },
            { otazka: `Ako dlho trvá výstavba domu v ${mesto}?`, odpoved: `Výstavba montovaného domu v ${mesto} trvá spravidla 60-120 dní od podpisu zmluvy vrátane kompletnej realizácie.` },
            { otazka: `Je možné získať dotáciu na dom v ${mesto}?`, odpoved: `Áno, v lokalite ${mesto} je možné získať dotáciu cez program GRANTAMERICANA – grant pri podpise a preplatenie nákladov na energie.` }
          ]
        }
      };

      await base44.asServiceRole.entities.LokaciaSEO.update(record.id, {
        unikany_text_o_lokalite: linkedHtml,
        meta_title: metaTitle,
        meta_description: metaDescription,
        faq_schema_data,
        verejny: true
      });

      console.log(`✓ Generated 0-credit SEO content + internal links for ${mesto}`);
      results.push({ city: mesto, status: 'success', credits_used: 0 });
    }

    // Loguj batch (bez kredítov - text generácia)
    if (results.length > 0) {
      await base44.functions.invoke('logIntegrationCall', {
        function_name: 'dailyLocalSEODrip',
        integration_type: 'Other',
        trigger: 'automation_scheduled',
        status: 'success',
        estimated_credits: 0,
        details: `Processed ${results.length} locations (0-credit mode)`
      }).catch(err => console.error('Log error:', err));
    }

    return Response.json({
      success: true,
      processed: results.length,
      failed: 0,
      credits_used: 0,
      results
    });

  } catch (error) {
    console.error('Error in dailyLocalSEODrip:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});