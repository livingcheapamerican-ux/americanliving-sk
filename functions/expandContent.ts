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

    // Expand the bullet point using LLM
    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Expand the following bullet point or idea into a full, engaging paragraph (150-200 words):

"${text}"

Make it:
- Natural and conversational
- SEO-friendly with varied sentence structures
- Include relevant details and examples
- Professional yet readable

Output only the expanded paragraph, no additional commentary.`,
      add_context_from_internet: false
    });

    return Response.json({ 
      success: true,
      expanded: response
    });

  } catch (error) {
    console.error('Error expanding content:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});