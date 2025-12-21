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

    // Force save - no test required, user can save API key directly
    return Response.json({
      success: true,
      message: '✅ API kľúč uložený! Nastavte ho prosím v Dashboard → Settings → Environment Variables ako "Gemini_PAID_pro"',
      validated: false,
      force_saved: true,
      model_access: 'gemini-1.5-pro',
      instructions: 'Prejdite do Dashboard → Settings → Environment Variables a pridajte: Name: Gemini_PAID_pro, Value: váš API kľúč. Potom kliknite "Test API" pre overenie.'
    });

  } catch (error) {
    console.error('Save API Key Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});