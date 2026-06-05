import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.super_admin !== true)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dom, konfiguraciaData, klientData } = await req.json();

    // Načítaj nastavenie cenovej ponuky
    const nastavenia = await base44.asServiceRole.entities.NastavenieCenovejPonuky.list();
    const aktivneNastavenie = nastavenia.find(n => n.aktivne) || nastavenia[0];

    // Použij PREVIEW číslo ponuky
    const cisloPonuky = `CP-${new Date().getFullYear()}-PREVIEW`;

    // Identifikácia typu stavby
    const isA0Configuration = () => {
      return (
        konfiguraciaData.izolaciaStien === "250mm" &&
        konfiguraciaData.izolaciaPodlahy === "200mm" &&
        konfiguraciaData.izolaciaStropu === "200mm" &&
        konfiguraciaData.tepelneCerpadlo === "ano" &&
        konfiguraciaData.rekuperacia === "ano" &&
        konfiguraciaData.elektro === "ge" &&
        konfiguraciaData.bleskozvod &&
        konfiguraciaData.prepat &&
        konfiguraciaData.inziniering &&
        konfiguraciaData.projektACertifikacia
      );
    };

    const isA0 = isA0Configuration();
    const typStavby = konfiguraciaData.ucel === "rodinny" && isA0 
      ? "Rodinný dom A0" 
      : "Rekreačná stavba";

    const formatPrice = (price) => {
      const num = typeof price === 'number' ? price : parseFloat(price);
      const parts = num.toFixed(2).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return parts.join(',') + ' €';
    };

    const row = (isSelected: boolean, label: string, price: string) => {
      const displayLabel = label.trim().startsWith('•') ? label.trim().substring(1).trim() : label.trim();
      if (isSelected) {
        return `<tr>
          <td>• ${displayLabel}</td>
          <td style="text-align: right;">${price}</td>
        </tr>`;
      } else {
        return `<tr style="color: #9ca3af; opacity: 0.6;">
          <td style="color: #9ca3af;">• <s>${displayLabel}</s></td>
          <td style="text-align: right; color: #9ca3af;"><s>${price}</s></td>
        </tr>`;
      }
    };

    // Cenník
    const CENY = {
      izolacia_stien_200mm: 1799.16,
      izolacia_stien_250mm: 1558.17,
      izolacia_podlahy_200mm: 334.08,
      izolacia_stropu_200mm: 271.44,
      tepelne_cerpadlo: 2889.27,
      pripravaNaRekuperaciu: 512,
      rekuperacia: 1155.36,
      podlahove_kurenie: 2253.30,
      klimatizacia: 902,
      pripravaKrb: 578.55,
      ochranaKachle: 1279.77,
      fasada_omietka: 1580.79,
      fasada_smrekovec: 3349.50,
      fasada_falcovane: 4953.78,
      fasada_thermowood: 6677.25,
      strecha_falcovane: 3227.70,
      odkvapy: 1502.49,
      dvere_kovove: 278.40,
      obklad_sadrokarton: 7855,
      obklad_osb: 5279,
      dvere_posuvne: 427.17,
      elektro_cz: 460.23,
      elektro_ge: 1583.40,
      bleskozvod: 856.08,
      prepat: 311.46,
      pripravaNaSolarnePanely: 1305,
      sprchovyKut: 645.54,
      vana: 501.12,
      bateria: 139.20,
      skrinka: 434.13,
      strop_kupelna_sadrokarton: 0,
      inziniering: 2773.56,
      projektACertifikacia: 3745.35,
      revizia: 1605.15,
      zaklady_vruty: 4494.42,
      zaklady_patky: 2568.24,
      zaklady_pasove: 11825.04,
      montaz: 4805.88,
      doprava: 8927.94
    };

    // Získaj galérie
    const getMatchedGalleries = () => {
      if (!dom?.galerie) return [];
      
      const matchedGalleries = [];
      
      if (!aktivneNastavenie?.mapovanie_fotiek_ticabhouse || aktivneNastavenie.mapovanie_fotiek_ticabhouse.length === 0) {
        if (konfiguraciaData.fasada === "omietka") {
          const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
          if (murovkaGaleria?.fotky?.length > 0) {
            matchedGalleries.push({ nazov: "Exteriér - Murovka", fotky: murovkaGaleria.fotky });
          }
        } else {
          const drevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
          if (drevoGaleria?.fotky?.length > 0) {
            matchedGalleries.push({ nazov: "Exteriér - Drevo/Plech", fotky: drevoGaleria.fotky });
          }
        }
        
        if (konfiguraciaData.obkladStien === "sadrokarton_tapeta") {
          const sadroGaleria = dom.galerie?.find(g => g.typ === "interier_sadrokarton");
          if (sadroGaleria?.fotky?.length > 0) {
            matchedGalleries.push({ nazov: "Interiér - Sadrokartón", fotky: sadroGaleria.fotky });
          }
        } else if (konfiguraciaData.obkladStien === "smrek_8cm" || konfiguraciaData.obkladStien === "smrek_bez_uzlov") {
          const drevoGaleria = dom.galerie?.find(g => g.typ === "interier_drevo");
          if (drevoGaleria?.fotky?.length > 0) {
            matchedGalleries.push({ nazov: "Interiér - Drevo", fotky: drevoGaleria.fotky });
          }
        }
        
        return matchedGalleries;
      }
      
      aktivneNastavenie.mapovanie_fotiek_ticabhouse.forEach(mapping => {
        const isActive = mapping.dlazdice_ids?.some(dlazdicaId => {
          if (dlazdicaId === "fasada_omietka" && konfiguraciaData.fasada === "omietka") return true;
          if (dlazdicaId === "fasada_smrekovec" && konfiguraciaData.fasada === "smrekovec") return true;
          if (dlazdicaId === "fasada_falcovane" && konfiguraciaData.fasada === "falcovane") return true;
          if (dlazdicaId === "fasada_thermowood" && konfiguraciaData.fasada === "thermowood") return true;
          if (dlazdicaId === "obklad_sadrokarton_tapeta" && konfiguraciaData.obkladStien === "sadrokarton_tapeta") return true;
          if (dlazdicaId === "obklad_smrek_bez_uzlov" && (konfiguraciaData.obkladStien === "smrek_bez_uzlov" || konfiguraciaData.obkladStien === "smrek_8cm")) return true;
          return false;
        });

        if (isActive) {
          const galeria = dom.galerie?.find(g => g.typ === mapping.galeria_typ);
          if (galeria && galeria.fotky?.length > 0) {
            matchedGalleries.push({
              nazov: mapping.galeria_nazov || galeria.nazov,
              fotky: galeria.fotky
            });
          }
        }
      });

      const maExterierovaGaleria = matchedGalleries.some(g => g.nazov && g.nazov.includes("Exteriér"));
      if (!maExterierovaGaleria) {
        if (konfiguraciaData.fasada === "omietka") {
          const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
          if (murovkaGaleria?.fotky?.length > 0) {
            matchedGalleries.unshift({ nazov: "Exteriér - Murovka", fotky: murovkaGaleria.fotky });
          }
        } else {
          const drevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
          if (drevoGaleria?.fotky?.length > 0) {
            matchedGalleries.unshift({ nazov: "Exteriér - Drevo/Plech", fotky: drevoGaleria.fotky });
          }
        }
      }

      return matchedGalleries;
    };

    const matchedGalleries = getMatchedGalleries();

    // Určiť ktorý obrázok zobraziť
    const getDisplayImage = () => {
      if (konfiguraciaData.fasada === "omietka") {
        return dom?.hlavny_obrazok;
      }
      return dom?.zakladna_konfiguracia_obrazok || dom?.hlavny_obrazok;
    };

    // Vytvor HTML email
    const htmlEmail = `
<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cenová ponuka ${cisloPonuky}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #EF4444 0%, #dc2626 100%); color: white; padding: 40px 30px; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .header-info { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; }
    .company-info { text-align: right; font-size: 12px; line-height: 1.6; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section-title { color: #EF4444; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #EF4444; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f9fafb; padding: 20px; border-radius: 8px; }
    .info-item { font-size: 13px; }
    .info-label { color: #6b7280; font-weight: 500; }
    .info-value { color: #111827; font-weight: 600; margin-top: 3px; }
    .badge { display: inline-block; background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-top: 8px; }
    .badge.blue { background: #3b82f6; }
    .image-container { position: relative; margin: 20px 0; border-radius: 8px; overflow: hidden; }
    .image-container img { width: 100%; height: auto; display: block; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.3); font-size: 32px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); pointer-events: none; }
    .price-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .price-table th { background: #EF4444; color: white; padding: 12px; text-align: left; font-size: 13px; }
    .price-table td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .price-table tr:nth-child(even) { background: #f9fafb; }
    .price-table .category { background: #f3f4f6; font-weight: bold; color: #EF4444; }
    /* .strikethrough removed */
    .total-price { background: #EF4444; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
    .total-price .label { font-size: 14px; opacity: 0.9; }
    .total-price .amount { font-size: 36px; font-weight: bold; margin-top: 5px; }
    .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    .gallery-item { position: relative; border-radius: 8px; overflow: hidden; }
    .gallery-item img { width: 100%; height: 200px; object-fit: cover; }
    .gallery-caption { background: #f3f4f6; padding: 8px; text-align: center; font-size: 11px; color: #6b7280; }
    .footer { background: #111827; color: #9ca3af; padding: 30px; text-align: center; font-size: 12px; }
    .footer a { color: #60a5fa; text-decoration: none; }
    .highlight-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .highlight-box.green { background: #d1fae5; border-left-color: #10b981; }
    .highlight-box.yellow { background: #fef3c7; border-left-color: #f59e0b; }
    .service-item { background: #f0f9ff; border: 2px solid #3b82f6; padding: 12px; border-radius: 8px; margin: 8px 0; }
    .service-item.selected { background: #dbeafe; border-color: #2563eb; }
    .service-item .title { font-weight: bold; color: #1e40af; margin-bottom: 4px; }
    .service-item .desc { font-size: 12px; color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-info">
        <div>
          <h1>CENOVÁ PONUKA</h1>
          <p style="margin: 5px 0;">Číslo ponuky: <strong>${cisloPonuky}</strong></p>
          <p style="margin: 5px 0;">Dátum: ${new Date().toLocaleDateString('sk-SK')}</p>
        </div>
        <div class="company-info">
          <strong style="font-size: 14px;">American Living</strong><br>
          +421 905 138 124<br>
          info@americanliving.sk<br>
          www.americanliving.sk
        </div>
      </div>
    </div>

    <div class="content">
      <!-- Klient info -->
      ${klientData.meno ? `
      <div class="section">
        <h2 class="section-title">Pre klienta</h2>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Meno:</div>
            <div class="info-value">${klientData.meno}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email:</div>
            <div class="info-value">${klientData.email}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Telefón:</div>
            <div class="info-value">${klientData.telefon}</div>
          </div>
          ${klientData.obec ? `
          <div class="info-item">
            <div class="info-label">Obec:</div>
            <div class="info-value">${klientData.obec}</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Vybraný model -->
      <div class="section">
        <h2 class="section-title">Vybraný model domu</h2>
        
        <div class="image-container">
          <img src="${konfiguraciaData.fasada === "omietka" ? dom?.hlavny_obrazok : (dom?.zakladna_konfiguracia_obrazok || dom?.hlavny_obrazok)}" alt="${dom?.nazov || 'Dom'}" style="max-height: 400px; object-fit: contain; background: #f9fafb;">
          <div class="watermark">American Living</div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Model:</div>
            <div class="info-value" style="font-size: 18px;">${dom?.nazov || 'Lyon 50m²'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Výrobca:</div>
            <div class="info-value">${dom?.vyrobca || 'Ticab house'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Typ domu:</div>
            <div class="info-value">${dom?.typ_domu || 'Modulárny dom'}</div>
          </div>
          ${dom?.pocet_modulov ? `
          <div class="info-item">
            <div class="info-label">Počet modulov:</div>
            <div class="info-value">${dom.pocet_modulov}</div>
          </div>
          ` : ''}
          ${dom?.pocet_izieb ? `
          <div class="info-item">
            <div class="info-label">Počet izieb:</div>
            <div class="info-value">max. ${dom.pocet_izieb}</div>
          </div>
          ` : ''}
          <div class="info-item">
            <div class="info-label">Zastavaná plocha:</div>
            <div class="info-value">${dom?.zastavana_plocha || 50} m²</div>
          </div>
          ${dom?.uzitkova_plocha ? `
          <div class="info-item">
            <div class="info-label">Úžitková plocha:</div>
            <div class="info-value">${dom.uzitkova_plocha} m²</div>
          </div>
          ` : ''}
          ${dom?.terasa_plocha ? `
          <div class="info-item">
            <div class="info-label">Terasa:</div>
            <div class="info-value">${dom.terasa_plocha} m²</div>
          </div>
          ` : ''}
        </div>

        <div class="${isA0 ? 'badge' : 'badge blue'}" style="display: block; text-align: center; margin-top: 15px;">
          Typ stavby: ${typStavby}
        </div>
      </div>

      <!-- Pôdorysy -->
      ${(dom?.podorys_2d || dom?.podorys_3d) ? `
      <div class="section">
        <h2 class="section-title">Pôdorysy</h2>
        <div class="gallery">
          ${dom?.podorys_2d ? `
          <div class="gallery-item">
            <div style="position: relative;">
              <img src="${dom.podorys_2d}" alt="2D pôdorys" style="height: 300px; object-fit: contain; background: #f9fafb; width: 100%;">
              <div class="watermark">American Living</div>
            </div>
            <div class="gallery-caption">2D pôdorys</div>
          </div>
          ` : ''}
          ${dom?.podorys_3d ? `
          <div class="gallery-item">
            <div style="position: relative;">
              <img src="${dom.podorys_3d}" alt="3D pôdorys" style="height: 300px; object-fit: contain; background: #f9fafb; width: 100%;">
              <div class="watermark">American Living</div>
            </div>
            <div class="gallery-caption">3D pôdorys</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <!-- Cenový rozpis -->
      <div class="section">
        <h2 class="section-title">Cenový rozpis konfigurácie</h2>
        
        <table class="price-table">
          <thead>
            <tr>
              <th>Položka</th>
              <th style="text-align: right;">Cena</th>
            </tr>
          </thead>
          <tbody>
            <!-- ÚČEL STAVBY -->
            <tr class="category"><td colspan="2">ÚČEL STAVBY</td></tr>
            ${row(!(konfiguraciaData.ucel !== 'chata'), `Rekreačná stavba`, `v cene`)}
            ${row(!(konfiguraciaData.ucel !== 'rodinny'), `Rodinný dom A0`, `v cene`)}

            <!-- 1. IZOLÁCIA -->
            <tr class="category"><td colspan="2">1. IZOLÁCIA</td></tr>
            <tr><td style="font-weight: 600;">Základná cena domu</td><td style="text-align: right; font-weight: 600;">${formatPrice(dom?.zakladna_cena || 0)}</td></tr>
            ${row(!(konfiguraciaData.izolaciaStien !== '150mm'), `Izolácia stien 150mm`, `v cene`)}
            ${row(!(konfiguraciaData.izolaciaStien !== '200mm'), `Izolácia stien 200mm`, `+ ${formatPrice(CENY.izolacia_stien_200mm)}`)}
            ${row(!(konfiguraciaData.izolaciaStien !== '250mm'), `Izolácia stien 250mm`, `+ ${formatPrice(CENY.izolacia_stien_250mm)}`)}
            ${row(!(konfiguraciaData.izolaciaPodlahy !== '150mm'), `Izolácia podlahy 150mm`, `v cene`)}
            ${row(!(konfiguraciaData.izolaciaPodlahy !== '200mm'), `Izolácia podlahy 200mm`, `+ ${formatPrice(CENY.izolacia_podlahy_200mm)}`)}
            ${row(!(konfiguraciaData.izolaciaStropu !== '150mm'), `Izolácia stropu 150mm`, `v cene`)}
            ${row(!(konfiguraciaData.izolaciaStropu !== '200mm'), `Izolácia stropu 200mm`, `+ ${formatPrice(CENY.izolacia_stropu_200mm)}`)}

            <!-- 2. VYKUROVANIE -->
            <tr class="category"><td colspan="2">2. VYKUROVANIE</td></tr>
            ${row(!(konfiguraciaData.tepelneCerpadlo !== 'nie'), `Príprava na vykurovanie`, `v cene`)}
            ${row(!(konfiguraciaData.tepelneCerpadlo !== 'ano'), `Tepelné čerpadlo`, `+ ${formatPrice(CENY.tepelne_cerpadlo)}`)}
            ${row(!(konfiguraciaData.rekuperacia === 'ano' || konfiguraciaData.pripravaNaRekuperaciu), `Bez rekuperácie`, `v cene`)}
            ${row(!(!konfiguraciaData.pripravaNaRekuperaciu), `Príprava na rekuperáciu`, `+ ${formatPrice(CENY.pripravaNaRekuperaciu)}`)}
            ${row(!(konfiguraciaData.rekuperacia !== 'ano'), `Rekuperácia`, `+ ${formatPrice(CENY.rekuperacia)}`)}
            ${row(!(!konfiguraciaData.podlahovoKurenie), `Podlahové kúrenie`, `+ ${formatPrice(CENY.podlahove_kurenie)}`)}
            ${row(!(!konfiguraciaData.pripravaNaKrb), `Príprava na krb`, `+ ${formatPrice(CENY.pripravaKrb)}`)}
            ${row(!(!konfiguraciaData.ochranaKachle), `Ochrana kachle`, `+ ${formatPrice(CENY.ochranaKachle)}`)}
            ${row(!(!konfiguraciaData.klimatizacia), `Príprava na klimatizáciu`, `+ ${formatPrice(CENY.klimatizacia)}`)}

            <!-- 3. FASÁDA -->
            <tr class="category"><td colspan="2">3. FASÁDA</td></tr>
            ${row(!(konfiguraciaData.fasada !== 'drevo_smrek'), `Fasáda - drevo smrek`, `v cene`)}
            ${row(!(konfiguraciaData.fasada !== 'omietka'), `Fasáda - šúchaná omietka`, `+ ${formatPrice(CENY.fasada_omietka)}`)}
            ${row(!(konfiguraciaData.fasada !== 'smrekovec'), `Fasáda - smrekovec`, `+ ${formatPrice(CENY.fasada_smrekovec)}`)}
            ${row(!(konfiguraciaData.fasada !== 'falcovane'), `Fasáda - falcované panely`, `+ ${formatPrice(CENY.fasada_falcovane)}`)}
            ${row(!(konfiguraciaData.fasada !== 'thermowood'), `Fasáda - thermowood`, `+ ${formatPrice(CENY.fasada_thermowood)}`)}

            <!-- 4. STRECHA -->
            <tr class="category"><td colspan="2">4. STRECHA</td></tr>
            ${row(!(konfiguraciaData.strecha !== 'korugovan_plech'), `Strecha - korugovaný plech`, `v cene`)}
            ${row(!(konfiguraciaData.strecha !== 'falcovane'), `Strecha - falcované panely`, `+ ${formatPrice(CENY.strecha_falcovane)}`)}
            ${row(!(konfiguraciaData.odkvapy !== 'nie'), `Bez odkvapov`, `v cene`)}
            ${row(!(konfiguraciaData.odkvapy !== 'ano'), `Odkvapy`, `+ ${formatPrice(CENY.odkvapy)}`)}

            <!-- 5. OKNÁ A DVERE -->
            <tr class="category"><td colspan="2">5. OKNÁ A DVERE</td></tr>
            ${row(!(konfiguraciaData.okna !== 'biele'), `Okná - biele 3-sklo`, `v cene`)}
            ${row(!(konfiguraciaData.okna !== 'antracit'), `Okná - antracit 3-sklo`, `v cene`)}
            ${row(!(konfiguraciaData.okna !== 'hnede'), `Okná - hnedé 3-sklo`, `v cene`)}
            ${row(!(konfiguraciaData.vchodoveDvere !== 'plastove'), `Vchodové dvere - plast/kov`, `v cene`)}
            ${row(!(konfiguraciaData.vchodoveDvere !== 'kovove'), `Vchodové dvere - kovové`, `+ ${formatPrice(CENY.dvere_kovove)}`)}

            <!-- 6. INTERIÉR -->
            <tr class="category"><td colspan="2">6. INTERIÉR</td></tr>
            ${row(!(konfiguraciaData.obkladStien !== 'smrek_8cm'), `Obklad - smrek 8cm`, `v cene`)}
            ${row(!(konfiguraciaData.obkladStien !== 'smrek_bez_uzlov'), `Obklad - smrek bez uzlov`, `v cene`)}
            ${row(!(konfiguraciaData.obkladStien !== 'sadrokarton_tapeta'), `Obklad - sadrokartón + tapeta`, `+ ${formatPrice(CENY.obklad_sadrokarton)}`)}
            ${row(!(konfiguraciaData.obkladStien !== 'osb_panel'), `Obklad - OSB panel`, `+ ${formatPrice(CENY.obklad_osb)}`)}
            <tr>
              <td>• Podlaha - laminát</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            ${row(!(konfiguraciaData.interieroveDvere !== 'kridlove'), `Interiérové dvere - krídlové`, `v cene`)}
            ${row(!(konfiguraciaData.interieroveDvere !== 'posuvne'), `Interiérové dvere - posuvné`, `+ ${formatPrice(CENY.dvere_posuvne)}`)}

            <!-- 7. ELEKTRO -->
            <tr class="category"><td colspan="2">7. ELEKTROINŠTALÁCIA</td></tr>
            ${row(!(konfiguraciaData.elektro !== 'eu'), `Elektro - EU štandard`, `v cene`)}
            ${row(!(konfiguraciaData.elektro !== 'cz'), `Elektro - CZ/SK štandard`, `+ ${formatPrice(CENY.elektro_cz)}`)}
            ${row(!(konfiguraciaData.elektro !== 'ge'), `Elektro - GE štandard (A0)`, `+ ${formatPrice(CENY.elektro_ge)}`)}
            ${row(!(!konfiguraciaData.bleskozvod), `Bleskozvod`, `+ ${formatPrice(CENY.bleskozvod)}`)}
            ${row(!(!konfiguraciaData.prepat), `Prepäťová ochrana`, `+ ${formatPrice(CENY.prepat)}`)}
            ${row(!(!konfiguraciaData.pripravaNaSolarnePanely), `Príprava na solárne panely`, `+ ${formatPrice(CENY.pripravaNaSolarnePanely)}`)}

            <!-- 8. KÚPEĽŇA -->
            <tr class="category"><td colspan="2">8. KÚPEĽŇA</td></tr>
            ${row(!(konfiguraciaData.sprchovyKut !== 'standard'), `Sprcha + WC Geberit`, `v cene`)}
            ${row(!(konfiguraciaData.sprchovyKut !== 'radaway'), `Sprchový kút Radaway`, `+ ${formatPrice(CENY.sprchovyKut)}`)}
            ${row(!(konfiguraciaData.bateria !== 'standard'), `Batéria - štandard`, `v cene`)}
            ${row(!(konfiguraciaData.bateria !== 'grohe'), `Batéria - Grohe`, `+ ${formatPrice(CENY.bateria)}`)}
            ${row(!(konfiguraciaData.stropKupelna !== 'drevo'), `Strop kúpeľňa - drevo`, `v cene`)}
            ${row(!(konfiguraciaData.stropKupelna !== 'sadrokarton'), `Strop kúpeľňa - sadrokartón`, `v cene`)}
            ${row(!(!konfiguraciaData.vana), `Vaňa`, `+ ${formatPrice(CENY.vana)}`)}
            ${row(!(!konfiguraciaData.skrinka), `Skrinka`, `+ ${formatPrice(CENY.skrinka)}`)}

            <!-- 9. ZÁKLADY -->
            <tr class="category"><td colspan="2">9. ZÁKLADY</td></tr>
            ${row(!(konfiguraciaData.zaklady !== 'bez'), `Bez základov`, `v cene`)}
            ${row(!(konfiguraciaData.zaklady !== 'vruty'), `Základy - zemné vruty`, `+ ${formatPrice(CENY.zaklady_vruty)}`)}
            ${row(!(konfiguraciaData.zaklady !== 'patky'), `Základy - betónové pätky`, `+ ${formatPrice(CENY.zaklady_patky)}`)}
            ${row(!(konfiguraciaData.zaklady !== 'pasove'), `Základy - pásové betónové`, `+ ${formatPrice(CENY.zaklady_pasove)}`)}

            <!-- 10. INŽINIERING -->
            <tr class="category"><td colspan="2">10. INŽINIERING A DOKUMENTÁCIA (A0)</td></tr>
            ${row(!(!konfiguraciaData.inziniering), `Inžiniering`, `+ ${formatPrice(CENY.inziniering)}`)}
            ${row(!(!konfiguraciaData.projektACertifikacia), `Projekt + Certifikácia A0`, `+ ${formatPrice(CENY.projektACertifikacia)}`)}
            ${row(!(!konfiguraciaData.revizia), `Revízna dokumentácia`, `+ ${formatPrice(CENY.revizia)}`)}

            <!-- 11. REALIZÁCIA -->
            <tr class="category"><td colspan="2">11. REALIZÁCIA</td></tr>
            ${row(!(!konfiguraciaData.montaz), `Montáž domu`, `+ ${formatPrice(CENY.montaz)}`)}
            ${row(!(!konfiguraciaData.doprava), `Doprava modulov`, `+ ${formatPrice(CENY.doprava)}`)}

            <!-- DODATOČNÉ SLUŽBY -->
            <tr class="category"><td colspan="2">DODATOČNÉ SLUŽBY</td></tr>
            ${row(!(!konfiguraciaData.predajNehnutelnosti), `Predaj predošlej nehnuteľnosti`, `na vyžiadanie`)}
            ${row(!(!konfiguraciaData.chcemPozemok), `Chcem pozemok pod svoj dom`, `na vyžiadanie`)}
            ${row(!(!konfiguraciaData.financneSluzby), `Finančné služby - úvery/pôžičky`, `na vyžiadanie`)}
          </tbody>
        </table>

        <!-- Vybrané dodatočné služby - detail -->
        ${(konfiguraciaData.predajNehnutelnosti || konfiguraciaData.chcemPozemok || konfiguraciaData.financneSluzby) ? `
        <div class="highlight-box">
          <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 15px;">✨ Vybrané dodatočné služby:</h3>
          ${konfiguraciaData.predajNehnutelnosti ? `
          <div class="service-item selected">
            <div class="title">✓ Predaj predošlej nehnuteľnosti</div>
            <div class="desc">Budú sa Vám venovať naši najlepší odborníci v realitách.</div>
          </div>
          ` : ''}
          ${konfiguraciaData.chcemPozemok ? `
          <div class="service-item selected">
            <div class="title">✓ Chcem pozemok pod svoj dom</div>
            <div class="desc">Pomôžeme Vám nájsť ideálny pozemok.</div>
          </div>
          ` : ''}
          ${konfiguraciaData.financneSluzby ? `
          <div class="service-item selected">
            <div class="title">✓ Finančné služby - úvery/pôžičky</div>
            <div class="desc">Budú sa Vám venovať naši najlepší finančníci.</div>
          </div>
          ` : ''}
        </div>
        ` : ''}
      </div>

      <!-- Celková cena -->
      <div class="total-price">
        <div class="label">CELKOVÁ CENA s DPH</div>
        <div class="amount">${formatPrice(konfiguraciaData.totalPrice)}</div>
      </div>

      <!-- Fotogalérie -->
      ${matchedGalleries.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Fotogaléria</h2>
        ${matchedGalleries.map(galeria => `
          <h3 style="color: #374151; font-size: 15px; margin: 20px 0 10px 0;">${galeria.nazov}</h3>
          <div class="gallery">
            ${galeria.fotky.slice(0, 6).map((img, idx) => `
            <div class="gallery-item">
              <div style="position: relative;">
                <img src="${img}" alt="${galeria.nazov} ${idx + 1}">
                <div class="watermark" style="font-size: 24px;">American Living</div>
              </div>
              <div class="gallery-caption">${galeria.nazov} - Fotka ${idx + 1}</div>
            </div>
            `).join('')}
          </div>
          ${galeria.fotky.length > 6 ? `<p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 10px;">+ ďalších ${galeria.fotky.length - 6} fotiek</p>` : ''}
        `).join('')}
      </div>
      ` : ''}

      <!-- Poznámka -->
      ${klientData.poznamka ? `
      <div class="section">
        <h2 class="section-title">Poznámka od klienta</h2>
        <div class="highlight-box yellow">
          <p style="margin: 0; line-height: 1.6;">${klientData.poznamka.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
      ` : ''}

      <!-- Upozornenie pre neúplnú A0 -->
      ${konfiguraciaData.ucel === "rodinny" && !isA0 ? `
      <div class="highlight-box yellow">
        <h3 style="margin: 0 0 10px 0; color: #d97706;">⚠️ Neúplná A0 konfigurácia</h3>
        <p style="margin: 0; line-height: 1.6; color: #78350f;">
          Aktuálna konfigurácia spĺňa požiadavky na <strong>rekreačnú stavbu</strong>. 
          Pre rodinný dom s certifikátom A0 je potrebné doplniť všetky povinné A0 položky.
        </p>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 10px 0;">Pre viac informácií nás neváhajte kontaktovať:</p>
      <p style="margin: 10px 0;">
        <strong>Telefón:</strong> <a href="tel:+421905138124">+421 905 138 124</a><br>
        <strong>Email:</strong> <a href="mailto:info@americanliving.sk">info@americanliving.sk</a><br>
        <strong>Web:</strong> <a href="https://www.americanliving.sk">www.americanliving.sk</a>
      </p>
      <p style="margin: 20px 0 10px 0; color: #6b7280; font-size: 11px;">
        &copy; ${new Date().getFullYear()} American Living. Všetky práva vyhradené.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Vráť HTML náhľad (BEZ odosielania a ukladania)
    return new Response(htmlEmail, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});