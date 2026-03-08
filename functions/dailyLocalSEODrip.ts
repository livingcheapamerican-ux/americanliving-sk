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
      const okres = record.okres || 'vašom okrese';

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

      await base44.asServiceRole.entities.LokaciaSEO.update(record.id, {
        content: seo_html,
        unikany_text_o_lokalite: seo_html,
        meta_title: metaTitle,
        meta_description: metaDescription,
        verejny: true
      });

      console.log(`✓ Generated 0-credit SEO content for ${mesto}`);
      results.push({ city: mesto, status: 'success', credits_used: 0 });
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