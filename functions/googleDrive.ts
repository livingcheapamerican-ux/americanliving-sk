import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { OAuth2Client } from 'npm:google-auth-library@9.6.3';
import { google } from 'npm:googleapis@134.0.0';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_DRIVE_FOLDER_IDS = Deno.env.get("GOOGLE_DRIVE_FOLDER_IDS");
const BASE44_APP_ID = Deno.env.get("BASE44_APP_ID");

Deno.serve(async (req) => {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'listFiles';
    
    console.log('[GoogleDrive] Action:', action);
    console.log('[GoogleDrive] URL:', url.toString());

    try {
        // Always use production domain for callback, not preview URLs
        const callbackUrl = BASE44_APP_ID 
            ? `https://${BASE44_APP_ID}.base44.io/functions/googleDrive?action=callback`
            : `${url.origin}/functions/googleDrive?action=callback`;
        
        console.log('[GoogleDrive] Callback URL:', callbackUrl);
        
        const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, callbackUrl);

        // AUTHORIZE
        if (action === 'authorize') {
            const base44 = createClientFromRequest(req);
            const user = await base44.auth.me();
            
            if (!user) {
                console.error('[GoogleDrive] No user');
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            
            const returnUrl = url.searchParams.get('return_url') || '/';
            const state = JSON.stringify({ userId: user.id, returnUrl });
            
            console.log('[GoogleDrive] User:', user.email, 'ID:', user.id);
            
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/drive.readonly'],
                prompt: 'consent',
                state
            });
            
            console.log('[GoogleDrive] Redirecting to Google OAuth');
            return Response.redirect(authUrl, 302);
        }

        // CALLBACK
        if (action === 'callback') {
            const code = url.searchParams.get('code');
            const stateStr = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            
            console.log('[GoogleDrive] === CALLBACK ===');
            console.log('[GoogleDrive] Code:', !!code);
            console.log('[GoogleDrive] Error:', error);
            
            if (error) {
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"><title>Chyba</title>
                    <style>body{font-family:system-ui;text-align:center;padding:50px;background:#fef2f2}.error{color:#dc2626;font-size:60px}</style>
                    </head>
                    <body><div class="error">✗</div><h1>Chyba: ${error}</h1></body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } });
            }
            
            if (!code || !stateStr) {
                return new Response('Missing code or state', { status: 400 });
            }

            let state;
            try {
                state = JSON.parse(stateStr);
            } catch (err) {
                return new Response('Invalid state', { status: 400 });
            }

            try {
                console.log('[GoogleDrive] [1] Exchanging code...');
                const { tokens } = await oauth2Client.getToken(code);
                console.log('[GoogleDrive] ✓ Got tokens');
                
                if (!tokens.access_token) {
                    throw new Error('No access token');
                }
                
                console.log('[GoogleDrive] [2] Creating service client...');
                const base44 = createClientFromRequest(req);
                
                console.log('[GoogleDrive] [3] Finding user...');
                const users = await base44.asServiceRole.entities.User.filter({ id: state.userId });
                
                if (!users || users.length === 0) {
                    throw new Error('User not found');
                }
                
                console.log('[GoogleDrive] [4] Saving tokens...');
                await base44.asServiceRole.entities.User.update(state.userId, {
                    google_drive_access_token: tokens.access_token,
                    google_drive_refresh_token: tokens.refresh_token || users[0].google_drive_refresh_token,
                    google_drive_token_expiry: tokens.expiry_date,
                });
                
                console.log('[GoogleDrive] ✓ SUCCESS');
                
                // Redirect to production URL, not preview
                const finalReturnUrl = BASE44_APP_ID 
                    ? `https://${BASE44_APP_ID}.base44.io${state.returnUrl.startsWith('/') ? state.returnUrl : '/' + state.returnUrl}`
                    : state.returnUrl;
                
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"><title>Úspech</title>
                    <style>
                    body{font-family:system-ui;text-align:center;padding:50px;background:#f0fdf4}
                    .success{color:#059669;font-size:60px;animation:pop .5s}
                    @keyframes pop{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
                    .spinner{border:4px solid #f3f3f3;border-top:4px solid #059669;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:20px auto}
                    @keyframes spin{100%{transform:rotate(360deg)}}
                    </style>
                    </head>
                    <body>
                    <div class="success">✓</div>
                    <h1>Úspešne pripojené!</h1>
                    <div class="spinner"></div>
                    <script>setTimeout(()=>{window.location.href='${finalReturnUrl}'+(${finalReturnUrl}.includes('?')?'&':'?')+'t='+Date.now()},1500)</script>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } });
                
            } catch (err) {
                console.error('[GoogleDrive] ERROR:', err.message);
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="UTF-8"><title>Chyba</title>
                    <style>body{font-family:system-ui;padding:50px;background:#fef2f2}.error{color:#dc2626;font-size:60px;text-align:center}</style>
                    </head>
                    <body><div class="error">✗</div><h1 style="text-align:center">Chyba</h1><pre style="background:#fee;padding:20px;border-radius:8px">${err.message}</pre></body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } });
            }
        }

        // All other actions need auth
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const refreshTokens = async () => {
            if (!user.google_drive_access_token) {
                throw new Error('Not authorized');
            }

            oauth2Client.setCredentials({
                access_token: user.google_drive_access_token,
                refresh_token: user.google_drive_refresh_token,
                expiry_date: user.google_drive_token_expiry,
            });

            try {
                const { credentials } = await oauth2Client.refreshAccessToken();
                
                if (credentials.access_token !== user.google_drive_access_token) {
                    await base44.auth.updateMe({
                        google_drive_access_token: credentials.access_token,
                        google_drive_refresh_token: credentials.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: credentials.expiry_date,
                    });
                    oauth2Client.setCredentials(credentials);
                }
            } catch (err) {
                throw new Error('Token expired');
            }
        };

        if (action === 'listFolders') {
            await refreshTokens();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            const res = await drive.files.list({
                pageSize: 100,
                q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name, modifiedTime, webViewLink)',
                orderBy: 'name'
            });
            return Response.json(res.data.files || []);
        }

        if (action === 'searchFiles') {
            const q = url.searchParams.get('q');
            if (!q) return Response.json({ error: 'Missing query' }, { status: 400 });

            await refreshTokens();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            let query = `name contains '${q.replace(/'/g, "\\'")}' and trashed=false`;
            if (GOOGLE_DRIVE_FOLDER_IDS) {
                const ids = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                query += ` and (${ids.map(id => `'${id}' in parents`).join(' or ')})`;
            }
            
            const res = await drive.files.list({
                pageSize: 50,
                q: query,
                fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size)',
                orderBy: 'name'
            });
            return Response.json(res.data.files || []);
        }

        if (action === 'listFiles') {
            await refreshTokens();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            let query = "trashed=false and mimeType != 'application/vnd.google-apps.folder'";
            if (GOOGLE_DRIVE_FOLDER_IDS) {
                const ids = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                query += ` and (${ids.map(id => `'${id}' in parents`).join(' or ')})`;
            }
            
            const res = await drive.files.list({
                pageSize: 100,
                q: query,
                fields: 'files(id, name, mimeType, modifiedTime, webViewLink, parents)',
            });
            return Response.json(res.data.files || []);
        }
        
        if (action === 'getFileContent') {
            const fileId = url.searchParams.get('fileId');
            if (!fileId) return Response.json({ error: 'Missing fileId' }, { status: 400 });

            await refreshTokens();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            if (GOOGLE_DRIVE_FOLDER_IDS) {
                const meta = await drive.files.get({ fileId, fields: 'parents' });
                const allowed = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                if (!(meta.data.parents || []).some(p => allowed.includes(p))) {
                    return Response.json({ error: 'Access denied' }, { status: 403 });
                }
            }
            
            const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
            let content = '';
            for await (const chunk of res.data) {
                content += new TextDecoder().decode(chunk);
            }
            return new Response(content, { headers: { 'Content-Type': 'text/plain' } });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('[GoogleDrive] Error:', error.message);
        
        if (error.message?.includes('Token expired') || error.message?.includes('Not authorized')) {
            return Response.json({ error: error.message, needsAuth: true }, { status: 403 });
        }
        
        return Response.json({ error: error.message }, { status: 500 });
    }
});