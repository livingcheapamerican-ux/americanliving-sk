import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

Deno.serve(async (req) => {
  try {
    // Hardcoded API kľúč na test
    const apiKey = "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I";
    
    console.log("Testing hardcoded API Key...");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Skúsime gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Sending test request...");

    const result = await model.generateContent("Povedz len: OK");
    const response = result.response;
    const text = response.text();

    console.log("✅ SUCCESS! Response:", text);

    return Response.json({ 
      success: true, 
      message: "✅ API kľúč AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I FUNGUJE!",
      testResponse: text
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    return Response.json({ 
      success: false, 
      error: error.message || "Neznáma chyba",
      details: error.toString(),
      stack: error.stack
    }, { status: 200 });
  }
});