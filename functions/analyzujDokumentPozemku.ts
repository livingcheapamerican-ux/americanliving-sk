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
            koeficient_zastavanosti: { type: "string", description: "Koeficient zastavanosti (ak je uvedený)" },
            detailne_odstupy: {
              type: "object",
              description: "Detailné odstupy pre rôzne zóny",
              properties: {
                obytna_zona: { type: "string" },
                rekracna_zona: { type: "string" },
                priemyselna_zona: { type: "string" },
                od_susedneho_domu: { type: "string" },
                od_verejnej_komunikacie: { type: "string" }
              }
            },
            povolene_materialy: {
              type: "array",
              items: { type: "string" },
              description: "Zoznam povolených stavebných materiálov a fasád podľa územného plánu"
            },
            zakazane_materialy: {
              type: "array",
              items: { type: "string" },
              description: "Zoznam zakázaných materiálov alebo typov stavieb"
            },
            typ_zonovanie: {
              type: "string",
              description: "Detailný typ zónovania (napr. 'IBV - rodinné domy nízkej zástavby', 'rekreačné územie', 'zmiešané obytné')"
            }
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
                dovod: { type: "string" },
                legislativne_poznamky: { type: "string", description: "Legislatívne obmedzenia pre mobilné domy" }
              }
            },
            rodinny_dom: {
              type: "object",
              properties: {
                vhodne: { type: "boolean" },
                dovod: { type: "string" },
                vyzaduje_a0: { type: "boolean", description: "Či pozemok/zóna vyžaduje A0 certifikát" }
              }
            },
            odporucana_velkost_domu: { type: "string", description: "Odporúčaná veľkosť domu v m²" },
            max_zastavanost_m2: { type: "string", description: "Maximálna zastavaná plocha v m² (vypočítaná z výmery a koeficientu)" },
            vhodne_typy_konstrukcii: {
              type: "array",
              items: { type: "string" },
              description: "Povolené typy konštrukcií (modulárny, montovaný, murovaný)"
            },
            vhodne_fasady: {
              type: "array",
              items: { type: "string" },
              description: "Povolené typy fasád podľa regulácií (omietka, drevo, kombinované)"
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

Extrahuj VŠETKY kľúčové informácie vrátane:
- Rozmerov a výmery pozemku (celková výmera, šírka, dĺžka, tvar)
- Detailných regulácií a obmedzení:
  * Výškové limity stavby
  * Odstupy od hraníc pre rôzne typy zón (obytná, rekreačná, priemyselná)
  * Odstupy od susedných domov
  * Odstupy od verejných komunikácií
  * Koeficienty zastavanosti
- Podmienok pre stavebné povolenie
- Funkčného využitia územia a detailného zónovania
- Dostupných inžinierskych sietí (elektrina, voda, plyn, kanalizácia)
- Ochranných pásiem (príroda, voda, elektrické vedenia)
- **POVOLENÝCH A ZAKÁZANÝCH stavebných materiálov a typov fasád**
- **DETAILNÝCH požiadaviek na vzhľad stavby** (farby, materiály, architektonický štýl)

DÔLEŽITÉ - Vypočítaj:
- Maximálnu zastavanosť v m² (výmera × koeficient zastavanosti)
- Odporúčanú veľkosť domu vzhľadom na regulácie

Na základe analýzy DETAILNE posuď:
1. **MOBILNÝ DOM (rekreačná stavba):**
   - Legislatívne povolenie v danej zóne
   - Upozornenia na obmedzenia
   
2. **RODINNÝ DOM (trvalé bývanie):**
   - Legislatívne povolenie
   - Či je vyžadovaný A0 energetický certifikát
   
3. **VHODNÉ TYPY KONŠTRUKCIÍ:**
   - Modulárne domy (Ticab house)
   - Montované domy (Prosto House)
   - Murované/kombinácie
   
4. **VHODNÉ TYPY FASÁD:**
   - Omietka/šúchaná fasáda
   - Drevený obklad
   - Kombinácie
   - Farby a štýly podľa regulácií

Poskytni PRESNÉ a KONKRÉTNE informácie s číslami a podrobnosťami.
Ak niektorá informácia nie je v dokumente uvedená, použi hodnotu "Neuvedené".`,
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