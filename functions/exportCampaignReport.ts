import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaigns, filters } = await req.json();

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Marketing Campaign Report', 20, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('sk-SK')}`, 20, 30);
    doc.text(`User: ${user.email}`, 20, 35);

    // Filters info
    if (filters) {
      let filterText = 'Filters: ';
      if (filters.platform && filters.platform !== 'all') filterText += `Platform: ${filters.platform} `;
      if (filters.status && filters.status !== 'all') filterText += `Status: ${filters.status} `;
      if (filters.dateFrom || filters.dateTo) filterText += `Date: ${filters.dateFrom || 'start'} - ${filters.dateTo || 'end'}`;
      doc.text(filterText, 20, 40);
    }

    // Summary stats
    const totalReach = campaigns.reduce((sum, c) => sum + (c.reach || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
    const totalCost = campaigns.reduce((sum, c) => sum + (c.cost || 0), 0);
    const avgCTR = campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + parseFloat(c.ctr || 0), 0) / campaigns.length).toFixed(2) : 0;
    const avgCPA = totalConversions > 0 ? (totalCost / totalConversions).toFixed(2) : 0;

    doc.setFontSize(12);
    doc.text('Overall Statistics', 20, 50);
    doc.setFontSize(10);
    doc.text(`Total Campaigns: ${campaigns.length}`, 20, 58);
    doc.text(`Total Reach: ${totalReach.toLocaleString()}`, 20, 64);
    doc.text(`Total Clicks: ${totalClicks.toLocaleString()}`, 20, 70);
    doc.text(`Total Conversions: ${totalConversions}`, 20, 76);
    doc.text(`Total Cost: €${totalCost.toFixed(2)}`, 20, 82);
    doc.text(`Average CTR: ${avgCTR}%`, 20, 88);
    doc.text(`Average CPA: €${avgCPA}`, 20, 94);

    // Campaign details table
    doc.setFontSize(12);
    doc.text('Campaign Details', 20, 110);

    let y = 120;
    doc.setFontSize(8);
    doc.text('Campaign', 20, y);
    doc.text('Platform', 80, y);
    doc.text('Reach', 120, y);
    doc.text('Clicks', 145, y);
    doc.text('Conv.', 170, y);
    doc.text('Cost', 190, y);

    y += 8;
    campaigns.forEach((campaign, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text((campaign.campaign_name || '').substring(0, 30), 20, y);
      doc.text(campaign.platform || '', 80, y);
      doc.text((campaign.reach || 0).toString(), 120, y);
      doc.text((campaign.clicks || 0).toString(), 145, y);
      doc.text((campaign.conversions || 0).toString(), 170, y);
      doc.text(`€${(campaign.cost || 0).toFixed(0)}`, 190, y);
      y += 6;
    });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=campaign_report_${new Date().toISOString().split('T')[0]}.pdf`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});