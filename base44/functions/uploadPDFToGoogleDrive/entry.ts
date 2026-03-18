import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pdfBase64, fileName, folderId } = await req.json();

    if (!pdfBase64 || !fileName) {
      return Response.json({ error: 'Missing pdfBase64 or fileName' }, { status: 400 });
    }

    // Parse service account credentials
    const serviceAccountJson = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      return Response.json({ error: 'GOOGLE_SERVICE_ACCOUNT_JSON not configured' }, { status: 500 });
    }

    const credentials = JSON.parse(serviceAccountJson);

    // Create JWT for Google API authentication
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: 'RS256', typ: 'JWT' };
    const jwtClaim = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Encode JWT
    const encoder = new TextEncoder();
    const headerB64 = btoa(JSON.stringify(jwtHeader)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const claimB64 = btoa(JSON.stringify(jwtClaim)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const signatureInput = `${headerB64}.${claimB64}`;

    // Import private key
    const pemHeader = '-----BEGIN PRIVATE KEY-----';
    const pemFooter = '-----END PRIVATE KEY-----';
    const pemContents = credentials.private_key.substring(
      pemHeader.length,
      credentials.private_key.length - pemFooter.length - 1
    ).replace(/\s/g, '');
    
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign JWT
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      encoder.encode(signatureInput)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const jwt = `${signatureInput}.${signatureB64}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      return Response.json({ error: 'Failed to get access token', details: error }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    // Decode base64 PDF
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    // Upload to Google Drive
    const metadata = {
      name: fileName,
      mimeType: 'application/pdf',
      ...(folderId && { parents: [folderId] })
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/pdf\r\n' +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      pdfBase64 +
      closeDelimiter;

    const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      return Response.json({ error: 'Failed to upload to Google Drive', details: error }, { status: 500 });
    }

    const result = await uploadResponse.json();

    return Response.json({
      success: true,
      fileId: result.id,
      fileName: result.name,
      webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});