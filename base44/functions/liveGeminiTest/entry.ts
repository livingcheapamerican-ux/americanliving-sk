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
    console.log("🚀 Volám Gemini API pomocou REST...");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
    
    const body = {
      contents: [{
        parts: [{
          text: "Ak toto čítaš a spojenie funguje, napíš mi krátku vtipnú vetu o stavbe domu."
        }]
      }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
      console.log("✅ ÚSPECH! Gemini API funguje perfektne!");
      console.log("📨 Odpoveď od AI:");
      console.log(text);
      
      return Response.json({
        status: 'success',
        message: 'Gemini API je funkčné a pripojenie funguje!',
        model: 'gemini-2.0-flash-exp',
        ai_response: text,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error("❌ CHYBA od Gemini API:");
      console.error("Status:", response.status);
      console.error("Error:", data.error?.message || JSON.stringify(data));
      
      return Response.json({
        status: 'error',
        error_message: data.error?.message || 'Unknown error',
        error_status: response.status,
        full_response: data
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("❌ CHYBA pri volaní Gemini API:");
    console.error("Typ chyby:", error.name);
    console.error("Správa:", error.message);
    console.error("Stack:", error.stack);
    
    return Response.json({
      status: 'error',
      error_type: error.name,
      error_message: error.message,
      full_error: error.toString()
    }, { status: 500 });
  }
});