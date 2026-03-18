import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Môže byť volaný automaticky cron jobom
    const user = await base44.auth.isAuthenticated() ? await base44.auth.me() : null;

    // Nájdi ponuky ktoré potrebujú follow-up
    // Odoslané pred 3 dňami a neboli zatiaľ zobrazené, alebo max 2 follow-upy
    const ponuky = await base44.asServiceRole.entities.CenovaPonuka.list();
    const teraz = new Date();
    const tri_dni_ms = 3 * 24 * 60 * 60 * 1000;

    const ponukyNaFollowup = ponuky.filter(p => {
      if (p.status === 'akceptovana' || p.status === 'odmietnuta') return false;
      if (!p.datum_odoslania) return false;
      if (p.pocet_followup >= 2) return false; // Max 2 follow-upy

      const datumOdoslania = new Date(p.datum_odoslania);
      const casOdOdoslania = teraz - datumOdoslania;
      
      // Ak nebola zobrazená a prešli 3 dni
      if (!p.datum_zobrazenia && casOdOdoslania >= tri_dni_ms) {
        return true;
      }

      // Ak bol posledný follow-up pred viac ako 7 dňami
      if (p.datum_posledneho_followup) {
        const datumFollowup = new Date(p.datum_posledneho_followup);
        const casOdFollowup = teraz - datumFollowup;
        return casOdFollowup >= (7 * 24 * 60 * 60 * 1000);
      }

      return false;
    });

    const vysledky = [];

    for (const ponuka of ponukyNaFollowup) {
      try {
        const followupEmail = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6b7280; font-size: 14px; }
    .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Nezabudli ste na našu ponuku?</h1>
    </div>
    <div class="content">
      <p>Vážený/á ${ponuka.klient_meno},</p>
      
      <p>Chceli by sme Vás upozorniť na našu cenovú ponuku, ktorú sme Vám zaslali.</p>

      <div class="highlight">
        <strong>Ponuka #${ponuka.cislo_ponuky}</strong><br>
        Dom: ${ponuka.dom_nazov}<br>
        Cena: <strong>${ponuka.celkova_cena?.toLocaleString('sk-SK')} €</strong>
      </div>

      <p>Ponuka je stále platná a radi by sme Vám pomohli s realizáciou Vášho vysnívaného domu.</p>

      ${ponuka.pdf_url ? `
        <div style="text-align: center;">
          <a href="${ponuka.pdf_url}" class="button">📄 Zobraziť ponuku</a>
        </div>
      ` : ''}

      <p><strong>Máte otázky?</strong></p>
      <ul>
        <li>📞 Zavolajte nám: +421 905 138 124</li>
        <li>📧 Napíšte email: info@americanliving.sk</li>
        <li>💬 Alebo si dohodnite online konzultáciu</li>
      </ul>

      <p style="color: #ef4444; font-weight: bold;">⏰ Ponuka platí ešte ${Math.ceil((new Date(ponuka.datum_odoslania).getTime() + 30*24*60*60*1000 - teraz.getTime())/(24*60*60*1000))} dní!</p>

      <p>S pozdravom,<br>
      <strong>Tím American Living</strong></p>
    </div>
    <div class="footer">
      <p>American Living s.r.o. | www.americanliving.sk</p>
    </div>
  </div>
</body>
</html>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: "American Living",
          to: ponuka.klient_email,
          subject: `🏠 Pripomienka: Vaša cenová ponuka #${ponuka.cislo_ponuky}`,
          body: followupEmail
        });

        await base44.asServiceRole.entities.CenovaPonuka.update(ponuka.id, {
          datum_posledneho_followup: new Date().toISOString(),
          pocet_followup: (ponuka.pocet_followup || 0) + 1
        });

        vysledky.push({
          ponuka_id: ponuka.id,
          cislo_ponuky: ponuka.cislo_ponuky,
          status: 'odoslane'
        });
      } catch (err) {
        vysledky.push({
          ponuka_id: ponuka.id,
          cislo_ponuky: ponuka.cislo_ponuky,
          status: 'chyba',
          error: err.message
        });
      }
    }

    return Response.json({ 
      success: true,
      odoslanych_followup: vysledky.length,
      vysledky
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});