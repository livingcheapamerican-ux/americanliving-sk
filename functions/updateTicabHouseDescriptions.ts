import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const TICAB_HOUSE_DATA = {
  "MAJORCA": {
    rozmery: { sirka: 3.55, dlzka: 13.6, vyska: 3.3 },
    vyska_stropu: "2,93 – 3,0 m",
    pocet_modulov: 1,
    rozmery_transport: "13,6 x 3,55 x 3,3 m",
    specifikacia: `Plocha: 46 m²
Počet modulov: 1
Rozmery (Transport): 13,6 x 3,55 x 3,3 m
Výška stropu: 2,93 – 3,0 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Kombinácia škandinávskeho smreku a imitácie falcovaného plechu
Strecha: Falcovaný plech

✔ INTERIÉR
Obklad stien: Prírodný drevený obklad

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC, sprcha Grohe
Kuchyňa: Kuchynská zástena, kuchynský nábytok
Extra: Vstavaná terasa (5,9 m²)

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Vykurovanie: Elektrické (zásuvky pod oknami pripravené pre elektrické konvektory)
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  },
  
  "OTTAWA": {
    rozmery: { sirka: 3.95, dlzka: 12.6, vyska: 3.5 },
    vyska_stropu: "2,23 – 2,91 m",
    pocet_modulov: 1,
    rozmery_transport: "12,6 x 3,95 x 3,5 m",
    specifikacia: `Plocha: 47,5 m²
Počet modulov: 1
Rozmery (Transport): 12,6 x 3,95 x 3,5 m
Výška stropu: 2,23 – 2,91 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Smrekovec (Larch)
Strecha: Plechová krytina (imitácia škridly)

✔ INTERIÉR
Obklad stien: Prírodný drevený obklad

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC (sprcha voliteľná)
Kuchyňa: Kuchynská zástena, kuchynský nábytok

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Vykurovanie: Elektrické (zásuvky pod oknami pripravené pre elektrické konvektory)
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  },

  "DUBLIN": {
    rozmery: { sirka: 4.1, dlzka: 11.6, vyska: 3.7 },
    vyska_stropu: "2,35 – 3,11 m",
    pocet_modulov: 1,
    rozmery_transport: "11,6 x 4,1 x 3,7 m",
    specifikacia: `Plocha: 46 m²
Počet modulov: 1
Rozmery (Transport): 11,6 x 4,1 x 3,7 m
Výška stropu: 2,35 – 3,11 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Falcovaný plech
Strecha: Falcovaný plech

✔ INTERIÉR
Obklad stien: Prírodný drevený obklad (10 cm)

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC, sprcha Grohe
Kuchyňa: Kuchynská zástena, kuchynský nábytok
Vykurovanie: Podlahové kúrenie (izby + kúpeľňa)

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  },

  "ALESSANDRIA": {
    rozmery: { sirka: 3.55, dlzka: 13.7, vyska: 3.5 },
    vyska_stropu: "2,31 – 2,68 m",
    pocet_modulov: 3,
    rozmery_transport: "2 ks (13,7 x 3,55 x 3,3 m) + 1 ks (13,7 x 3,55 x 3,5 m)",
    specifikacia: `Plocha: 130 m²
Počet modulov: 3
Rozmery (Transport): 2 ks (13,7 x 3,55 x 3,3 m) + 1 ks (13,7 x 3,55 x 3,5 m)
Výška stropu: 2,31 – 2,68 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Škandinávsky smrek
Strecha: Falcovaný plech

✔ INTERIÉR
Obklad stien: Prírodný drevený obklad alebo laminátové panely

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC, sprcha Grohe
Kuchyňa: Kuchynská zástena (kuchynský nábytok a podlahové kúrenie voliteľné)

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Vykurovanie: Elektrické (zásuvky pod oknami pripravené pre elektrické konvektory)
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  },

  "LONDON": {
    rozmery: { sirka: 3.55, dlzka: 10.8, vyska: 3.3 },
    vyska_stropu: "2,24 – 2,81 m",
    pocet_modulov: 4,
    rozmery_transport: "4 ks modulov (10,8 x 3,55 x 3,3 m)",
    specifikacia: `Plocha: 144 m²
Počet modulov: 4
Rozmery (Transport): 4 ks modulov (10,8 x 3,55 x 3,3 m)
Výška stropu: 2,24 – 2,81 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Termodrevo a kompozitné panely
Strecha: Plechová krytina

✔ INTERIÉR
Obklad stien: Sadrokartón a tapeta

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC, sprcha Grohe, vaňa (na 2. poschodí)
Kuchyňa: Kuchynská zástena, kuchynský nábytok
Vykurovanie: Podlahové kúrenie (na 1. poschodí)

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Vykurovanie: Podlahové kúrenie na 1. poschodí, príprava pre konvektory
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  },

  "GRINDAVÍK": {
    rozmery: { sirka: 3.55, dlzka: 13.7, vyska: 3.3 },
    vyska_stropu: "2,2 – 2,9 m",
    pocet_modulov: 2,
    specifikacia: `Plocha: 103 m²
Počet modulov: 2
Výška stropu: 2,2 – 2,9 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Falcovaný plech
Strecha: Falcovaný plech

✔ INTERIÉR
Obklad stien: Prírodný drevený obklad

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC, sprcha Grohe
Kuchyňa: Kuchynská zástena, kuchynský nábytok
Vykurovanie: Podlahové kúrenie (izby + kúpeľňa)

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  },

  "NATAL": {
    rozmery: { sirka: 3.55, dlzka: 13.7, vyska: 3.3 },
    vyska_stropu: "2,25 – 2,7 m",
    pocet_modulov: 2,
    specifikacia: `Plocha: 95 m²
Počet modulov: 2
Výška stropu: 2,25 – 2,7 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Škandinávsky smrek
Strecha: Plechová krytina

✔ INTERIÉR
Obklad stien: Prírodný drevený obklad

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC, sprcha Grohe
Kuchyňa: Kuchynská zástena, kuchynský nábytok
Vykurovanie: Podlahové kúrenie (izby + kúpeľňa)
Extra: Terasa 25,4 m² v cene

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  },

  "LISBON": {
    rozmery: { sirka: 3.55, dlzka: 13.7, vyska: 3.3 },
    vyska_stropu: "2,25 – 2,7 m",
    pocet_modulov: 2,
    specifikacia: `Plocha: 95 m²
Počet modulov: 2
Výška stropu: 2,25 – 2,7 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Kombinácia škandinávskeho smreku a imitácie falcovaného plechu
Strecha: Škandinávsky smrek

✔ INTERIÉR
Obklad stien: Prírodný drevený obklad

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC, sprcha Grohe
Kuchyňa: Kuchynská zástena, kuchynský nábytok
Vykurovanie: Podlahové kúrenie
Extra: Vstavaná terasa (11 m²)

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  },

  "BARCELONA": {
    rozmery: { sirka: 3.55, dlzka: 13.7, vyska: 3.3 },
    vyska_stropu: "1,42 – 2,85 m",
    pocet_modulov: 2,
    specifikacia: `Plocha: 70 m²
Počet modulov: 2
Výška stropu: 1,42 – 2,85 m

✔ KONŠTRUKCIA
Rám: Sušené kalibrované drevo ošetrené bio-ochranným náterom

✔ IZOLÁCIA
Podlaha a strop: 200 mm minerálna vlna (stlačená na 150 mm)
Steny: 150 mm čadičová vlna

✔ OKNÁ A DVERE
Okná: Dvojkomorové plastové okná, laminované, energeticky úsporné
Vstupné dvere: Plastové bezpečnostné
Interiérové dvere: MDF

✔ EXTERIÉR
Fasáda: Kombinácia škandinávskeho smreku a imitácie falcovaného plechu
Strecha: Falcovaný plech

✔ INTERIÉR
Obklad stien: Prírodný drevený obklad alebo laminátové panely

✔ VYBAVENIE V CENE
Kúpeľňa: Umývadlo, Geberit WC, sprcha Grohe
Kuchyňa: Kuchynská zástena

✔ TECHNICKÉ INŠTALÁCIE
Elektroinštalácia: Medené rozvody, zásuvky, LED osvetlenie, vypínače, rozvodná skriňa s poistkami
Voda a odpady: Rozvody v stenách, príprava pre práčku, umývadlo, drez a WC
Vykurovanie: Elektrické (zásuvky pod oknami pripravené pre elektrické konvektory)
Klimatizácia: Zásuvka a výstuž v stene pre montáž (jednotka voliteľná)`
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.super_admin) {
      return Response.json({ error: 'Unauthorized - Super admin only' }, { status: 401 });
    }

    // Get all Ticab house domy
    const domy = await base44.asServiceRole.entities.Dom.filter({ vyrobca: "Ticab house" });
    
    const updates = [];
    
    for (const dom of domy) {
      const nazovUpper = dom.nazov.toUpperCase();
      
      // Try to match with data
      let matchedData = null;
      for (const [key, data] of Object.entries(TICAB_HOUSE_DATA)) {
        if (nazovUpper.includes(key)) {
          matchedData = data;
          break;
        }
      }

      if (matchedData) {
        const updateData = {};
        
        // Update rozmery if not set or different
        if (matchedData.rozmery && JSON.stringify(dom.rozmery) !== JSON.stringify(matchedData.rozmery)) {
          updateData.rozmery = matchedData.rozmery;
        }
        
        // Update vyska_stropu if not set
        if (matchedData.vyska_stropu && !dom.vyska_stropu) {
          updateData.vyska_stropu = matchedData.vyska_stropu;
        }
        
        // Update specifikacia if not set or needs update
        if (matchedData.specifikacia && dom.specifikacia !== matchedData.specifikacia) {
          updateData.specifikacia = matchedData.specifikacia;
        }

        if (Object.keys(updateData).length > 0) {
          await base44.asServiceRole.entities.Dom.update(dom.id, updateData);
          updates.push({ nazov: dom.nazov, updated: Object.keys(updateData) });
        }
      }
    }

    return Response.json({ 
      success: true, 
      message: `Updated ${updates.length} Ticab house models`,
      updates 
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});