import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me().catch(() => null);
    
    const { event_name, event_source_url, user_data } = await req.json();
    
    const FB_ACCESS_TOKEN = Deno.env.get("FB_ACCESS_TOKEN");
    const PIXEL_ID = "1525927175478080";
    
    if (!FB_ACCESS_TOKEN) {
      return Response.json({ 
        error: 'FB_ACCESS_TOKEN not configured' 
      }, { status: 500 });
    }

    // Prepare CAPI event payload
    const eventData = {
      data: [{
        event_name: event_name || 'PageView',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: event_source_url || 'https://americanliving.sk',
        user_data: {
          client_user_agent: user_data?.client_user_agent || 'Mozilla/5.0 (Compatible; Server-Side-Test)',
          ...user_data
        }
      }]
    };

    // Send to Facebook Conversions API
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}&test_event_code=TEST96562`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Facebook CAPI Error Response:', JSON.stringify(result, null, 2));
        return Response.json({ 
          error: 'Failed to send event to Facebook',
          details: result
        }, { status: response.status });
      }

      console.log('✅ Facebook CAPI Success:', result);
      
      return Response.json({ 
        success: true,
        result: result,
        message: 'Event sent to Facebook CAPI'
      });
    } catch (fetchError) {
      console.error('❌ Facebook API Request Failed:', fetchError.message);
      throw fetchError;
    }

    return Response.json({ 
      success: true,
      result: result,
      message: 'Event sent to Facebook CAPI'
    });

  } catch (error) {
    console.error('CAPI Function Error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});