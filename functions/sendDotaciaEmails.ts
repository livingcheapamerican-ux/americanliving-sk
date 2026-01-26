import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Resend } from 'npm:resend@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data } = await req.json();

    // Get dopyt data
    const dopyt = data || {};
    const { meno, email, telefon, poznamka } = dopyt;

    // Extract účel from poznámka
    const ucel = poznamka?.includes('Bývanie') ? 'Bývanie (Program Ambassador)' : 
                 poznamka?.includes('Investícia') ? 'Investícia (Program Partner)' : 
                 'Neuvedený';

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Email pre klienta
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">DOTÁCIA AMERICANA</h1>
        </div>
        
        <div style="padding: 40px 20px; background: white;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Ďakujeme za váš záujem, ${meno}! 🎉</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Vaša žiadosť o dotáciu bola úspešne prijatá. Náš tím ju teraz spracováva.
          </p>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">📹 ČO ĎALEJ?</p>
            <p style="margin: 10px 0 0 0; color: #374151;">
              Do 24 hodín vám pošleme <strong>personalizovanú video odpoveď</strong> s detailmi o dotácii 
              pre váš účel: <strong>${ucel}</strong>
            </p>
          </div>

          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Ak máte akékoľvek otázky, neváhajte nás kontaktovať:
          </p>
          
          <p style="font-size: 14px; color: #6b7280;">
            📞 <a href="tel:+421905138124" style="color: #1e40af;">+421 905 138 124</a><br>
            📧 <a href="mailto:info@americanliving.sk" style="color: #1e40af;">info@americanliving.sk</a>
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">American Living - Partner pre váš domov aj biznis</p>
          <p style="margin: 5px 0 0 0;">Powered by AI 🤖</p>
        </div>
      </div>
    `;

    // Email pre tím
    const teamEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚨 NOVÝ DOPYT - DOTÁCIA AMERICANA</h1>
        </div>
        
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">Detaily dopytu:</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">Meno:</td>
              <td style="padding: 12px 0; color: #374151;">${meno}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #1e40af;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">Telefón:</td>
              <td style="padding: 12px 0;"><a href="tel:${telefon}" style="color: #1e40af;">${telefon}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">Účel:</td>
              <td style="padding: 12px 0; color: #374151;"><strong>${ucel}</strong></td>
            </tr>
          </table>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-weight: bold;">⚡ AKCIA POTREBNÁ:</p>
            <p style="margin: 10px 0 0 0; color: #92400e;">
              Vytvorte personalizované video pre ${meno} s detailmi o ${ucel === 'Bývanie (Program Ambassador)' ? 'programe Ambassador' : 'programe Partner'}.
            </p>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p style="margin: 0;">American Living - Interný systém</p>
        </div>
      </div>
    `;

    // Odoslať e-mail klientovi
    await resend.emails.send({
      from: 'American Living <info@americanliving.sk>',
      to: email,
      subject: '🎁 Dotácia Americana - Vaša žiadosť bola prijatá',
      html: clientEmailHtml
    });

    // Odoslať e-mail tímu
    await resend.emails.send({
      from: 'American Living System <info@americanliving.sk>',
      to: 'info@americanliving.sk',
      subject: `🚨 NOVÝ DOPYT - Dotácia Americana (${ucel}) - ${meno}`,
      html: teamEmailHtml
    });

    return Response.json({
      success: true,
      message: 'E-maily úspešne odoslané'
    });

  } catch (error) {
    console.error('Chyba pri odosielaní e-mailov:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});