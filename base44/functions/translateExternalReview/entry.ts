import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { review_id } = await req.json();

    if (!review_id) {
      return Response.json({ error: 'review_id is required' }, { status: 400 });
    }

    // Fetch the review
    const reviews = await base44.asServiceRole.entities.ExternalReview.filter({ id: review_id });
    const review = reviews[0];

    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    const contentSk = review.content_sk;
    if (!contentSk) {
      return Response.json({ error: 'content_sk is empty' }, { status: 400 });
    }

    // Translate to all languages
    const languages = [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'German' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'pl', name: 'Polish' },
      { code: 'fr', name: 'French' },
      { code: 'it', name: 'Italian' },
      { code: 'cz', name: 'Czech' },
      { code: 'uk', name: 'Ukrainian' }
    ];

    const translations = {};

    for (const lang of languages) {
      const fieldName = `content_${lang.code}`;
      
      // Skip if already translated
      if (review[fieldName] && review[fieldName].length > 10) {
        console.log(`✓ Skipping ${lang.code} - already translated`);
        continue;
      }

      const prompt = `Translate this customer review from Slovak to ${lang.name}. Keep the same tone and style. Return ONLY the translated text, nothing else.

Slovak text:
${contentSk}`;

      const translated = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const translatedText = typeof translated === 'string' ? translated : translated.content || '';
      translations[fieldName] = translatedText.trim();
      
      console.log(`✓ Translated to ${lang.code}`);
    }

    // Update the review with all translations
    await base44.asServiceRole.entities.ExternalReview.update(review_id, translations);

    return Response.json({ 
      success: true, 
      translated_languages: Object.keys(translations).length,
      translations: translations
    });

  } catch (error) {
    console.error('Error translating review:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});