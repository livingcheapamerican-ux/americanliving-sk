import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_name, event_source_url, user_data } = await req.json();
    
    const FB_ACCESS_TOKEN = Deno.env.get("FB_ACCESS_TOKEN");
    const PIXEL_ID = "1525927175478080";
    
    if (!FB_ACCESS_TOKEN) {
      return Response.json({ 
        status: 'error',
        details: 'FB_ACCESS_TOKEN not configured' 
      }, { status: 500 });
    }

    const eventTime = Math.floor(Date.now() / 1000);
    const actionSource = 'website';
    const eventSourceUrl = event_source_url || 'https://americanliving.sk';
    const eventNameFinal = event_name || 'PageView';

    // STEP 1: Try FULL payload
    const fullPayload = {
      data: [{
        event_name: eventNameFinal,
        event_time: eventTime,
        action_source: actionSource,
        event_source_url: eventSourceUrl,
        user_data: {
          client_user_agent: user_data?.client_user_agent || 'Mozilla/5.0 (Compatible; Server-Side-Test)',
          client_ip_address: user_data?.client_ip_address,
          ...user_data
        }
      }]
    };

    try {
      console.log('🔄 Attempting FULL payload...');
      const fullResponse = await fetch(
        `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}&test_event_code=TEST96562`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullPayload)
        }
      );

      const fullResult = await fullResponse.json();

      if (fullResponse.ok) {
        console.log('✅ FULL payload SUCCESS:', fullResult);
        return Response.json({ 
          status: 'success',
          method: 'full',
          result: fullResult
        });
      }

      // STEP 2: Auto-Repair - Retry with MINIMAL payload
      console.warn('⚠️ FULL payload failed, auto-repairing with MINIMAL payload...');
      console.error('Full payload error:', JSON.stringify(fullResult, null, 2));

      const minimalPayload = {
        data: [{
          event_name: eventNameFinal,
          event_time: eventTime,
          action_source: actionSource,
          user_data: {
            client_user_agent: 'Mozilla/5.0 (Compatible; Server-Side-Test)'
          }
        }]
      };

      const minimalResponse = await fetch(
        `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}&test_event_code=TEST96562`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(minimalPayload)
        }
      );

      const minimalResult = await minimalResponse.json();

      if (minimalResponse.ok) {
        console.log('✅ RECOVERED with minimal payload:', minimalResult);
        return Response.json({ 
          status: 'recovered',
          method: 'minimal',
          result: minimalResult,
          original_error: fullResult
        });
      }

      // Both failed
      console.error('❌ Both payloads FAILED:', minimalResult);
      return Response.json({ 
        status: 'error',
        details: minimalResult,
        original_error: fullResult
      }, { status: 400 });

    } catch (fetchError) {
      console.error('❌ Network error:', fetchError.message);
      return Response.json({ 
        status: 'error',
        details: fetchError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Function error:', error.message);
    return Response.json({ 
      status: 'error',
      details: error.message 
    }, { status: 500 });
  }
});