import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

Deno.serve(async (req) => {
  try {
    console.log("🔍 Načítavam API kľúč Gemini_PAID_pro...");
    const apiKey = Deno.env.get("Gemini_PAID_pro");
    
    if (!apiKey) {
      console.error("❌ CHYBA: API kľúč Gemini_PAID_pro nebol nájdený v environment variables!");
      return Response.json({ 
        status: 'error',
        message: 'API kľúč Gemini_PAID_pro nie je nastavený'
      }, { status: 500 });
    }
    
    console.log("✅ API kľúč načítaný úspešne");
    console.log("🚀 Inicializujem Gemini AI klienta...");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("📤 Posielam testovací prompt do Gemini 1.5 Flash...");
    const prompt = "Ak toto čítaš a spojenie funguje, napíš mi krátku vtipnú vetu o stavbe domu.";
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log("✅ ÚSPECH! Gemini API funguje perfektne!");
    console.log("📨 Odpoveď od AI:");
    console.log(text);
    
    return Response.json({
      status: 'success',
      message: 'Gemini API je funkčné a pripojenie funguje!',
      model: 'gemini-1.5-flash',
      ai_response: text,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ CHYBA pri volaní Gemini API:");
    console.error("Typ chyby:", error.name);
    console.error("Správa:", error.message);
    console.error("HTTP status:", error.status || 'N/A');
    console.error("Stack:", error.stack);
    
    return Response.json({
      status: 'error',
      error_type: error.name,
      error_message: error.message,
      error_status: error.status || null,
      full_error: error.toString()
    }, { status: 500 });
  }
});