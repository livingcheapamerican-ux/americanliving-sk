import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { dom_id, price_key, new_price } = await req.json();

    if (!dom_id || !price_key || new_price === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current dom
    const dom = await base44.entities.Dom.read(dom_id);
    if (!dom) {
      return Response.json({ error: 'Dom not found' }, { status: 404 });
    }

    // Update konfigurator_ceny (generic price field used by multiple configurators)
    const currentCeny = dom.konfigurator_ceny || {};
    currentCeny[price_key] = new_price;

    // Update the dom
    await base44.entities.Dom.update(dom_id, {
      konfigurator_ceny: currentCeny
    });

    return Response.json({ 
      success: true, 
      message: 'Price updated successfully',
      price_key,
      new_price
    });
  } catch (error) {
    console.error('Error updating price:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});