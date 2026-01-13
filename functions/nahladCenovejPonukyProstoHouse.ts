import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.super_admin !== true)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      dom_id, klient_meno, klient_email, klient_telefon, klient_adresa,
      selectedItems, totalPrice,
      montazHolodomu, izolaciaNavysenie, zaklady, vstupneDvere,
      elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler,
      tepelneCerpadlo, rekuperacia, pripojkaSiete,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55,
      povrchokaOkien, tonovaneSkla, vonkajsiaFasada, interierFinis,
      vnutornePodlahy, podlahovVykurovanie, interieroveDvere,
      inziniering, projektA0, revizna, doprava, predlzenie,
      predajNehnutelnosti, hladaniePozemku, financneSluzby
    } = payload;

    // Načítaj dom
    const domy = await base44.asServiceRole.entities.Dom.list();
    const dom = domy.find(d => d.id === dom_id);

    if (!dom) {
      return Response.json({ error: 'Dom nenájdený' }, { status: 404 });
    }

    // Generuj číslo ponuky
    const aktualnyRok = new Date().getFullYear();
    const pocitadla = await base44.asServiceRole.entities.PocitadloCenovychPonuk.list();
    let pocitadlo = pocitadla.find(p => p.rok === aktualnyRok);
    
    let cisloPonuky;
    if (!pocitadlo) {
      await base44.asServiceRole.entities.PocitadloCenovychPonuk.create({
        rok: aktualnyRok,
        posledne_cislo: 1
      });
      cisloPonuky = `CP-${aktualnyRok}-001`;
    } else {
      const noveCislo = pocitadlo.posledne_cislo + 1;
      await base44.asServiceRole.entities.PocitadloCenovychPonuk.update(pocitadlo.id, {
        posledne_cislo: noveCislo
      });
      cisloPonuky = `CP-${aktualnyRok}-${String(noveCislo).padStart(3, '0')}`;
    }

    console.log('=== PRIJATÉ DÁTA ===');
    console.log('selectedItems:', selectedItems);
    console.log('totalPrice:', totalPrice);

    // Typ stavby
    const isA0 = projektA0 && izolaciaNavysenie === "premium" && tepelneCerpadlo && rekuperacia;
    const typStavby = isA0 ? "rodinny_dom_a0" : "rekreacna_stavba";

    // Výber hlavnej fotky
    const hlavnaFotka = vonkajsiaFasada === "suchana" 
      ? dom.hlavny_obrazok 
      : (dom.zakladna_konfiguracia_obrazok || dom.hlavny_obrazok);

    // Galérie - VŽDY zobraz obe interiérové galérie a exteriér podľa fasády
    const galerie = [];
    
    // INTERIÉR - vždy zobraz obe galérie ak existujú
    const drevoGaleria = dom.galerie?.find(g => g.typ === "interier_drevo");
    if (drevoGaleria?.fotky?.length > 0) {
      galerie.push({ nazov: "Interiér - Drevo", fotky: drevoGaleria.fotky });
    }
    
    const sadroGaleria = dom.galerie?.find(g => g.typ === "interier_sadrokarton");
    if (sadroGaleria?.fotky?.length > 0) {
      galerie.push({ nazov: "Interiér - Sadrokartón", fotky: sadroGaleria.fotky });
    }

    // EXTERIÉR - podľa fasády
    if (vonkajsiaFasada === "standard" || !vonkajsiaFasada) {
      const exterierDrevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
      if (exterierDrevoGaleria?.fotky?.length > 0) {
        galerie.push({ nazov: "Exteriér - Drevo/Plech", fotky: exterierDrevoGaleria.fotky });
      }
    } else if (vonkajsiaFasada === "suchana") {
      const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
      if (murovkaGaleria?.fotky?.length > 0) {
        galerie.push({ nazov: "Exteriér - Murovka", fotky: murovkaGaleria.fotky });
      }
    }

    const formatPrice = (price) => {
      if (!price) return "0,00 €";
      return price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    };

    // Vytvor HTML
    const html = `
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cenová ponuka - ${dom.nazov}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #EF4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 20px; font-weight: bold; color: #EF4444; margin-bottom: 15px; border-bottom: 3px solid #EF4444; padding-bottom: 8px; }
    
    .typ-stavby { padding: 20px; border-radius: 12px; margin: 20px 0; border: 3px solid; }
    .typ-stavby.rekreacna { background: #fef3c7; border-color: #f59e0b; }
    .typ-stavby.a0 { background: #d1fae5; border-color: #10b981; }
    .typ-stavby h3 { margin: 0 0 10px 0; font-size: 22px; display: flex; align-items: center; gap: 10px; }
    .typ-stavby ul { margin: 10px 0; padding-left: 20px; }
    .typ-stavby li { margin: 5px 0; }
    
    .info-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .info-box h4 { margin: 0 0 10px 0; color: #065f46; font-size: 16px; }
    .info-box ul { margin: 0; padding-left: 20px; color: #047857; }
    .info-box li { margin: 5px 0; font-size: 14px; }
    
    .house-img { width: 100%; height: auto; object-fit: contain; background: #f9fafb; border-radius: 8px; margin: 15px 0; position: relative; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.3); font-size: 48px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); pointer-events: none; }
    
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #EF4444; color: white; padding: 12px; text-align: left; font-size: 14px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    tr:nth-child(even) { background: #f9fafb; }
    .section-row { background: #3b82f6 !important; color: white; font-weight: bold; text-transform: uppercase; font-size: 12px; }
    .selected-row { color: #059669; font-weight: bold; }
    .not-selected-row { color: #dc2626; text-decoration: line-through; }
    .base-row { background: #dbeafe !important; font-weight: bold; color: #1e40af; }
    
    .total-box { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0; }
    .total-box .label { font-size: 16px; opacity: 0.9; }
    .total-box .amount { font-size: 42px; font-weight: bold; margin-top: 10px; }
    
    .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .gallery-item { position: relative; border-radius: 8px; overflow: hidden; }
    .gallery-item img { width: 100%; height: auto; object-fit: contain; max-height: 500px; }
    .gallery-caption { background: #f3f4f6; padding: 8px; text-align: center; font-size: 12px; color: #6b7280; }
    
    .footer { background: #111827; color: #9ca3af; padding: 30px; text-align: center; font-size: 13px; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CENOVÁ PONUKA</h1>
      <p style="font-size: 16px; opacity: 0.95;">Číslo ponuky: ${cisloPonuky}</p>
      <p style="font-size: 14px; opacity: 0.9;">Dátum: ${new Date().toLocaleDateString('sk-SK')}</p>
    </div>

    <div class="content">
      <!-- Typ stavby -->
      <div class="typ-stavby ${typStavby === 'rodinny_dom_a0' ? 'a0' : 'rekreacna'}">
        ${typStavby === 'rodinny_dom_a0' ? `
          <h3><span style="font-size: 28px;">🏡</span> Rodinný dom A0</h3>
          <div style="display: inline-block; background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 10px;">⚡ Odporúčané</div>
          <ul style="margin: 10px 0; color: #065f46;">
            <li>✓ Celoročné bývanie</li>
            <li>✓ Energetický certifikát A0</li>
            <li>✓ Premium izolácia 250/300mm</li>
            <li>✓ Tepelné čerpadlo + Rekuperácia</li>
            <li>✓ Možnosť trvalého pobytu</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #047857; font-style: italic;">Spĺňa všetky normy pre rodinný dom</p>
        ` : `
          <h3><span style="font-size: 28px;">🏕️</span> Rekreačná stavba</h3>
          <div style="display: inline-block; background: #f59e0b; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 10px;">💰 Ekonomická voľba</div>
          <ul style="margin: 10px 0; color: #92400e;">
            <li>✓ Chata, záhradný domček</li>
            <li>✓ Celoročná izolácia 150/200mm</li>
            <li>✓ Bez energetického certifikátu</li>
            <li>✓ Nižšia cena</li>
          </ul>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #b45309; font-style: italic;">Spĺňa parametre rekreačnej stavby</p>
        `}
      </div>

      <!-- Klient info -->
      <div class="section">
        <div class="section-title">Pre klienta</div>
        <p style="margin: 8px 0;"><strong>Meno:</strong> ${klient_meno}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> ${klient_email}</p>
        <p style="margin: 8px 0;"><strong>Telefón:</strong> ${klient_telefon}</p>
        ${klient_adresa ? `<p style="margin: 8px 0;"><strong>Lokalita:</strong> ${klient_adresa}</p>` : ''}
      </div>

      <!-- Dodatočné služby -->
      ${(predajNehnutelnosti || hladaniePozemku || financneSluzby) ? `
      <div class="section">
        <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">✨</span> Vybrané dodatočné služby
          </h3>
          ${predajNehnutelnosti ? `
          <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #047857; font-weight: bold;">✓ Predaj predošlej nehnuteľnosti</p>
            <p style="margin: 5px 0 0 0; color: #059669; font-size: 13px;">Budú sa Vám venovať naši najlepší odborníci v realitách.</p>
          </div>
          ` : ''}
          ${hladaniePozemku ? `
          <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #047857; font-weight: bold;">✓ Chcem pozemok pod svoj dom</p>
            <p style="margin: 5px 0 0 0; color: #059669; font-size: 13px;">Pomôžeme Vám nájsť ideálny pozemok.</p>
          </div>
          ` : ''}
          ${financneSluzby ? `
          <div style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #047857; font-weight: bold;">✓ Finančné služby - úvery/pôžičky</p>
            <p style="margin: 5px 0 0 0; color: #059669; font-size: 13px;">Budú sa Vám venovať naši najlepší finančníci.</p>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Vybraný model -->
      <div class="section">
        <div class="section-title">Vybraný model domu</div>
        <div style="position: relative;">
          <img src="${hlavnaFotka}" alt="${dom.nazov}" class="house-img">
          <div class="watermark">American Living</div>
        </div>
        <h2 style="margin: 15px 0 10px 0; color: #1f2937; font-size: 26px;">${dom.nazov}</h2>
        <p style="margin: 5px 0; color: #6b7280;"><strong>Výrobca:</strong> ${dom.vyrobca}</p>
        <p style="margin: 5px 0; color: #6b7280;"><strong>Typ domu:</strong> ${dom.typ_domu}</p>
        <p style="margin: 5px 0; color: #6b7280;"><strong>Zastavaná plocha:</strong> ${dom.zastavana_plocha} m²</p>
      </div>

      <!-- Sprievodné texty -->
      <div class="info-box">
        <h4>📦 Komplet pre montáž</h4>
        <ul>
          <li>drevená konštrukcia, hoblovaný hranol</li>
          <li>vonkajšie steny, falcovaný plech 0,45mm</li>
          <li>strecha, falcovaný plech 0,45mm</li>
          <li>okná s dvojkomorovým sklom</li>
          <li>dvere s dvojkomorovým sklom</li>
          <li>hydroizoláčná membrána Strotex 1300</li>
          <li>tepelná izolácia (150–250mm)</li>
          <li>parozábranová fólia Strotex AL90</li>
          <li>hrubá podlaha z OSB 22mm</li>
        </ul>
        <p style="color: #dc2626; font-weight: bold; margin-top: 10px;">Maľovanie: 4,5 €/m²</p>
      </div>

      <div class="info-box">
        <h4>⚡ Elektroinštalácia</h4>
        <ul>
          <li>montáž elektrických káblov</li>
          <li>inštalácia rozvádzača s ističmi</li>
          <li>uloženie chráničky pre vonkajší kábel</li>
          <li>montáž inštalačných krabíc</li>
        </ul>
        <p style="color: #dc2626; font-weight: bold; margin-top: 10px;">Nezahŕňa: bleskozvod, revízne doklady, montáž zásuviek/svietidiel</p>
      </div>

      <div class="info-box">
        <h4>💧 Voda a kanalizácia</h4>
        <ul>
          <li>montáž vodovodných potrubí</li>
          <li>montáž ventilov, záslepiek</li>
          <li>montáž kanalizačných potrubí</li>
          <li>kontrola tesnosti pod tlakom</li>
        </ul>
        <p style="color: #dc2626; font-weight: bold; margin-top: 10px;">Protokoly a sanitárne zariadenia za príplatok</p>
      </div>

      <div class="info-box">
        <h4>🏗️ Základy</h4>
        <ul>
          <li>vrutové stĺpy, betónové stĺpiky alebo doska</li>
          <li>uvedená minimálna cena za rovný terén</li>
          <li>konečná cena po geodetickej analýze</li>
        </ul>
        <p style="color: #dc2626; font-weight: bold; margin-top: 10px;">Prípravné práce nie sú v cene</p>
      </div>

      <div class="info-box" style="background: #fef3c7; border-color: #f59e0b;">
        <h4 style="color: #92400e;">🏡 Interiér finiš</h4>
        <ul style="color: #b45309;">
          <li>montáž priečok podľa projektu</li>
          <li>izolácia 100mm + parозábrana</li>
          <li>tatranský profil 8–12mm</li>
        </ul>
        <p style="color: #dc2626; font-weight: bold; margin-top: 10px;">Maľovanie: 4,5 €/m², farbu dodáva klient</p>
      </div>

      <!-- Cenový rozpis -->
      <div class="section">
        <div class="section-title">Cenový rozpis konfigurácie</div>
        <table>
          <thead>
            <tr>
              <th>Položka</th>
              <th style="text-align: right;">Cena s DPH</th>
            </tr>
          </thead>
          <tbody>
            ${selectedItems?.map(item => {
              const isBase = item.section === "base";
              const isSectionHeader = item.name === "HRUBÁ STAVBA" || item.name === "HOLODOM" || item.name === "DOM NA KĽÚČ" || item.name === "DOKUMENTÁCIA";
              
              if (isSectionHeader) {
                const icon = item.name === "HRUBÁ STAVBA" ? "🏗️" : 
                            item.name === "HOLODOM" ? "🔨" : 
                            item.name === "DOM NA KĽÚČ" ? "🔑" : "📋";
                return `<tr class="section-row"><td colspan="2">${icon} ${item.name}</td></tr>`;
              }
              
              const rowClass = item.selected ? 'selected-row' : 'not-selected-row';
              const baseClass = isBase ? 'base-row' : rowClass;
              
              return `
                <tr class="${baseClass}">
                  <td>${isBase ? '<strong>' + item.name + '</strong>' : item.name}</td>
                  <td style="text-align: right;">${isBase ? '<strong>' + formatPrice(item.price) + '</strong>' : (item.selected ? formatPrice(item.price) : '—')}</td>
                </tr>
              `;
            }).join('') || ''}
          </tbody>
        </table>
      </div>

      <!-- Celková cena -->
      <div class="total-box">
        <div class="label">CELKOVÁ CENA s DPH</div>
        <div class="amount">${formatPrice(totalPrice)}</div>
      </div>

      <!-- Pôdorysy -->
      ${(dom.podorys_2d || dom.podorys_3d) ? `
      <div class="section">
        <div class="section-title">Pôdorysy</div>
        <div class="gallery">
          ${dom.podorys_2d ? `
          <div class="gallery-item">
            <div style="position: relative;">
              <img src="${dom.podorys_2d}" alt="2D pôdorys">
              <div class="watermark" style="font-size: 32px;">American Living</div>
            </div>
            <div class="gallery-caption">2D pôdorys</div>
          </div>
          ` : ''}
          ${dom.podorys_3d ? `
          <div class="gallery-item">
            <div style="position: relative;">
              <img src="${dom.podorys_3d}" alt="3D pôdorys">
              <div class="watermark" style="font-size: 32px;">American Living</div>
            </div>
            <div class="gallery-caption">3D pôdorys</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Fotogalérie -->
      ${galerie.length > 0 ? `
      <div class="section">
        <div class="section-title">Fotogaléria</div>
        ${galerie.map(g => `
          <h3 style="color: #374151; font-size: 16px; margin: 20px 0 10px 0;">${g.nazov}</h3>
          <div class="gallery">
            ${g.fotky.slice(0, 9).map((fotka, idx) => `
            <div class="gallery-item">
              <div style="position: relative;">
                <img src="${fotka}" alt="${g.nazov} ${idx + 1}">
                <div class="watermark" style="font-size: 28px;">American Living</div>
              </div>
              <div class="gallery-caption">${g.nazov} - Fotka ${idx + 1}</div>
            </div>
            `).join('')}
          </div>
          ${g.fotky.length > 9 ? `<p style="text-align: center; color: #6b7280; font-size: 12px;">+ ďalších ${g.fotky.length - 9} fotiek</p>` : ''}
        `).join('')}
      </div>
      ` : `
      <div class="section">
        <p style="color: #dc2626; font-weight: bold; background: #fee; padding: 15px; border-radius: 8px;">⚠️ DEBUG: Žiadne galérie nenájdené</p>
        <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 12px;">
          <p><strong>interierFinis:</strong> ${interierFinis}</p>
          <p><strong>vonkajsiaFasada:</strong> ${vonkajsiaFasada}</p>
          <p><strong>dom.galerie existuje:</strong> ${dom.galerie ? 'áno' : 'nie'}</p>
          <p><strong>počet galérií v dome:</strong> ${dom.galerie?.length || 0}</p>
        </div>
      </div>
      `}
    </div>

    <div class="footer">
      <p style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">American Living</p>
      <p style="margin: 8px 0;">📞 Telefón: <a href="tel:+421905138124">+421 905 138 124</a></p>
      <p style="margin: 8px 0;">✉️ Email: <a href="mailto:info@americanliving.sk">info@americanliving.sk</a></p>
      <p style="margin: 8px 0;">🌐 Web: <a href="https://www.americanliving.sk">www.americanliving.sk</a></p>
      <p style="margin: 20px 0 5px 0; font-size: 11px;">&copy; ${new Date().getFullYear()} American Living. Všetky práva vyhradené.</p>
    </div>
  </div>
</body>
</html>
    `;

    return Response.json({ html });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});