import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await req.json();

    // Fetch the blog post
    const posts = await base44.asServiceRole.entities.BlogPost.filter({ id: postId });
    if (!posts || posts.length === 0) {
      return Response.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const post = posts[0];

    // Generate SEO metadata using AI
    const seoData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Vytvor SEO metadata pre tento blogový článok v slovenčine.

Názov článku: ${post.nazov}
Perex: ${post.perex}
Obsah: ${post.obsah.substring(0, 1000)}...

Vygeneruj:
1. Meta Title (max 60 znakov) - príťažlivý, s kľúčovým slovom
2. Meta Description (max 160 znakov) - zhrnutie článku, pútavé

Musí byť unikátne, opisné a optimalizované pre vyhľadávače.`,
      response_json_schema: {
        type: "object",
        properties: {
          meta_title: {
            type: "string",
            description: "SEO meta title (max 60 znakov)"
          },
          meta_description: {
            type: "string",
            description: "SEO meta description (max 160 znakov)"
          }
        },
        required: ["meta_title", "meta_description"]
      }
    });

    // Update the blog post with generated SEO data
    await base44.asServiceRole.entities.BlogPost.update(postId, {
      meta_title: seoData.meta_title,
      meta_description: seoData.meta_description
    });

    return Response.json({
      success: true,
      meta_title: seoData.meta_title,
      meta_description: seoData.meta_description
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});