import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { url, html, title, description } = await req.json();

    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Analyze SEO factors
    const issues = [];
    let score = 100;

    // Title analysis
    if (!title || title.length === 0) {
      issues.push({
        type: 'error',
        message: 'Chýba titulok stránky',
        recommendation: 'Pridajte titulok stránky dlhý 50-60 znakov'
      });
      score -= 15;
    } else if (title.length < 30) {
      issues.push({
        type: 'warning',
        message: 'Titulok je príliš krátky',
        recommendation: 'Titulok by mal mať 50-60 znakov'
      });
      score -= 5;
    } else if (title.length > 60) {
      issues.push({
        type: 'warning',
        message: 'Titulok je príliš dlhý',
        recommendation: 'Skrátte titulok na maximálne 60 znakov'
      });
      score -= 5;
    }

    // Meta description analysis
    if (!description || description.length === 0) {
      issues.push({
        type: 'error',
        message: 'Chýba meta popis',
        recommendation: 'Pridajte meta popis dlhý 150-160 znakov'
      });
      score -= 15;
    } else if (description.length < 120) {
      issues.push({
        type: 'warning',
        message: 'Meta popis je príliš krátky',
        recommendation: 'Meta popis by mal mať 150-160 znakov'
      });
      score -= 5;
    } else if (description.length > 160) {
      issues.push({
        type: 'warning',
        message: 'Meta popis je príliš dlhý',
        recommendation: 'Skrátte meta popis na maximálne 160 znakov'
      });
      score -= 5;
    }

    // HTML analysis (if provided)
    if (html) {
      // Check for H1
      const h1Count = (html.match(/<h1/gi) || []).length;
      if (h1Count === 0) {
        issues.push({
          type: 'error',
          message: 'Chýba H1 nadpis',
          recommendation: 'Pridajte jeden hlavný H1 nadpis'
        });
        score -= 10;
      } else if (h1Count > 1) {
        issues.push({
          type: 'warning',
          message: 'Príliš veľa H1 nadpisov',
          recommendation: 'Použite len jeden H1 nadpis na stránku'
        });
        score -= 5;
      }

      // Check for alt tags on images
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      const imgsWithoutAlt = imgTags.filter(img => !img.includes('alt=')).length;
      if (imgsWithoutAlt > 0) {
        issues.push({
          type: 'warning',
          message: `${imgsWithoutAlt} obrázkov bez alt textu`,
          recommendation: 'Pridajte alt text ku všetkým obrázkom'
        });
        score -= Math.min(10, imgsWithoutAlt * 2);
      }

      // Check for internal links
      const internalLinks = (html.match(/href="\/[^"]*"/gi) || []).length;
      if (internalLinks < 3) {
        issues.push({
          type: 'info',
          message: 'Málo interných odkazov',
          recommendation: 'Pridajte viac interných odkazov na súvisiace stránky'
        });
        score -= 3;
      }
    }

    // Extract keywords from title and description
    const text = `${title} ${description}`.toLowerCase();
    const words = text.match(/\b\w{4,}\b/g) || [];
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const klucove_slova = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    // Update or create SEO analytics record
    const existing = await base44.asServiceRole.entities.SEOAnalytika.filter({ url });
    
    const data = {
      url,
      page_title: title || 'Unknown',
      meta_description: description || '',
      klucove_slova,
      seo_score: Math.max(0, score),
      issues,
      last_analyzed: new Date().toISOString()
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.SEOAnalytika.update(existing[0].id, data);
    } else {
      await base44.asServiceRole.entities.SEOAnalytika.create(data);
    }

    return Response.json({
      success: true,
      score: Math.max(0, score),
      issues,
      keywords: klucove_slova,
      recommendations: issues.filter(i => i.type === 'error' || i.type === 'warning')
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});