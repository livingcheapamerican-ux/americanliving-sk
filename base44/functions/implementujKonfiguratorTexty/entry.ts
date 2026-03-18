import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.super_admin) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, vyrobca } = await req.json();

    if (!items || items.length === 0) {
      return Response.json({ error: 'Neboli poskytnuté žiadne položky' }, { status: 400 });
    }

    // Vytvor tooltip z textu
    const createTooltip = (item) => {
      let tooltip = item.name || '';
      if (item.subtitle) tooltip += ` - ${item.subtitle}`;
      if (item.long_description) tooltip += `. ${item.long_description}`;
      if (item.notes) tooltip += ` (${item.notes})`;
      return tooltip;
    };

    // Vytvor polozka_id z názvu (kebab-case)
    const createId = (name) => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    };

    // Ulož všetky položky
    const savedItems = [];
    for (const item of items) {
      const polozka_id = createId(item.name);
      
      // Skontroluj či už existuje
      const existing = await base44.asServiceRole.entities.KonfiguratorText.filter({
        vyrobca: vyrobca || 'Prosto House',
        polozka_id
      });

      const data = {
        vyrobca: vyrobca || 'Prosto House',
        polozka_id,
        nazov: item.name,
        podnadpis: item.subtitle || '',
        dlhy_popis: item.long_description || '',
        poznamky: item.notes || '',
        kategoria: item.category || '',
        tooltip: createTooltip(item)
      };

      if (existing && existing.length > 0) {
        // Aktualizuj existujúcu
        await base44.asServiceRole.entities.KonfiguratorText.update(existing[0].id, data);
        savedItems.push({ ...data, id: existing[0].id, updated: true });
      } else {
        // Vytvor novú
        const created = await base44.asServiceRole.entities.KonfiguratorText.create(data);
        savedItems.push({ ...created, created: true });
      }
    }

    return Response.json({
      success: true,
      count: savedItems.length,
      items: savedItems
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});