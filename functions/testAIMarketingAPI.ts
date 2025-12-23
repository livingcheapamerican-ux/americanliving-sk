import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const API_KEY = Deno.env.get("Gemini_PAID_pro");
    
    console.log('API Key exists:', !!API_KEY);
    console.log('API Key length:', API_KEY?.length);
    
    if (!API_KEY) {
      return Response.json({ 
        success: false,
        error: 'API kľúč nie je nastavený'
      });
    }

    // Test s jednoduchým promptom
    const testPrompt = "Ahoj, funguje AI?";
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: testPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        })
      }
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return Response.json({ 
        success: false,
        status: response.status,
        error: errorText,
        api_key_prefix: API_KEY.substring(0, 10) + '...'
      });
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Žiadna odpoveď';

    return Response.json({
      success: true,
      message: '✅ API funguje perfektne!',
      test_response: aiResponse,
      model: 'gemini-1.5-pro'
    });

  } catch (error) {
    console.error('Critical error:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});