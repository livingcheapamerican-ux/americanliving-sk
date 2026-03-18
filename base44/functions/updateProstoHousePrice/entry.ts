import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { dom_id, price_key, new_price } = await req.json();

    if (!dom_id || !price_key || new_price === undefined) {
      return Response.json({ 
        error: 'Missing required fields: dom_id, price_key, new_price' 
      }, { status: 400 });
    }

    // Načítať dom
    const dom = await base44.asServiceRole.entities.Dom.get(dom_id);

    if (!dom) {
      return Response.json({ error: 'Dom not found' }, { status: 404 });
    }

    // Aktualizovať custom ceny
    const customCeny = dom.konfigurator_custom_ceny_prosto_house || {};
    customCeny[price_key] = parseFloat(new_price);

    // Uložiť späť do databázy
    await base44.asServiceRole.entities.Dom.update(dom_id, {
      konfigurator_custom_ceny_prosto_house: customCeny
    });

    return Response.json({ 
      success: true,
      message: `Cena pre ${price_key} aktualizovaná na ${new_price} €`,
      custom_ceny: customCeny
    });
  } catch (error) {
    console.error('Error updating Prosto House price:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});