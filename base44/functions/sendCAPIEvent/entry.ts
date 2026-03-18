import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_name, event_source_url, user_data } = await req.json();
    
    // AI-DRIVEN: Get optimal payload recommendation
    let optimalPayload = null;
    try {
      const aiOptimization = await base44.functions.invoke('aiCAPIOptimizer', { action: 'get_optimal_payload' });
      optimalPayload = aiOptimization.data;
    } catch (e) {
      console.warn('AI optimization not available, using default strategy');
    }
    
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
    
    // AI-DRIVEN: Reorder attempts based on optimal method
    let attemptOrder = ['full_payload', 'no_ip', 'no_url', 'minimal', 'ultra_minimal'];
    if (optimalPayload?.optimal_method) {
      // Put optimal method first
      attemptOrder = [optimalPayload.optimal_method, ...attemptOrder.filter(m => m !== optimalPayload.optimal_method)];
      console.log('🤖 AI recommends starting with:', optimalPayload.optimal_method);
    }
    
    // Duplicate detection - check last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentLogs = await base44.asServiceRole.entities.CAPILog.filter({
      event_name: eventNameFinal,
      event_source_url: eventSourceUrl,
      created_date: { $gte: fiveMinutesAgo }
    });
    
    if (recentLogs.length > 0) {
      console.log('⚠️ Duplicate event detected within 5 minutes, skipping...');
      return Response.json({ 
        status: 'skipped',
        reason: 'Duplicate event detected',
        attempts: []
      });
    }

    // Helper function to try sending
    const tryPayload = async (payloadName, payload) => {
      const startTime = Date.now();
      try {
        const payloadString = JSON.stringify(payload);
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}&test_event_code=TEST96562`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payloadString
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
        
        // Log to database for AI learning
        await base44.asServiceRole.entities.CAPILog.create({
          event_name: eventNameFinal,
          attempt_method: payloadName,
          success: response.ok,
          duration_ms: duration,
          error_message: response.ok ? null : JSON.stringify(result),
          payload_size: payloadString.length,
          user_data_fields: Object.keys(payload.data[0].user_data || {}),
          event_source_url: eventSourceUrl,
          total_attempts: attempts.length,
          timestamp: new Date().toISOString()
        }).catch(e => console.error('Failed to log CAPI attempt:', e));

        return { success: response.ok, result };
      } catch (error) {
        const duration = Date.now() - startTime;
        attempts.push({
          name: payloadName,
          success: false,
          duration_ms: duration,
          error: error.message
        });
        
        // Log error
        await base44.asServiceRole.entities.CAPILog.create({
          event_name: eventNameFinal,
          attempt_method: payloadName,
          success: false,
          duration_ms: duration,
          error_message: error.message,
          event_source_url: eventSourceUrl,
          total_attempts: attempts.length,
          timestamp: new Date().toISOString()
        }).catch(e => console.error('Failed to log CAPI error:', e));
        
        return { success: false, error };
      }
    };

    // AI-DRIVEN ATTEMPTS: Try in optimal order
    let result = null;
    
    for (let i = 0; i < attemptOrder.length; i++) {
      const method = attemptOrder[i];
      console.log(`🔄 Attempt ${i + 1}: ${method}...`);
      
      if (method === 'full_payload') {
        result = await tryPayload('full_payload', {
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
      } else if (method === 'no_ip') {
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
      } else if (method === 'no_url') {
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
      } else if (method === 'minimal') {
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
      } else if (method === 'ultra_minimal') {
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
      }
      
      if (result && result.success) {
        console.log(`✅ SUCCESS on attempt ${i + 1} with ${method}`);
        return Response.json({ 
          status: i === 0 ? 'success' : 'recovered',
          method: method,
          attempts: attempts,
          result: result.result,
          ai_optimized: optimalPayload ? true : false
        });
      }
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