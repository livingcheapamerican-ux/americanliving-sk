import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Copy, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";

export default function CampaignExporter({ campaign }) {
  const exportToAdsManager = () => {
    // Formát pre Facebook Ads Manager CSV import
    const csvData = [
      ['Campaign Name', 'Objective', 'Daily Budget', 'Age Min', 'Age Max', 'Gender', 'Locations', 'Interests'],
      [
        campaign.title || 'Kampaň',
        'LEAD_GENERATION',
        campaign.budget?.daily || campaign.budget_allocation || 20,
        campaign.targeting?.age_range?.split('-')[0] || 25,
        campaign.targeting?.age_range?.split('-')[1] || 55,
        campaign.targeting?.gender === 'all' ? 'All' : campaign.targeting?.gender,
        campaign.targeting?.locations?.join(';') || 'Slovakia',
        campaign.targeting?.interests?.join(';') || 'Real Estate'
      ]
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign_${campaign.title?.replace(/\s/g, '_')}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('CSV súbor stiahnutý!');
  };

  const exportToJSON = () => {
    const adsManagerFormat = {
      campaign: {
        name: campaign.title,
        objective: 'LEAD_GENERATION',
        status: 'PAUSED',
        buying_type: 'AUCTION'
      },
      ad_set: {
        name: `AdSet - ${campaign.title}`,
        optimization_goal: 'LEAD_GENERATION',
        billing_event: 'IMPRESSIONS',
        bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
        daily_budget: (campaign.budget?.daily || campaign.budget_allocation || 20) * 100, // v centoch
        targeting: {
          geo_locations: {
            countries: ['SK'],
            cities: campaign.targeting?.locations?.map(loc => ({
              name: loc,
              region: 'Slovakia'
            }))
          },
          age_min: parseInt(campaign.targeting?.age_range?.split('-')[0]) || 25,
          age_max: parseInt(campaign.targeting?.age_range?.split('-')[1]) || 55,
          genders: campaign.targeting?.gender === 'all' ? [1, 2] : [campaign.targeting?.gender === 'male' ? 1 : 2],
          flexible_spec: [{
            interests: campaign.targeting?.interests?.map(interest => ({
              name: interest
            })) || []
          }]
        }
      },
      creative: {
        name: `Creative - ${campaign.title}`,
        object_story_spec: {
          page_id: 'YOUR_PAGE_ID',
          link_data: {
            message: campaign.creative?.primary_text || campaign.copy?.body,
            link: 'https://americanliving.sk',
            name: campaign.creative?.headline || campaign.copy?.headline,
            call_to_action: {
              type: 'LEARN_MORE'
            }
          }
        }
      },
      lead_form: {
        name: `Lead Form - ${campaign.title}`,
        questions: campaign.lead_form?.questions?.map(q => ({
          type: 'CUSTOM',
          label: q
        })) || []
      }
    };

    const json = JSON.stringify(adsManagerFormat, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ads_manager_${campaign.title?.replace(/\s/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('JSON súbor stiahnutý!');
  };

  const copyInstructions = () => {
    const instructions = `
📋 NÁVOD NA VYTVORENIE KAMPANE V ADS MANAGER

🔗 Prejdite na: https://business.facebook.com/adsmanager

KROK 1: VYTVORENIE KAMPANE
1. Kliknite na zelené tlačidlo "Create" (Vytvoriť)
2. Vyberte cieľ: "Lead Generation" (Generovanie leadov)
3. Názov kampane: ${campaign.title}
4. Buying type: Auction
5. Kliknite "Continue"

KROK 2: AD SET (CIELENIE)
6. Názov ad setu: "AdSet - ${campaign.title}"
7. Budget: €${campaign.budget?.daily || campaign.budget_allocation || 20}/deň
8. Schedule: ${campaign.budget?.duration_days || 14} dní od dnes

9. CIELENIE:
   - Lokalita: ${campaign.targeting?.locations?.join(', ') || 'Slovensko'}
   - Vek: ${campaign.targeting?.age_range || '25-55'}
   - Pohlavie: ${campaign.targeting?.gender === 'all' ? 'Všetci' : campaign.targeting?.gender}
   
10. DETAILNÉ CIELENIE:
    - Záujmy: ${campaign.targeting?.interests?.join(', ') || 'Real Estate, Home Improvement'}
    - Správanie: ${campaign.targeting?.detailed_targeting || 'Engaged shoppers, Homeowners'}

11. Placements: ${campaign.platform?.includes('Instagram') ? 'Facebook Feed + Instagram Stories' : 'Automatic Placements'}

KROK 3: AD CREATIVE (KREATÍVA)
12. Formát: ${campaign.creative?.type === 'video' ? 'Video' : 'Single Image'}
13. ${campaign.creative?.type === 'video' ? 'Video:' : 'Obrázok:'} ${campaign.creative?.visual_description || campaign.visual_specs?.description}
14. Rozlíšenie: ${campaign.visual_specs?.resolution || '1200x628 pre Feed, 1080x1920 pre Stories'}

15. TEXTY:
    - Primary Text: ${campaign.creative?.primary_text || campaign.copy?.body}
    - Headline: ${campaign.creative?.headline || campaign.copy?.headline}
    - Description: ${campaign.description || ''}
    - CTA Button: ${campaign.creative?.cta_button || campaign.copy?.cta || 'Learn More'}

KROK 4: INSTANT FORM (LEAD FORM)
16. Kliknite "Create Form"
17. Pridajte otázky:
${campaign.lead_form?.questions?.map((q, i) => `    ${i + 1}. ${q}`).join('\n') || '    1. Meno\n    2. Email\n    3. Telefón'}
18. Privacy policy: ${campaign.lead_form?.privacy_policy || 'Súhlas so spracovaním osobných údajov'}

KROK 5: PUBLIKOVANIE
19. Review všetky nastavenia
20. Kliknite "Publish"

✅ HOTOVO! Kampaň je aktívna.

📊 OČAKÁVANÉ VÝSLEDKY:
- Leady: ${campaign.expected_results?.estimated_leads || 'N/A'}
- CPL: ${campaign.expected_results?.cost_per_lead || 'N/A'}
- Konverzia: ${campaign.expected_results?.conversion_rate || 'N/A'}

🎯 PSYCHOLÓGIA: ${campaign.psychology || campaign.psychological_trigger_used || 'N/A'}
    `;

    navigator.clipboard.writeText(instructions);
    toast.success('Návod skopírovaný do schránky!');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Download className="w-3 h-3 mr-1" />
          Export do Ads Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Facebook className="w-5 h-5 text-blue-600" />
            <Instagram className="w-5 h-5 text-pink-600" />
            Export do Facebook Ads Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export Options */}
          <div className="grid grid-cols-3 gap-3">
            <Button onClick={exportToAdsManager} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              CSV Import
            </Button>
            <Button onClick={exportToJSON} className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 mr-2" />
              JSON Format
            </Button>
            <Button onClick={copyInstructions} className="bg-green-600 hover:bg-green-700">
              <Copy className="w-4 h-4 mr-2" />
              Návod (Copy)
            </Button>
          </div>

          {/* Preview */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300">
            <CardHeader>
              <CardTitle className="text-sm">📋 Náhľad kampane</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong>Názov:</strong> {campaign.title}
                </div>
                <div>
                  <strong>Platforma:</strong> {campaign.platform}
                </div>
                <div>
                  <strong>Budget:</strong> €{campaign.budget?.daily || campaign.budget_allocation}/deň
                </div>
                <div>
                  <strong>Trvanie:</strong> {campaign.budget?.duration_days || 14} dní
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <strong className="block mb-1">Kreatíva:</strong>
                <p className="text-gray-700">{campaign.creative?.primary_text || campaign.copy?.body}</p>
              </div>

              <div className="bg-white p-3 rounded border">
                <strong className="block mb-1">Cielenie:</strong>
                <p className="text-gray-700">
                  {campaign.targeting?.age_range} rokov, {campaign.targeting?.locations?.join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-yellow-50 p-4 rounded border border-yellow-300 text-xs">
            <p className="font-semibold text-yellow-900 mb-2">💡 Ako použiť:</p>
            <ol className="space-y-1 text-yellow-800 list-decimal list-inside">
              <li>Stiahnite CSV alebo JSON súbor</li>
              <li>Otvorte Facebook Ads Manager</li>
              <li>Pre CSV: Bulk Tools → Import Campaigns</li>
              <li>Pre JSON: Použite API alebo skopírujte hodnoty manuálne</li>
              <li>Pre manuálny postup: Použite "Návod (Copy)"</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}