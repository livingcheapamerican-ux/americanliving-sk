import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { user_agent, event_source_url } = await req.json();

    // Get secrets
    const FB_PIXEL_ID = Deno.env.get("FB_PIXEL_ID");
    const FB_ACCESS_TOKEN = Deno.env.get("FB_ACCESS_TOKEN");

    if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
      console.error('❌ Missing secrets: FB_PIXEL_ID or FB_ACCESS_TOKEN');
      return Response.json({ 
        error: 'FB_PIXEL_ID alebo FB_ACCESS_TOKEN nie sú nastavené',
        success: false 
      }, { status: 400 });
    }

    // Auto-detect client IP from request headers
    const client_ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                      req.headers.get('x-real-ip') ||
                      req.headers.get('cf-connecting-ip') ||
                      '0.0.0.0';

    console.log('🔥 FB Server-Side Tracking:', {
      pixel_id: FB_PIXEL_ID,
      client_ip: client_ip,
      user_agent: user_agent?.substring(0, 50) + '...',
      url: event_source_url
    });

    const event_time = Math.floor(Date.now() / 1000);

    const payload = {
      data: [{
        event_name: "PageView",
        event_time: event_time,
        action_source: "website",
        event_source_url: event_source_url || "https://americanliving.sk",
        user_data: {
          client_ip_address: client_ip,
          client_user_agent: user_agent
        }
      }],
      test_event_code: "TEST56422",
      access_token: FB_ACCESS_TOKEN
    };

    console.log('📤 Sending to Facebook:', {
      url: `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events`,
      event_name: 'PageView',
      has_test_code: true
    });

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Facebook API Error:', result);
      return Response.json({ 
        success: false, 
        error: result.error?.message || 'Facebook API error',
        details: result
      }, { status: response.status });
    }

    console.log('✅ Facebook API Response:', result);

    // Log success to CAPILog
    await base44.asServiceRole.entities.CAPILog.create({
      event_name: 'PageView',
      attempt_method: 'server_side_tracking',
      success: true,
      duration_ms: 0,
      payload_size: JSON.stringify(payload).length,
      user_data_fields: ['client_ip_address', 'client_user_agent'],
      event_source_url: event_source_url || "https://americanliving.sk",
      total_attempts: 1,
      timestamp: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      events_received: result.events_received || 1,
      fbtrace_id: result.fbtrace_id
    });

  } catch (error) {
    console.error('❌ trackFacebookPageView Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});