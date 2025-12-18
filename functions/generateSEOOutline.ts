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

    // Generate outline using LLM
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive SEO-optimized article outline for the keyword: "${project.target_keyword}"

Create an outline with:
- An engaging introduction paragraph
- 5-7 main H2 headings with descriptive subheadings (H3)
- Each section should be actionable and specific
- Include a conclusion section

Format the output as HTML with proper heading tags (<h2>, <h3>).
Make it natural and engaging, not robotic.`,
      add_context_from_internet: false
    });

    return Response.json({ 
      success: true,
      outline: response
    });

  } catch (error) {
    console.error('Error generating outline:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});