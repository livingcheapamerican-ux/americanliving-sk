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

    // Create a detailed prompt based on blog content
    const imagePrompt = `Create a professional, high-quality architectural visualization image for a blog article about: "${post.nazov}".

Context: ${post.perex}

The image should be:
- Modern and professional architectural style
- Photorealistic rendering
- Bright, inviting atmosphere
- Suitable for a blog header (landscape orientation)
- Related to modular homes, prefab construction, or modern housing
- Show exterior of a modern house in natural setting
- High resolution, professional photography style

Make it visually appealing and directly related to the article topic.`;

    console.log('Generating image for blog:', post.nazov);
    console.log('Prompt:', imagePrompt);

    // Generate image using AI
    const imageResult = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: imagePrompt
    });

    console.log('Image generated:', imageResult);

    // Update the blog post with the new image
    await base44.asServiceRole.entities.BlogPost.update(postId, {
      titulny_obrazok: imageResult.url
    });

    return Response.json({
      success: true,
      image_url: imageResult.url,
      blog_title: post.nazov
    });

  } catch (error) {
    console.error('Error generating blog image:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});