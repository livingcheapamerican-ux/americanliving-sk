import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domId, configuration, language = 'sk', template = 'standard' } = await req.json();

    // Fetch house data
    const houses = await base44.asServiceRole.entities.Dom.filter({ id: domId });
    const dom = houses[0];

    if (!dom) {
      return Response.json({ error: 'House not found' }, { status: 404 });
    }

    // Build configuration summary
    const configSummary = configuration ? `
Vybraná konfigurácia:
- Montáž: ${configuration.montazHolodomu === 'ano' ? 'Áno' : 'Nie'}
- Izolácia: ${configuration.izolaciaNavysenie || 'štandardná'}
- Základy: ${configuration.zaklady || 'nie sú súčasťou'}
- Vstupné dvere: ${configuration.vstupneDvere || 'štandardné'}
- Elektroinštalácia: ${configuration.elektroinstalacia ? 'Áno' : 'Nie'}
- Voda a kanalizácia: ${configuration.vodaKanalizacia ? 'Áno' : 'Nie'}
- Tepelné čerpadlo: ${configuration.tepelneCerpadlo ? 'Áno' : 'Nie'}
- Rekuperácia: ${configuration.rekuperacia ? 'Áno' : 'Nie'}
- Interiér finiš: ${configuration.interierFinis || 'nie je vybraný'}
- Vonkajšia fasáda: ${configuration.vonkajsiaFasada || 'štandardná'}
- Podlahové vykurovanie: ${configuration.podlahovVykurovanie ? 'Áno' : 'Nie'}
- Projekt A0: ${configuration.projektA0 ? 'Áno' : 'Nie'}
    ` : '';

    // Language mapping
    const langMap = {
      'sk': 'slovenčina',
      'en': 'angličtina',
      'hu': 'maďarčina',
      'pl': 'poľština',
      'uk': 'ukrajinčina',
      'de': 'nemčina',
      'fr': 'francúzština',
      'sr': 'srbčina',
      'hr': 'chorvátčina',
      'el': 'gréčtina'
    };

    const targetLanguage = langMap[language] || 'slovenčina';

    // Template-specific instructions
    const templateInstructions = {
      standard: `Vytvor atraktívny, profesionálny a vyvážený popis, ktorý kombinuje technické detaily s marketingovými prvkami.`,
      technical: `Vytvor technický a detailný popis zameraný na špecifikácie, parametre, materiály a konštrukciu. Používaj presné merania a technickú terminológiu.`,
      marketing: `Vytvor emocionálny a presvedčivý marketingový popis, ktorý zdôrazňuje životný štýl, výhody a sen o bývaní. Používaj silné emócie a vizualizácie.`,
      social: `Vytvor krátky, pútavý popis vhodný pre sociálne siete (max 150 slov). Používaj jednoduché vety, emojis sú povolené, a pridaj hashtag na konci.`
    };

    const wordCountGuide = template === 'social' ? '100-150 slov' : '250-350 slov';

    // Generate description using LLM
    const prompt = `Si profesionálny copywriter pre realitný a stavebný priemysel. ${templateInstructions[template] || templateInstructions.standard}

Základné informácie o dome:
- Názov: ${dom.nazov}
- Výrobca: ${dom.vyrobca}
- Typ domu: ${dom.typ_domu === 'modularny' ? 'Modulárny' : dom.typ_domu === 'montovany' ? 'Montovaný' : 'Mobilný'}
- Zastavaná plocha: ${dom.zastavana_plocha}m²
${dom.uzitkova_plocha ? `- Úžitková plocha: ${dom.uzitkova_plocha}m²` : ''}
${dom.pocet_izieb ? `- Počet izieb: ${dom.pocet_izieb}` : ''}
- Základná cena: ${dom.zakladna_cena?.toLocaleString('sk-SK')} € s DPH
${dom.celorocny ? '- Celoročné bývanie: Áno' : ''}
${dom.energeticky_certifikat ? '- Energetický certifikát A0: Možnosť' : ''}
${dom.rozmery ? `- Rozmery: ${dom.rozmery.sirka}m × ${dom.rozmery.dlzka}m × ${dom.rozmery.vyska}m` : ''}
${dom.vyska_stropu ? `- Výška stropu: ${dom.vyska_stropu}` : ''}

${configSummary}

${dom.specifikacia ? `Technická špecifikácia:\n${dom.specifikacia}` : ''}

POKYNY:
1. Vytvor popis v jazyku: ${targetLanguage}
2. Popis musí byť dlhý ${wordCountGuide}
3. Štýl popisu: ${template === 'technical' ? 'technický a faktický' : template === 'marketing' ? 'emotívny a presvedčivý' : template === 'social' ? 'krátky a pútavý pre sociálne siete' : 'vyvážený profesionálny'}
4. ${template === 'technical' ? 'Použi technické parametre, U-hodnoty, materiály, konštrukčné riešenia' : template === 'marketing' ? 'Použi emócie, sen o bývaní, životný štýl, vizualizuj život v dome' : template === 'social' ? 'Buď stručný, pútavý, pridaj max 2-3 emojis a hashtag' : 'Zameriaj sa na výhody, komfort a praktické vlastnosti'}
5. Zahrň konkrétne čísla a parametre
6. ${template !== 'technical' ? 'Zakončí výzvou k akcii' : 'Zakonči technickým súhrnom'}
7. NEPÍŠ nadpisy, len plynulý text
8. Ak je uvedená konfigurácia, zohľadni ju v popise

Vráť iba samotný text popisu, nič iné.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: prompt
    });

    const generatedDescription = response.output || response;

    // Update house with new description
    const updateField = language === 'sk' ? 'popis' : `popis_${language}`;
    await base44.asServiceRole.entities.Dom.update(domId, {
      [updateField]: generatedDescription
    });

    return Response.json({ 
      success: true, 
      description: generatedDescription,
      language: language
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});