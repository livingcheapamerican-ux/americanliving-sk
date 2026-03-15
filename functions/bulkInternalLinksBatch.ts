import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * BULK INTERNAL LINKS - One-time historical backfill
 * 0 AI credits - pure local RegEx logic
 * 
 * Loop protection: This function writes directly via asServiceRole WITHOUT
 * triggering the entity automation, because automations only fire from
 * frontend/user writes, not from service-role backend writes in the same function.
 * 
 * Safe to run multiple times - idempotent (only saves if text actually changed)
 */

function injectInternalLinks(text, domy) {
  if (!text || text.trim().length < 50) return { text, injected: 0, names: [] };

  let processedText = text;
  let linksInjected = 0;
  const injectedNames = [];

  // Sort by name length DESC - longer names match before shorter ones
  const sorted = [...domy].sort((a, b) => b.nazov.length - a.nazov.length);

  for (const dom of sorted) {
    const nazov = dom.nazov.trim();
    if (!nazov) continue;

    const escapedNazov = nazov.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Protect existing <a> tags with placeholders
    const linkPlaceholders = [];
    const textWithPlaceholders = processedText.replace(/<a[\s\S]*?<\/a>/gi, (match) => {
      const idx = linkPlaceholders.length;
      linkPlaceholders.push(match);
      return `__LINK_PLACEHOLDER_${idx}__`;
    });

    // Replace only FIRST occurrence
    const regex = new RegExp(`(${escapedNazov})`);
    if (regex.test(textWithPlaceholders)) {
      const linkedText = textWithPlaceholders.replace(
        regex,
        `<a href="/DetailDomu?id=${dom.id}" class="internal-link" title="${nazov} - American Living">$1</a>`
      );
      const restored = linkedText.replace(/__LINK_PLACEHOLDER_(\d+)__/g, (_, idx) => linkPlaceholders[parseInt(idx)]);
      processedText = restored;
      linksInjected++;
      injectedNames.push(nazov);
    }
  }

  return { text: processedText, injected: linksInjected, names: injectedNames };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only protection
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    console.log('🚀 bulkInternalLinksBatch: starting...');

    // Load all public Dom records
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    const domy = allDomy.filter(d => d.verejny !== false && d.nazov && d.id);
    console.log(`📦 Loaded ${domy.length} house models`);

    // Load ALL BlogPost records
    const allBlogPosts = await base44.asServiceRole.entities.BlogPost.list();
    console.log(`📝 Loaded ${allBlogPosts.length} BlogPost records`);

    // Load ALL LokaciaSEO records
    const allLokacii = await base44.asServiceRole.entities.LokaciaSEO.list();
    console.log(`🗺️ Loaded ${allLokacii.length} LokaciaSEO records`);

    const stats = {
      blogpost: { processed: 0, updated: 0, links_added: 0, details: [] },
      lokaciaseo: { processed: 0, updated: 0, links_added: 0, details: [] }
    };

    // ── PROCESS BlogPosts ──
    for (const post of allBlogPosts) {
      stats.blogpost.processed++;
      const originalText = post.obsah;
      if (!originalText || originalText.trim().length < 50) continue;

      const { text: newText, injected, names } = injectInternalLinks(originalText, domy);

      if (injected > 0 && newText !== originalText) {
        await base44.asServiceRole.entities.BlogPost.update(post.id, { obsah: newText });
        stats.blogpost.updated++;
        stats.blogpost.links_added += injected;
        stats.blogpost.details.push({
          id: post.id,
          nazov: post.nazov || '(no title)',
          links_injected: injected,
          house_names: names
        });
        console.log(`✅ BlogPost "${post.nazov}" → +${injected} link(s): [${names.join(', ')}]`);
        // Small delay to avoid DB rate limiting
        await new Promise(r => setTimeout(r, 150));
      }
    }

    // ── PROCESS LokaciaSEO ──
    for (const loc of allLokacii) {
      stats.lokaciaseo.processed++;
      const originalText = loc.unikany_text_o_lokalite;
      if (!originalText || originalText.trim().length < 50) continue;

      const { text: newText, injected, names } = injectInternalLinks(originalText, domy);

      if (injected > 0 && newText !== originalText) {
        await base44.asServiceRole.entities.LokaciaSEO.update(loc.id, { unikany_text_o_lokalite: newText });
        stats.lokaciaseo.updated++;
        stats.lokaciaseo.links_added += injected;
        stats.lokaciaseo.details.push({
          id: loc.id,
          nazov: loc.nazov_mesta || '(no name)',
          links_injected: injected,
          house_names: names
        });
        console.log(`✅ LokaciaSEO "${loc.nazov_mesta}" → +${injected} link(s): [${names.join(', ')}]`);
        await new Promise(r => setTimeout(r, 150));
      }
    }

    const totalLinksAdded = stats.blogpost.links_added + stats.lokaciaseo.links_added;
    const totalUpdated = stats.blogpost.updated + stats.lokaciaseo.updated;

    console.log(`\n📊 FINAL REPORT:`);
    console.log(`  BlogPost: ${stats.blogpost.processed} spracovaných, ${stats.blogpost.updated} aktualizovaných, ${stats.blogpost.links_added} odkazov`);
    console.log(`  LokaciaSEO: ${stats.lokaciaseo.processed} spracovaných, ${stats.lokaciaseo.updated} aktualizovaných, ${stats.lokaciaseo.links_added} odkazov`);
    console.log(`  CELKOM: ${totalUpdated} aktualizovaných záznamov, ${totalLinksAdded} interných odkazov vložených`);

    return Response.json({
      success: true,
      summary: {
        total_records_processed: stats.blogpost.processed + stats.lokaciaseo.processed,
        total_records_updated: totalUpdated,
        total_links_injected: totalLinksAdded,
        house_models_available: domy.length
      },
      blogpost: {
        processed: stats.blogpost.processed,
        updated: stats.blogpost.updated,
        links_added: stats.blogpost.links_added,
        details: stats.blogpost.details
      },
      lokaciaseo: {
        processed: stats.lokaciaseo.processed,
        updated: stats.lokaciaseo.updated,
        links_added: stats.lokaciaseo.links_added,
        details: stats.lokaciaseo.details
      }
    });

  } catch (error) {
    console.error('bulkInternalLinksBatch error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});