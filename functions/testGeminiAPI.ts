import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

Deno.serve(async (req) => {
  try {
    // HARDCODED API KEY PRE TESTING
    const apiKey = "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I";
    
    console.log("🔑 Using API Key:", apiKey.substring(0, 10) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log("📡 Testing gemini-1.5-flash model...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("✉️ Sending request...");

    const result = await model.generateContent("Reply with exactly: OK");
    const response = result.response;
    const text = response.text();

    console.log("✅ SUCCESS! Response:", text);

    return Response.json({ 
      success: true, 
      message: "✅ Gemini API kľúč je FUNKČNÝ!",
      testResponse: text,
      model: "gemini-1.5-flash"
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