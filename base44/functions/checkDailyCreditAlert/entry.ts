import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { startOfDay, parseISO } from 'npm:date-fns@3.6.0';

/**
 * Skontroluje dennú spotrebu kreditov a pošle alert ak je prekročený limit
 * Spustí sa denne o 6:00 v UTC (4:00 CET - predpokladané)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Načítaj konfiguráciu limitu
    const configs = await base44.asServiceRole.entities.AppConfiguration.filter({
      config_key: 'credit_daily_limit'
    });
    
    const dailyLimit = configs[0]?.config_value?.limit || 100;

    // Načítaj záznamy z dnešného dňa
    const today = startOfDay(new Date());
    const allLogs = await base44.asServiceRole.entities.IntegrationLog.list('-created_date', 500);
    
    const todayLogs = allLogs.filter(log => {
      const logDate = startOfDay(parseISO(log.created_date));
      return logDate.getTime() === today.getTime();
    });

    const todayCredits = todayLogs.reduce((sum, l) => sum + (l.estimated_credits || 1), 0);

    console.log(`[Credit Alert Check] Today: ${todayCredits}/${dailyLimit} credits`);

    // Ak je prekročený limit, pošli email
    if (todayCredits > dailyLimit) {
      const adminEmail = 'living.cheap.american@gmail.com'; // Zmeniť na skutočný email

      const topFunctions = Object.entries(
        todayLogs.reduce((acc, l) => {
          acc[l.function_name] = acc[l.function_name] || { count: 0, credits: 0 };
          acc[l.function_name].count += 1;
          acc[l.function_name].credits += l.estimated_credits || 1;
          return acc;
        }, {})
      )
        .sort((a, b) => b[1].credits - a[1].credits)
        .slice(0, 5)
        .map(([name, data]) => `${name}: ${data.credits} kr (${data.count}×)`)
        .join('\n');

      const emailBody = `
🚨 AI CREDIT ALERT - Denný limit prekročený!

Dnes ste spotrebovali: ${todayCredits} kreditov
Denný limit: ${dailyLimit} kreditov
Prekročenie: ${todayCredits - dailyLimit} kreditov (${Math.round(((todayCredits - dailyLimit) / dailyLimit) * 100)}%)

TOP ŽRÚTI:
${topFunctions}

AKCIA:
1. Otvor https://americanliving.sk/admin/credit-monitor
2. Skontroluj ktoré funkcie sú problematické
3. Zmierni ich spustenie alebo patrí do batch procesov

Dashboard pre monitoring: /admin/credit-monitor
      `;

      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `🚨 AI Credit Alert: ${todayCredits}/${dailyLimit} kreditov (PREKROČENÉ!)`,
        body: emailBody
      });

      // Loguj sám alert
      await base44.asServiceRole.entities.IntegrationLog.create({
        function_name: 'checkDailyCreditAlert',
        integration_type: 'SendEmail',
        trigger: 'automation_scheduled',
        status: 'success',
        estimated_credits: 0,
        details: `Alert sent: ${todayCredits}/${dailyLimit}`
      });

      console.log(`✉️ Alert email sent to ${adminEmail}`);
    }

    return Response.json({ 
      success: true, 
      todayCredits, 
      dailyLimit,
      alerted: todayCredits > dailyLimit
    });

  } catch (error) {
    console.error('Credit Alert Check Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});