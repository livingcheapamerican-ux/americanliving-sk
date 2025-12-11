import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    const { 
      dom_id, klient_meno, klient_email, klient_telefon, klient_adresa, klient_poznamka,
      predajNehnutelnosti, hladaniePozemku, financneSluzby,
      montazHolodomu, izolaciaNavysenie, zaklady, predlzenie, vstupneDvere,
      elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo,
      rekuperacia, pripojkaSiete, stresneOkno, bocneOknoFixne, bocneOknoVyklopne90,
      bocneOknoVyklopne55, povrchokaOkien, tonovaneSkla, vonkajsiaFasada, interierFinis,
      vnutornePodlahy, podlahovVykurovanie, interieroveDvere, inziniering, projektA0,
      revizna, doprava
    } = await req.json();

    const dom = (await base44.asServiceRole.entities.Dom.filter({ id: dom_id }))[0];
    const aktivneNastavenia = (await base44.asServiceRole.entities.NastavenieCenovejPonuky.filter({ aktivne: true }))[0];
    
    const pocitadlo = (await base44.asServiceRole.entities.PocitadloCenovychPonuk.filter({ rok: new Date().getFullYear() }))[0];
    const noveCislo = (pocitadlo?.posledne_cislo || 0) + 1;
    const cisloPonuky = `CP-${new Date().getFullYear()}-${String(noveCislo).padStart(3, '0')}`;
    
    if (pocitadlo) {
      await base44.asServiceRole.entities.PocitadloCenovychPonuk.update(pocitadlo.id, { posledne_cislo: noveCislo });
    } else {
      await base44.asServiceRole.entities.PocitadloCenovychPonuk.create({ rok: new Date().getFullYear(), posledne_cislo: noveCislo });
    }

    const CENY = {
      montaz: { nie: 0, ano: 9225 },
      predlzenie: { 0: 0, 1.2: 6600, 2.4: 13200, 3.6: 19800, 4.8: 26400 },
      dvere: { ziadne: 0, kovove: 720, plastove: 660 },
      izolacia: { standard: 0, zvysena: 2700, premium: 5400, ultra: 10125 },
      elektroinstalacia: 3900,
      vodaKanalizacia: 1150,
      sanitaKomplet: 1169,
      bojler: 264,
      tepelneCerpadlo: 3321,
      rekuperacia: 1600,
      zaklady: { bez: 0, skrutky: 4751, doska: 9633, pasove: 11823 },
      pripojkaSiete: 1501,
      inziniering: 2592,
      projektA0: 3500,
      interierFinis: { ziadne: 0, drevo: 8200, sadrokarton: 9430 },
      vonkajsiaFasada: { standard: 0, suchana: 6371 },
      povrchokaOkien: 1450,
      vnutornePodlahy: 1750,
      podlahovVykurovanie: 3960,
      interieroveDvere: 180,
      tonovaneSkla: 700,
      doprava: 0,
      revizna: 1000,
      stresneOkno: 760,
      bocneOknoFixne: 500,
      bocneOknoVyklopne90: 540,
      bocneOknoVyklopne55: 225
    };

    let total = dom.zakladna_cena || 0;
    const polozky = [];

    polozky.push({ nazov: `${dom.nazov} - Základná cena`, cena: dom.zakladna_cena, vybrane: true });

    if (predajNehnutelnosti) polozky.push({ nazov: "📋 Predaj predošlej nehnuteľnosti", cena: 0, vybrane: true, kategoria: "sluzby" });
    if (hladaniePozemku) polozky.push({ nazov: "📋 Chcem pozemok pod svoj dom", cena: 0, vybrane: true, kategoria: "sluzby" });
    if (financneSluzby) polozky.push({ nazov: "📋 Finančné služby - úvery/poistky", cena: 0, vybrane: true, kategoria: "sluzby" });

    const montazCena = CENY.montaz[montazHolodomu];
    if (montazHolodomu === "ano") { polozky.push({ nazov: "Montáž holodomu", cena: montazCena, vybrane: true }); total += montazCena; }

    if (predlzenie > 0) {
      const predlzenieCena = CENY.predlzenie[predlzenie];
      polozky.push({ nazov: `Predĺženie domu +${predlzenie}m`, cena: predlzenieCena, vybrane: true });
      total += predlzenieCena;
    }

    const izolaciaCena = CENY.izolacia[izolaciaNavysenie];
    const izolaciaLabel = izolaciaNavysenie === "ultra" ? "Izolácia 300mm" : izolaciaNavysenie === "premium" ? "Izolácia 250mm" : izolaciaNavysenie === "zvysena" ? "Izolácia 200mm" : "Izolácia štandard";
    polozky.push({ nazov: izolaciaLabel, cena: izolaciaCena, vybrane: izolaciaNavysenie !== "standard" });
    if (izolaciaNavysenie !== "standard") total += izolaciaCena;

    const zakladyCena = CENY.zaklady[zaklady];
    const zakladyLabel = zaklady === "pasove" ? "Základy pásové" : zaklady === "doska" ? "Základy doska" : zaklady === "skrutky" ? "Základy pilóty/pätky" : "Základy (zákazník)";
    polozky.push({ nazov: zakladyLabel, cena: zakladyCena, vybrane: zaklady !== "bez" });
    if (zaklady !== "bez") total += zakladyCena;

    const dvereCena = CENY.dvere[vstupneDvere];
    const dvereLabel = vstupneDvere === "kovove" ? "Vstupné dvere kovové" : vstupneDvere === "plastove" ? "Vstupné dvere plastové" : "Vstupné dvere štandard";
    polozky.push({ nazov: dvereLabel, cena: dvereCena, vybrane: vstupneDvere !== "ziadne" });
    if (vstupneDvere !== "ziadne") total += dvereCena;

    if (elektroinstalacia) { polozky.push({ nazov: "Elektroinštalácia komplet", cena: CENY.elektroinstalacia, vybrane: true }); total += CENY.elektroinstalacia; }
    if (vodaKanalizacia) { polozky.push({ nazov: "Voda a kanalizácia", cena: CENY.vodaKanalizacia, vybrane: true }); total += CENY.vodaKanalizacia; }
    if (sanitaKomplet) { polozky.push({ nazov: "Sanita komplet", cena: CENY.sanitaKomplet, vybrane: true }); total += CENY.sanitaKomplet; }
    if (bojler) { polozky.push({ nazov: "Bojler", cena: CENY.bojler, vybrane: true }); total += CENY.bojler; }
    if (tepelneCerpadlo) { polozky.push({ nazov: "Tepelné čerpadlo", cena: CENY.tepelneCerpadlo, vybrane: true }); total += CENY.tepelneCerpadlo; }
    if (rekuperacia) { polozky.push({ nazov: "Rekuperácia", cena: CENY.rekuperacia, vybrane: true }); total += CENY.rekuperacia; }
    if (pripojkaSiete) { polozky.push({ nazov: "Pripojka siete", cena: CENY.pripojkaSiete, vybrane: true }); total += CENY.pripojkaSiete; }

    if (stresneOkno > 0) { const c = stresneOkno * CENY.stresneOkno; polozky.push({ nazov: `Strešné okno (${stresneOkno}×)`, cena: c, vybrane: true }); total += c; }
    if (bocneOknoFixne > 0) { const c = bocneOknoFixne * CENY.bocneOknoFixne; polozky.push({ nazov: `Bočné okno fixné (${bocneOknoFixne}×)`, cena: c, vybrane: true }); total += c; }
    if (bocneOknoVyklopne90 > 0) { const c = bocneOknoVyklopne90 * CENY.bocneOknoVyklopne90; polozky.push({ nazov: `Bočné okno vyklopné 90×205 (${bocneOknoVyklopne90}×)`, cena: c, vybrane: true }); total += c; }
    if (bocneOknoVyklopne55 > 0) { const c = bocneOknoVyklopne55 * CENY.bocneOknoVyklopne55; polozky.push({ nazov: `Bočné okno vyklopné 55×90 (${bocneOknoVyklopne55}×)`, cena: c, vybrane: true }); total += c; }
    if (povrchokaOkien) { polozky.push({ nazov: "Laminácia okien - antracit", cena: CENY.povrchokaOkien, vybrane: true }); total += CENY.povrchokaOkien; }
    if (tonovaneSkla) { polozky.push({ nazov: "Tónované sklá (Solar)", cena: CENY.tonovaneSkla, vybrane: true }); total += CENY.tonovaneSkla; }

    const interierCena = CENY.interierFinis[interierFinis];
    const interierLabel = interierFinis === "drevo" ? "Interiér - drevený obklad" : interierFinis === "sadrokarton" ? "Interiér - sadrokartón" : "Interiér bez finálnej úpravy";
    polozky.push({ nazov: interierLabel, cena: interierCena, vybrane: interierFinis !== "ziadne" });
    if (interierFinis !== "ziadne") total += interierCena;

    const fasadaCena = CENY.vonkajsiaFasada[vonkajsiaFasada];
    const fasadaLabel = vonkajsiaFasada === "suchana" ? "Fasáda - škúchaná omietka" : "Fasáda - drevo/plech";
    polozky.push({ nazov: fasadaLabel, cena: fasadaCena, vybrane: true });
    if (vonkajsiaFasada === "suchana") total += fasadaCena;

    if (vnutornePodlahy) { polozky.push({ nazov: "Vnútorné podlahy - laminát", cena: CENY.vnutornePodlahy, vybrane: true }); total += CENY.vnutornePodlahy; }
    if (podlahovVykurovanie) { polozky.push({ nazov: "Podlahové vykurovanie", cena: CENY.podlahovVykurovanie, vybrane: true }); total += CENY.podlahovVykurovanie; }
    if (interieroveDvere > 0) { const c = interieroveDvere * CENY.interieroveDvere; polozky.push({ nazov: `Interiérové dvere (${interieroveDvere}×)`, cena: c, vybrane: true }); total += c; }

    if (inziniering) { polozky.push({ nazov: "Inžiniering", cena: CENY.inziniering, vybrane: true }); total += CENY.inziniering; }
    if (projektA0) { polozky.push({ nazov: "Projekt A0 + certifikácia", cena: CENY.projektA0, vybrane: true }); total += CENY.projektA0; }
    if (revizna) { polozky.push({ nazov: "Revízna dokumentácia", cena: CENY.revizna, vybrane: true }); total += CENY.revizna; }
    if (doprava) { polozky.push({ nazov: "Doprava", cena: CENY.doprava, vybrane: true }); total += CENY.doprava; }

    const formatPrice = (p) => p.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Výber fotiek podľa pravidiel
    const vybraneFotky = [];
    
    // Úvodná fotka
    if (vonkajsiaFasada === "suchana") {
      vybraneFotky.push(dom.hlavny_obrazok);
    } else {
      vybraneFotky.push(dom.zakladna_konfiguracia_obrazok || dom.hlavny_obrazok);
    }

    // Galérie na základe výberu interiéru
    if (dom.galerie) {
      if (interierFinis === "drevo") {
        const gal = dom.galerie.find(g => g.typ === "interier_drevo");
        if (gal?.fotky) vybraneFotky.push(...gal.fotky.slice(0, 3));
      } else if (interierFinis === "sadrokarton") {
        const gal = dom.galerie.find(g => g.typ === "interier_sadrokarton");
        if (gal?.fotky) vybraneFotky.push(...gal.fotky.slice(0, 3));
      }

      if (vonkajsiaFasada === "standard") {
        const galExt = dom.galerie.find(g => g.typ === "exterier_drevo_plech");
        if (galExt?.fotky) vybraneFotky.push(...galExt.fotky.slice(0, 3));
      } else if (vonkajsiaFasada === "suchana") {
        const galMur = dom.galerie.find(g => g.typ === "exterier_murovka");
        if (galMur?.fotky) vybraneFotky.push(...galMur.fotky.slice(0, 3));
      }
    }

    // 2D a 3D pôdorysy vždy
    if (dom.podorys_2d) vybraneFotky.push(dom.podorys_2d);
    if (dom.podorys_3d) vybraneFotky.push(dom.podorys_3d);

    // Proxy URL pre watermark
    const proxyUrl = (url) => `https://qtrypzzcjebvfcihiynt.supabase.co/functions/v1/apply-watermark?url=${encodeURIComponent(url)}`;

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 700px; margin: 20px auto; background: white; }
    .header { background: linear-gradient(135deg, #EF4444 0%, #dc2626 100%); padding: 30px; text-align: center; color: white; }
    .logo { max-width: 200px; margin-bottom: 15px; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: bold; color: #EF4444; margin-bottom: 15px; border-bottom: 2px solid #EF4444; padding-bottom: 8px; }
    .client-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .house-info { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
    .house-img { max-width: 250px; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: bold; color: #374151; }
    .price { color: #059669; font-weight: bold; }
    .total { background: #dcfce7; font-size: 18px; font-weight: bold; }
    .footer { background: #1f2937; color: white; padding: 25px; text-align: center; }
    .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
    .gallery img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; }
    .services-box { background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${aktivneNastavenia?.logo_url ? `<img src="${aktivneNastavenia.logo_url}" alt="Logo" class="logo">` : '<h1>American Living</h1>'}
      <h1 style="margin: 0; font-size: 28px;">Cenová ponuka</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Číslo: ${cisloPonuky}</p>
    </div>

    <div class="content">
      <div class="client-info">
        <h3 style="margin-top: 0; color: #374151;">Informácie o klientovi</h3>
        <p style="margin: 5px 0;"><strong>Meno:</strong> ${klient_meno}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${klient_email}</p>
        <p style="margin: 5px 0;"><strong>Telefón:</strong> ${klient_telefon}</p>
        ${klient_adresa ? `<p style="margin: 5px 0;"><strong>Lokalita:</strong> ${klient_adresa}</p>` : ''}
      </div>

      <div class="section">
        <div class="section-title">Model domu</div>
        <div class="house-info">
          <img src="${proxyUrl(vybraneFotky[0])}" alt="${dom.nazov}" class="house-img">
          <div>
            <h2 style="margin: 0 0 10px 0; color: #1f2937;">${dom.nazov}</h2>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Výrobca:</strong> ${dom.vyrobca}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Zastavana plocha:</strong> ${dom.zastavana_plocha} m²</p>
            ${dom.uzitkova_plocha ? `<p style="margin: 5px 0; color: #6b7280;"><strong>Úžitková plocha:</strong> ${dom.uzitkova_plocha} m²</p>` : ''}
          </div>
        </div>
      </div>

      ${(predajNehnutelnosti || hladaniePozemku || financneSluzby) ? `
      <div class="services-box">
        <h3 style="margin-top: 0; color: #065f46;">📋 Dodatočné služby</h3>
        ${predajNehnutelnosti ? '<p style="margin: 5px 0;">✓ Predaj predošlej nehnuteľnosti</p>' : ''}
        ${hladaniePozemku ? '<p style="margin: 5px 0;">✓ Chcem pozemok pod svoj dom</p>' : ''}
        ${financneSluzby ? '<p style="margin: 5px 0;">✓ Finančné služby - úvery/poistky</p>' : ''}
      </div>` : ''}

      <div class="section">
        <div class="section-title">Rozpis ceny</div>
        <table>
          <thead>
            <tr>
              <th>Položka</th>
              <th style="text-align: right;">Cena s DPH</th>
            </tr>
          </thead>
          <tbody>
            ${polozky.filter(p => p.vybrane).map(p => `
              <tr>
                <td>${p.nazov}</td>
                <td class="price" style="text-align: right;">${formatPrice(p.cena)} €</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td><strong>CELKOM</strong></td>
              <td style="text-align: right;"><strong>${formatPrice(total)} €</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      ${vybraneFotky.length > 1 ? `
      <div class="section">
        <div class="section-title">Galéria</div>
        <div class="gallery">
          ${vybraneFotky.slice(1).map(url => `<img src="${proxyUrl(url)}" alt="Fotka">`).join('')}
        </div>
      </div>` : ''}

      <div class="section">
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Ďakujeme za váš záujem o naše domy. Táto ponuka je orientačná a môže sa líšiť v závislosti od finálnej špecifikácie.
          Pre viac informácií nás neváhajte kontaktovať.
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 5px 0; font-size: 16px;"><strong>American Living</strong></p>
      <p style="margin: 5px 0;">Telefón: +421 905 138 124</p>
      <p style="margin: 5px 0;">Email: info@americanliving.sk</p>
      <p style="margin: 5px 0;">Web: www.americanliving.sk</p>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: klient_email,
      subject: `Cenová ponuka - ${dom.nazov} - ${cisloPonuky}`,
      body: htmlEmail,
      from_name: 'American Living'
    });

    await base44.asServiceRole.entities.CenovaPonuka.create({
      cislo_ponuky: cisloPonuky,
      dom_id: dom_id,
      dom_nazov: dom.nazov,
      klient_meno,
      klient_email,
      klient_telefon,
      klient_adresa,
      konfigurator_data: {
        montazHolodomu, izolaciaNavysenie, zaklady, predlzenie, vstupneDvere,
        elektroinstalacia, vodaKanalizacia, sanitaKomplet, bojler, tepelneCerpadlo,
        rekuperacia, pripojkaSiete, stresneOkno, bocneOknoFixne, bocneOknoVyklopne90,
        bocneOknoVyklopne55, povrchokaOkien, tonovaneSkla, vonkajsiaFasada, interierFinis,
        vnutornePodlahy, podlahovVykurovanie, interieroveDvere, inziniering, projektA0,
        revizna, doprava, predajNehnutelnosti, hladaniePozemku, financneSluzby
      },
      celkova_cena: total,
      polozky,
      vybrane_fotky: vybraneFotky,
      status: 'odoslana',
      odoslana: true,
      datum_odoslania: new Date().toISOString()
    });

    await base44.asServiceRole.entities.CRMAktivita.create({
      typ: 'odoslana_ponuka',
      klient_email,
      klient_meno,
      popis: `Odoslaná cenová ponuka ${cisloPonuky} - ${dom.nazov}`,
      metadata: { cislo_ponuky: cisloPonuky, celkova_cena: total }
    });

    return Response.json({ success: true, cislo_ponuky: cisloPonuky });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});