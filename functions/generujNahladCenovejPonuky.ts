import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && user.super_admin !== true)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { nastavenie } = await req.json();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Farby z nastavenia
    const hlavnaFarba = nastavenie.farba_hlavna || '#EF4444';
    const sekundarnaFarba = nastavenie.farba_sekundarna || '#dc2626';
    
    // Konverzia hex na RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 239, g: 68, b: 68 };
    };

    const mainColor = hexToRgb(hlavnaFarba);
    const secondaryColor = hexToRgb(sekundarnaFarba);

    // Header s farbou
    doc.setFillColor(mainColor.r, mainColor.g, mainColor.b);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo (ak je k dispozícii)
    if (nastavenie.logo_url) {
      try {
        // Logo by sa dal pridať, ale vyžaduje to async fetch a konverziu
        // Pre zjednodušenie len text
      } catch (e) {
        // Skip logo if error
      }
    }

    // Názov ponuky
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('CENOVÁ PONUKA', 20, 25);

    // Informácie o spoločnosti
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(nastavenie.nazov_spolocnosti || 'American Living', pageWidth - 20, 50, { align: 'right' });
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    let yPos = 56;
    if (nastavenie.adresa) {
      doc.text(nastavenie.adresa, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
    if (nastavenie.telefon) {
      doc.text(nastavenie.telefon, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
    if (nastavenie.email) {
      doc.text(nastavenie.email, pageWidth - 20, yPos, { align: 'right' });
      yPos += 5;
    }
    if (nastavenie.web) {
      doc.text(nastavenie.web, pageWidth - 20, yPos, { align: 'right' });
    }

    // Číslo ponuky
    doc.setFontSize(10);
    doc.text('Číslo ponuky: CP-2025-VZOR', 20, 50);
    doc.text('Dátum: ' + new Date().toLocaleDateString('sk-SK'), 20, 56);

    // Úvodný text
    yPos = 80;
    if (nastavenie.uvodni_text) {
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(nastavenie.uvodni_text, pageWidth - 40);
      doc.text(splitText, 20, yPos);
      yPos += splitText.length * 5 + 10;
    }

    // Pre klienta
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text('Pre klienta:', 20, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Meno: Ján Novák', 20, yPos);
    yPos += 6;
    doc.text('Email: jan.novak@email.com', 20, yPos);
    yPos += 6;
    doc.text('Telefón: +421 900 123 456', 20, yPos);
    yPos += 12;

    // Vybraný model
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text('Vybraný model:', 20, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('WASHINGTON (72 m²)', 20, yPos);
    yPos += 6;
    doc.text('Ticab house - Modulárny dom', 20, yPos);
    yPos += 12;

    // Cenová kalkulácia
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text('Cenová kalkulácia:', 20, yPos);
    yPos += 10;

    // Tabuľka
    doc.setFillColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
    doc.rect(20, yPos - 5, pageWidth - 40, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Položka', 25, yPos);
    doc.text('Cena', pageWidth - 25, yPos, { align: 'right' });
    yPos += 10;

    // Položky
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    const polozky = [
      { nazov: 'Základná cena domu', cena: '72 078 €' },
      { nazov: 'Izolácia stien 250mm', cena: '4 800 €' },
      { nazov: 'Tepelné čerpadlo', cena: '8 500 €' },
      { nazov: 'Podlahové kúrenie', cena: '3 200 €' },
      { nazov: 'Fasáda - šúchaná omietka', cena: '6 500 €' },
    ];

    polozky.forEach((polozka, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, yPos - 4, pageWidth - 40, 7, 'F');
      }
      doc.text(polozka.nazov, 25, yPos);
      doc.text(polozka.cena, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
    });

    // Celková cena
    yPos += 3;
    doc.setFillColor(mainColor.r, mainColor.g, mainColor.b, 0.1);
    doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(mainColor.r, mainColor.g, mainColor.b);
    doc.text('CELKOVÁ CENA s DPH', 25, yPos);
    doc.text('95 078 €', pageWidth - 25, yPos, { align: 'right' });
    yPos += 15;

    // Záverečný text
    if (nastavenie.zavery_text) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      const splitZavery = doc.splitTextToSize(nastavenie.zavery_text, pageWidth - 40);
      doc.text(splitZavery, 20, yPos);
      yPos += splitZavery.length * 4 + 10;
    }

    // Päticka
    doc.setDrawColor(mainColor.r, mainColor.g, mainColor.b);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const footerText = `Pre viac informácií nás neváhajte kontaktovať na ${nastavenie.telefon} alebo ${nastavenie.email}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 22, { align: 'center' });
    
    if (nastavenie.ico || nastavenie.dic || nastavenie.ic_dph) {
      const idText = `IČO: ${nastavenie.ico || ''} | DIČ: ${nastavenie.dic || ''} | IČ DPH: ${nastavenie.ic_dph || ''}`;
      doc.text(idText, pageWidth / 2, pageHeight - 16, { align: 'center' });
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=cenova-ponuka-nahlad.pdf'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});