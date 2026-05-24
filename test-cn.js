const apiKeys = [
  "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I",
  "AIzaSyCQAzitrr3FOwYo7_16A1-VnRe-0166r1o",
  "AIzaSyCeROe3rvIIwgDvMMcRlAmwzS4MOwblnRg"
];

async function testKeys() {
  for (const key of apiKeys) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Povedz iba: OK" }] }]
        })
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Key ${key.substring(0, 10)}... works! Response:`, JSON.stringify(data.candidates?.[0]?.content?.parts?.[0]?.text));
      } else {
        console.log(`❌ Key ${key.substring(0, 10)}... failed:`, data.error?.message);
      }
    } catch (e) {
      console.log(`❌ Key ${key.substring(0, 10)}... error:`, e.message);
    }
  }
}

testKeys();
