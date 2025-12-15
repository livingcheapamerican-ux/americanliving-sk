import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, analyza_typ } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'Missing file_url' }, { status: 400 });
    }

    // Definovať JSON schému pre extrakciu údajov
    const schema = {
      type: "object",
      properties: {
        typ_dokumentu: {
          type: "string",
          description: "Typ dokumentu (napr. 'katastrálna mapa', 'výpis z LV', 'stavebné povolenie', 'územné rozhodnutie')"
        },
        rozmery_pozemku: {
          type: "object",
          properties: {
            celkova_vymera: { type: "string", description: "Celková výmera pozemku v m²" },
            sirka: { type: "string", description: "Šírka pozemku v metroch (ak je uvedená)" },
            dlzka: { type: "string", description: "Dĺžka pozemku v metroch (ak je uvedená)" },
            tvar: { type: "string", description: "Tvar pozemku (napr. pravouhlý, nepravidelný)" }
          }
        },
        umiestnenie: {
          type: "object",
          properties: {
            obec: { type: "string" },
            kataster: { type: "string" },
            parcela_cislo: { type: "string" },
            gps_suradnice: { type: "string", description: "GPS súradnice ak sú uvedené" }
          }
        },
        regulacie_a_obmedzenia: {
          type: "array",
          items: { type: "string" },
          description: "Zoznam všetkých regulácií, obmedzení a podmienok (napr. výškové obmedzenie, vzdialenosť od hranice, ochranné pásma)"
        },
        funkcia_vyuzitia: {
          type: "string",
          description: "Funkčné využitie územia (napr. 'plocha pre bývanie', 'zmiešané územie', 'rekreačné územie')"
        },
        stavebne_podmienky: {
          type: "object",
          properties: {
            max_zastavana_plocha: { type: "string", description: "Maximálna zastavaná plocha v %" },
            max_podlaznost: { type: "string", description: "Maximálna podlažnosť stavby" },
            max_vyska: { type: "string", description: "Maximálna výška stavby v metroch" },
            min_odstup_od_hranice: { type: "string", description: "Minimálny odstup od hranice pozemku" },
            koeficient_zastavanosti: { type: "string", description: "Koeficient zastavanosti (ak je uvedený)" }
          }
        },
        inzinierske_siete: {
          type: "array",
          items: { type: "string" },
          description: "Dostupné inžinierske siete (voda, kanalizácia, elektrina, plyn)"
        },
        ochrana_prirody: {
          type: "array",
          items: { type: "string" },
          description: "Ochranné pásma prírody, chránené stromy, biotopy"
        },
        poznamky_a_specialne_podmienky: {
          type: "array",
          items: { type: "string" },
          description: "Ďalšie dôležité poznámky, podmienky alebo obmedzenia"
        },
        vhodnost_pre_domy: {
          type: "object",
          properties: {
            mobilny_dom: {
              type: "object",
              properties: {
                vhodne: { type: "boolean" },
                dovod: { type: "string" }
              }
            },
            rodinny_dom: {
              type: "object",
              properties: {
                vhodne: { type: "boolean" },
                dovod: { type: "string" }
              }
            },
            odporucana_velkost_domu: { type: "string", description: "Odporúčaná veľkosť domu v m²" },
            odporucane_modely: {
              type: "array",
              items: { type: "string" },
              description: "Konkrétne modely domov z databázy, ktoré by boli vhodné"
            }
          }
        },
        zhrnutie: {
          type: "string",
          description: "Stručné zhrnutie (2-3 vety) o tom, čo dokument obsahuje a aké sú hlavné podmienky pre stavbu"
        }
      }
    };

    // Volanie LLM na analýzu dokumentu
    const analyza = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyzuj tento dokument týkajúci sa pozemku alebo stavebného povolenia.

Extrahuj všetky kľúčové informácie vrátane:
- Rozmerov a výmery pozemku
- Regulácií a obmedzení (výškové limity, odstupy od hraníc, koeficienty zastavanosti)
- Podmienok pre stavebné povolenie
- Funkčného využitia územia
- Dostupných inžinierskych sietí
- Ochranných pásiem

Na základe analýzy posuď:
- Či je pozemok vhodný pre mobilný dom (rekreačnú stavbu)
- Či je pozemok vhodný pre rodinný dom (trvalé bývanie)
- Akú veľkosť domu by bolo možné na tomto pozemku postaviť

Poskytni presné a konkrétne informácie. Ak niektorá informácia nie je v dokumente uvedená, použi hodnotu "Neuvedené".`,
      file_urls: [file_url],
      response_json_schema: schema
    });

    return Response.json({ 
      success: true, 
      analyza,
      file_url 
    });

  } catch (error) {
    console.error('Error analyzing document:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});