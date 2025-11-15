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
    
    console.log('[GoogleDrive] ===== REQUEST START =====');
    console.log('[GoogleDrive] Action:', action);
    console.log('[GoogleDrive] URL:', url.toString());
    console.log('[GoogleDrive] Origin:', url.origin);
    console.log('[GoogleDrive] Pathname:', url.pathname);

    try {
        // Build callback URL - remove /preview/ if present
        const origin = url.origin;
        let callbackPath = url.pathname.replace(/\/preview\/.*$/, '');
        if (!callbackPath.endsWith('/googleDrive')) {
            callbackPath = callbackPath.replace(/\/[^/]*$/, '/googleDrive');
        }
        const callbackUrl = `${origin}${callbackPath}?action=callback`;
        
        console.log('[GoogleDrive] Callback URL:', callbackUrl);
        
        const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, callbackUrl);

        // AUTHORIZE
        if (action === 'authorize') {
            const base44 = createClientFromRequest(req);
            const user = await base44.auth.me();
            
            if (!user) {
                console.error('[GoogleDrive] No user found');
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            
            const returnUrl = url.searchParams.get('return_url') || '/';
            const state = JSON.stringify({ userId: user.id, returnUrl });
            
            console.log('[GoogleDrive] User:', user.email);
            console.log('[GoogleDrive] User ID:', user.id);
            console.log('[GoogleDrive] Return URL:', returnUrl);
            
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/drive.readonly'],
                prompt: 'consent',
                state
            });
            
            console.log('[GoogleDrive] Redirecting to:', authUrl);
            return Response.redirect(authUrl, 302);
        }

        // CALLBACK
        if (action === 'callback') {
            const code = url.searchParams.get('code');
            const stateStr = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            
            console.log('[GoogleDrive] ===== CALLBACK =====');
            console.log('[GoogleDrive] Has code:', !!code);
            console.log('[GoogleDrive] Has state:', !!stateStr);
            console.log('[GoogleDrive] Error:', error);
            
            if (error) {
                console.error('[GoogleDrive] OAuth error:', error);
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Chyba</title>
                        <style>
                            body { font-family: system-ui; text-align: center; padding: 50px; background: #fef2f2; }
                            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                            .error { color: #dc2626; font-size: 60px; margin-bottom: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error">✗</div>
                            <h1>Chyba autorizácie</h1>
                            <p>Google OAuth chyba: ${error}</p>
                            <p><button onclick="window.close()">Zavrieť</button></p>
                        </div>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
            }
            
            if (!code || !stateStr) {
                console.error('[GoogleDrive] Missing code or state');
                return new Response('Missing authorization code or state', { status: 400 });
            }

            let state;
            try {
                state = JSON.parse(stateStr);
                console.log('[GoogleDrive] State parsed - userId:', state.userId);
            } catch (err) {
                console.error('[GoogleDrive] State parse error:', err);
                return new Response('Invalid state', { status: 400 });
            }

            try {
                console.log('[GoogleDrive] [1/4] Exchanging code...');
                const { tokens } = await oauth2Client.getToken(code);
                console.log('[GoogleDrive] ✓ Tokens received');
                console.log('[GoogleDrive]     Access:', tokens.access_token?.substring(0, 30) + '...');
                console.log('[GoogleDrive]     Refresh:', tokens.refresh_token ? 'YES' : 'NO');
                console.log('[GoogleDrive]     Expiry:', tokens.expiry_date);
                
                if (!tokens.access_token) {
                    throw new Error('No access_token in response');
                }
                
                console.log('[GoogleDrive] [2/4] Creating service client...');
                const base44 = createClientFromRequest(req);
                
                console.log('[GoogleDrive] [3/4] Finding user:', state.userId);
                const users = await base44.asServiceRole.entities.User.filter({ id: state.userId });
                
                if (!users || users.length === 0) {
                    throw new Error(`User not found: ${state.userId}`);
                }
                
                const user = users[0];
                console.log('[GoogleDrive] ✓ User found:', user.email);
                
                const updateData = {
                    google_drive_access_token: tokens.access_token,
                    google_drive_refresh_token: tokens.refresh_token || user.google_drive_refresh_token || null,
                    google_drive_token_expiry: tokens.expiry_date || null,
                };
                
                console.log('[GoogleDrive] [4/4] Saving tokens...');
                console.log('[GoogleDrive]     Saving access token:', updateData.google_drive_access_token.substring(0, 30) + '...');
                console.log('[GoogleDrive]     Saving refresh token:', updateData.google_drive_refresh_token ? 'YES' : 'NO');
                console.log('[GoogleDrive]     Saving expiry:', updateData.google_drive_token_expiry);
                
                await base44.asServiceRole.entities.User.update(state.userId, updateData);
                console.log('[GoogleDrive] ✓ User updated');
                
                // Verify
                console.log('[GoogleDrive] [VERIFY] Checking saved data...');
                const verifyUsers = await base44.asServiceRole.entities.User.filter({ id: state.userId });
                const verifiedUser = verifyUsers[0];
                
                console.log('[GoogleDrive] ===== VERIFICATION =====');
                console.log('[GoogleDrive] Access token saved:', verifiedUser.google_drive_access_token ? 'YES (' + verifiedUser.google_drive_access_token.substring(0, 30) + '...)' : 'NO');
                console.log('[GoogleDrive] Refresh token saved:', verifiedUser.google_drive_refresh_token ? 'YES' : 'NO');
                console.log('[GoogleDrive] Expiry saved:', verifiedUser.google_drive_token_expiry || 'NO');
                
                if (!verifiedUser.google_drive_access_token) {
                    throw new Error('VERIFICATION FAILED: Tokens not saved!');
                }
                
                console.log('[GoogleDrive] ✓✓✓ SUCCESS ✓✓✓');
                
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Úspech</title>
                        <style>
                            body { font-family: system-ui; text-align: center; padding: 50px; background: #f0fdf4; }
                            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                            .success { color: #059669; font-size: 60px; margin-bottom: 20px; animation: pop 0.5s ease-out; }
                            @keyframes pop { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
                            .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #059669; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
                            @keyframes spin { 100% { transform: rotate(360deg); } }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="success">✓</div>
                            <h1>Úspešne pripojené!</h1>
                            <p>Google Drive je teraz pripojený k vášmu účtu.</p>
                            <div class="spinner"></div>
                            <p>Presmerovávam...</p>
                        </div>
                        <script>
                            setTimeout(() => {
                                window.location.href = '${state.returnUrl}' + (${state.returnUrl}.includes('?') ? '&' : '?') + 't=' + Date.now();
                            }, 1500);
                        </script>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
                
            } catch (callbackError) {
                console.error('[GoogleDrive] ===== CALLBACK ERROR =====');
                console.error('[GoogleDrive]', callbackError.message);
                console.error('[GoogleDrive]', callbackError.stack);
                
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Chyba</title>
                        <style>
                            body { font-family: system-ui; padding: 50px; background: #fef2f2; }
                            .container { max-width: 700px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px; }
                            .error { color: #dc2626; font-size: 60px; text-align: center; margin-bottom: 20px; }
                            .details { background: #fee; border: 1px solid #fcc; border-radius: 8px; padding: 20px; font-family: monospace; font-size: 12px; white-space: pre-wrap; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error">✗</div>
                            <h1 style="text-align: center;">Chyba pri ukladaní</h1>
                            <div class="details">${callbackError.message}\n\n${callbackError.stack}</div>
                            <p style="text-align: center;"><a href="${state.returnUrl}">← Späť</a></p>
                        </div>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
            }
        }

        // All other actions need auth
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const refreshTokensIfNeeded = async () => {
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
            } catch (refreshError) {
                throw new Error('Token expired. Please re-authorize.');
            }
        };

        if (action === 'listFolders') {
            await refreshTokensIfNeeded();
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
            const searchQuery = url.searchParams.get('q');
            if (!searchQuery) {
                return Response.json({ error: 'Missing query' }, { status: 400 });
            }

            await refreshTokensIfNeeded();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            let query = `name contains '${searchQuery.replace(/'/g, "\\'")}' and trashed=false`;
            if (GOOGLE_DRIVE_FOLDER_IDS) {
                const folderIds = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                query += ` and (${folderIds.map(id => `'${id}' in parents`).join(' or ')})`;
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
            await refreshTokensIfNeeded();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            let query = "trashed=false and mimeType != 'application/vnd.google-apps.folder'";
            if (GOOGLE_DRIVE_FOLDER_IDS) {
                const folderIds = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                query += ` and (${folderIds.map(id => `'${id}' in parents`).join(' or ')})`;
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
            if (!fileId) {
                return Response.json({ error: 'Missing fileId' }, { status: 400 });
            }

            await refreshTokensIfNeeded();
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
        console.error('[GoogleDrive] ERROR:', error.message);
        
        if (error.message?.includes('Token expired') || error.message?.includes('Not authorized')) {
            return Response.json({ error: error.message, needsAuth: true }, { status: 403 });
        }
        
        return Response.json({ error: error.message }, { status: 500 });
    }
});