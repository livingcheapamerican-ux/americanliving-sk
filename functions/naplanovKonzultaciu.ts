import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const { 
      klient_meno, 
      klient_email, 
      klient_telefon,
      datum_cas,
      typ_konzultacie,
      specialista,
      poznamka,
      dom_id,
      navrhnuty_terminy // AI môže navrhnúť viacero termínov
    } = await req.json();

    // Vytvoriť konzultačný termín
    const konzultacia = await base44.asServiceRole.entities.KonzultaciaTermin.create({
      klient_meno,
      klient_email,
      klient_telefon,
      datum_cas,
      typ_konzultacie: typ_konzultacie || "online",
      specialista: specialista || "vseobecny",
      poznamka: poznamka || "",
      dom_id: dom_id || null,
      status: "naplanovana"
    });

    // Odoslať email klientovi
    const typKonzultacieText = {
      "online": "Online stretnutie",
      "osobne": "Osobné stretnutie",
      "telefon": "Telefonická konzultácia"
    }[typ_konzultacie] || "Konzultácia";

    const specialistaText = {
      "financny_poradca": "Finančný poradca - hypotéky a financovanie",
      "technicky_poradca": "Technický poradca - konštrukcia a konfigurácia",
      "legislativny_poradca": "Legislatívny poradca - povolenia a predpisy",
      "vseobecny": "Všeobecný poradca"
    }[specialista] || "Odborník";

    const formatDatum = (datum) => {
      const d = new Date(datum);
      return d.toLocaleString('sk-SK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: klient_email,
      from_name: "American Living",
      subject: `Potvrdenie konzultácie - ${formatDatum(datum_cas)}`,
      body: `Dobrý deň ${klient_meno},

Ďakujeme za záujem o našu konzultáciu!

📅 DETAILY KONZULTÁCIE:
────────────────────────────
• Dátum a čas: ${formatDatum(datum_cas)}
• Typ: ${typKonzultacieText}
• Špecialista: ${specialistaText}
${poznamka ? `• Poznámka: ${poznamka}` : ''}

${typ_konzultacie === "online" ? `
💻 Pred stretnutím Vám pošleme link na online meeting.
` : typ_konzultacie === "telefon" ? `
📞 Zavoláme Vám na číslo: ${klient_telefon}
` : `
📍 Kontaktujeme Vás s adresou stretnutia.
`}

Ak potrebujete zmeniť termín alebo máte otázky, neváhajte nás kontaktovať:
📞 +421 905 138 124
📧 info@americanliving.sk

Tešíme sa na stretnutie s Vami!

S pozdravom,
Tím American Living
www.americanliving.sk`
    });

    // Odoslať notifikáciu adminom
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: "info@americanliving.sk",
      from_name: "American Living System",
      subject: `🆕 Nová konzultácia: ${klient_meno} - ${formatDatum(datum_cas)}`,
      body: `Nová konzultácia bola naplánovaná:

👤 Klient: ${klient_meno}
📧 Email: ${klient_email}
📞 Telefón: ${klient_telefon}
📅 Termín: ${formatDatum(datum_cas)}
🎯 Typ: ${typKonzultacieText}
👨‍💼 Špecialista: ${specialistaText}
${dom_id ? `🏠 Záujem o dom ID: ${dom_id}` : ''}
${poznamka ? `\n📝 Poznámka:\n${poznamka}` : ''}

────────────────────────────
Prihláste sa do administrácie pre viac detailov.`
    });

    return Response.json({ 
      success: true,
      konzultacia_id: konzultacia.id,
      datum_cas: formatDatum(datum_cas)
    });

  } catch (error) {
    console.error('Error scheduling consultation:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});