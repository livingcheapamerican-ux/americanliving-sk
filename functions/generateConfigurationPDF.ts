import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { domId, configuration, totalPrice, selectedItems, sendEmail, recipientEmail } = await req.json();

    // Fetch house data
    const houses = await base44.asServiceRole.entities.Dom.filter({ id: domId });
    const dom = houses[0];

    if (!dom) {
      return Response.json({ error: 'House not found' }, { status: 404 });
    }

    // Create PDF
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFillColor(239, 68, 68);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('American Living', 20, 20);
    doc.setFontSize(12);
    doc.text('Cenová ponuka', 20, 30);
    
    yPosition = 50;
    doc.setTextColor(0, 0, 0);

    // House info
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(dom.nazov, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Výrobca: ${dom.vyrobca}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Zastavaná plocha: ${dom.zastavana_plocha}m²`, 20, yPosition);
    yPosition += 6;
    if (dom.uzitkova_plocha) {
      doc.text(`Úžitková plocha: ${dom.uzitkova_plocha}m²`, 20, yPosition);
      yPosition += 6;
    }
    doc.text(`Základná cena: ${dom.zakladna_cena?.toLocaleString('sk-SK')} € s DPH`, 20, yPosition);
    yPosition += 12;

    // Configuration details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Vybraná konfigurácia:', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // Group items by section
    const sections = {
      base: { title: 'Základná cena', items: [] },
      hruba: { title: 'Hrubá stavba', items: [] },
      holodom: { title: 'Holodom', items: [] },
      kluc: { title: 'Dom na kľúč', items: [] },
      docs: { title: 'Dokumentácia', items: [] }
    };

    selectedItems.forEach(item => {
      if (item.selected && sections[item.section]) {
        sections[item.section].items.push(item);
      }
    });

    // Render sections
    Object.values(sections).forEach(section => {
      if (section.items.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text(section.title, 20, yPosition);
        yPosition += 6;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        section.items.forEach(item => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const itemName = item.name.length > 60 ? item.name.substring(0, 57) + '...' : item.name;
          doc.text(`• ${itemName}`, 25, yPosition);
          doc.text(`${item.price.toLocaleString('sk-SK')} €`, 170, yPosition, { align: 'right' });
          yPosition += 5;
        });
        yPosition += 5;
      }
    });

    // Total price
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    yPosition += 10;
    doc.setFillColor(34, 197, 94);
    doc.rect(15, yPosition - 8, 180, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('CELKOVÁ CENA S DPH:', 20, yPosition);
    doc.text(`${totalPrice.toLocaleString('sk-SK')} €`, 190, yPosition, { align: 'right' });
    
    // Footer
    yPosition += 20;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('American Living | +421 905 138 124 | info@americanliving.sk', 105, 280, { align: 'center' });
    doc.text(`Vygenerované: ${new Date().toLocaleDateString('sk-SK')}`, 105, 285, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    // Send email if requested
    if (sendEmail && recipientEmail) {
      try {
        // Upload PDF to temporary storage
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const fileName = `konfig_${dom.nazov.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        
        // Create form data
        const formData = new FormData();
        formData.append('file', pdfBlob, fileName);
        
        // Upload file
        const uploadResponse = await base44.asServiceRole.integrations.Core.UploadFile({
          file: pdfBlob
        });

        // Send email with attachment link
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: `Cenová ponuka - ${dom.nazov}`,
          body: `Dobrý deň,

prikladáme cenovú ponuku pre konfiguráciu domu ${dom.nazov}.

Celková cena: ${totalPrice.toLocaleString('sk-SK')} € s DPH

Link na stiahnutie PDF: ${uploadResponse.file_url}

S pozdravom,
American Living
+421 905 138 124
info@americanliving.sk`
        });

        return Response.json({ 
          success: true, 
          pdf: Array.from(new Uint8Array(pdfBytes)),
          emailSent: true 
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Continue without email
      }
    }

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="konfig_${dom.nazov.replace(/\s+/g, '_')}.pdf"`
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});