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

    // Generuj unikátne číslo ponuky
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
    .price-table .strikethrough { color: #9ca3af; text-decoration: line-through; }
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
          <img src="${getDisplayImage()}" alt="${dom?.nazov || 'Dom'}" style="max-height: 400px; object-fit: contain; background: #f9fafb;">
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
            <tr class="${konfiguraciaData.ucel !== 'chata' ? 'strikethrough' : ''}">
              <td>• Rekreačná stavba</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.ucel !== 'rodinny' ? 'strikethrough' : ''}">
              <td>• Rodinný dom A0</td>
              <td style="text-align: right;">v cene</td>
            </tr>

            <!-- 1. IZOLÁCIA -->
            <tr class="category"><td colspan="2">1. IZOLÁCIA</td></tr>
            <tr><td style="font-weight: 600;">Základná cena domu</td><td style="text-align: right; font-weight: 600;">${formatPrice(dom?.zakladna_cena || 0)}</td></tr>
            <tr class="${konfiguraciaData.izolaciaStien !== '150mm' ? 'strikethrough' : ''}">
              <td>• Izolácia stien 150mm</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaStien !== '200mm' ? 'strikethrough' : ''}">
              <td>• Izolácia stien 200mm</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.izolacia_stien_200mm)}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaStien !== '250mm' ? 'strikethrough' : ''}">
              <td>• Izolácia stien 250mm</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.izolacia_stien_250mm)}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaPodlahy !== '150mm' ? 'strikethrough' : ''}">
              <td>• Izolácia podlahy 150mm</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaPodlahy !== '200mm' ? 'strikethrough' : ''}">
              <td>• Izolácia podlahy 200mm</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.izolacia_podlahy_200mm)}</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaStropu !== '150mm' ? 'strikethrough' : ''}">
              <td>• Izolácia stropu 150mm</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.izolaciaStropu !== '200mm' ? 'strikethrough' : ''}">
              <td>• Izolácia stropu 200mm</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.izolacia_stropu_200mm)}</td>
            </tr>

            <!-- 2. VYKUROVANIE -->
            <tr class="category"><td colspan="2">2. VYKUROVANIE</td></tr>
            <tr class="${konfiguraciaData.tepelneCerpadlo !== 'nie' ? 'strikethrough' : ''}">
              <td>• Príprava na vykurovanie</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.tepelneCerpadlo !== 'ano' ? 'strikethrough' : ''}">
              <td>• Tepelné čerpadlo</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.tepelne_cerpadlo)}</td>
            </tr>
            <tr class="${konfiguraciaData.rekuperacia === 'ano' || konfiguraciaData.pripravaNaRekuperaciu ? 'strikethrough' : ''}">
              <td>• Bez rekuperácie</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${!konfiguraciaData.pripravaNaRekuperaciu ? 'strikethrough' : ''}">
              <td>• Príprava na rekuperáciu</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.pripravaNaRekuperaciu)}</td>
            </tr>
            <tr class="${konfiguraciaData.rekuperacia !== 'ano' ? 'strikethrough' : ''}">
              <td>• Rekuperácia</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.rekuperacia)}</td>
            </tr>
            <tr class="${!konfiguraciaData.podlahovoKurenie ? 'strikethrough' : ''}">
              <td>• Podlahové kúrenie</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.podlahove_kurenie)}</td>
            </tr>
            <tr class="${!konfiguraciaData.pripravaNaKrb ? 'strikethrough' : ''}">
              <td>• Príprava na krb</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.pripravaKrb)}</td>
            </tr>
            <tr class="${!konfiguraciaData.ochranaKachle ? 'strikethrough' : ''}">
              <td>• Ochrana kachle</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.ochranaKachle)}</td>
            </tr>
            <tr class="${!konfiguraciaData.klimatizacia ? 'strikethrough' : ''}">
              <td>• Príprava na klimatizáciu</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.klimatizacia)}</td>
            </tr>

            <!-- 3. FASÁDA -->
            <tr class="category"><td colspan="2">3. FASÁDA</td></tr>
            <tr class="${konfiguraciaData.fasada !== 'drevo_smrek' ? 'strikethrough' : ''}">
              <td>• Fasáda - drevo smrek</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.fasada !== 'omietka' ? 'strikethrough' : ''}">
              <td>• Fasáda - šúchaná omietka</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.fasada_omietka)}</td>
            </tr>
            <tr class="${konfiguraciaData.fasada !== 'smrekovec' ? 'strikethrough' : ''}">
              <td>• Fasáda - smrekovec</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.fasada_smrekovec)}</td>
            </tr>
            <tr class="${konfiguraciaData.fasada !== 'falcovane' ? 'strikethrough' : ''}">
              <td>• Fasáda - falcované panely</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.fasada_falcovane)}</td>
            </tr>
            <tr class="${konfiguraciaData.fasada !== 'thermowood' ? 'strikethrough' : ''}">
              <td>• Fasáda - thermowood</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.fasada_thermowood)}</td>
            </tr>

            <!-- 4. STRECHA -->
            <tr class="category"><td colspan="2">4. STRECHA</td></tr>
            <tr class="${konfiguraciaData.strecha !== 'korugovan_plech' ? 'strikethrough' : ''}">
              <td>• Strecha - korugovaný plech</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.strecha !== 'falcovane' ? 'strikethrough' : ''}">
              <td>• Strecha - falcované panely</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.strecha_falcovane)}</td>
            </tr>
            <tr class="${konfiguraciaData.odkvapy !== 'nie' ? 'strikethrough' : ''}">
              <td>• Bez odkvapov</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.odkvapy !== 'ano' ? 'strikethrough' : ''}">
              <td>• Odkvapy</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.odkvapy)}</td>
            </tr>

            <!-- 5. OKNÁ A DVERE -->
            <tr class="category"><td colspan="2">5. OKNÁ A DVERE</td></tr>
            <tr class="${konfiguraciaData.okna !== 'biele' ? 'strikethrough' : ''}">
              <td>• Okná - biele 3-sklo</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.okna !== 'antracit' ? 'strikethrough' : ''}">
              <td>• Okná - antracit 3-sklo</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.okna !== 'hnede' ? 'strikethrough' : ''}">
              <td>• Okná - hnedé 3-sklo</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.vchodoveDvere !== 'plastove' ? 'strikethrough' : ''}">
              <td>• Vchodové dvere - plast/kov</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.vchodoveDvere !== 'kovove' ? 'strikethrough' : ''}">
              <td>• Vchodové dvere - kovové</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.dvere_kovove)}</td>
            </tr>

            <!-- 6. INTERIÉR -->
            <tr class="category"><td colspan="2">6. INTERIÉR</td></tr>
            <tr class="${konfiguraciaData.obkladStien !== 'smrek_8cm' ? 'strikethrough' : ''}">
              <td>• Obklad - smrek 8cm</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.obkladStien !== 'smrek_bez_uzlov' ? 'strikethrough' : ''}">
              <td>• Obklad - smrek bez uzlov</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.obkladStien !== 'sadrokarton_tapeta' ? 'strikethrough' : ''}">
              <td>• Obklad - sadrokartón + tapeta</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.obklad_sadrokarton)}</td>
            </tr>
            <tr class="${konfiguraciaData.obkladStien !== 'osb_panel' ? 'strikethrough' : ''}">
              <td>• Obklad - OSB panel</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.obklad_osb)}</td>
            </tr>
            <tr>
              <td>• Podlaha - laminát</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.interieroveDvere !== 'kridlove' ? 'strikethrough' : ''}">
              <td>• Interiérové dvere - krídlové</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.interieroveDvere !== 'posuvne' ? 'strikethrough' : ''}">
              <td>• Interiérové dvere - posuvné</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.dvere_posuvne)}</td>
            </tr>

            <!-- 7. ELEKTRO -->
            <tr class="category"><td colspan="2">7. ELEKTROINŠTALÁCIA</td></tr>
            <tr class="${konfiguraciaData.elektro !== 'eu' ? 'strikethrough' : ''}">
              <td>• Elektro - EU štandard</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.elektro !== 'cz' ? 'strikethrough' : ''}">
              <td>• Elektro - CZ/SK štandard</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.elektro_cz)}</td>
            </tr>
            <tr class="${konfiguraciaData.elektro !== 'ge' ? 'strikethrough' : ''}">
              <td>• Elektro - GE štandard (A0)</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.elektro_ge)}</td>
            </tr>
            <tr class="${!konfiguraciaData.bleskozvod ? 'strikethrough' : ''}">
              <td>• Bleskozvod</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.bleskozvod)}</td>
            </tr>
            <tr class="${!konfiguraciaData.prepat ? 'strikethrough' : ''}">
              <td>• Prepäťová ochrana</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.prepat)}</td>
            </tr>
            <tr class="${!konfiguraciaData.pripravaNaSolarnePanely ? 'strikethrough' : ''}">
              <td>• Príprava na solárne panely</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.pripravaNaSolarnePanely)}</td>
            </tr>

            <!-- 8. KÚPEĽŇA -->
            <tr class="category"><td colspan="2">8. KÚPEĽŇA</td></tr>
            <tr class="${konfiguraciaData.sprchovyKut !== 'standard' ? 'strikethrough' : ''}">
              <td>• Sprcha + WC Geberit</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.sprchovyKut !== 'radaway' ? 'strikethrough' : ''}">
              <td>• Sprchový kút Radaway</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.sprchovyKut)}</td>
            </tr>
            <tr class="${konfiguraciaData.bateria !== 'standard' ? 'strikethrough' : ''}">
              <td>• Batéria - štandard</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.bateria !== 'grohe' ? 'strikethrough' : ''}">
              <td>• Batéria - Grohe</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.bateria)}</td>
            </tr>
            <tr class="${konfiguraciaData.stropKupelna !== 'drevo' ? 'strikethrough' : ''}">
              <td>• Strop kúpeľňa - drevo</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.stropKupelna !== 'sadrokarton' ? 'strikethrough' : ''}">
              <td>• Strop kúpeľňa - sadrokartón</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${!konfiguraciaData.vana ? 'strikethrough' : ''}">
              <td>• Vaňa</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.vana)}</td>
            </tr>
            <tr class="${!konfiguraciaData.skrinka ? 'strikethrough' : ''}">
              <td>• Skrinka</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.skrinka)}</td>
            </tr>

            <!-- 9. ZÁKLADY -->
            <tr class="category"><td colspan="2">9. ZÁKLADY</td></tr>
            <tr class="${konfiguraciaData.zaklady !== 'bez' ? 'strikethrough' : ''}">
              <td>• Bez základov</td>
              <td style="text-align: right;">v cene</td>
            </tr>
            <tr class="${konfiguraciaData.zaklady !== 'vruty' ? 'strikethrough' : ''}">
              <td>• Základy - zemné vruty</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.zaklady_vruty)}</td>
            </tr>
            <tr class="${konfiguraciaData.zaklady !== 'patky' ? 'strikethrough' : ''}">
              <td>• Základy - betónové pätky</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.zaklady_patky)}</td>
            </tr>
            <tr class="${konfiguraciaData.zaklady !== 'pasove' ? 'strikethrough' : ''}">
              <td>• Základy - pásové betónové</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.zaklady_pasove)}</td>
            </tr>

            <!-- 10. INŽINIERING -->
            <tr class="category"><td colspan="2">10. INŽINIERING A DOKUMENTÁCIA (A0)</td></tr>
            <tr class="${!konfiguraciaData.inziniering ? 'strikethrough' : ''}">
              <td>• Inžiniering</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.inziniering)}</td>
            </tr>
            <tr class="${!konfiguraciaData.projektACertifikacia ? 'strikethrough' : ''}">
              <td>• Projekt + Certifikácia A0</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.projektACertifikacia)}</td>
            </tr>
            <tr class="${!konfiguraciaData.revizia ? 'strikethrough' : ''}">
              <td>• Revízna dokumentácia</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.revizia)}</td>
            </tr>

            <!-- 11. REALIZÁCIA -->
            <tr class="category"><td colspan="2">11. REALIZÁCIA</td></tr>
            <tr class="${!konfiguraciaData.montaz ? 'strikethrough' : ''}">
              <td>• Montáž domu</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.montaz)}</td>
            </tr>
            <tr class="${!konfiguraciaData.doprava ? 'strikethrough' : ''}">
              <td>• Doprava modulov</td>
              <td style="text-align: right;">+ ${formatPrice(CENY.doprava)}</td>
            </tr>

            <!-- DODATOČNÉ SLUŽBY - vždy zobrazené -->
            <tr class="category"><td colspan="2">DODATOČNÉ SLUŽBY</td></tr>
            <tr class="${!konfiguraciaData.predajNehnutelnosti ? 'strikethrough' : ''}">
              <td>• Predaj predošlej nehnuteľnosti</td>
              <td style="text-align: right;">na vyžiadanie</td>
            </tr>
            <tr class="${!konfiguraciaData.chcemPozemok ? 'strikethrough' : ''}">
              <td>• Chcem pozemok pod svoj dom</td>
              <td style="text-align: right;">na vyžiadanie</td>
            </tr>
            <tr class="${!konfiguraciaData.financneSluzby ? 'strikethrough' : ''}">
              <td>• Finančné služby - úvery/pôžičky</td>
              <td style="text-align: right;">na vyžiadanie</td>
            </tr>
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

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    // Odošli email klientovi
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'American Living <info@americanliving.sk>',
        to: klientData.email,
        subject: `Cenová ponuka ${cisloPonuky} - ${dom?.nazov || 'Lyon 50m²'} - American Living`,
        html: htmlEmail
      })
    });
    
    // Odošli ROVNAKÚ ponuku na firemný email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'American Living <info@americanliving.sk>',
        to: 'info.americanliving@gmail.com',
        subject: `[KÓPIA] Cenová ponuka ${cisloPonuky} - ${dom?.nazov || 'Lyon'} - ${klientData.meno}`,
        html: `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">📋 Interná kópia cenovej ponuky</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Klient:</strong> ${klientData.meno}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${klientData.email}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Telefón:</strong> ${klientData.telefon}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Celková cena:</strong> ${formatPrice(konfiguraciaData.totalPrice)}</p>
          </div>
          ${htmlEmail}
        `
      })
    });

    // Ulož do databázy
    const polozky = [];
    
    // Vytvor zoznam položiek
    polozky.push({ nazov: 'Základná cena domu', cena: dom?.zakladna_cena || 0, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.izolaciaStien === "200mm") polozky.push({ nazov: 'Izolácia stien 200mm', cena: CENY.izolacia_stien_200mm, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.izolaciaStien === "250mm") polozky.push({ nazov: 'Izolácia stien 250mm', cena: CENY.izolacia_stien_250mm, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.izolaciaPodlahy === "200mm") polozky.push({ nazov: 'Izolácia podlahy 200mm', cena: CENY.izolacia_podlahy_200mm, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.izolaciaStropu === "200mm") polozky.push({ nazov: 'Izolácia stropu 200mm', cena: CENY.izolacia_stropu_200mm, vybrane: true, kategoria: 'Izolácia' });
    if (konfiguraciaData.tepelneCerpadlo === "ano") polozky.push({ nazov: 'Tepelné čerpadlo', cena: CENY.tepelne_cerpadlo, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.rekuperacia === "ano") polozky.push({ nazov: 'Rekuperácia', cena: CENY.rekuperacia, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.pripravaNaRekuperaciu) polozky.push({ nazov: 'Príprava na rekuperáciu', cena: CENY.pripravaNaRekuperaciu, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.podlahovoKurenie) polozky.push({ nazov: 'Podlahové kúrenie', cena: CENY.podlahove_kurenie, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.klimatizacia) polozky.push({ nazov: 'Príprava na klimatizáciu', cena: CENY.klimatizacia, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.pripravaNaKrb) polozky.push({ nazov: 'Príprava na krb', cena: CENY.pripravaKrb, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.ochranaKachle) polozky.push({ nazov: 'Ochrana kachle', cena: CENY.ochranaKachle, vybrane: true, kategoria: 'Vykurovanie' });
    if (konfiguraciaData.fasada !== "drevo_smrek") {
      const fasadaNazov = konfiguraciaData.fasada === "omietka" ? "Šúchaná omietka" :
        konfiguraciaData.fasada === "smrekovec" ? "Smrekovec" :
        konfiguraciaData.fasada === "falcovane" ? "Falcované panely" : "Thermowood";
      polozky.push({ nazov: `Fasáda - ${fasadaNazov}`, cena: CENY[`fasada_${konfiguraciaData.fasada}`], vybrane: true, kategoria: 'Fasáda' });
    }
    if (konfiguraciaData.strecha === "falcovane") polozky.push({ nazov: 'Strecha - falcované panely', cena: CENY.strecha_falcovane, vybrane: true, kategoria: 'Strecha' });
    if (konfiguraciaData.odkvapy === "ano") polozky.push({ nazov: 'Odkvapy', cena: CENY.odkvapy, vybrane: true, kategoria: 'Strecha' });
    if (konfiguraciaData.vchodoveDvere === "kovove") polozky.push({ nazov: 'Vchodové dvere - kovové', cena: CENY.dvere_kovove, vybrane: true, kategoria: 'Okná a dvere' });
    if (konfiguraciaData.obkladStien === "sadrokarton_tapeta") polozky.push({ nazov: 'Obklad - sadrokartón + tapeta', cena: CENY.obklad_sadrokarton, vybrane: true, kategoria: 'Interiér' });
    if (konfiguraciaData.obkladStien === "osb_panel") polozky.push({ nazov: 'Obklad - OSB panel', cena: CENY.obklad_osb, vybrane: true, kategoria: 'Interiér' });
    if (konfiguraciaData.interieroveDvere === "posuvne") polozky.push({ nazov: 'Interiérové dvere - posuvné', cena: CENY.dvere_posuvne, vybrane: true, kategoria: 'Interiér' });
    if (konfiguraciaData.elektro === "cz") polozky.push({ nazov: 'Elektro - CZ/SK štandard', cena: CENY.elektro_cz, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.elektro === "ge") polozky.push({ nazov: 'Elektro - GE štandard (A0)', cena: CENY.elektro_ge, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.bleskozvod) polozky.push({ nazov: 'Bleskozvod', cena: CENY.bleskozvod, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.prepat) polozky.push({ nazov: 'Prepäťová ochrana', cena: CENY.prepat, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.pripravaNaSolarnePanely) polozky.push({ nazov: 'Príprava na solárne panely', cena: CENY.pripravaNaSolarnePanely, vybrane: true, kategoria: 'Elektro' });
    if (konfiguraciaData.sprchovyKut === "radaway") polozky.push({ nazov: 'Sprchový kút Radaway', cena: CENY.sprchovyKut, vybrane: true, kategoria: 'Kúpeľňa' });
    if (konfiguraciaData.vana) polozky.push({ nazov: 'Vaňa', cena: CENY.vana, vybrane: true, kategoria: 'Kúpeľňa' });
    if (konfiguraciaData.bateria === "grohe") polozky.push({ nazov: 'Batéria - Grohe', cena: CENY.bateria, vybrane: true, kategoria: 'Kúpeľňa' });
    if (konfiguraciaData.skrinka) polozky.push({ nazov: 'Skrinka', cena: CENY.skrinka, vybrane: true, kategoria: 'Kúpeľňa' });
    if (konfiguraciaData.zaklady === "vruty") polozky.push({ nazov: 'Základy - zemné vruty', cena: CENY.zaklady_vruty, vybrane: true, kategoria: 'Základy' });
    if (konfiguraciaData.zaklady === "patky") polozky.push({ nazov: 'Základy - betónové pätky', cena: CENY.zaklady_patky, vybrane: true, kategoria: 'Základy' });
    if (konfiguraciaData.zaklady === "pasove") polozky.push({ nazov: 'Základy - pásové betónové', cena: CENY.zaklady_pasove, vybrane: true, kategoria: 'Základy' });
    if (konfiguraciaData.inziniering) polozky.push({ nazov: 'Inžiniering', cena: CENY.inziniering, vybrane: true, kategoria: 'Služby' });
    if (konfiguraciaData.projektACertifikacia) polozky.push({ nazov: 'Projekt + Certifikácia A0', cena: CENY.projektACertifikacia, vybrane: true, kategoria: 'Služby' });
    if (konfiguraciaData.revizia) polozky.push({ nazov: 'Revízna dokumentácia', cena: CENY.revizia, vybrane: true, kategoria: 'Služby' });
    if (konfiguraciaData.montaz) polozky.push({ nazov: 'Montáž domu', cena: CENY.montaz, vybrane: true, kategoria: 'Realizácia' });
    if (konfiguraciaData.doprava) polozky.push({ nazov: 'Doprava modulov', cena: CENY.doprava, vybrane: true, kategoria: 'Realizácia' });

    // Ulož ponuku do databázy
    const novaPonuka = await base44.asServiceRole.entities.CenovaPonuka.create({
      cislo_ponuky: cisloPonuky,
      dom_id: dom?.id,
      dom_nazov: dom?.nazov || 'Lyon 50m²',
      klient_meno: klientData.meno,
      klient_email: klientData.email,
      klient_telefon: klientData.telefon,
      klient_adresa: klientData.obec || '',
      konfigurator_data: konfiguraciaData,
      celkova_cena: konfiguraciaData.totalPrice,
      polozky: polozky,
      status: 'odoslana',
      odoslana: true,
      datum_odoslania: new Date().toISOString(),
      predajca_email: user.email,
      nastavenie_id: aktivneNastavenie?.id
    });

    // Vytvor záznam aktivity v CRM
    await base44.asServiceRole.entities.CRMAktivita.create({
      typ: 'odoslana_ponuka',
      ponuka_id: novaPonuka.id,
      klient_email: klientData.email,
      klient_meno: klientData.meno,
      predajca_email: user.email,
      popis: `Odoslaná cenová ponuka ${cisloPonuky} - ${dom?.nazov || 'Lyon'} - ${formatPrice(konfiguraciaData.totalPrice)}`,
      metadata: {
        cislo_ponuky: cisloPonuky,
        dom_nazov: dom?.nazov,
        celkova_cena: konfiguraciaData.totalPrice,
        lokalita: klientData.obec
      }
    });

    return Response.json({ 
      success: true, 
      cislo_ponuky: cisloPonuky,
      message: 'Email s cenovou ponukou bol úspešne odoslaný'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});