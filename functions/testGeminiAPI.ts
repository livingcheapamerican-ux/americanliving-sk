import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get("Gemini_PAID_pro") || "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I";
    
    if (!apiKey) {
      return Response.json({ 
        success: false, 
        error: "Gemini_PAID_pro nie je nastavený" 
      }, { status: 200 });
    }

    console.log("Testing API Key...");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Skúsime gemini-pro model (stabilný)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Sending request...");

    const result = await model.generateContent("Povedz len: OK");
    const response = result.response;
    const text = response.text();

    return Response.json({ 
      success: true, 
      message: "✅ API kľúč funguje!",
      testResponse: text
    });

  } catch (error) {
    console.error("Error:", error);
    return Response.json({ 
      success: false, 
      error: error.message || "Neznáma chyba",
      details: error.toString()
    }, { status: 200 });
  }
});