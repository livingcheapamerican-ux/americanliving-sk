Deno.serve(async (req) => {
  try {
    const apiKey = "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I";
    
    console.log("🔑 Testing API Key directly via REST...");

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        parts: [{
          text: "Say OK"
        }]
      }]
    };

    console.log("📡 Sending direct HTTP request...");

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API Error:", data);
      return Response.json({ 
        success: false, 
        error: data.error?.message || "API request failed",
        details: JSON.stringify(data),
        status: response.status
      }, { status: 200 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    
    console.log("✅ SUCCESS! Response:", text);

    return Response.json({ 
      success: true, 
      message: "✅ Gemini API kľúč FUNGUJE!",
      testResponse: text,
      model: "gemini-pro"
    });

  } catch (error) {
    console.error("❌ ERROR:", error);
    return Response.json({ 
      success: false, 
      error: error.message || "Neznáma chyba",
      details: error.toString()
    }, { status: 200 });
  }
});