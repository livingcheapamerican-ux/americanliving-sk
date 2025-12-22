import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { user_agent, client_ip, event_source_url } = await req.json();

    const FB_PIXEL_ID = Deno.env.get("FB_PIXEL_ID");
    const FB_ACCESS_TOKEN = Deno.env.get("FB_ACCESS_TOKEN");

    if (!FB_PIXEL_ID || !FB_ACCESS_TOKEN) {
      return Response.json({ 
        error: 'FB_PIXEL_ID alebo FB_ACCESS_TOKEN nie sú nastavené',
        success: false 
      }, { status: 400 });
    }

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
      access_token: FB_ACCESS_TOKEN
    };

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
      console.error('Facebook API Error:', result);
      return Response.json({ 
        success: false, 
        error: result.error?.message || 'Facebook API error',
        details: result
      }, { status: response.status });
    }

    // Log to CAPILog entity
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
    console.error('trackFacebookPageView Error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});