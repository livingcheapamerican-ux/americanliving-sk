import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * DAILY LOCAL SEO DRIP v2 (0 AI credits)
 * Generuje 500+ slov obsahu pre lokality bez obsahu.
 * Slug-first interné linky, 5 FAQ otázok, rozšírené meta tagy.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const allRecords = await base44.asServiceRole.entities.LokaciaSEO.list();
    const pendingRecords = allRecords
      .filter(record =>
        // Spracuj záznamy bez obsahu ALEBO s príliš krátkym obsahom (<800 znakov = starý formát)
        (!record.unikany_text_o_lokalite || record.unikany_text_o_lokalite.length < 800)
      )
      .slice(0, 5);

    if (pendingRecords.length === 0) {
      console.log('✓ No pending LokaciaSEO records found');
      return Response.json({ success: true, processed: 0, message: 'No pending records', credits_used: 0 });
    }

    console.log(`📝 Processing ${pendingRecords.length} LokaciaSEO records (v2, 0-credit mode)...`);

    // Načítaj domy raz pre všetky lokality
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    const domy = allDomy.filter(d => d.verejny !== false && d.nazov && (d.slug || d.id));
    domy.sort((a, b) => b.nazov.length - a.nazov.length);

    const results = [];

    for (const record of pendingRecords) {
      const mesto = record.nazov_mesta || record.slug || 'vašom meste';
      const okres = record.okres || record.nazov_mesta || 'okolí';
      const kraj = record.kraj || 'Slovensku';

      // Vyber 3 featured domy
      const featuredDomy = domy.slice(0, 3);
      const domyList = featuredDomy.map(d => {
        const url = d.slug ? `/DetailDomu?slug=${d.slug}` : `/DetailDomu?id=${d.id}`;
        const plocha = d.zastavana_plocha ? `${d.zastavana_plocha}m²` : '';
        const cena = d.zakladna_cena ? `od ${d.zakladna_cena.toLocaleString('sk-SK')} EUR` : '';
        return `<li><a href="${url}" title="${d.nazov}"><strong>${d.nazov}</strong></a>${plocha ? ' – ' + plocha : ''}${cena ? ' – ' + cena : ''}</li>`;
      }).join('\n');

      const intros = [
        `<h2>Montované a modulárne domy ${mesto} – výstavba na kľúč</h2>
<p>Hľadáte spoľahlivého partnera pre výstavbu rodinného domu v meste <strong>${mesto}</strong>? Spoločnosť American Living je exkluzívnym distribútorom prémiových montovaných, modulárnych a mobilných domov pre celý okres ${okres}. Každý dom dodávame s energetickým certifikátom triedy A0 a zárukou kvality.</p>`,
        `<h2>Rodinné domy v lokalite ${mesto} – moderné montované bývanie</h2>
<p>Objavte moderný spôsob, ako si postaviť rodinný dom v <strong>${mesto}</strong> rýchlo a bez starostí. American Living dodáva montované domy na kľúč s celoročným využitím, montážou 60–120 dní a energetickou triedou A0 pre celý okres ${okres} a ${kraj}.</p>`,
        `<h2>Výstavba domov na kľúč v meste ${mesto}</h2>
<p>Plánujete stavbu nového rodinného domu v <strong>${mesto}</strong>? American Living zabezpečí kompletný servis od výberu modelu až po odovzdanie kľúčov. Realizujeme výstavbu po celom okrese ${okres} vrátane inžinierskych sietí a kolaudácie.</p>`
      ];

      const bodies = [
        `<h3>Prečo si vybrať American Living pre výstavbu v ${mesto}?</h3>
<p>Montované domy od American Living spĺňajú najprísnejšie európske normy. Pre obyvateľov mesta ${mesto} ponúkame:</p>
<ul>
<li><strong>Rýchlosť výstavby:</strong> 60–120 dní od podpisu zmluvy</li>
<li><strong>Energetická trieda A0:</strong> minimálne náklady na vykurovanie</li>
<li><strong>Pevná cena:</strong> bez skrytých poplatkov, možnosť hypotéky</li>
<li><strong>Kompletný servis:</strong> projekt, povolenie, siete, kolaudácia</li>
<li><strong>Dodávka do ${mesto}:</strong> montáž priamo na váš pozemok</li>
</ul>`,
        `<h3>Výhody montovaných domov pre bývanie v ${mesto}</h3>
<p>Moderné montované domy sú ideálne pre bývanie v ${mesto} a okolí:</p>
<ul>
<li><strong>3× rýchlejšia výstavba</strong> oproti klasickej murovanej stavbe</li>
<li><strong>Nižšie prevádzkové náklady</strong> – výborná izolácia, trieda A0</li>
<li><strong>Ekologické materiály</strong> – certifikované drevo</li>
<li><strong>Možnosť kolaudácie</strong> pre trvalé bývanie na Slovensku</li>
<li><strong>Flexibilná dispozícia</strong> – prispôsobte si interiér</li>
</ul>`,
        `<h3>Čo zahŕňa naša ponuka pre ${mesto}?</h3>
<p>Pre zákazníkov z okresu ${okres} zabezpečujeme:</p>
<ul>
<li>Výber a overenie pozemku pre výstavbu v ${mesto}</li>
<li>Projektová dokumentácia a stavebné povolenie</li>
<li>Výstavba montovaného domu s profesionálnou montážnou čatou</li>
<li>Napojenie na inžinierske siete (elektrina, voda, kanalizácia)</li>
<li>Kolaudácia a energetický certifikát A0</li>
</ul>`
      ];

      const domSection = domyList ? `
<h3>Odporúčané modely pre lokalitu ${mesto}</h3>
<ul>
${domyList}
</ul>
<p>Prezrite si kompletný katalóg modelov a nájdite dom, ktorý vyhovuje vašim potrebám a rozpočtu.</p>` : '';

      const grantSection = `
<h3>Dotačný program GRANTAMERICANA pre ${mesto}</h3>
<p>Zákazníci z mesta ${mesto} môžu využiť program <strong>GRANTAMERICANA</strong> – grant pri podpise zmluvy a preplatenie energetických nákladov. Pomôžeme aj s predajom starej nehnuteľnosti, výberom pozemku a hypotékou.</p>`;

      const cta = `
<h3>Kontaktujte nás – výstavba v ${mesto}</h3>
<p>Zavolajte na <strong>+421 905 138 124</strong> alebo zanechajte kontakt. Konzultácia je bezplatná a nezáväzná. Ozveme sa do 24 hodín.</p>`;

      const randomIntro = intros[Math.floor(Math.random() * intros.length)];
      const randomBody = bodies[Math.floor(Math.random() * bodies.length)];
      let seo_html = randomIntro + randomBody + domSection + grantSection + cta;

      // Interné linky (slug-first)
      for (const dom of domy) {
        const nazov = dom.nazov.trim();
        if (!nazov) continue;
        const url = dom.slug ? `/DetailDomu?slug=${dom.slug}` : `/DetailDomu?id=${dom.id}`;
        const escaped = nazov.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const placeholders = [];
        const withPlaceholders = seo_html.replace(/<a[\s\S]*?<\/a>/gi, (m) => {
          const i = placeholders.length; placeholders.push(m); return `__LP_${i}__`;
        });
        const regex = new RegExp(`(${escaped})`);
        if (regex.test(withPlaceholders)) {
          const replaced = withPlaceholders.replace(regex,
            `<a href="${url}" class="internal-link" title="${nazov} – American Living">$1</a>`
          );
          seo_html = replaced.replace(/__LP_(\d+)__/g, (_, i) => placeholders[parseInt(i)]);
        }
      }

      const metaTitle = `Montované domy ${mesto} – výstavba na kľúč od 19 500 € | American Living`;
      const metaDescription = `Stavba rodinného domu v ${mesto} do 120 dní. Energetická trieda A0. Bezplatná konzultácia: +421 905 138 124.`;

      const faq_schema_data = {
        sk: {
          faqs: [
            { otazka: `Kde stavia American Living v okolí ${mesto}?`, odpoved: `American Living realizuje výstavbu montovaných domov v meste ${mesto} a celom okrese ${okres}.` },
            { otazka: `Aká je cena montovaného domu v ${mesto}?`, odpoved: `Ceny začínajú od 19 500 EUR s DPH. Celková cena závisí od modelu a konfigurácie.` },
            { otazka: `Ako dlho trvá výstavba domu v ${mesto}?`, odpoved: `Výstavba trvá 60–120 dní od podpisu zmluvy vrátane montáže a kolaudácie.` },
            { otazka: `Je možné získať dotáciu na dom v ${mesto}?`, odpoved: `Áno, cez program GRANTAMERICANA – grant pri podpise a preplatenie energetických nákladov.` },
            { otazka: `Potrebujem stavebné povolenie na montovaný dom v ${mesto}?`, odpoved: `Pre trvalé bývanie áno – American Living vybavuje celú dokumentáciu za vás.` }
          ]
        }
      };

      await base44.asServiceRole.entities.LokaciaSEO.update(record.id, {
        unikany_text_o_lokalite: seo_html,
        meta_title: metaTitle,
        meta_description: metaDescription,
        faq_schema_data,
        verejny: true
      });

      console.log(`✓ ${mesto}: ${seo_html.length} znakov obsahu vygenerovaných`);
      results.push({ city: mesto, status: 'success', content_length: seo_html.length, credits_used: 0 });
    }

    if (results.length > 0) {
      await base44.asServiceRole.functions.invoke('logIntegrationCall', {
        function_name: 'dailyLocalSEODrip',
        integration_type: 'Other',
        trigger: 'automation_scheduled',
        status: 'success',
        estimated_credits: 0,
        details: `v2: Processed ${results.length} locations (0-credit mode)`
      }).catch(err => console.error('Log error:', err));
    }

    return Response.json({ success: true, processed: results.length, failed: 0, credits_used: 0, results });

  } catch (error) {
    console.error('Error in dailyLocalSEODrip:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});