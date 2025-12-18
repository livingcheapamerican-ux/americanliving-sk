import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

Deno.serve(async (req) => {
  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      return Response.json({ 
        success: false, 
        error: "GEMINI_API_KEY nie je nastavený" 
      }, { status: 500 });
    }

    // Inicializuj Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Jednoduchý test
    const result = await model.generateContent("Ahoj! Napíš mi len jedno slovo: OK");
    const response = await result.response;
    const text = response.text();

    return Response.json({ 
      success: true, 
      message: "API kľúč funguje správne!",
      testResponse: text
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});