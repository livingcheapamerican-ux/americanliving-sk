import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * DIAGNOSTICKÝ KÓD (S vloženým API kľúčom)
 */
Deno.serve(async (req) => {
  try {
    // =================================================================
    // Kľúč vložený presne podľa vášho zadania (s veľkým W):
    const API_KEY = "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I";
    // =================================================================

    // Endpoint pre zoznam modelov
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
        const errorText = await response.text();
        return Response.json({ 
            response: `❌ CHYBA KĽÚČA/SPOJENIA: ${response.status}\n\nGoogle odkazuje: ${errorText}` 
        });
    }

    const data = await response.json();
    
    // Vyfiltrujeme modely
    const textoveModely = data.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.replace('models/', ''))
        .join("\n");

    return Response.json({
        response: `✅ **KĽÚČ JE SPRÁVNY!**\n\nTu sú modely, ktoré máte povolené:\n\n${textoveModely}\n\n(Prosím, pošlite mi fotku tohto zoznamu)`,
        success: true
    });

  } catch (error) {
    return Response.json({ response: `⚠️ KRITICKÁ CHYBA: ${error.message}` });
  }
});