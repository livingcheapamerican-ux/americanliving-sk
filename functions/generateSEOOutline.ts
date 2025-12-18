import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id } = await req.json();

    // Fetch project details
    const projects = await base44.asServiceRole.entities.SEOProject.filter({ id: project_id });
    const project = projects[0];

    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Generate outline using Gemini API
    const apiKeys = [
      "AIzaSyDI4UWtkRk6u-wAR-ZcPUZg2HGrfmvoy6I",
      "AIzaSyCQAzitrr3FOwYo7_16A1-VnRe-0166r1o",
      "AIzaSyCeROe3rvIIwgDvMMcRlAmwzS4MOwblnRg"
    ];

    let outline = null;
    
    for (const apiKey of apiKeys) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate a comprehensive SEO-optimized article outline for the keyword: "${project.target_keyword}"

Create an outline with:
- An engaging introduction paragraph
- 5-7 main H2 headings with descriptive subheadings (H3)
- Each section should be actionable and specific
- Include a conclusion section

Format the output as HTML with proper heading tags (<h2>, <h3>).
Make it natural and engaging, not robotic.`
              }]
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          outline = data.candidates?.[0]?.content?.parts?.[0]?.text;
          console.log('✅ Outline generated');
          break;
        }
      } catch (error) {
        console.error(`❌ API key failed:`, error.message);
        continue;
      }
    }

    if (!outline) {
      throw new Error('All API keys failed');
    }

    return Response.json({ 
      success: true,
      outline: outline
    });

  } catch (error) {
    console.error('Error generating outline:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});