import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { api_key } = await req.json();

    if (!api_key) {
      return Response.json({ 
        success: false,
        error: 'API kľúč nie je zadaný'
      }, { status: 400 });
    }

    // Validate API key format
    if (!api_key.startsWith('AIzaSy')) {
      return Response.json({ 
        success: false,
        error: 'Neplatný formát API kľúča. Google AI Studio kľúče začínajú s "AIzaSy"'
      }, { status: 400 });
    }

    // Test the API key
    const testResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${api_key}`,
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

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return Response.json({ 
        success: false,
        error: `API kľúč zlyhal test: ${errorText}. Napriek tomu môžete pokračovať v nastavení v Dashboard.`,
        can_force_save: true
      }, { status: 200 });
    }

    // Store API key in environment (this would need platform support)
    // For now, we'll return success and user needs to set it in Dashboard -> Settings -> Secrets
    
    return Response.json({
      success: true,
      message: '✅ API kľúč overený! Nastavte ho prosím v Dashboard → Settings → Environment Variables ako "Gemini_PAID_pro"',
      validated: true,
      model_access: 'gemini-1.5-pro',
      instructions: 'Prejdite do Dashboard → Settings → Environment Variables a pridajte: Name: Gemini_PAID_pro, Value: váš API kľúč'
    });

  } catch (error) {
    console.error('Save API Key Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});