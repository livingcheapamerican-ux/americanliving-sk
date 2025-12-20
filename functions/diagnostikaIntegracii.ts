import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { OAuth2Client } from 'npm:google-auth-library@9.6.3';
import { google } from 'npm:googleapis@134.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || (user.role !== 'admin' && !user.super_admin)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      user: user.email,
      tests: []
    };

    // TEST 1: Core.InvokeLLM (user-scoped)
    try {
      const llmTest = await base44.integrations.Core.InvokeLLM({
        prompt: 'Odpoveď len "OK"'
      });
      diagnostics.tests.push({
        name: 'Core.InvokeLLM (user-scoped)',
        status: 'success',
        result: llmTest.substring(0, 50)
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'Core.InvokeLLM (user-scoped)',
        status: 'failed',
        error: error.message
      });
    }

    // TEST 2: Core.InvokeLLM (service role)
    try {
      const llmTestService = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: 'Odpoveď len "OK"'
      });
      diagnostics.tests.push({
        name: 'Core.InvokeLLM (service role)',
        status: 'success',
        result: llmTestService.substring(0, 50)
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'Core.InvokeLLM (service role)',
        status: 'failed',
        error: error.message
      });
    }

    // TEST 3: Gemini API Key
    const geminiKey = Deno.env.get("Gemini_PAID_pro");
    if (geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Test - odpovedz OK' }] }],
              generationConfig: { maxOutputTokens: 10 }
            })
          }
        );

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          diagnostics.tests.push({
            name: 'Gemini API (gemini-1.5-pro)',
            status: 'success',
            result: 'API kľúč funguje',
            model: 'gemini-1.5-pro'
          });
        } else {
          const errorText = await geminiResponse.text();
          diagnostics.tests.push({
            name: 'Gemini API (gemini-1.5-pro)',
            status: 'failed',
            error: errorText.substring(0, 200)
          });
        }
      } catch (error) {
        diagnostics.tests.push({
          name: 'Gemini API (gemini-1.5-pro)',
          status: 'failed',
          error: error.message
        });
      }
    } else {
      diagnostics.tests.push({
        name: 'Gemini API',
        status: 'warning',
        message: 'API kľúč nie je nastavený (Gemini_PAID_pro)'
      });
    }

    // TEST 4: Google Drive OAuth
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
      diagnostics.tests.push({
        name: 'Google OAuth credentials',
        status: 'success',
        message: 'Client ID a Secret sú nastavené'
      });

      // Skontrolovať tokeny používateľa
      if (user.google_drive_access_token) {
        try {
          const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
          oauth2Client.setCredentials({
            access_token: user.google_drive_access_token,
            refresh_token: user.google_drive_refresh_token,
            expiry_date: user.google_drive_token_expiry,
          });

          const drive = google.drive({ version: 'v3', auth: oauth2Client });
          const testList = await drive.files.list({ pageSize: 1 });
          
          diagnostics.tests.push({
            name: 'Google Drive prístup',
            status: 'success',
            message: 'Token je platný a funkčný'
          });
        } catch (error) {
          diagnostics.tests.push({
            name: 'Google Drive prístup',
            status: 'failed',
            error: error.message,
            suggestion: 'Token vypršal - znovu sa pripojte v Admin Google Drive'
          });
        }
      } else {
        diagnostics.tests.push({
          name: 'Google Drive prístup',
          status: 'warning',
          message: 'Používateľ nie je pripojený k Google Drive'
        });
      }
    } else {
      diagnostics.tests.push({
        name: 'Google OAuth credentials',
        status: 'failed',
        message: 'GOOGLE_CLIENT_ID alebo GOOGLE_CLIENT_SECRET nie sú nastavené'
      });
    }

    // TEST 5: Ostatné env variables
    const envTests = [
      { name: 'AI_MARKETING', key: 'AI_MARKETING' },
      { name: 'KONFIGA_API_ENDPOINT', key: 'KONFIGA_API_ENDPOINT' },
      { name: 'RESEND_API_KEY', key: 'RESEND_API_KEY' },
    ];

    envTests.forEach(test => {
      const value = Deno.env.get(test.key);
      diagnostics.tests.push({
        name: `Env: ${test.name}`,
        status: value ? 'success' : 'warning',
        message: value ? 'Nastavené' : 'Nie je nastavené'
      });
    });

    // Summary
    const successCount = diagnostics.tests.filter(t => t.status === 'success').length;
    const failedCount = diagnostics.tests.filter(t => t.status === 'failed').length;
    const warningCount = diagnostics.tests.filter(t => t.status === 'warning').length;

    diagnostics.summary = {
      total: diagnostics.tests.length,
      success: successCount,
      failed: failedCount,
      warnings: warningCount,
      overall_status: failedCount > 0 ? 'failed' : warningCount > 0 ? 'warning' : 'success'
    };

    return Response.json(diagnostics);

  } catch (error) {
    console.error('Diagnostika Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});