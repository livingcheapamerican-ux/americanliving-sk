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
    console.log('[GoogleDrive] Full URL:', url.toString());

    try {
        // Use a clean callback URL
        const origin = url.origin;
        const basePath = BASE44_APP_ID ? `/apps/${BASE44_APP_ID}` : '';
        const callbackUrl = `${origin}${basePath}/functions/googleDrive?action=callback`;
        
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
            
            console.log('[GoogleDrive] Authorizing user:', user.email, 'ID:', user.id);
            console.log('[GoogleDrive] State:', state);
            console.log('[GoogleDrive] Return URL:', returnUrl);
            
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/drive.readonly'],
                prompt: 'consent',
                state
            });
            
            console.log('[GoogleDrive] Auth URL:', authUrl);
            return Response.redirect(authUrl, 302);
        }

        // CALLBACK
        if (action === 'callback') {
            const code = url.searchParams.get('code');
            const stateStr = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            
            console.log('[GoogleDrive] ====== CALLBACK START ======');
            console.log('[GoogleDrive] Code present:', !!code);
            console.log('[GoogleDrive] State:', stateStr);
            console.log('[GoogleDrive] Error:', error);
            
            if (error) {
                console.error('[GoogleDrive] OAuth error from Google:', error);
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Authorization Failed</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error">✗</div>
                            <h1>Autorizácia zlyhala</h1>
                            <p>Chyba: ${error}</p>
                            <p><a href="javascript:window.close()">Zavrieť okno</a></p>
                        </div>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } });
            }
            
            if (!code || !stateStr) {
                console.error('[GoogleDrive] Missing code or state');
                return new Response('Missing code or state', { status: 400 });
            }

            let state;
            try {
                state = JSON.parse(stateStr);
                console.log('[GoogleDrive] Parsed state - userId:', state.userId);
            } catch (err) {
                console.error('[GoogleDrive] Failed to parse state:', err);
                return new Response('Invalid state parameter', { status: 400 });
            }

            try {
                console.log('[GoogleDrive] Step 1: Exchanging code for tokens...');
                const { tokens } = await oauth2Client.getToken(code);
                console.log('[GoogleDrive] ✓ Tokens received');
                console.log('[GoogleDrive]   - Access token length:', tokens.access_token?.length);
                console.log('[GoogleDrive]   - Refresh token present:', !!tokens.refresh_token);
                console.log('[GoogleDrive]   - Expiry:', tokens.expiry_date);
                
                if (!tokens.access_token) {
                    throw new Error('No access token received');
                }
                
                console.log('[GoogleDrive] Step 2: Creating service role client...');
                const base44 = createClientFromRequest(req);
                
                console.log('[GoogleDrive] Step 3: Fetching user...');
                const users = await base44.asServiceRole.entities.User.filter({ id: state.userId });
                
                if (users.length === 0) {
                    console.error('[GoogleDrive] ✗ User not found:', state.userId);
                    throw new Error('User not found');
                }
                
                console.log('[GoogleDrive] ✓ User found:', users[0].email);
                
                const updateData = {
                    google_drive_access_token: tokens.access_token,
                    google_drive_refresh_token: tokens.refresh_token || users[0].google_drive_refresh_token,
                    google_drive_token_expiry: tokens.expiry_date,
                };
                
                console.log('[GoogleDrive] Step 4: Updating user tokens...');
                console.log('[GoogleDrive]   - Access token to save:', updateData.google_drive_access_token.substring(0, 20) + '...');
                console.log('[GoogleDrive]   - Refresh token present:', !!updateData.google_drive_refresh_token);
                console.log('[GoogleDrive]   - Expiry to save:', updateData.google_drive_token_expiry);
                
                const updateResult = await base44.asServiceRole.entities.User.update(state.userId, updateData);
                console.log('[GoogleDrive] ✓ Update completed');
                console.log('[GoogleDrive]   - Result:', updateResult);
                
                // Verify the update
                console.log('[GoogleDrive] Step 5: Verifying update...');
                const verifyUsers = await base44.asServiceRole.entities.User.filter({ id: state.userId });
                const verifyUser = verifyUsers[0];
                console.log('[GoogleDrive] Verification:');
                console.log('[GoogleDrive]   - Access token saved:', !!verifyUser.google_drive_access_token);
                console.log('[GoogleDrive]   - Refresh token saved:', !!verifyUser.google_drive_refresh_token);
                console.log('[GoogleDrive]   - Expiry saved:', verifyUser.google_drive_token_expiry);
                
                if (!verifyUser.google_drive_access_token) {
                    console.error('[GoogleDrive] ✗ Verification failed - tokens not saved!');
                    throw new Error('Tokens were not saved properly');
                }
                
                console.log('[GoogleDrive] ✓✓✓ SUCCESS - All tokens saved and verified ✓✓✓');
                console.log('[GoogleDrive] ====== CALLBACK COMPLETE ======');
                
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Authorization Successful</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                            .success { color: #059669; font-size: 48px; margin-bottom: 20px; animation: bounce 0.5s; }
                            @keyframes bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                            .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #059669; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="success">✓</div>
                            <h1>Úspešne pripojené!</h1>
                            <p>Google Drive bol úspešne pripojený.</p>
                            <div class="spinner"></div>
                            <p>Presmerovávam...</p>
                        </div>
                        <script>
                            console.log('Redirecting with reload...');
                            setTimeout(() => {
                                window.location.href = '${state.returnUrl}?_refresh=' + Date.now();
                            }, 1500);
                        </script>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } });
            } catch (callbackError) {
                console.error('[GoogleDrive] ====== CALLBACK ERROR ======');
                console.error('[GoogleDrive] Error:', callbackError.message);
                console.error('[GoogleDrive] Stack:', callbackError.stack);
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Error</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
                            .details { background: #fee; border: 1px solid #fcc; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error">✗</div>
                            <h1>Chyba pri autorizácii</h1>
                            <div class="details">${callbackError.message}\n\n${callbackError.stack}</div>
                            <p><a href="${state.returnUrl}">Späť</a></p>
                        </div>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } });
            }
        }

        // All other actions require authentication
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            console.error('[GoogleDrive] No authenticated user');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[GoogleDrive] User authenticated:', user.email);

        // Helper to refresh tokens
        const refreshTokensIfNeeded = async () => {
            if (!user.google_drive_access_token) {
                console.error('[GoogleDrive] No access token');
                throw new Error('Not authorized. Please connect Google Drive.');
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
                console.error('[GoogleDrive] Token refresh failed:', refreshError);
                throw new Error('Token expired. Please re-authorize.');
            }
        };

        // LIST FOLDERS
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

        // SEARCH FILES
        if (action === 'searchFiles') {
            const searchQuery = url.searchParams.get('q');
            if (!searchQuery || searchQuery.trim() === '') {
                return Response.json({ error: 'Search query missing' }, { status: 400 });
            }

            await refreshTokensIfNeeded();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            let query = `name contains '${searchQuery.replace(/'/g, "\\'")}' and trashed=false`;
            
            if (GOOGLE_DRIVE_FOLDER_IDS && GOOGLE_DRIVE_FOLDER_IDS.trim()) {
                const folderIds = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                const folderQueries = folderIds.map(id => `'${id}' in parents`).join(' or ');
                query += ` and (${folderQueries})`;
            }
            
            const res = await drive.files.list({
                pageSize: 50,
                q: query,
                fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size)',
                orderBy: 'name'
            });
            
            return Response.json(res.data.files || []);
        }

        // LIST FILES
        if (action === 'listFiles') {
            await refreshTokensIfNeeded();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            let query = "trashed=false and mimeType != 'application/vnd.google-apps.folder'";
            if (GOOGLE_DRIVE_FOLDER_IDS && GOOGLE_DRIVE_FOLDER_IDS.trim()) {
                const folderIds = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                const folderQueries = folderIds.map(id => `'${id}' in parents`).join(' or ');
                query += ` and (${folderQueries})`;
            }
            
            const res = await drive.files.list({
                pageSize: 100,
                q: query,
                fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, parents)',
            });
            
            return Response.json(res.data.files || []);
        }
        
        // GET FILE CONTENT
        if (action === 'getFileContent') {
            const fileId = url.searchParams.get('fileId');
            if (!fileId) {
                return Response.json({ error: 'File ID missing' }, { status: 400 });
            }

            await refreshTokensIfNeeded();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            if (GOOGLE_DRIVE_FOLDER_IDS && GOOGLE_DRIVE_FOLDER_IDS.trim()) {
                const fileMetadata = await drive.files.get({
                    fileId: fileId,
                    fields: 'parents'
                });
                
                const allowedFolderIds = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                const fileParents = fileMetadata.data.parents || [];
                
                const isInAllowedFolder = fileParents.some(parent => 
                    allowedFolderIds.includes(parent)
                );
                
                if (!isInAllowedFolder) {
                    return Response.json({ error: 'Access denied' }, { status: 403 });
                }
            }
            
            const res = await drive.files.get({ 
                fileId: fileId, 
                alt: 'media'
            }, { responseType: 'stream' });

            let fileContent = '';
            for await (const chunk of res.data) {
                fileContent += new TextDecoder().decode(chunk);
            }

            return new Response(fileContent, {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        return Response.json({ 
            error: 'Invalid action',
            available: ['authorize', 'callback', 'listFolders', 'searchFiles', 'listFiles', 'getFileContent']
        }, { status: 400 });

    } catch (error) {
        console.error('[GoogleDrive] Error:', error.message);
        
        if (error.message && (error.message.includes('Token expired') || error.message.includes('Not authorized'))) {
            return Response.json({ 
                error: error.message,
                needsAuth: true 
            }, { status: 403 });
        }
        
        return Response.json({ 
            error: error.message
        }, { status: 500 });
    }
});