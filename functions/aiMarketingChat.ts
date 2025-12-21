import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * OPRAVENÝ DIAGNOSTICKÝ NÁSTROJ
 * Zisťuje dostupné modely a vypisuje ich do chatu.
 */
Deno.serve(async (req) => {
  try {
    // 1. VÁŠ KĽÚČ (Opravený podľa screenshotu na presné znenie)
    const API_KEY = "AIzaSyDI4UwtkRk6u-wAR-ZcPUZg2HGrfmvoy6I"; 

    // Endpoint pre zoznam modelov (GET request)
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    // 2. SPOJENIE S GOOGLE
    const response = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    // 3. ODCHYTENIE CHYBY (Ak je zlý kľúč alebo blokovaný prístup)
    if (!response.ok) {
        const errorText = await response.text();
        return Response.json({ 
            response: `🔴 CHYBA SPOJENIA (HTTP ${response.status}):\n${errorText}` 
        });
    }

    const data = await response.json();

    // 4. GENEROWANIE ZOZNAMU
    if (!data.models) {
        return Response.json({ response: "⚠️ Google odpovedal (200 OK), ale zoznam modelov je prázdny." });
    }

    let report = "✅ **SPOJENIE FUNGUJE! TOTO SÚ VAŠE MODELY:**\n\n";
    
    // Hľadáme len modely, ktoré vedia písať text (generateContent)
    const chatModels = data.models.filter(m => 
        m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
    );

    if (chatModels.length === 0) {
        report += "❌ Žiadne chatovacie modely (asi len embeddingy?)\n";
    } else {
        chatModels.forEach(model => {
            // Toto je to, čo hľadáme (napr. 'models/gemini-1.5-flash')
            report += `👉 ${model.name.replace('models/', '')}\n`; 
        });
    }
    
    report += "\n**INŠTRUKCIA:** Skopírujte tento zoznam a pošlite mi ho.";
    
    // Vrátime odpoveď v JSON formáte, ktorý Base44 vyžaduje
    return Response.json({ response: report });

  } catch (e) {
    return Response.json({ response: `☠️ KRITICKÁ CHYBA SKRIPTU: ${e.toString()}` });
  }
});