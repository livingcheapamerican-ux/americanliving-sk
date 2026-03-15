import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * AUTO INTERNAL LINKING (Link Juice)
 * 0 AI credits - pure local RegEx logic
 * Triggered by: BlogPost create/update, LokaciaSEO create/update
 *
 * Logic:
 * 1. Load all Dom records (nazov + id + slug)
 * 2. Find first occurrence of each Dom nazov in the target text field
 * 3. Replace with <a href="/DetailDomu?id={id}">{nazov}</a>
 * 4. Skip text already wrapped in an existing <a> tag
 * 5. Save back to entity
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { event, data } = payload;
    if (!event || !data) {
      return Response.json({ error: 'Missing event or data' }, { status: 400 });
    }

    const { entity_name, entity_id, type } = event;

    // Only process BlogPost and LokaciaSEO
    if (!['BlogPost', 'LokaciaSEO'].includes(entity_name)) {
      return Response.json({ success: true, skipped: true, reason: 'entity_not_supported' });
    }

    // Determine which field holds the main text content
    const textField = entity_name === 'BlogPost' ? 'obsah' : 'unikany_text_o_lokalite';
    const originalText = data[textField];

    if (!originalText || originalText.trim().length < 50) {
      return Response.json({ success: true, skipped: true, reason: 'text_too_short_or_empty' });
    }

    // Load all public Dom records (0 credits - pure DB read)
    const allDomy = await base44.asServiceRole.entities.Dom.list();
    const domy = allDomy.filter(d => d.verejny !== false && d.nazov && d.id);

    if (domy.length === 0) {
      return Response.json({ success: true, skipped: true, reason: 'no_houses_found' });
    }

    // Sort by name length DESC so longer names (e.g. "Bungalov 15 Plus") match before shorter ones ("Bungalov 15")
    domy.sort((a, b) => b.nazov.length - a.nazov.length);

    let processedText = originalText;
    let linksInjected = 0;
    const injectedNames = [];

    for (const dom of domy) {
      const nazov = dom.nazov.trim();
      if (!nazov) continue;

      // Escape special RegEx characters in the house name
      const escapedNazov = nazov.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Match the name only if it is NOT already inside an <a ...> tag
      // Negative lookbehind would be ideal but Deno supports it - use a two-step approach for safety:
      // Step 1: temporarily replace existing <a> tags with placeholders
      // Step 2: do the replacement on the clean text
      // Step 3: restore placeholders
      // This ensures we never double-wrap existing links.

      const linkPlaceholders = [];
      const textWithPlaceholders = processedText.replace(/<a[\s\S]*?<\/a>/gi, (match) => {
        const idx = linkPlaceholders.length;
        linkPlaceholders.push(match);
        return `__LINK_PLACEHOLDER_${idx}__`;
      });

      // Replace only the FIRST occurrence of the house name (word-boundary match, case-sensitive)
      const regex = new RegExp(`(${escapedNazov})`, ''); // no 'g' flag = first occurrence only
      if (regex.test(textWithPlaceholders)) {
        const linkedText = textWithPlaceholders.replace(
          regex,
          `<a href="/DetailDomu?id=${dom.id}" class="internal-link" title="${nazov} - American Living">$1</a>`
        );

        // Restore placeholders
        const restored = linkedText.replace(/__LINK_PLACEHOLDER_(\d+)__/g, (_, idx) => linkPlaceholders[parseInt(idx)]);

        processedText = restored;
        linksInjected++;
        injectedNames.push(nazov);
      }
    }

    // If nothing changed, skip DB write
    if (linksInjected === 0) {
      return Response.json({
        success: true,
        skipped: true,
        reason: 'no_matching_house_names_found',
        entity_name,
        entity_id
      });
    }

    // Loop protection: if the processed text equals original, nothing to save
    if (processedText === originalText) {
      return Response.json({ success: true, skipped: true, reason: 'text_unchanged' });
    }

    // Save the enriched text back
    await base44.asServiceRole.entities[entity_name].update(entity_id, {
      [textField]: processedText
    });

    console.log(`✅ autoInternalLinks: injected ${linksInjected} link(s) into ${entity_name} ${entity_id} → [${injectedNames.join(', ')}]`);

    return Response.json({
      success: true,
      entity_name,
      entity_id,
      links_injected: linksInjected,
      injected_houses: injectedNames,
      credits_used: 0
    });

  } catch (error) {
    console.error('autoInternalLinks error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});