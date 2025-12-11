import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

const removeDiacritics = (str) => {
  if (!str) return '';
  if (typeof str !== 'string') str = String(str);
  return str
    .replace(/á/g, 'a').replace(/Á/g, 'A')
    .replace(/ä/g, 'a').replace(/Ä/g, 'A')
    .replace(/č/g, 'c').replace(/Č/g, 'C')
    .replace(/ď/g, 'd').replace(/Ď/g, 'D')
    .replace(/é/g, 'e').replace(/É/g, 'E')
    .replace(/ě/g, 'e').replace(/Ě/g, 'E')
    .replace(/í/g, 'i').replace(/Í/g, 'I')
    .replace(/ľ/g, 'l').replace(/Ľ/g, 'L')
    .replace(/ĺ/g, 'l').replace(/Ĺ/g, 'L')
    .replace(/ň/g, 'n').replace(/Ň/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ô/g, 'o').replace(/Ô/g, 'O')
    .replace(/ř/g, 'r').replace(/Ř/g, 'R')
    .replace(/ŕ/g, 'r').replace(/Ŕ/g, 'R')
    .replace(/š/g, 's').replace(/Š/g, 'S')
    .replace(/ť/g, 't').replace(/Ť/g, 'T')
    .replace(/ú/g, 'u').replace(/Ú/g, 'U')
    .replace(/ů/g, 'u').replace(/Ů/g, 'U')
    .replace(/ý/g, 'y').replace(/Ý/g, 'Y')
    .replace(/ž/g, 'z').replace(/Ž/g, 'Z')
    .replace(/€/g, 'EUR')
    .replace(/²/g, '2')
    .replace(/³/g, '3');
};

const fetchImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const format = contentType.includes('png') ? 'PNG' : 'JPEG';
    
    return { base64: `data:${contentType};base64,${base64}`, format };
  } catch (e) {
    console.error('Chyba pri stiahnutí obrázka:', url, e);
    return null;
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.super_admin !== true)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dom, konfiguraciaData, klientData } = await req.json();

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

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 239, g: 68, b: 68 };
    };

    const mainColor = hexToRgb('#EF4444');

    // Header
    doc.setFillColor(mainColor.r, mainColor.g, mainColor.b);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(removeDiacritics('CENOVA PONUKA'), 20, 25);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('American Living', pageWidth - 20, 50, { align: 'right' });
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('+421 905 138 124', pageWidth - 20, 56, { align: 'right' });
    doc.text('info@americanliving.sk', pageWidth - 20, 61, { align: 'right' });
    doc.text('www.americanliving.sk', pageWidth - 20, 66, { align: 'right' });

    doc.setFontSize(10);
    doc.text(removeDiacritics(`Cislo ponuky: ${cisloPonuky}`), 20, 50);
    doc.text(removeDiacritics('Datum: ' + new Date().toLocaleDateString('sk-SK')), 20, 56);

    let yPos = 75;

    // Klient
    if (klientData.meno) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
      doc.text(removeDiacritics('Pre klienta:'), 20, yPos);
      yPos += 8;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(removeDiacritics(`Meno: ${klientData.meno}`), 20, yPos);
      yPos += 6;
      doc.text(removeDiacritics(`Email: ${klientData.email}`), 20, yPos);
      yPos += 6;
      doc.text(removeDiacritics(`Telefon: ${klientData.telefon}`), 20, yPos);
      yPos += 6;
      if (klientData.obec) {
        doc.text(removeDiacritics(`Obec: ${klientData.obec}`), 20, yPos);
        yPos += 6;
      }
      yPos += 6;
    }

    // Dom info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text(removeDiacritics('Vybrany model:'), 20, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(removeDiacritics(dom?.nazov || 'Prosto House'), 20, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(removeDiacritics(`Vyrobca: ${dom?.vyrobca || 'Prosto House'}`), 25, yPos);
    yPos += 5;
    doc.text(removeDiacritics(`Typ domu: ${dom?.typ_domu || 'Modularny dom'}`), 25, yPos);
    yPos += 5;
    if (dom?.zastavana_plocha) {
      doc.text(removeDiacritics(`Zastavana plocha: ${dom.zastavana_plocha} m2`), 25, yPos);
      yPos += 5;
    }
    if (dom?.uzitkova_plocha) {
      doc.text(removeDiacritics(`Uzitkova plocha: ${dom.uzitkova_plocha} m2`), 25, yPos);
      yPos += 5;
    }
    yPos += 10;

    // Konfigurácia
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text(removeDiacritics('Konfiguracia:'), 20, yPos);
    yPos += 7;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const formatPrice = (price) => {
      const num = typeof price === 'number' ? price : parseFloat(price);
      const parts = num.toFixed(2).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return parts.join(',') + ' EUR';
    };

    // Získaj galérie podľa mapovacích pravidiel
    const getMatchedGalleries = () => {
      if (!dom?.galerie) return [];
      
      const matchedGalleries = [];
      
      if (!aktivneNastavenie?.mapovanie_fotiek_prosto || aktivneNastavenie.mapovanie_fotiek_prosto.length === 0) {
        // Default - zobraz všetky galérie
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
      
      // Použij nastavené mapovanie podľa dlaždíc
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
      
      // Fallback - aspoň jedna galéria
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

    // Cenový rozpis z konfiguraciaData
    const polozkyDetail = konfiguraciaData.polozky || [];

    // Tabuľka
    doc.setFillColor(mainColor.r, mainColor.g, mainColor.b);
    doc.rect(20, yPos - 3, pageWidth - 40, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(removeDiacritics('Polozka:'), 25, yPos);
    doc.text('Cena', pageWidth - 25, yPos, { align: 'right' });
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    polozkyDetail.forEach((polozka, index) => {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      if (polozka.kategoria) {
        doc.setFillColor(mainColor.r, mainColor.g, mainColor.b);
        doc.rect(20, yPos - 4, pageWidth - 40, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(removeDiacritics(polozka.nazov), 25, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 9;
        return;
      }

      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 4, pageWidth - 40, 6, 'F');
      }

      if (!polozka.vybrane) {
        doc.setTextColor(150, 150, 150);
        doc.setFont(undefined, 'normal');

        const textNoDiacritics = removeDiacritics(polozka.nazov);
        const textWidth = doc.getTextWidth(textNoDiacritics);
        doc.line(25, yPos - 1, 25 + textWidth, yPos - 1);

        doc.text(textNoDiacritics, 25, yPos);
        if (polozka.cena !== null && polozka.cena !== undefined) {
          const priceText = removeDiacritics(formatPrice(polozka.cena));
          doc.text(priceText, pageWidth - 25, yPos, { align: 'right' });
        }

        doc.setTextColor(0, 0, 0);
      } else {
        const itemText = removeDiacritics(polozka.nazov);
        doc.text(itemText, 25, yPos);
        if (polozka.cena !== null && polozka.cena !== undefined) {
          const priceText = typeof polozka.cena === 'string' ? removeDiacritics(polozka.cena) : removeDiacritics(formatPrice(polozka.cena));
          doc.text(priceText, pageWidth - 25, yPos, { align: 'right' });
        }
      }

      yPos += 6;
    });

    yPos += 5;

    // Celková cena
    doc.setFillColor(0, 0, 0);
    doc.rect(20, yPos - 3, pageWidth - 40, 12, 'F');

    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(removeDiacritics('CELKOVA CENA s DPH'), 25, yPos + 4);
    doc.text(removeDiacritics(formatPrice(konfiguraciaData.totalPrice)), pageWidth - 25, yPos + 4, { align: 'right' });
    yPos += 18;

    doc.setTextColor(0, 0, 0);

    // Pôdorysy
    if (dom?.podorys_2d || dom?.podorys_3d) {
      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
      doc.text(removeDiacritics('Podorysy'), 20, yPos);
      yPos += 10;

      const podorysy = [];
      if (dom.podorys_2d) podorysy.push({ url: dom.podorys_2d, label: '2D podorys' });
      if (dom.podorys_3d) podorysy.push({ url: dom.podorys_3d, label: '3D podorys' });

      const imgWidth = 85;
      const imgHeight = 100;

      for (let i = 0; i < podorysy.length; i++) {
        const xPos = 20 + (i % 2) * 92;
        if (i === 2) {
          doc.addPage();
          yPos = 20;
        }

        const imageData = await fetchImageAsBase64(podorysy[i].url);
        if (imageData) {
          try {
            doc.addImage(imageData.base64, imageData.format, xPos, yPos, imgWidth, imgHeight);
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(podorysy[i].label, xPos + imgWidth/2, yPos + imgHeight + 5, { align: 'center' });
          } catch (e) {
            console.error('Chyba pri vkladani podorysu:', e);
          }
        }
      }

      yPos += imgHeight + 15;
    }

    // Galérie
    if (matchedGalleries.length > 0) {
      doc.addPage();
      yPos = 20;

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
      doc.text(removeDiacritics('Fotogaleria'), 20, yPos);
      yPos += 10;

      for (const galeria of matchedGalleries) {
        if (yPos > pageHeight - 80) {
          doc.addPage();
          yPos = 20;
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(removeDiacritics(galeria.nazov), 20, yPos);
        yPos += 7;

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        const maxFotky = Math.min(2, galeria.fotky.length);
        doc.text(removeDiacritics(`${maxFotky} z ${galeria.fotky.length} fotiek`), 25, yPos);
        yPos += 7;

        for (let i = 0; i < maxFotky; i++) {
          if (yPos > pageHeight - 75) {
            doc.addPage();
            yPos = 20;
          }

          try {
            const imgWidth = 85;
            const imgHeight = 60;
            const xPos = 20 + (i % 2) * 92;

            if (i % 2 === 0 && i > 0) yPos += 68;

            const imageData = await fetchImageAsBase64(galeria.fotky[i]);
            if (imageData) {
              doc.addImage(imageData.base64, imageData.format, xPos, yPos, imgWidth, imgHeight, undefined, 'FAST');

              doc.setFontSize(10);
              doc.setFont(undefined, 'bold');
              doc.setTextColor(200, 200, 200);
              doc.text('American Living', xPos + imgWidth/2, yPos + imgHeight/2, { align: 'center' });

              doc.setFontSize(7);
              doc.setFont(undefined, 'normal');
              doc.setTextColor(80, 80, 80);
              doc.text(removeDiacritics(`${galeria.nazov} - Fotka ${i + 1}`), xPos + imgWidth/2, yPos + imgHeight + 4, { align: 'center' });
            }
          } catch (e) {
            console.error('Chyba pri vkladani fotky:', galeria.fotky[i], e);
          }
        }

        yPos += 70;
      }
    }

    // Poznámka
    if (klientData.poznamka) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(removeDiacritics('Poznamka:'), 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const splitPoznamka = doc.splitTextToSize(removeDiacritics(klientData.poznamka), pageWidth - 40);
      doc.text(splitPoznamka, 20, yPos);
      yPos += splitPoznamka.length * 4 + 10;
    }

    // Päticka
    doc.setDrawColor(mainColor.r, mainColor.g, mainColor.b);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(removeDiacritics('Pre viac informacii nas nevahajte kontaktovat na +421 905 138 124 alebo info@americanliving.sk'), 
      pageWidth / 2, pageHeight - 20, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');
    
    const domSlug = (dom?.nazov || 'dom').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `cenova-ponuka-${domSlug}-${cisloPonuky}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${fileName}`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});