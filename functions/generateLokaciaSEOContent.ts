import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!event || !data) {
      return Response.json({ error: 'Missing event or data' }, { status: 400 });
    }

    const { entity_id } = event;
    const mesto = data.nazov_mesta || 'vašom meste';
    const okres = data.okres || 'vašom okrese';

    if (!entity_id) {
      return Response.json({ error: 'Missing entity_id' }, { status: 400 });
    }

    // Loop protection: skip if content already exists and is substantial
    if (data.content && data.content.length > 100 && data.meta_title) {
      console.log(`⏭️ Skipping ${mesto} - content already exists (loop protection)`);
      return Response.json({ success: true, skipped: true, reason: 'content_exists' });
    }

    console.log(`Generating 0-credit SEO content for: ${mesto}`);

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

    const randomIntro = intro[Math.floor(Math.random() * intro.length)];
    const randomBody = body[Math.floor(Math.random() * body.length)];
    const randomOutro = outro[Math.floor(Math.random() * outro.length)];

    const seo_html = randomIntro + randomBody + randomOutro;

    const metaTitle = `Montované domy ${mesto} | Výstavba na kľúč - American Living`;
    const metaDescription = `Objavte výhody stavby montovaného domu v ${mesto}. Rýchla výstavba, kvalita a dostupnosť. American Living - oficiálny distribútor.`;

    await base44.asServiceRole.entities.LokaciaSEO.update(entity_id, {
      content: seo_html,
      unikany_text_o_lokalite: seo_html,
      meta_title: metaTitle,
      meta_description: metaDescription
    });

    console.log(`✅ 0-credit SEO content generated for: ${mesto}`);

    return Response.json({
      success: true,
      entity_id,
      nazov_mesta: mesto,
      credits_used: 0
    });

  } catch (error) {
    console.error('SEO generation error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});