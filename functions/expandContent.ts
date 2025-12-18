import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return Response.json({ error: 'Text is required' }, { status: 400 });
    }

    // Expand the bullet point using Gemini API
    const apiKeys = [
      "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I",
      "AIzaSyCQAzitrr3FOwYo7_16A1-VnRe-0166r1o",
      "AIzaSyCeROe3rvIIwgDvMMcRlAmwzS4MOwblnRg"
    ];

    let expanded = null;
    
    for (const apiKey of apiKeys) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Expand the following bullet point or idea into a full, engaging paragraph (150-200 words):

"${text}"

Make it:
- Natural and conversational
- SEO-friendly with varied sentence structures
- Include relevant details and examples
- Professional yet readable

Output only the expanded paragraph, no additional commentary.`
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          expanded = data.candidates?.[0]?.content?.parts?.[0]?.text;
          console.log('✅ Content expanded');
          break;
        }
      } catch (error) {
        console.error(`❌ API key failed:`, error.message);
        continue;
      }
    }

    if (!expanded) {
      throw new Error('All API keys failed');
    }

    return Response.json({ 
      success: true,
      expanded: expanded
    });

  } catch (error) {
    console.error('Error expanding content:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});