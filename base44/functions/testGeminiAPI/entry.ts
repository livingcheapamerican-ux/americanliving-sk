Deno.serve(async (req) => {
  try {
    const apiKeys = [
      { key: "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I", name: "Kľúč 1" },
      { key: "AIzaSyCQAzitrr3FOwYo7_16A1-VnRe-0166r1o", name: "Kľúč 2" },
      { key: "AIzaSyCeROe3rvIIwgDvMMcRlAmwzS4MOwblnRg", name: "Kľúč 3" }
    ];
    
    const results = [];
    
    for (const apiKeyInfo of apiKeys) {
      console.log(`\n🔑 Testing ${apiKeyInfo.name}...`);

      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKeyInfo.key}`;
      
      const body = {
        contents: [{
          parts: [{
            text: "Say OK"
          }]
        }]
      };

      try {
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
          console.log(`✅ ${apiKeyInfo.name} FUNGUJE! Response:`, text);
          results.push({
            name: apiKeyInfo.name,
            key: apiKeyInfo.key.substring(0, 15) + "...",
            success: true,
            response: text
          });
        } else {
          console.error(`❌ ${apiKeyInfo.name} Error:`, data.error?.message);
          results.push({
            name: apiKeyInfo.name,
            key: apiKeyInfo.key.substring(0, 15) + "...",
            success: false,
            error: data.error?.message || "API request failed"
          });
        }
      } catch (error) {
        console.error(`❌ ${apiKeyInfo.name} Exception:`, error.message);
        results.push({
          name: apiKeyInfo.name,
          key: apiKeyInfo.key.substring(0, 15) + "...",
          success: false,
          error: error.message
        });
      }
    }

    const workingKeys = results.filter(r => r.success);
    
    return Response.json({ 
      success: workingKeys.length > 0,
      message: workingKeys.length > 0 
        ? `✅ ${workingKeys.length} z ${apiKeys.length} kľúčov FUNGUJE!` 
        : `❌ Žiadny z ${apiKeys.length} kľúčov nefunguje`,
      results: results,
      workingKeys: workingKeys.map(k => k.name),
      model: "gemini-2.0-flash"
    });

  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error);
    return Response.json({ 
      success: false, 
      error: error.message || "Neznáma chyba",
      details: error.toString()
    }, { status: 200 });
  }
});