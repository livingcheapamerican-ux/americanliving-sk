import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, date_range_start, date_range_end } = await req.json();

    const CLIENT_ID = Deno.env.get('GOOGLE_ADS_CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('GOOGLE_ADS_CLIENT_SECRET');
    const REFRESH_TOKEN = Deno.env.get('GOOGLE_ADS_REFRESH_TOKEN');
    const DEVELOPER_TOKEN = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN');
    const CUSTOMER_ID = Deno.env.get('GOOGLE_ADS_CUSTOMER_ID');

    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !DEVELOPER_TOKEN || !CUSTOMER_ID) {
      return Response.json({ 
        error: 'Google Ads API credentials not configured',
        needsAuth: true 
      }, { status: 400 });
    }

    // Get fresh access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      return Response.json({ error: 'Failed to refresh Google Ads token: ' + error }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    if (action === 'fetch_campaigns') {
      // Fetch campaign performance from Google Ads API
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.conversions,
          metrics.conversion_rate,
          metrics.cost_micros,
          metrics.average_cpc,
          metrics.average_cpa,
          campaign.target_cpa.target_cpa_micros,
          segments.date
        FROM campaign
        WHERE segments.date BETWEEN '${date_range_start || '2025-01-01'}' AND '${date_range_end || '2025-12-31'}'
        ORDER BY metrics.impressions DESC
      `;

      const customerId = CUSTOMER_ID.replace(/-/g, ''); // Remove hyphens

      const searchResponse = await fetch(
        `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'developer-token': DEVELOPER_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        }
      );

      if (!searchResponse.ok) {
        const error = await searchResponse.text();
        return Response.json({ error: 'Google Ads API error: ' + error }, { status: 500 });
      }

      const data = await searchResponse.json();
      const results = data.results || [];

      // Aggregate campaigns by ID
      const campaignsMap = {};
      results.forEach(row => {
        const campaignId = row.campaign.id;
        if (!campaignsMap[campaignId]) {
          campaignsMap[campaignId] = {
            campaign_id: campaignId,
            campaign_name: row.campaign.name,
            status: row.campaign.status.toLowerCase(),
            impressions: 0,
            clicks: 0,
            conversions: 0,
            cost: 0
          };
        }
        
        campaignsMap[campaignId].impressions += parseInt(row.metrics.impressions || 0);
        campaignsMap[campaignId].clicks += parseInt(row.metrics.clicks || 0);
        campaignsMap[campaignId].conversions += parseFloat(row.metrics.conversions || 0);
        campaignsMap[campaignId].cost += parseInt(row.metrics.costMicros || 0) / 1000000;
      });

      const campaigns = Object.values(campaignsMap).map(c => ({
        ...c,
        ctr: c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : 0,
        conversion_rate: c.clicks > 0 ? ((c.conversions / c.clicks) * 100).toFixed(2) : 0,
        cpc: c.clicks > 0 ? (c.cost / c.clicks).toFixed(2) : 0,
        cpa: c.conversions > 0 ? (c.cost / c.conversions).toFixed(2) : 0,
        last_synced: new Date().toISOString()
      }));

      // Save to database
      for (const campaign of campaigns) {
        const existing = await base44.asServiceRole.entities.GoogleAdsMetrics.filter({ campaign_id: campaign.campaign_id });
        
        if (existing.length > 0) {
          await base44.asServiceRole.entities.GoogleAdsMetrics.update(existing[0].id, campaign);
        } else {
          await base44.asServiceRole.entities.GoogleAdsMetrics.create(campaign);
        }
      }

      return Response.json({ 
        success: true,
        campaigns_synced: campaigns.length,
        campaigns 
      });
    }

    if (action === 'fetch_keywords') {
      const { campaign_id } = await req.json();
      
      const query = `
        SELECT 
          campaign.id,
          ad_group_criterion.keyword.text,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.cost_micros,
          metrics.conversions
        FROM keyword_view
        WHERE campaign.id = ${campaign_id}
        ORDER BY metrics.clicks DESC
        LIMIT 20
      `;

      const customerId = CUSTOMER_ID.replace(/-/g, '');

      const searchResponse = await fetch(
        `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'developer-token': DEVELOPER_TOKEN,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        }
      );

      if (!searchResponse.ok) {
        const error = await searchResponse.text();
        return Response.json({ error: 'Failed to fetch keywords: ' + error }, { status: 500 });
      }

      const data = await searchResponse.json();
      const keywords = (data.results || []).map(row => ({
        keyword: row.adGroupCriterion?.keyword?.text,
        impressions: parseInt(row.metrics.impressions || 0),
        clicks: parseInt(row.metrics.clicks || 0),
        ctr: parseFloat(row.metrics.ctr || 0),
        cost: parseInt(row.metrics.costMicros || 0) / 1000000,
        conversions: parseFloat(row.metrics.conversions || 0)
      }));

      return Response.json({ keywords });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});