import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action } = await req.json();

    // Fetch historical CAPI logs (last 1000)
    const logs = await base44.asServiceRole.entities.CAPILog.list('-created_date', 1000);

    if (action === 'analyze') {
      // AI Analysis of historical data
      const successRate = logs.filter(l => l.success).length / logs.length;
      const avgDuration = logs.reduce((acc, l) => acc + (l.duration_ms || 0), 0) / logs.length;
      const failedLogs = logs.filter(l => !l.success);
      
      // Group by method to see which works best
      const methodStats = {};
      logs.forEach(log => {
        if (!methodStats[log.attempt_method]) {
          methodStats[log.attempt_method] = { success: 0, failed: 0, total: 0 };
        }
        methodStats[log.attempt_method].total++;
        if (log.success) {
          methodStats[log.attempt_method].success++;
        } else {
          methodStats[log.attempt_method].failed++;
        }
      });

      // Identify most problematic fields
      const fieldProblems = {};
      failedLogs.forEach(log => {
        (log.user_data_fields || []).forEach(field => {
          fieldProblems[field] = (fieldProblems[field] || 0) + 1;
        });
      });

      // Use AI to generate recommendations
      const apiKey = Deno.env.get("Gemini_PAID_pro");
      if (!apiKey) {
        return Response.json({
          success: false,
          error: 'AI API key not configured',
          stats: { successRate, avgDuration, methodStats, fieldProblems }
        });
      }

      const prompt = `Analyzuj Facebook CAPI tracking systém a vytvor optimalizačné odporúčania.

📊 AKTUÁLNE DÁTA:
- Success Rate: ${(successRate * 100).toFixed(1)}%
- Priemerná rýchlosť: ${avgDuration.toFixed(0)}ms
- Celkovo pokusov: ${logs.length}
- Zlyhania: ${failedLogs.length}

🔧 METÓDY (úspešnosť):
${Object.entries(methodStats).map(([method, stats]) => 
  `- ${method}: ${stats.success}/${stats.total} (${((stats.success/stats.total)*100).toFixed(0)}%)`
).join('\n')}

⚠️ PROBLEMATICKÉ POLIA (počet zlyhaní):
${Object.entries(fieldProblems).map(([field, count]) => `- ${field}: ${count}x`).join('\n')}

VYTVOR JSON ODPOVEĎ:
{
  "recommended_strategy": "Ktorú metódu preferovať ako prvú",
  "fields_to_avoid": ["Polia ktoré spôsobujú problémy"],
  "optimal_payload_size": "Odporúčaná veľkosť v KB",
  "predicted_issues": ["Čo môže zlyhať v budúcnosti"],
  "optimization_tips": ["Konkrétne tipy na zrýchlenie"],
  "duplicate_detection_rules": ["Pravidlá na detekciu duplikátov"],
  "reasoning": "Prečo si to takto rozhodol"
}`;

      const aiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      const aiResult = await aiResponse.json();
      const aiText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      return Response.json({
        success: true,
        stats: { successRate, avgDuration, methodStats, fieldProblems },
        recommendations: recommendations,
        last_updated: new Date().toISOString()
      });

    } else if (action === 'get_optimal_payload') {
      // Return optimal payload structure based on history
      const successfulLogs = logs.filter(l => l.success);
      
      // Find most successful method
      const methodCounts = {};
      successfulLogs.forEach(log => {
        methodCounts[log.attempt_method] = (methodCounts[log.attempt_method] || 0) + 1;
      });
      
      const bestMethod = Object.entries(methodCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'minimal';

      // Get average successful fields
      const fieldFrequency = {};
      successfulLogs.forEach(log => {
        (log.user_data_fields || []).forEach(field => {
          fieldFrequency[field] = (fieldFrequency[field] || 0) + 1;
        });
      });

      const safeFields = Object.entries(fieldFrequency)
        .filter(([field, count]) => count / successfulLogs.length > 0.8)
        .map(([field]) => field);

      return Response.json({
        success: true,
        optimal_method: bestMethod,
        safe_fields: safeFields,
        recommendation: `Use ${bestMethod} method with fields: ${safeFields.join(', ')}`
      });
    }

    return Response.json({ success: false, error: 'Unknown action' });

  } catch (error) {
    console.error('AI CAPI Optimizer error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});