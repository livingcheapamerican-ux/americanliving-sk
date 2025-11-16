import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, context, history } = await req.json();

    // Systémový prompt pre AI asistenta
    const systemPrompt = `Si AI asistent pre aplikáciu American Living - distribútor modulárnych domov.

TVOJE HLAVNÉ ÚLOHY:
1. Pomáhať s vypĺňaním formulárov (navrhovať typ dokumentu, výrobcu, model domu na základe kontextu)
2. Odpovedať na otázky o fungovaní aplikácie
3. Poskytovať rady a návrhy v prirodzenom jazyku

KONTEXT APLIKÁCIE:
- Výrobcovia: JAK Modules, Ticab house, Prosto House, Domki z Gór, American Living
- Typy dokumentov: cenník, technická_špecifikácia, návod, certifikát, FAQ, blog, fotky, video, zmluva, faktúra, ponuka, objednávka
- AI analýza dokumentov extrahuje rozmery, materiály, ceny, energetické parametre
- Admin môže nahrať súbory/priečinky hromadne
- Konfigurátor umožňuje vypočítať cenu domu s rôznymi možnosťami

AKO ODPOVEDAŤ:
- Buď priateľský a stručný
- Použi emoji kde to dáva zmysel
- Ak používateľ pýta sa na formulár, navrhni konkrétne hodnoty
- Vysvetľuj jednoducho, aj pre netechnických používateľov

AKTUÁLNY KONTEXT: ${context}

Odpovedaj v slovenčine.`;

    // Priprav históriu pre LLM
    const conversationHistory = (history || []).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Volaj LLM
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}

HISTÓRIA KONVERZÁCIE:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

NOVÁ SPRÁVA OD POUŽÍVATEĽA:
${message}

Odpovedz na používateľovu správu. Ak ide o pomoc s formulárom, navrhni konkrétne hodnoty.`,
      response_json_schema: {
        type: "object",
        properties: {
          response: {
            type: "string",
            description: "Odpoveď pre používateľa"
          },
          suggestion: {
            type: "string",
            description: "Konkrétny návrh na akciu (ak je relevantné), napr. 'Typ dokumentu: cenník, Výrobca: JAK Modules'"
          },
          action: {
            type: "string",
            description: "Typ akcie: fill_form, navigate, explain"
          }
        },
        required: ["response"]
      }
    });

    return Response.json({
      response: llmResponse.response || "Prepáč, nerozumiem. Skús sa opýtať inak.",
      suggestion: llmResponse.suggestion || null,
      action: llmResponse.action || "explain"
    });

  } catch (error) {
    console.error('AI Asistent Error:', error);
    return Response.json({ 
      response: "Prepáč, momentálne nemôžem odpovedať. Skús to prosím neskôr.",
      error: error.message 
    }, { status: 500 });
  }
});