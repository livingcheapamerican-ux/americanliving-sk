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

    // Email notifikácia - vždy pošli na info.americanliving@gmail.com
    const emailTo = prirdenenyPredajca?.email || 'info.americanliving@gmail.com';
    
    console.log('📧 Pripravujem email notifikáciu...');
    console.log('Priradený predajca:', prirdenenyPredajca?.meno || 'Žiadny (fallback na info)');
    console.log('Email to:', emailTo);
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
    console.log('To:', emailTo);
    console.log('CC: info.americanliving@gmail.com');
    
    try {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      
      const emailData = {
        from: 'American Living <info@americanliving.sk>',
        to: emailTo,
        cc: emailTo !== 'info.americanliving@gmail.com' ? 'info.americanliving@gmail.com' : undefined,
        subject: `🏡 Nový dopyt: ${dopyt.klient_meno} - ${dopyt.dom_nazov || 'Všeobecný záujem'}`,
        html: emailBody
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();
      console.log('✅ Email odoslaný:', result);
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (emailError) {
      console.error('❌ Chyba pri odosielaní emailu:', emailError);
      throw emailError;
    }

    // Slack notifikácia ak je nastavená
    if (prirdenenyPredajca?.slack_webhook) {
      await fetch(prirdenenyPredajca.slack_webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🏡 *Nový dopyt*\n\n*Klient:* ${dopyt.klient_meno}\n*Email:* ${dopyt.klient_email}\n*Telefón:* ${dopyt.klient_telefon}\n${dopyt.klient_adresa ? `*Lokalita:* ${dopyt.klient_adresa}\n` : ''}${dopyt.dom_nazov ? `*Model:* ${dopyt.dom_nazov}` : ''}`
        })
      });
    }

    // Vytvor záznam aktivity
    await base44.asServiceRole.entities.CRMAktivita.create({
      typ: 'novy_dopyt',
      dopyt_id: dopyt.id,
      klient_email: dopyt.klient_email,
      klient_meno: dopyt.klient_meno,
      predajca_email: emailTo,
      popis: `Nový dopyt z kontaktného formulára: ${dopyt.dom_nazov || 'Všeobecný záujem'}`,
      metadata: {
        lokalita: dopyt.klient_adresa,
        dom_nazov: dopyt.dom_nazov
      }
    });

    console.log('✅ Notifikácia úspešne spracovaná');
    return Response.json({ 
      success: true, 
      priradeny_predajca: prirdenenyPredajca?.meno || 'Default (info@americanliving.sk)',
      email_sent_to: emailTo
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});