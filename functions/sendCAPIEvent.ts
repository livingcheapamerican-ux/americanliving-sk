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
        details: 'FB_ACCESS_TOKEN not configured',
        attempts: []
      }, { status: 500 });
    }

    const eventTime = Math.floor(Date.now() / 1000);
    const actionSource = 'website';
    const eventSourceUrl = event_source_url || 'https://americanliving.sk';
    const eventNameFinal = event_name || 'PageView';
    const attempts = [];

    // Helper function to try sending
    const tryPayload = async (payloadName, payload) => {
      const startTime = Date.now();
      try {
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}&test_event_code=TEST96562`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }
        );

        const result = await response.json();
        const duration = Date.now() - startTime;

        attempts.push({
          name: payloadName,
          success: response.ok,
          duration_ms: duration,
          response: result
        });

        return { success: response.ok, result };
      } catch (error) {
        attempts.push({
          name: payloadName,
          success: false,
          duration_ms: Date.now() - startTime,
          error: error.message
        });
        return { success: false, error };
      }
    };

    // ATTEMPT 1: Full payload with all data
    console.log('🔄 Attempt 1: Full payload...');
    let result = await tryPayload('full_payload', {
      data: [{
        event_name: eventNameFinal,
        event_time: eventTime,
        action_source: actionSource,
        event_source_url: eventSourceUrl,
        user_data: {
          client_user_agent: user_data?.client_user_agent || 'Mozilla/5.0',
          client_ip_address: user_data?.client_ip_address,
          ...user_data
        }
      }]
    });

    if (result.success) {
      console.log('✅ SUCCESS on attempt 1');
      return Response.json({ 
        status: 'success',
        method: 'full_payload',
        attempts: attempts,
        result: result.result
      });
    }

    // ATTEMPT 2: Without IP address
    console.log('🔄 Attempt 2: Without IP...');
    result = await tryPayload('no_ip', {
      data: [{
        event_name: eventNameFinal,
        event_time: eventTime,
        action_source: actionSource,
        event_source_url: eventSourceUrl,
        user_data: {
          client_user_agent: user_data?.client_user_agent || 'Mozilla/5.0'
        }
      }]
    });

    if (result.success) {
      console.log('✅ SUCCESS on attempt 2');
      return Response.json({ 
        status: 'recovered',
        method: 'no_ip',
        attempts: attempts,
        result: result.result
      });
    }

    // ATTEMPT 3: Without event_source_url
    console.log('🔄 Attempt 3: Without URL...');
    result = await tryPayload('no_url', {
      data: [{
        event_name: eventNameFinal,
        event_time: eventTime,
        action_source: actionSource,
        user_data: {
          client_user_agent: user_data?.client_user_agent || 'Mozilla/5.0'
        }
      }]
    });

    if (result.success) {
      console.log('✅ SUCCESS on attempt 3');
      return Response.json({ 
        status: 'recovered',
        method: 'no_url',
        attempts: attempts,
        result: result.result
      });
    }

    // ATTEMPT 4: Minimal payload
    console.log('🔄 Attempt 4: Minimal...');
    result = await tryPayload('minimal', {
      data: [{
        event_name: eventNameFinal,
        event_time: eventTime,
        action_source: actionSource,
        user_data: {
          client_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }]
    });

    if (result.success) {
      console.log('✅ SUCCESS on attempt 4');
      return Response.json({ 
        status: 'recovered',
        method: 'minimal',
        attempts: attempts,
        result: result.result
      });
    }

    // ATTEMPT 5: Ultra-minimal (absolute minimum)
    console.log('🔄 Attempt 5: Ultra-minimal...');
    result = await tryPayload('ultra_minimal', {
      data: [{
        event_name: 'PageView',
        event_time: eventTime,
        action_source: 'website',
        user_data: {
          client_user_agent: 'Mozilla/5.0'
        }
      }]
    });

    if (result.success) {
      console.log('✅ SUCCESS on attempt 5');
      return Response.json({ 
        status: 'recovered',
        method: 'ultra_minimal',
        attempts: attempts,
        result: result.result
      });
    }

    // All attempts failed
    console.error('❌ All 5 attempts FAILED');
    return Response.json({ 
      status: 'error',
      message: 'All repair attempts failed',
      attempts: attempts
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Function error:', error.message);
    return Response.json({ 
      status: 'error',
      details: error.message
    }, { status: 500 });
  }
});