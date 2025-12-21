import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = Deno.env.get("Gemini_PAID_pro");
    
    if (!apiKey) {
      return Response.json({ 
        success: false,
        error: 'Gemini API key nie je nastavený v secrets'
      }, { status: 400 });
    }

    // Test connection
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Hello" }]
          }]
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ 
        success: false,
        error: `API Error ${response.status}: ${error}`
      }, { status: 200 });
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';

    return Response.json({
      success: true,
      message: '✅ API Connected - Deep Reasoning Active',
      model: 'gemini-2.0-flash-exp',
      test_response: responseText,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test Gemini Connection Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});