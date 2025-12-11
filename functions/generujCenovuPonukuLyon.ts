import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

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

    // Identifikácia typu stavby podľa pravidiel A0
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
    doc.text('CENOVÁ PONUKA', 20, 25);

    // Informácie o spoločnosti
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('American Living', pageWidth - 20, 50, { align: 'right' });
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('+421 905 138 124', pageWidth - 20, 56, { align: 'right' });
    doc.text('info@americanliving.sk', pageWidth - 20, 61, { align: 'right' });
    doc.text('www.americanliving.sk', pageWidth - 20, 66, { align: 'right' });

    // Číslo ponuky
    doc.setFontSize(10);
    const domSlug = (dom?.nazov || 'LYON').toUpperCase().replace(/\s+/g, '-');
    doc.text(`Číslo ponuky: CP-2025-${domSlug}`, 20, 50);
    doc.text('Dátum: ' + new Date().toLocaleDateString('sk-SK'), 20, 56);

    let yPos = 75;

    // Pre klienta
    if (klientData.meno) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
      doc.text('Pre klienta:', 20, yPos);
      yPos += 8;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Meno: ${klientData.meno}`, 20, yPos);
      yPos += 6;
      doc.text(`Email: ${klientData.email}`, 20, yPos);
      yPos += 6;
      doc.text(`Telefón: ${klientData.telefon}`, 20, yPos);
      yPos += 6;
      if (klientData.obec) {
        doc.text(`Obec: ${klientData.obec}`, 20, yPos);
        yPos += 6;
      }
      yPos += 6;
    }

    // Vybraný model
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text('Vybraný model:', 20, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(dom?.nazov || 'Lyon 50m²', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Výrobca: ${dom?.vyrobca || 'Ticab house'}`, 25, yPos);
    yPos += 5;
    doc.text(`Typ domu: ${dom?.typ_domu || 'Modulárny dom'}`, 25, yPos);
    yPos += 5;
    if (dom?.pocet_modulov) {
      doc.text(`Moduly: ${dom.pocet_modulov}`, 25, yPos);
      yPos += 5;
    }
    if (dom?.pocet_izieb) {
      doc.text(`Počet izieb: max. ${dom.pocet_izieb}`, 25, yPos);
      yPos += 5;
    }
    doc.text(`Zastavaná plocha: ${dom?.zastavana_plocha || 50} m²`, 25, yPos);
    yPos += 5;
    if (dom?.uzitkova_plocha) {
      doc.text(`Úžitková plocha: ${dom.uzitkova_plocha} m²`, 25, yPos);
      yPos += 5;
    }
    if (dom?.terasa_plocha) {
      doc.text(`Terasa: ${dom.terasa_plocha} m²`, 25, yPos);
      yPos += 5;
    }
    if (dom?.energeticky_certifikat) {
      doc.text(`Možnosť energetického certifikátu A0: Áno`, 25, yPos);
      yPos += 5;
    }
    
    yPos += 3;
    
    // TYP STAVBY - DÔLEŽITÉ
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text(`Typ stavby: ${typStavby}`, 20, yPos);
    yPos += 10;

    // Konfigurácia
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text('Konfigurácia:', 20, yPos);
    yPos += 7;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    const formatPrice = (price) => price.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

    // Cenník
    const CENY = {
      izolacia_stien_200mm: 1799.16,
      izolacia_stien_250mm: 1558.17,
      izolacia_podlahy_200mm: 334.08,
      izolacia_stropu_200mm: 271.44,
      tepelne_cerpadlo: 2889.27,
      rekuperacia: 1155.36,
      podlahove_kurenie: 2253.30,
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
      sprchovyKut: 645.54,
      vana: 501.12,
      bateria: 139.20,
      skrinka: 434.13,
      inziniering: 2773.56,
      projektACertifikacia: 3745.35,
      revizia: 1605.15,
      zaklady_vruty: 4494.42,
      zaklady_patky: 2568.24,
      zaklady_pasove: 11825.04,
      montaz: 4805.88,
      doprava: 8927.94
    };

    // Získaj galérie podľa mapovaných pravidiel
    const getMatchedGalleries = () => {
      if (!dom?.galerie) return [];
      
      const matchedGalleries = [];
      
      // Ak nie je nastavenie, použij default logiku
      if (!aktivneNastavenie?.mapovanie_fotiek_ticabhouse || aktivneNastavenie.mapovanie_fotiek_ticabhouse.length === 0) {
        // Default pravidlá pre exteriér
        if (konfiguraciaData.fasada === "omietka") {
          const murovkaGaleria = dom.galerie?.find(g => g.typ === "exterier_murovka");
          if (murovkaGaleria?.fotky?.length > 0) {
            matchedGalleries.push({
              nazov: "Exteriér - Murovka",
              fotky: murovkaGaleria.fotky
            });
          }
        } else if (konfiguraciaData.fasada === "drevo_smrek" || konfiguraciaData.fasada === "smrekovec" || 
                   konfiguraciaData.fasada === "falcovane" || konfiguraciaData.fasada === "thermowood") {
          const drevoGaleria = dom.galerie?.find(g => g.typ === "exterier_drevo_plech");
          if (drevoGaleria?.fotky?.length > 0) {
            matchedGalleries.push({
              nazov: "Exteriér - Drevo/Plech",
              fotky: drevoGaleria.fotky
            });
          }
        }
        
        // Default pravidlá pre interiér
        if (konfiguraciaData.obkladStien === "sadrokarton_tapeta") {
          const sadroGaleria = dom.galerie?.find(g => g.typ === "interier_sadrokarton");
          if (sadroGaleria?.fotky?.length > 0) {
            matchedGalleries.push({
              nazov: "Interiér - Sadrokartón",
              fotky: sadroGaleria.fotky
            });
          }
        } else if (konfiguraciaData.obkladStien === "smrek_8cm" || konfiguraciaData.obkladStien === "smrek_bez_uzlov") {
          const drevoGaleria = dom.galerie?.find(g => g.typ === "interier_drevo");
          if (drevoGaleria?.fotky?.length > 0) {
            matchedGalleries.push({
              nazov: "Interiér - Drevo",
              fotky: drevoGaleria.fotky
            });
          }
        }
        
        return matchedGalleries;
      }
      
      // Použij nastavené mapovanie
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
      
      return matchedGalleries;
    };

    const matchedGalleries = getMatchedGalleries();

    // Cenový rozpis - Detail položiek
    const polozkyDetail = [];
    
    polozkyDetail.push({ nazov: 'Základná cena domu', cena: 73431 });
    
    if (konfiguraciaData.izolaciaStien === "200mm") polozkyDetail.push({ nazov: 'Izolácia stien 200mm', cena: CENY.izolacia_stien_200mm });
    if (konfiguraciaData.izolaciaStien === "250mm") polozkyDetail.push({ nazov: 'Izolácia stien 250mm', cena: CENY.izolacia_stien_250mm });
    if (konfiguraciaData.izolaciaPodlahy === "200mm") polozkyDetail.push({ nazov: 'Izolácia podlahy 200mm', cena: CENY.izolacia_podlahy_200mm });
    if (konfiguraciaData.izolaciaStropu === "200mm") polozkyDetail.push({ nazov: 'Izolácia stropu 200mm', cena: CENY.izolacia_stropu_200mm });
    if (konfiguraciaData.tepelneCerpadlo === "ano") polozkyDetail.push({ nazov: 'Tepelné čerpadlo', cena: CENY.tepelne_cerpadlo });
    if (konfiguraciaData.rekuperacia === "ano") polozkyDetail.push({ nazov: 'Rekuperácia', cena: CENY.rekuperacia });
    if (konfiguraciaData.podlahovoKurenie) polozkyDetail.push({ nazov: 'Podlahové kúrenie', cena: CENY.podlahove_kurenie });
    if (konfiguraciaData.pripravaNaKrb) polozkyDetail.push({ nazov: 'Príprava na krb', cena: CENY.pripravaKrb });
    if (konfiguraciaData.ochranaKachle) polozkyDetail.push({ nazov: 'Ochrana kachle', cena: CENY.ochranaKachle });
    if (konfiguraciaData.fasada === "omietka") polozkyDetail.push({ nazov: 'Fasáda - šúchaná omietka', cena: CENY.fasada_omietka });
    if (konfiguraciaData.fasada === "smrekovec") polozkyDetail.push({ nazov: 'Fasáda - smrekovec', cena: CENY.fasada_smrekovec });
    if (konfiguraciaData.fasada === "falcovane") polozkyDetail.push({ nazov: 'Fasáda - falcované panely', cena: CENY.fasada_falcovane });
    if (konfiguraciaData.fasada === "thermowood") polozkyDetail.push({ nazov: 'Fasáda - thermowood', cena: CENY.fasada_thermowood });
    if (konfiguraciaData.strecha === "falcovane") polozkyDetail.push({ nazov: 'Strecha - falcované panely', cena: CENY.strecha_falcovane });
    if (konfiguraciaData.odkvapy === "ano") polozkyDetail.push({ nazov: 'Odkvapy', cena: CENY.odkvapy });
    if (konfiguraciaData.vchodoveDvere === "kovove") polozkyDetail.push({ nazov: 'Kovové dvere', cena: CENY.dvere_kovove });
    if (konfiguraciaData.obkladStien === "sadrokarton_tapeta") polozkyDetail.push({ nazov: 'Obklad - sadrokartón + tapeta', cena: CENY.obklad_sadrokarton });
    if (konfiguraciaData.obkladStien === "osb_panel") polozkyDetail.push({ nazov: 'Obklad - OSB panel', cena: CENY.obklad_osb });
    if (konfiguraciaData.interieroveDvere === "posuvne") polozkyDetail.push({ nazov: 'Posuvné dvere', cena: CENY.dvere_posuvne });
    if (konfiguraciaData.elektro === "cz") polozkyDetail.push({ nazov: 'Elektro - CZ/SK štandard', cena: CENY.elektro_cz });
    if (konfiguraciaData.elektro === "ge") polozkyDetail.push({ nazov: 'Elektro - GE štandard (A0)', cena: CENY.elektro_ge });
    if (konfiguraciaData.bleskozvod) polozkyDetail.push({ nazov: 'Bleskozvod', cena: CENY.bleskozvod });
    if (konfiguraciaData.prepat) polozkyDetail.push({ nazov: 'Prepäťová ochrana', cena: CENY.prepat });
    if (konfiguraciaData.sprchovyKut === "radaway") polozkyDetail.push({ nazov: 'Sprchový kút Radaway', cena: CENY.sprchovyKut });
    if (konfiguraciaData.vana) polozkyDetail.push({ nazov: 'Vaňa', cena: CENY.vana });
    if (konfiguraciaData.bateria === "grohe") polozkyDetail.push({ nazov: 'Batéria Grohe', cena: CENY.bateria });
    if (konfiguraciaData.skrinka) polozkyDetail.push({ nazov: 'Skrinka', cena: CENY.skrinka });
    if (konfiguraciaData.inziniering) polozkyDetail.push({ nazov: 'Inžiniering', cena: CENY.inziniering });
    if (konfiguraciaData.projektACertifikacia) polozkyDetail.push({ nazov: 'Projekt + Certifikácia A0', cena: CENY.projektACertifikacia });
    if (konfiguraciaData.revizia) polozkyDetail.push({ nazov: 'Revízna dokumentácia', cena: CENY.revizia });
    if (konfiguraciaData.zaklady === "vruty") polozkyDetail.push({ nazov: 'Základy - zemné vruty', cena: CENY.zaklady_vruty });
    if (konfiguraciaData.zaklady === "patky") polozkyDetail.push({ nazov: 'Základy - betónové pätky', cena: CENY.zaklady_patky });
    if (konfiguraciaData.zaklady === "pasove") polozkyDetail.push({ nazov: 'Základy - pásové betónové', cena: CENY.zaklady_pasove });
    if (konfiguraciaData.montaz) polozkyDetail.push({ nazov: 'Montáž domu', cena: CENY.montaz });
    if (konfiguraciaData.doprava) polozkyDetail.push({ nazov: 'Doprava modulov', cena: CENY.doprava });

    // Tabuľka cenových položiek
    doc.setFillColor(mainColor.r, mainColor.g, mainColor.b);
    doc.rect(20, yPos - 3, pageWidth - 40, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Položka', 25, yPos);
    doc.text('Cena', pageWidth - 25, yPos, { align: 'right' });
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    polozkyDetail.forEach((polozka, index) => {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 4, pageWidth - 40, 6, 'F');
      }
      
      doc.text(polozka.nazov, 25, yPos);
      doc.text(formatPrice(polozka.cena), pageWidth - 25, yPos, { align: 'right' });
      yPos += 6;
    });

    yPos += 5;

    // Celková cena
    doc.setFillColor(mainColor.r, mainColor.g, mainColor.b, 0.1);
    doc.rect(20, yPos - 3, pageWidth - 40, 12, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text('CELKOVÁ CENA s DPH', 25, yPos + 4);
    doc.text(formatPrice(konfiguraciaData.totalPrice), pageWidth - 25, yPos + 4, { align: 'right' });
    yPos += 18;

    // Pôdorysy
    if (dom?.podorys_2d || dom?.podorys_3d) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
      doc.text('Pôdorysy:', 20, yPos);
      yPos += 8;
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text('(Pôdorysy sú k dispozícii v prílohe alebo na vyžiadanie)', 25, yPos);
      yPos += 10;
    }

    // Galérie s fotkami (s watermarkom) - nová stránka
    if (matchedGalleries.length > 0) {
      doc.addPage();
      yPos = 20;
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
      doc.text('Fotogaléria', 20, yPos);
      yPos += 10;
      
      for (const galeria of matchedGalleries) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(galeria.nazov, 20, yPos);
        yPos += 7;
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`${Math.min(6, galeria.fotky.length)} z ${galeria.fotky.length} fotiek`, 25, yPos);
        yPos += 7;
        
        // Aplikuj watermark a pridaj fotky do PDF
        const fotkyNaStranku = Math.min(6, galeria.fotky.length);
        for (let i = 0; i < fotkyNaStranku; i++) {
          if (yPos > pageHeight - 70) {
            doc.addPage();
            yPos = 20;
          }
          
          try {
            // Stiahnuť obrázok a pridať watermark text pri vkladaní
            const imgWidth = 80;
            const imgHeight = 60;
            const xPos = 20 + (i % 2) * 90;
            
            if (i % 2 === 0 && i > 0) yPos += 65;
            
            // Pridaj obrázok
            doc.setFillColor(240, 240, 240);
            doc.rect(xPos, yPos, imgWidth, imgHeight, 'F');
            
            // Watermark v strede
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(150, 150, 150);
            doc.text('American Living', xPos + imgWidth/2, yPos + imgHeight/2, { align: 'center' });
            
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.text(`${galeria.nazov} - Fotka ${i + 1}`, xPos + imgWidth/2, yPos + imgHeight - 5, { align: 'center' });
            
          } catch (e) {
            console.error('Chyba pri vkladaní fotky:', e);
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
      doc.text('Poznámka:', 20, yPos);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      const splitPoznamka = doc.splitTextToSize(klientData.poznamka, pageWidth - 40);
      doc.text(splitPoznamka, 20, yPos);
      yPos += splitPoznamka.length * 4 + 10;
    }

    // Päticka
    doc.setDrawColor(mainColor.r, mainColor.g, mainColor.b);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Pre viac informácií nás neváhajte kontaktovať na +421 905 138 124 alebo info@americanliving.sk', 
      pageWidth / 2, pageHeight - 20, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=cenova-ponuka-lyon.pdf'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});