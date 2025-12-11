import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.super_admin !== true)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dom, konfiguraciaData, klientData } = await req.json();

    if (!klientData.email) {
      return Response.json({ error: 'Email klienta je povinný' }, { status: 400 });
    }

    const nastavenia = await base44.asServiceRole.entities.NastavenieCenovejPonuky.list();
    const aktivneNastavenie = nastavenia.find(n => n.aktivne) || nastavenia[0];

    const rok = new Date().getFullYear();
    let pocitadlo = await base44.asServiceRole.entities.PocitadloCenovychPonuk.filter({ rok });

    if (!pocitadlo || pocitadlo.length === 0) {
      pocitadlo = await base44.asServiceRole.entities.PocitadloCenovychPonuk.create({ rok, posledne_cislo: 1 });
    } else {
      pocitadlo = pocitadlo[0];
      await base44.asServiceRole.entities.PocitadloCenovychPonuk.update(pocitadlo.id, { 
        posledne_cislo: pocitadlo.posledne_cislo + 1 
      });
      pocitadlo.posledne_cislo += 1;
    }

    const cisloPonuky = `CP-${rok}-${String(pocitadlo.posledne_cislo).padStart(4, '0')}`;

    const formatPrice = (price) => {
      const num = typeof price === 'number' ? price : parseFloat(price);
      return num.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    };

    const getMatchedGalleries = () => {
      if (!dom?.galerie) return [];
      
      const matchedGalleries = [];
      
      if (!aktivneNastavenie?.mapovanie_fotiek_prosto || aktivneNastavenie.mapovanie_fotiek_prosto.length === 0) {
        dom.galerie?.forEach(galeria => {
          if (galeria.fotky?.length > 0) {
            matchedGalleries.push({
              nazov: galeria.nazov || "Galéria",
              fotky: galeria.fotky
            });
          }
        });
        return matchedGalleries;
      }
      
      aktivneNastavenie.mapovanie_fotiek_prosto.forEach(mapping => {
        const isActive = mapping.dlazdica_id && konfiguraciaData[mapping.dlazdica_id];
        
        if (isActive && mapping.typ_fotky) {
          if (mapping.typ_fotky.startsWith('galeria_')) {
            const galeriaTyp = mapping.typ_fotky.replace('galeria_', '');
            const galeria = dom.galerie?.find(g => g.nazov?.toLowerCase().includes(galeriaTyp));
            if (galeria && galeria.fotky?.length > 0) {
              matchedGalleries.push({
                nazov: galeria.nazov,
                fotky: galeria.fotky
              });
            }
          }
        }
      });
      
      if (matchedGalleries.length === 0 && dom.galerie?.length > 0) {
        const prvaGaleria = dom.galerie[0];
        if (prvaGaleria.fotky?.length > 0) {
          matchedGalleries.push({
            nazov: prvaGaleria.nazov || "Galéria",
            fotky: prvaGaleria.fotky
          });
        }
      }
      
      return matchedGalleries;
    };

    const matchedGalleries = getMatchedGalleries();
    const polozkyDetail = konfiguraciaData.polozky || [];
    const mainColor = aktivneNastavenie?.farba_hlavna || '#EF4444';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; }
    .header { background: ${mainColor}; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 32px; }
    .content { padding: 30px; }
    .info-section { margin-bottom: 25px; }
    .info-section h3 { color: ${mainColor}; margin-bottom: 10px; border-bottom: 2px solid ${mainColor}; padding-bottom: 5px; }
    .price-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .price-table th { background: ${mainColor}; color: white; padding: 10px; text-align: left; }
    .price-table td { padding: 8px; border-bottom: 1px solid #ddd; }
    .price-table tr:nth-child(even) { background: #f9f9f9; }
    .price-table tr.strikethrough { color: #999; text-decoration: line-through; }
    .price-table tr.category { background: ${mainColor}; color: white; font-weight: bold; }
    .total-price { background: #000; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
    .gallery { margin: 20px 0; }
    .gallery h4 { color: ${mainColor}; }
    .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .gallery-grid img { width: 100%; height: 200px; object-fit: cover; border-radius: 5px; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CENOVÁ PONUKA</h1>
      <p>Číslo ponuky: ${cisloPonuky}</p>
      <p>Dátum: ${new Date().toLocaleDateString('sk-SK')}</p>
    </div>
    
    <div class="content">
      ${klientData.meno ? `
      <div class="info-section">
        <h3>Pre klienta</h3>
        <p><strong>Meno:</strong> ${klientData.meno}</p>
        <p><strong>Email:</strong> ${klientData.email}</p>
        <p><strong>Telefón:</strong> ${klientData.telefon}</p>
        ${klientData.obec ? `<p><strong>Obec:</strong> ${klientData.obec}</p>` : ''}
      </div>
      ` : ''}
      
      <div class="info-section">
        <h3>Vybraný model</h3>
        <p><strong>${dom?.nazov || 'Prosto House'}</strong></p>
        <p>Výrobca: ${dom?.vyrobca || 'Prosto House'}</p>
        <p>Typ domu: ${dom?.typ_domu || 'Modulárny dom'}</p>
        ${dom?.zastavana_plocha ? `<p>Zastavaná plocha: ${dom.zastavana_plocha} m²</p>` : ''}
        ${dom?.uzitkova_plocha ? `<p>Úžitková plocha: ${dom.uzitkova_plocha} m²</p>` : ''}
      </div>
      
      <div class="info-section">
        <h3>Cenový rozpis</h3>
        <table class="price-table">
          <thead>
            <tr>
              <th>Položka</th>
              <th style="text-align: right;">Cena</th>
            </tr>
          </thead>
          <tbody>
            ${polozkyDetail.map(polozka => {
              if (polozka.kategoria) {
                return `<tr class="category"><td colspan="2">${polozka.nazov}</td></tr>`;
              }
              const rowClass = !polozka.vybrane ? 'strikethrough' : '';
              const priceText = polozka.cena !== null && polozka.cena !== undefined 
                ? (typeof polozka.cena === 'string' ? polozka.cena : formatPrice(polozka.cena))
                : '';
              return `<tr class="${rowClass}"><td>${polozka.nazov}</td><td style="text-align: right;">${priceText}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="total-price">
        CELKOVÁ CENA s DPH: ${formatPrice(konfiguraciaData.totalPrice)}
      </div>
      
      ${dom?.podorys_2d || dom?.podorys_3d ? `
      <div class="info-section">
        <h3>Pôdorysy</h3>
        <div class="gallery-grid">
          ${dom.podorys_2d ? `<img src="${dom.podorys_2d}" alt="2D pôdorys">` : ''}
          ${dom.podorys_3d ? `<img src="${dom.podorys_3d}" alt="3D pôdorys">` : ''}
        </div>
      </div>
      ` : ''}
      
      ${matchedGalleries.length > 0 ? `
      <div class="info-section">
        <h3>Fotogaléria</h3>
        ${matchedGalleries.map(galeria => `
          <div class="gallery">
            <h4>${galeria.nazov}</h4>
            <div class="gallery-grid">
              ${galeria.fotky.slice(0, 6).map(img => `<img src="${img}" alt="${galeria.nazov}">`).join('')}
            </div>
            ${galeria.fotky.length > 6 ? `<p style="color: #666; font-size: 12px;">+ ďalších ${galeria.fotky.length - 6} fotiek</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${klientData.poznamka ? `
      <div class="info-section">
        <h3>Poznámka</h3>
        <p>${klientData.poznamka}</p>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p>American Living | +421 905 138 124 | info@americanliving.sk | www.americanliving.sk</p>
      <p>Pre viac informácií nás neváhajte kontaktovať</p>
    </div>
  </div>
</body>
</html>
    `;

    // Odoslať email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: klientData.email,
      subject: `Cenová ponuka ${cisloPonuky} - ${dom?.nazov || 'Prosto House'}`,
      body: htmlContent
    });

    // Uložiť ponuku do databázy
    await base44.asServiceRole.entities.CenovaPonuka.create({
      cislo_ponuky: cisloPonuky,
      dom_id: dom?.id,
      dom_nazov: dom?.nazov,
      klient_meno: klientData.meno,
      klient_email: klientData.email,
      klient_telefon: klientData.telefon,
      klient_adresa: klientData.obec,
      konfigurator_data: konfiguraciaData,
      celkova_cena: konfiguraciaData.totalPrice,
      polozky: polozkyDetail,
      vybrane_fotky: matchedGalleries.flatMap(g => g.fotky.slice(0, 6)),
      status: 'odoslana',
      odoslana: true,
      datum_odoslania: new Date().toISOString(),
      nastavenie_id: aktivneNastavenie?.id,
      predajca_email: user.email
    });

    return Response.json({ success: true, cislo_ponuky: cisloPonuky });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});