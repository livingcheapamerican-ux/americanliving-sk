import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { dopyt } = await req.json();

    // Nájdi zodpovedného predajcu na základe lokality
    const predajcovia = await base44.asServiceRole.entities.Predajca.filter({ aktivny: true });
    
    let prirdenenyPredajca = null;
    
    // Priradenie na základe lokality
    if (dopyt.klient_adresa) {
      const lokalita = dopyt.klient_adresa.toLowerCase();
      prirdenenyPredajca = predajcovia.find(p => 
        p.priradene_uzemie?.some(u => lokalita.includes(u.toLowerCase()))
      );
    }
    
    // Priradenie na základe výrobcu domu (ak existuje dom_id)
    if (!prirdenenyPredajca && dopyt.dom_id) {
      const dom = await base44.asServiceRole.entities.Dom.filter({ id: dopyt.dom_id });
      if (dom && dom.length > 0) {
        prirdenenyPredajca = predajcovia.find(p => 
          p.priradene_vyrobcovia?.includes(dom[0].vyrobca)
        );
      }
    }
    
    // Default prvý aktívny predajca
    if (!prirdenenyPredajca && predajcovia.length > 0) {
      prirdenenyPredajca = predajcovia[0];
    }

    // Email notifikácia
    if (prirdenenyPredajca) {
      const emailBody = `
        <h2>🏡 Nový dopyt od klienta</h2>
        
        <h3>Informácie o klientovi:</h3>
        <ul>
          <li><strong>Meno:</strong> ${dopyt.klient_meno}</li>
          <li><strong>Email:</strong> ${dopyt.klient_email}</li>
          <li><strong>Telefón:</strong> ${dopyt.klient_telefon}</li>
          ${dopyt.klient_adresa ? `<li><strong>Lokalita:</strong> ${dopyt.klient_adresa}</li>` : ''}
        </ul>

        ${dopyt.dom_nazov ? `
        <h3>Záujem o model:</h3>
        <p><strong>${dopyt.dom_nazov}</strong></p>
        ` : ''}

        ${dopyt.poznamka ? `
        <h3>Poznámka od klienta:</h3>
        <p>${dopyt.poznamka.replace(/\n/g, '<br>')}</p>
        ` : ''}

        <p style="margin-top: 20px;">
          <a href="${Deno.env.get('BASE44_APP_URL') || 'https://app.americanliving.sk'}" 
             style="background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Otvoriť v systéme
          </a>
        </p>
      `;

      console.log('📧 Posielam email notifikáciu...');
      console.log('To:', prirdenenyPredajca.email);
      console.log('CC: info.americanliving@gmail.com');
      
      try {
        const emailResult = await base44.asServiceRole.functions.invoke('sendEmailResend', {
          to: prirdenenyPredajca.email,
          cc: 'info.americanliving@gmail.com',
          subject: `🏡 Nový dopyt: ${dopyt.klient_meno} - ${dopyt.dom_nazov || 'Všeobecný záujem'}`,
          html: emailBody
        });
        console.log('✅ Email odoslaný:', emailResult);
      } catch (emailError) {
        console.error('❌ Chyba pri odosielaní emailu:', emailError);
        throw emailError;
      }

      // Slack notifikácia ak je nastavená
      if (prirdenenyPredajca.slack_webhook) {
        await fetch(prirdenenyPredajca.slack_webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🏡 *Nový dopyt*\n\n*Klient:* ${dopyt.klient_meno}\n*Email:* ${dopyt.klient_email}\n*Telefón:* ${dopyt.klient_telefon}\n${dopyt.klient_adresa ? `*Lokalita:* ${dopyt.klient_adresa}\n` : ''}${dopyt.dom_nazov ? `*Model:* ${dopyt.dom_nazov}` : ''}`
          })
        });
      }
    }

    // Vytvor záznam aktivity
    await base44.asServiceRole.entities.CRMAktivita.create({
      typ: 'novy_dopyt',
      dopyt_id: dopyt.id,
      klient_email: dopyt.klient_email,
      klient_meno: dopyt.klient_meno,
      predajca_email: prirdenenyPredajca?.email,
      popis: `Nový dopyt z konfiguratora: ${dopyt.dom_nazov || 'Všeobecný záujem'}`,
      metadata: {
        lokalita: dopyt.klient_adresa,
        dom_nazov: dopyt.dom_nazov
      }
    });

    return Response.json({ 
      success: true, 
      priradeny_predajca: prirdenenyPredajca?.meno 
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});