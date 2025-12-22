import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    console.log('🔥 trackFacebookPageView called');
    
    const base44 = createClientFromRequest(req);
    
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('❌ Failed to parse request body:', e);
      return Response.json({ 
        error: 'Invalid JSON body',
        success: false 
      }, { status: 400 });
    }
    
    const { user_agent, event_source_url } = body;

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

    // ROBUST IP DETECTION - Try multiple sources
    let client_ip = null;
    
    // Try x-forwarded-for first (most common for proxied requests)
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
      client_ip = forwardedFor.split(',')[0].trim();
    }
    
    // Try other common headers
    if (!client_ip) {
      client_ip = req.headers.get('x-real-ip') ||
                  req.headers.get('cf-connecting-ip') ||
                  req.headers.get('x-client-ip') ||
                  req.headers.get('true-client-ip');
    }
    
    // Try socket remote address (Deno specific)
    if (!client_ip) {
      try {
        const connInfo = req.socket?.remoteAddr;
        if (connInfo && connInfo.hostname) {
          client_ip = connInfo.hostname;
        }
      } catch (e) {
        console.warn('Failed to get socket remote address:', e);
      }
    }
    
    // Fallback to a placeholder (Facebook will accept it but won't use it for targeting)
    if (!client_ip) {
      client_ip = '0.0.0.0';
      console.warn('⚠️ Could not detect client IP, using fallback');
    }

    console.log('📊 Tracking data:', {
      pixel_id: FB_PIXEL_ID.substring(0, 8) + '...',
      client_ip: client_ip,
      user_agent: user_agent?.substring(0, 50) + '...',
      url: event_source_url,
      all_headers: Object.fromEntries(req.headers.entries())
    });

    const event_time = Math.floor(Date.now() / 1000);

    // Ensure we have required fields
    if (!user_agent) {
      console.error('❌ Missing user_agent');
      return Response.json({ 
        error: 'user_agent is required',
        success: false 
      }, { status: 400 });
    }

    if (!event_source_url) {
      console.error('❌ Missing event_source_url');
      return Response.json({ 
        error: 'event_source_url is required',
        success: false 
      }, { status: 400 });
    }

    const payload = {
      data: [{
        event_name: "PageView",
        event_time: event_time,
        action_source: "website",
        event_source_url: event_source_url,
        user_data: {
          client_ip_address: client_ip,
          client_user_agent: user_agent
        }
      }]
    };

    console.log('📤 Sending to Facebook API...');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const fbUrl = `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`;
    
    let fbResponse;
    try {
      fbResponse = await fetch(fbUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return Response.json({ 
        error: 'Failed to connect to Facebook API: ' + fetchError.message,
        success: false 
      }, { status: 500 });
    }

    let result;
    try {
      result = await fbResponse.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse Facebook response:', jsonError);
      const textResponse = await fbResponse.text();
      console.error('Raw response:', textResponse);
      return Response.json({ 
        error: 'Invalid response from Facebook API',
        raw_response: textResponse,
        success: false 
      }, { status: 500 });
    }

    if (!fbResponse.ok) {
      console.error('❌ Facebook API Error:', {
        status: fbResponse.status,
        statusText: fbResponse.statusText,
        error: result
      });
      
      // Log failed attempt
      try {
        await base44.asServiceRole.entities.CAPILog.create({
          event_name: 'PageView',
          attempt_method: 'server_side_tracking',
          success: false,
          error_message: JSON.stringify(result),
          timestamp: new Date().toISOString()
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
      
      // Return FULL error details to frontend
      return Response.json({ 
        success: false, 
        error: result.error?.message || 'Facebook API error',
        error_code: result.error?.code,
        error_type: result.error?.type,
        error_subcode: result.error?.error_subcode,
        full_error: result,
        fb_status: fbResponse.status,
        fb_status_text: fbResponse.statusText
      }, { status: fbResponse.status });
    }

    console.log('✅ Facebook API Success:', {
      events_received: result.events_received,
      fbtrace_id: result.fbtrace_id
    });

    // Log success to CAPILog
    try {
      await base44.asServiceRole.entities.CAPILog.create({
        event_name: 'PageView',
        attempt_method: 'server_side_tracking',
        success: true,
        duration_ms: 0,
        payload_size: JSON.stringify(payload).length,
        user_data_fields: ['client_ip_address', 'client_user_agent'],
        event_source_url: event_source_url,
        total_attempts: 1,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log success:', logError);
    }

    return Response.json({ 
      success: true,
      events_received: result.events_received || 1,
      fbtrace_id: result.fbtrace_id,
      client_ip_used: client_ip
    });

  } catch (error) {
    console.error('❌ trackFacebookPageView Critical Error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message,
      error_stack: error.stack,
      success: false 
    }, { status: 500 });
  }
});