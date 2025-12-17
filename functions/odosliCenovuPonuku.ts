import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ponuka_id } = await req.json();

    // Načítaj ponuku
    const ponuky = await base44.entities.CenovaPonuka.list();
    const ponuka = ponuky.find(p => p.id === ponuka_id);

    if (!ponuka) {
      return Response.json({ error: 'Ponuka nenájdená' }, { status: 404 });
    }

    // Email pre klienta
    const klientEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #EF4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6b7280; font-size: 14px; }
    .button { display: inline-block; background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .price { font-size: 32px; font-weight: bold; color: #EF4444; margin: 20px 0; }
    .details { background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Cenová ponuka #${ponuka.cislo_ponuky}</h1>
      <p>American Living - Modulárne domy</p>
    </div>
    <div class="content">
      <p>Vážený/á ${ponuka.klient_meno},</p>
      
      <p>Ďakujeme za Váš záujem o naše modulárne domy. Pripravili sme pre Vás cenovú ponuku na základe Vašich požiadaviek.</p>
      
      <div class="details">
        <strong>Dom:</strong> ${ponuka.dom_nazov}<br>
        <strong>Číslo ponuky:</strong> ${ponuka.cislo_ponuky}<br>
        <strong>Dátum vytvorenia:</strong> ${new Date(ponuka.created_date).toLocaleDateString('sk-SK')}
      </div>

      <div style="text-align: center;">
        <div class="price">${ponuka.celkova_cena?.toLocaleString('sk-SK')} €</div>
        <p style="color: #6b7280;">Celková cena s DPH</p>
      </div>

      ${ponuka.pdf_url ? `
        <div style="text-align: center;">
          <a href="${ponuka.pdf_url}" class="button">📄 Stiahnuť PDF ponuku</a>
        </div>
      ` : ''}

      <p>V prípade otázok alebo záujmu o ďalšie informácie nás neváhajte kontaktovať:</p>
      
      <ul>
        <li>📞 Telefón: +421 905 138 124</li>
        <li>📧 Email: info@americanliving.sk</li>
        <li>🌐 Web: www.americanliving.sk</li>
      </ul>

      <p><strong>Ponuka je platná 30 dní od dátumu vystavenia.</strong></p>

      <p>S pozdravom,<br>
      <strong>Tím American Living</strong></p>
    </div>
    <div class="footer">
      <p>American Living s.r.o. | www.americanliving.sk</p>
      <p style="font-size: 12px; color: #9ca3af;">Tento email bol odoslaný automaticky. Prosím neodpovedajte na túto správu.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Odošli email cez Resend s kópiou pre firmu
    await base44.functions.invoke('sendEmailResend', {
      to: ponuka.klient_email,
      cc: 'info.americanliving@gmail.com',
      subject: `Cenová ponuka #${ponuka.cislo_ponuky} - ${ponuka.dom_nazov}`,
      html: klientEmail
    });

    // Email pre predajcu
    const predajcaEmail = ponuka.predajca_email || user.email;
    const notifikaciaEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 20px; border: 1px solid #e5e7eb; }
    .info-box { background: #f3f4f6; padding: 15px; border-left: 4px solid #3b82f6; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🔔 Nová cenová ponuka odoslaná</h2>
    </div>
    <div class="content">
      <div class="info-box">
        <strong>Číslo ponuky:</strong> ${ponuka.cislo_ponuky}<br>
        <strong>Klient:</strong> ${ponuka.klient_meno}<br>
        <strong>Email:</strong> ${ponuka.klient_email}<br>
        <strong>Telefón:</strong> ${ponuka.klient_telefon || 'neuvedený'}<br>
        <strong>Dom:</strong> ${ponuka.dom_nazov}<br>
        <strong>Cena:</strong> ${ponuka.celkova_cena?.toLocaleString('sk-SK')} €<br>
        <strong>Dátum odoslania:</strong> ${new Date().toLocaleString('sk-SK')}
      </div>
      
      <p>Ponuka bola úspešne odoslaná klientovi.</p>
    </div>
  </div>
</body>
</html>
    `;

    await base44.functions.invoke('sendEmailResend', {
      to: predajcaEmail,
      subject: `📧 Cenová ponuka #${ponuka.cislo_ponuky} odoslaná - ${ponuka.klient_meno}`,
      html: notifikaciaEmail
    });

    // Aktualizuj status ponuky
    await base44.asServiceRole.entities.CenovaPonuka.update(ponuka_id, {
      odoslana: true,
      status: 'odoslana',
      datum_odoslania: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      message: 'Ponuka úspešne odoslaná'
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});