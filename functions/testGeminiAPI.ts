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

    console.log("API Key exists, length:", apiKey.length);

    // Inicializuj Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("Model initialized, sending test request...");

    // Jednoduchý test
    const result = await model.generateContent("Ahoj! Napíš mi len jedno slovo: OK");
    const response = await result.response;
    const text = response.text();

    console.log("Success! Response:", text);

    return Response.json({ 
      success: true, 
      message: "API kľúč funguje správne!",
      testResponse: text
    });

  } catch (error) {
    console.error("Error details:", error);
    return Response.json({ 
      success: false, 
      error: error.message,
      errorDetails: error.toString()
    }, { status: 200 });
  }
});