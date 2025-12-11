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
    doc.text('Číslo ponuky: CP-2025-LYON', 20, 50);
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
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(dom?.nazov || 'Lyon 50m²', 20, yPos);
    yPos += 6;
    doc.text(`${dom?.vyrobca || 'Ticab house'} - ${dom?.typ_domu || 'Modulárny dom'}`, 20, yPos);
    yPos += 6;
    doc.text(`Zastavana plocha: ${dom?.zastavana_plocha || 50} m²`, 20, yPos);
    yPos += 6;
    if (dom?.uzitkova_plocha) {
      doc.text(`Úžitková plocha: ${dom.uzitkova_plocha} m²`, 20, yPos);
      yPos += 6;
    }
    
    // TYP STAVBY - DÔLEŽITÉ
    doc.setFont(undefined, 'bold');
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

    // Izolácia
    doc.text(`• Steny: ${konfiguraciaData.izolaciaStien}`, 25, yPos);
    yPos += 5;
    doc.text(`• Podlaha: ${konfiguraciaData.izolaciaPodlahy}`, 25, yPos);
    yPos += 5;
    doc.text(`• Strop: ${konfiguraciaData.izolaciaStropu}`, 25, yPos);
    yPos += 5;

    if (konfiguraciaData.tepelneCerpadlo === "ano") {
      doc.text(`• Tepelné čerpadlo`, 25, yPos);
      yPos += 5;
    }
    if (konfiguraciaData.rekuperacia === "ano") {
      doc.text(`• Rekuperácia`, 25, yPos);
      yPos += 5;
    }
    if (konfiguraciaData.podlahovoKurenie) {
      doc.text(`• Podlahové kúrenie`, 25, yPos);
      yPos += 5;
    }

    const fasadaText = konfiguraciaData.fasada === "drevo_smrek" ? "Drevo smrek" :
                       konfiguraciaData.fasada === "omietka" ? "Šúchaná omietka" :
                       konfiguraciaData.fasada === "smrekovec" ? "Smrekovec" :
                       konfiguraciaData.fasada === "falcovane" ? "Falcované panely" : "Thermowood";
    doc.text(`• Fasáda: ${fasadaText}`, 25, yPos);
    yPos += 5;

    const elektroText = konfiguraciaData.elektro === "eu" ? "EU štandard" :
                        konfiguraciaData.elektro === "cz" ? "CZ/SK štandard" : "GE štandard (A0)";
    doc.text(`• Elektroinštalácia: ${elektroText}`, 25, yPos);
    yPos += 5;

    if (konfiguraciaData.zaklady !== "bez") {
      const zakladyText = konfiguraciaData.zaklady === "vruty" ? "Zemné vruty" :
                          konfiguraciaData.zaklady === "patky" ? "Betónové pätky" : "Pásové betónové";
      doc.text(`• Základy: ${zakladyText}`, 25, yPos);
      yPos += 5;
    }

    if (konfiguraciaData.montaz) {
      doc.text(`• Montáž domu`, 25, yPos);
      yPos += 5;
    }

    if (konfiguraciaData.doprava) {
      doc.text(`• Doprava modulov`, 25, yPos);
      yPos += 5;
    }

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