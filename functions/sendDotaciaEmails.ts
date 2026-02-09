import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { klientEmail, klientMeno, domId, typGrantu, domNazov, dotacia, lokalita, rozpocet, formaFinancovania } = await req.json();

    // Fetch house data with photos
    let houseData = null;
    let housePhotos = [];
    if (domId) {
      const houses = await base44.entities.Dom.filter({ id: domId });
      if (houses.length > 0) {
        houseData = houses[0];
        housePhotos = [houseData.hlavny_obrazok];
        if (houseData.zakladna_konfiguracia_obrazok) {
          housePhotos.push(houseData.zakladna_konfiguracia_obrazok);
        }
        if (houseData.galeria && houseData.galeria.length > 0) {
          housePhotos = [...housePhotos, ...houseData.galeria.slice(0, 3)];
        }
      }
    }

    // Construct email HTML
    const photoGallery = housePhotos.map(url => 
      `<div style="margin-bottom: 20px;">
        <img src="${url}" alt="Dom" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>`
    ).join('');

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #34D399 0%, #10B981 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">✅ Žiadosť prijatá!</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Dotácia AMERICANA - American Living</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; color: #10B981; font-weight: bold; margin-bottom: 20px;">Dobrý deň ${klientMeno},</p>
    
    <p style="margin-bottom: 20px; color: #555;">
      Ďakujeme za Vašu žiadosť o <strong>dotáciu AMERICANA</strong>. Vaša žiadosť bola úspešne zaznamenaná a zaradili ste sa medzi kandidátov na poskytnutie súkromného grantu od spoločnosti American Living.
    </p>

    <div style="background: #F0FDF4; border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; font-weight: bold; color: #10B981; margin-bottom: 10px;">📋 Detaily Vašej žiadosti:</p>
      <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
        ${typGrantu ? `<li><strong>Typ programu:</strong> ${typGrantu}</li>` : ''}
        ${domNazov ? `<li><strong>Vybraný dom:</strong> ${domNazov}</li>` : ''}
        ${dotacia ? `<li><strong>Výška dotácie:</strong> ${dotacia.toLocaleString()} €</li>` : ''}
        ${lokalita ? `<li><strong>Lokalita:</strong> ${lokalita}</li>` : ''}
        ${rozpocet ? `<li><strong>Rozpočet:</strong> ${rozpocet}</li>` : ''}
        ${formaFinancovania ? `<li><strong>Financovanie:</strong> ${formaFinancovania}</li>` : ''}
      </ul>
    </div>

    ${housePhotos.length > 0 ? `
    <div style="margin: 30px 0;">
      <h3 style="color: #10B981; font-size: 20px; margin-bottom: 15px;">🏡 Fotografie vybraného domu</h3>
      ${photoGallery}
    </div>
    ` : ''}

    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; font-weight: bold; color: #D97706; margin-bottom: 10px;">⏳ Ďalšie kroky:</p>
      <ol style="margin: 10px 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 8px;">Náš tím posúdi Vašu žiadosť v najbližších dňoch</li>
        <li style="margin-bottom: 8px;">Budeme Vás kontaktovať s dodatočnými informáciami</li>
        <li style="margin-bottom: 8px;">Ak spĺňate kritériá, dohodneme si stretnutie</li>
      </ol>
    </div>

    <div style="border-top: 2px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
      <h3 style="color: #10B981; font-size: 18px; margin-bottom: 15px;">📞 Kontaktujte nás</h3>
      <div style="background: #F9FAFB; padding: 15px; border-radius: 8px;">
        <p style="margin: 5px 0; color: #555;">
          <strong style="color: #10B981;">📧 Email:</strong> 
          <a href="mailto:info@americanliving.sk" style="color: #10B981; text-decoration: none;">info@americanliving.sk</a>
        </p>
        <p style="margin: 5px 0; color: #555;">
          <strong style="color: #10B981;">📞 Telefón:</strong> 
          <a href="tel:+421905138124" style="color: #10B981; text-decoration: none;">+421 905 138 124</a>
        </p>
        <p style="margin: 5px 0; color: #555;">
          <strong style="color: #10B981;">🌐 Web:</strong> 
          <a href="https://americanliving.sk" style="color: #10B981; text-decoration: none;">www.americanliving.sk</a>
        </p>
      </div>
    </div>

    <p style="margin-top: 30px; color: #888; font-size: 14px; text-align: center;">
      S pozdravom,<br>
      <strong style="color: #10B981;">Tým American Living</strong>
    </p>
  </div>
</body>
</html>`;

    // Send email to client
    await base44.integrations.Core.SendEmail({
      to: klientEmail,
      from_name: "American Living - Dotácia AMERICANA",
      subject: `✅ Potvrdenie žiadosti o dotáciu AMERICANA${domNazov ? ` - ${domNazov}` : ''}`,
      body: emailHtml
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});