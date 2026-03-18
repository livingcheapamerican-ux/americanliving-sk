import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('🔄 Starting analytics data sync...');
    
    // Get FB Pixel config
    const pixelConfigs = await base44.asServiceRole.entities.AppConfiguration.filter({ 
      config_key: 'meta_pixel' 
    });
    const pixelConfig = pixelConfigs[0];
    
    if (!pixelConfig?.pixel_id) {
      console.log('⚠️ No Meta Pixel configured');
    }
    
    const FB_PIXEL_ID = Deno.env.get('FB_PIXEL_ID') || pixelConfig?.pixel_id;
    const FB_ACCESS_TOKEN = Deno.env.get('FB_ACCESS_TOKEN');
    
    const results = {
      sessions_synced: 0,
      metrics_synced: 0,
      campaigns_synced: 0,
      errors: []
    };
    
    // 1. Sync Meta Pixel Insights (last 7 days)
    if (FB_PIXEL_ID && FB_ACCESS_TOKEN) {
      try {
        console.log('📊 Fetching Meta Pixel insights...');
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        const since = startDate.toISOString().split('T')[0];
        const until = endDate.toISOString().split('T')[0];
        
        // Get pixel stats
        const statsUrl = `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/stats?access_token=${FB_ACCESS_TOKEN}&start_time=${since}&end_time=${until}&aggregation=pixel`;
        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();
        
        if (statsData.data && statsData.data.length > 0) {
          for (const stat of statsData.data) {
            // Update or create aggregated metrics
            const existingMetrics = await base44.asServiceRole.entities.SocialMediaMetrics.filter({
              campaign_name: `Meta Pixel Organic - ${stat.event}`,
              platform: 'Facebook'
            });
            
            const metricData = {
              campaign_name: `Meta Pixel Organic - ${stat.event}`,
              platform: 'Facebook',
              status: 'active',
              impressions: stat.count || 0,
              clicks: 0,
              conversions: stat.value || 0,
              reach: stat.count || 0,
              cost: 0,
              ctr: 0,
              conversion_rate: 0,
              cpc: 0,
              cpm: 0,
              cpa: 0,
              last_updated: new Date().toISOString(),
              performance_notes: `Auto-synced from Meta Pixel on ${new Date().toLocaleDateString()}`
            };
            
            if (existingMetrics.length > 0) {
              await base44.asServiceRole.entities.SocialMediaMetrics.update(
                existingMetrics[0].id, 
                metricData
              );
            } else {
              await base44.asServiceRole.entities.SocialMediaMetrics.create(metricData);
            }
            
            results.metrics_synced++;
          }
        }
        
        // Get ad account insights
        const adAccountId = pixelConfig?.ad_account_id;
        if (adAccountId) {
          const insightsUrl = `https://graph.facebook.com/v18.0/${adAccountId}/insights?access_token=${FB_ACCESS_TOKEN}&time_range={'since':'${since}','until':'${until}'}&fields=campaign_name,reach,impressions,clicks,spend,actions,cpc,cpm,ctr`;
          const insightsResponse = await fetch(insightsUrl);
          const insightsData = await insightsResponse.json();
          
          if (insightsData.data && insightsData.data.length > 0) {
            for (const campaign of insightsData.data) {
              const conversions = campaign.actions?.find(a => a.action_type === 'lead')?.value || 0;
              
              const campaignData = {
                campaign_name: campaign.campaign_name || 'Unknown Campaign',
                platform: 'Facebook',
                status: 'active',
                reach: parseInt(campaign.reach) || 0,
                impressions: parseInt(campaign.impressions) || 0,
                clicks: parseInt(campaign.clicks) || 0,
                conversions: parseInt(conversions),
                cost: parseFloat(campaign.spend) || 0,
                ctr: parseFloat(campaign.ctr) || 0,
                cpc: parseFloat(campaign.cpc) || 0,
                cpm: parseFloat(campaign.cpm) || 0,
                cpa: conversions > 0 ? (parseFloat(campaign.spend) / parseInt(conversions)).toFixed(2) : 0,
                conversion_rate: campaign.clicks > 0 ? ((conversions / campaign.clicks) * 100).toFixed(2) : 0,
                last_updated: new Date().toISOString(),
                performance_notes: `Auto-synced from Meta Ads API on ${new Date().toLocaleDateString()}`
              };
              
              const existing = await base44.asServiceRole.entities.SocialMediaMetrics.filter({
                campaign_name: campaignData.campaign_name,
                platform: 'Facebook'
              });
              
              if (existing.length > 0) {
                await base44.asServiceRole.entities.SocialMediaMetrics.update(
                  existing[0].id,
                  campaignData
                );
              } else {
                await base44.asServiceRole.entities.SocialMediaMetrics.create(campaignData);
              }
              
              results.campaigns_synced++;
            }
          }
        }
        
        console.log(`✅ Meta Pixel sync: ${results.metrics_synced} metrics, ${results.campaigns_synced} campaigns`);
      } catch (error) {
        console.error('❌ Meta Pixel sync error:', error);
        results.errors.push(`Meta Pixel: ${error.message}`);
      }
    }
    
    // 2. Process UserSession data for aggregated stats
    try {
      console.log('📊 Aggregating session data...');
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentSessions = await base44.asServiceRole.entities.UserSession.list('-created_date', 1000);
      
      // Group by day and calculate metrics
      const dailyStats = {};
      
      for (const session of recentSessions) {
        const sessionDate = new Date(session.created_date);
        if (sessionDate < sevenDaysAgo) continue;
        
        const dateKey = sessionDate.toISOString().split('T')[0];
        
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = {
            date: dateKey,
            sessions: 0,
            unique_visitors: new Set(),
            page_views: 0,
            avg_duration: 0,
            bounce_rate: 0,
            bounced: 0,
            conversions: 0
          };
        }
        
        dailyStats[dateKey].sessions++;
        dailyStats[dateKey].unique_visitors.add(session.visitor_id);
        dailyStats[dateKey].page_views += session.navigation_path?.length || 1;
        
        if (session.duration) {
          dailyStats[dateKey].avg_duration += session.duration;
        }
        
        // Check if bounce (single page view, short duration)
        if ((!session.navigation_path || session.navigation_path.length <= 1) && 
            (!session.duration || session.duration < 30)) {
          dailyStats[dateKey].bounced++;
        }
        
        // Check for conversions (form submissions, etc.)
        if (session.clicks?.some(c => c.type === 'form_submit' || c.text?.includes('Odoslať'))) {
          dailyStats[dateKey].conversions++;
        }
      }
      
      // Calculate averages and create/update DailyMarketingAnalysis
      for (const [dateKey, stats] of Object.entries(dailyStats)) {
        stats.unique_visitors = stats.unique_visitors.size;
        stats.avg_duration = stats.sessions > 0 ? Math.round(stats.avg_duration / stats.sessions) : 0;
        stats.bounce_rate = stats.sessions > 0 ? ((stats.bounced / stats.sessions) * 100).toFixed(1) : 0;
        
        const analysisData = {
          date: dateKey,
          total_sessions: stats.sessions,
          unique_visitors: stats.unique_visitors,
          page_views: stats.page_views,
          avg_session_duration: stats.avg_duration,
          bounce_rate: parseFloat(stats.bounce_rate),
          conversions: stats.conversions,
          conversion_rate: stats.sessions > 0 ? ((stats.conversions / stats.sessions) * 100).toFixed(2) : 0,
          top_pages: [],
          traffic_sources: {},
          last_updated: new Date().toISOString()
        };
        
        const existing = await base44.asServiceRole.entities.DailyMarketingAnalysis.filter({ date: dateKey });
        
        if (existing.length > 0) {
          await base44.asServiceRole.entities.DailyMarketingAnalysis.update(
            existing[0].id,
            analysisData
          );
        } else {
          await base44.asServiceRole.entities.DailyMarketingAnalysis.create(analysisData);
        }
        
        results.sessions_synced++;
      }
      
      console.log(`✅ Session aggregation: ${results.sessions_synced} days processed`);
    } catch (error) {
      console.error('❌ Session aggregation error:', error);
      results.errors.push(`Sessions: ${error.message}`);
    }
    
    // 3. Create summary notification
    try {
      await base44.asServiceRole.entities.MarketingNotification.create({
        notification_type: 'sync_completed',
        severity: results.errors.length > 0 ? 'warning' : 'success',
        title: '✅ Analytics Data Sync Completed',
        message: `Synced ${results.metrics_synced} metrics, ${results.campaigns_synced} campaigns, ${results.sessions_synced} daily stats. ${results.errors.length > 0 ? `Errors: ${results.errors.length}` : ''}`,
        action_required: false,
        read: false,
        metadata: { 
          sync_results: results,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.log('Failed to create notification:', error.message);
    }
    
    console.log('✅ Analytics sync complete:', results);
    
    return Response.json({ 
      success: true,
      results,
      message: 'Analytics data synced successfully'
    });
    
  } catch (error) {
    console.error('❌ Analytics sync error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});