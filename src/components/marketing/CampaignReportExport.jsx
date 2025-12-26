import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CampaignReportExport({ campaigns, filters }) {
  const exportToCSV = () => {
    if (campaigns.length === 0) {
      toast.error('Žiadne kampane na export');
      return;
    }

    const headers = [
      'Názov kampane',
      'Platforma',
      'Status',
      'Dosah',
      'Zobrazenia',
      'Kliknutia',
      'CTR (%)',
      'Konverzie',
      'Conv. Rate (%)',
      'Náklady (€)',
      'CPC (€)',
      'CPA (€)',
      'Dátum'
    ].join(',');

    const rows = campaigns.map(c => [
      `"${c.campaign_name || ''}"`,
      c.platform || '',
      c.status || '',
      c.reach || 0,
      c.impressions || 0,
      c.clicks || 0,
      c.ctr || 0,
      c.conversions || 0,
      c.conversion_rate || 0,
      c.cost || 0,
      c.cpc || 0,
      c.cpa || 0,
      c.last_updated ? format(new Date(c.last_updated), 'dd.MM.yyyy') : ''
    ].join(','));

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kampane_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('CSV report stiahnutý!');
  };

  const exportToPDF = async () => {
    if (campaigns.length === 0) {
      toast.error('Žiadne kampane na export');
      return;
    }

    try {
      toast.info('Generujem PDF report...', { duration: 3000 });

      const response = await fetch('/api/functions/exportCampaignReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaigns, filters })
      });

      if (!response.ok) {
        throw new Error('PDF export zlyhал');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kampane_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('PDF report stiahnutý!');
    } catch (error) {
      toast.error('Chyba pri generovaní PDF: ' + error.message);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToCSV}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Export CSV
      </Button>
      <Button
        onClick={exportToPDF}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export PDF
      </Button>
    </div>
  );
}