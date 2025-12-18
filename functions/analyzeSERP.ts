import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target_keyword, target_region } = await req.json();

    if (!target_keyword) {
      return Response.json({ error: 'Target keyword is required' }, { status: 400 });
    }

    console.log(`🔍 Analyzing SERP for: "${target_keyword}" in ${target_region}`);

    // Use Gemini API to analyze top ranking content
    const apiKeys = [
      "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I",
      "AIzaSyCQAzitrr3FOwYo7_16A1-VnRe-0166r1o",
      "AIzaSyCeROe3rvIIwgDvMMcRlAmwzS4MOwblnRg"
    ];

    let analysis = null;
    
    for (const apiKey of apiKeys) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze SEO requirements for ranking on Google for the keyword: "${target_keyword}" in region: ${target_region}

Based on typical top-ranking content for this keyword, provide realistic SEO recommendations in JSON format:

{
  "average_word_count": <number>,
  "average_headings": <number>,
  "recommended_keywords": [
    {"keyword": "main keyword", "target_count": 5},
    {"keyword": "related keyword 1", "target_count": 3},
    {"keyword": "related keyword 2", "target_count": 2}
  ]
}

Provide realistic numbers based on what typically ranks for this type of content.`
              }]
            }],
            generationConfig: {
              response_mime_type: "application/json"
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          analysis = JSON.parse(text);
          console.log('✅ SERP analysis successful');
          break;
        }
      } catch (error) {
        console.error(`❌ API key failed:`, error.message);
        continue;
      }
    }

    if (!analysis) {
      throw new Error('All API keys failed');
    }

    return Response.json({ 
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('Error analyzing SERP:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});