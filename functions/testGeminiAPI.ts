import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      return Response.json({ 
        success: false, 
        error: "GEMINI_API_KEY nie je nastavený" 
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