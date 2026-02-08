import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    let user;
    try {
      user = await base44.auth.me();
    } catch (e) {
      user = null;
    }

    const payload = await req.json();
    const {
      dom_id, klient_meno, klient_email, klient_telefon, klient_adresa, klient_poznamka,
      selectedItems, totalPrice,
      montazHolodomu, izolaciaNavysenie, zaklady, vstupneDvere,
      elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler,
      tepelneCerpadlo, rekuperacia, pripojkaSiete,
      stresneOkno, bocneOknoFixne, bocneOknoVyklopne90, bocneOknoVyklopne55,
      povrchokaOkien, tonovaneSkla, vonkajsiaFasada, interierFinis,
      vnutornePodlahy, podlahovVykurovanie, interieroveDvere, pergola,
      inziniering, projektA0, revizna, doprava, predlzenie,
      predajNehnutelnosti, hladaniePozemku, financneSluzby,
      language
    } = payload;

    const domy = await base44.asServiceRole.entities.Dom.list();
    const dom = domy.find(d => d.id === dom_id);

    if (!dom) {
      return Response.json({ error: 'Dom nenájdený' }, { status: 404 });
    }

    // Mapovanie cien hrubej stavby
    const priceMap = {
      'PH-001': { kit: 59900, assembly: 17970 },
      'PH-002': { kit: 59000, assembly: 17700 },
      'PH-003': { kit: 44900, assembly: 13470 },
      'PH-004': { kit: 49500, assembly: 14850 },
      'PH-005': { kit: 36900, assembly: 9225 },
      'PH-006': { kit: 31700, assembly: 7925 },
      'PH-007': { kit: 22700, assembly: 5675 },
      'PH-008': { kit: 20900, assembly: 4875 },
      'PH-009': { kit: 19500, assembly: 4875 }
    };
    
    const shellPrices = priceMap[dom.prosto_house_kod] || { kit: 0, assembly: 0 };

    const isA0 = projektA0 && izolaciaNavysenie === "premium" && tepelneCerpadlo && rekuperacia;
    const typStavby = isA0 ? "rodinny_dom_a0" : "rekreacna_stavba";

    const hlavnaFotka = vonkajsiaFasada === "suchana" 
      ? dom.hlavny_obrazok 
      : (dom.zakladna_konfiguracia_obrazok || dom.hlavny_obrazok);

    const galerie = [];

    const drevoGaleria = dom.galerie?.find(g => g.typ === "interier_drevo");
    if (drevoGaleria?.fotky?.length > 0) {
      galerie.push({ nazov: "Interiér - Drevo", fotky: drevoGaleria.fotky });
    }
    
    const sadroGaleria = dom.galerie?.find(g => g.typ === "interier_sadrokarton");
    if (sadroGaleria?.fotky?.length > 0) {
      galerie.push({ nazov: "Interiér - Sadrokartón", fotky: sadroGaleria.fotky });
    }

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

    const htmlEmail = `
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cenová ponuka - ${dom.nazov}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #EF4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 20px; font-weight: bold; color: #EF4444; margin-bottom: 15px; border-bottom: 3px solid #EF4444; padding-bottom: 8px; }
    
    .typ-stavby { padding: 20px; border-radius: 12px; margin: 20px 0; border: 3px solid; }
    .typ-stavby.rekreacna { background: #fef3c7; border-color: #f59e0b; }
    .typ-stavby.a0 { background: #d1fae5; border-color: #10b981; }
    .typ-stavby h3 { margin: 0 0 10px 0; font-size: 22px; }
    .typ-stavby ul { margin: 10px 0; padding-left: 20px; }
    .typ-stavby li { margin: 5px 0; }
    
    .house-img { width: 100%; max-height: 400px; object-fit: contain; background: #f9fafb; border-radius: 8px; margin: 15px 0; }
    .img-wrapper { position: relative; }
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
    
    .image-container { margin: 15px 0; position: relative; }
    .image-container img { width: 100%; height: auto; display: block; border-radius: 8px; }
    
    .footer { background: #111827; color: #9ca3af; padding: 30px; text-align: center; font-size: 13px; }
    .footer a { color: #60a5fa; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6916d89a485af231beb54c71/0a055b39a_AmericanLiving.png" alt="American Living" style="height: 60px; margin-bottom: 15px;">
      <h1>CENOVÁ PONUKA</h1>
      <p style="font-size: 16px; opacity: 0.95;">Náhľad konfigurácie</p>
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
        ${klient_poznamka ? `<p style="margin: 8px 0;"><strong>Poznámka:</strong> ${klient_poznamka}</p>` : ''}
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
        <div class="img-wrapper">
          <img src="${hlavnaFotka}" alt="${dom.nazov}" class="house-img">
          <div class="watermark">American Living</div>
        </div>
        <h2 style="margin: 15px 0 10px 0; color: #1f2937; font-size: 26px;">${dom.nazov}</h2>
        <p style="margin: 5px 0; color: #6b7280;"><strong>Výrobca:</strong> ${dom.vyrobca}</p>
        <p style="margin: 5px 0; color: #6b7280;"><strong>Typ domu:</strong> ${dom.typ_domu}</p>
        <p style="margin: 5px 0; color: #6b7280;"><strong>Zastavaná plocha:</strong> ${dom.zastavana_plocha} m²</p>
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
        ${dom.podorys_2d ? `
        <div class="image-container">
          <img src="${dom.podorys_2d}" alt="2D pôdorys" style="width: 100%; height: auto; display: block; object-fit: contain; border-radius: 8px; background: #f9fafb;">
          <div class="watermark" style="font-size: 32px;">American Living</div>
          <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 8px; background: #f3f4f6; padding: 8px; border-radius: 4px;">2D pôdorys</p>
        </div>
        ` : ''}
        ${dom.podorys_3d ? `
        <div class="image-container">
          <img src="${dom.podorys_3d}" alt="3D pôdorys" style="width: 100%; height: auto; display: block; object-fit: contain; border-radius: 8px; background: #f9fafb;">
          <div class="watermark" style="font-size: 32px;">American Living</div>
          <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 8px; background: #f3f4f6; padding: 8px; border-radius: 4px;">3D pôdorys</p>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Fotogalérie - VŠETKY v plnom rozlíšení -->
      ${galerie.length > 0 ? `
      <div class="section">
        <div class="section-title">Fotogaléria</div>
        ${galerie.map(g => `
          <h3 style="color: #374151; font-size: 16px; margin: 20px 0 10px 0;">${g.nazov}</h3>
          ${g.fotky.map((fotka, idx) => `
          <div class="image-container" style="margin: 15px 0;">
            <img src="${fotka}" alt="${g.nazov} ${idx + 1}" style="width: 100%; height: auto; display: block; border-radius: 8px;">
            <div class="watermark" style="font-size: 32px;">American Living</div>
            <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 8px; background: #f3f4f6; padding: 8px; border-radius: 4px;">${g.nazov} - Fotka ${idx + 1}</p>
          </div>
          `).join('')}
        `).join('')}
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">American Living</p>
      <p style="margin: 8px 0;">📞 Telefón: <a href="tel:+421905138124">+421 905 138 124</a></p>
      <p style="margin: 8px 0;">✉️ Email: <a href="mailto:info@americanliving.sk">info@americanliving.sk</a></p>
      <p style="margin: 8px 0;">🌐 Web: <a href="https://www.americanliving.sk">www.americanliving.sk</a></p>
      <div style="margin: 20px 0;">
        <p style="margin-bottom: 10px; font-size: 13px; color: #9ca3af;">Sledujte nás na sociálnych sieťach:</p>
        <p style="margin: 5px 0;">
          <a href="https://www.facebook.com/americanliving.sk" style="margin: 0 10px;">Facebook</a>
          <a href="https://www.instagram.com/americanliving.sk" style="margin: 0 10px;">Instagram</a>
        </p>
      </div>
      <p style="margin: 20px 0 5px 0; font-size: 11px;">&copy; ${new Date().getFullYear()} American Living. Všetky práva vyhradené.</p>
    </div>
  </div>
</body>
</html>
    `;

    return Response.json({ 
      success: true, 
      html: htmlEmail
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});