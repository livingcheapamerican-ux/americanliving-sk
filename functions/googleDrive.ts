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
        // Use a clean callback URL without /preview/
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
                            .message { color: #333; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error">✗</div>
                            <h1>Autorizácia zlyhala</h1>
                            <p class="message">Chyba: ${error}</p>
                            <p><a href="javascript:window.close()">Zavrieť okno</a></p>
                        </div>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } });
            }
            
            if (!code) {
                console.error('[GoogleDrive] Missing authorization code');
                return new Response('Missing authorization code', { status: 400 });
            }

            if (!stateStr) {
                console.error('[GoogleDrive] Missing state parameter');
                return new Response('Missing state parameter', { status: 400 });
            }

            let state;
            try {
                state = JSON.parse(stateStr);
                console.log('[GoogleDrive] Parsed state:', state);
            } catch (err) {
                console.error('[GoogleDrive] Failed to parse state:', err);
                return new Response('Invalid state parameter', { status: 400 });
            }

            try {
                console.log('[GoogleDrive] Exchanging code for tokens...');
                const { tokens } = await oauth2Client.getToken(code);
                console.log('[GoogleDrive] ✓ Tokens received from Google');
                console.log('[GoogleDrive] - Access token present:', !!tokens.access_token);
                console.log('[GoogleDrive] - Refresh token present:', !!tokens.refresh_token);
                console.log('[GoogleDrive] - Expiry date:', tokens.expiry_date);
                
                if (!tokens.access_token) {
                    throw new Error('No access token received from Google');
                }
                
                // Create service role client - no user context needed
                console.log('[GoogleDrive] Creating service role client...');
                const base44 = createClientFromRequest(req);
                
                console.log('[GoogleDrive] Fetching user with ID:', state.userId);
                const users = await base44.asServiceRole.entities.User.filter({ id: state.userId });
                
                if (users.length === 0) {
                    console.error('[GoogleDrive] ✗ User not found with ID:', state.userId);
                    throw new Error('User not found');
                }
                
                const user = users[0];
                console.log('[GoogleDrive] ✓ User found:', user.email);
                
                const updateData = {
                    google_drive_access_token: tokens.access_token,
                    google_drive_refresh_token: tokens.refresh_token || user.google_drive_refresh_token,
                    google_drive_token_expiry: tokens.expiry_date,
                };
                
                console.log('[GoogleDrive] Updating user with tokens...');
                console.log('[GoogleDrive] - Access token length:', updateData.google_drive_access_token?.length);
                console.log('[GoogleDrive] - Refresh token present:', !!updateData.google_drive_refresh_token);
                
                await base44.asServiceRole.entities.User.update(state.userId, updateData);
                
                console.log('[GoogleDrive] ✓ Tokens saved successfully');
                console.log('[GoogleDrive] ====== CALLBACK SUCCESS ======');
                
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
                            .message { color: #333; margin: 20px 0; }
                            .spinner { border: 3px solid #f3f3f3; border-top: 3px solid #059669; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto; }
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="success">✓</div>
                            <h1>Úspešne pripojené!</h1>
                            <p class="message">Google Drive bol úspešne pripojený k vašemu účtu.</p>
                            <div class="spinner"></div>
                            <p class="message">Presmerovávam späť...</p>
                        </div>
                        <script>
                            console.log('Callback successful, redirecting to:', '${state.returnUrl}');
                            setTimeout(() => {
                                window.location.href = '${state.returnUrl}';
                            }, 2000);
                        </script>
                    </body>
                    </html>
                `, {
                    headers: { 'Content-Type': 'text/html' }
                });
            } catch (callbackError) {
                console.error('[GoogleDrive] ====== CALLBACK ERROR ======');
                console.error('[GoogleDrive] Error:', callbackError.message);
                console.error('[GoogleDrive] Stack:', callbackError.stack);
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Authorization Error</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
                            .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
                            .message { color: #333; margin: 20px 0; }
                            .details { background: #fee; border: 1px solid #fcc; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left; font-family: monospace; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error">✗</div>
                            <h1>Chyba pri autorizácii</h1>
                            <p class="message">Nepodarilo sa uložiť prihlasovacie údaje.</p>
                            <div class="details">
                                <strong>Chyba:</strong> ${callbackError.message}
                            </div>
                            <p><a href="${state.returnUrl}">Späť na administráciu</a></p>
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

        // Helper function to refresh tokens
        const refreshTokensIfNeeded = async () => {
            if (!user.google_drive_access_token) {
                console.error('[GoogleDrive] No access token found for user');
                throw new Error('Not authorized. Please connect your Google Drive account.');
            }

            console.log('[GoogleDrive] Setting credentials...');
            oauth2Client.setCredentials({
                access_token: user.google_drive_access_token,
                refresh_token: user.google_drive_refresh_token,
                expiry_date: user.google_drive_token_expiry,
            });

            try {
                console.log('[GoogleDrive] Checking if token refresh needed...');
                const { credentials } = await oauth2Client.refreshAccessToken();
                console.log('[GoogleDrive] Token refreshed successfully');
                
                if (credentials.access_token !== user.google_drive_access_token) {
                    console.log('[GoogleDrive] Saving refreshed tokens...');
                    await base44.auth.updateMe({
                        google_drive_access_token: credentials.access_token,
                        google_drive_refresh_token: credentials.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: credentials.expiry_date,
                    });
                    oauth2Client.setCredentials(credentials);
                }
            } catch (refreshError) {
                console.error('[GoogleDrive] Token refresh failed:', refreshError.message);
                throw new Error('Token expired. Please re-authorize your Google Drive connection.');
            }
        };

        // LIST FOLDERS
        if (action === 'listFolders') {
            console.log('[GoogleDrive] Listing folders...');
            await refreshTokensIfNeeded();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            const res = await drive.files.list({
                pageSize: 100,
                q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name, modifiedTime, webViewLink)',
                orderBy: 'name'
            });
            
            console.log('[GoogleDrive] Found folders:', res.data.files?.length || 0);
            return Response.json(res.data.files || []);
        }

        // SEARCH FILES
        if (action === 'searchFiles') {
            const searchQuery = url.searchParams.get('q');
            if (!searchQuery || searchQuery.trim() === '') {
                return Response.json({ error: 'Search query missing' }, { status: 400 });
            }

            console.log('[GoogleDrive] Searching files with query:', searchQuery);
            await refreshTokensIfNeeded();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            let query = `name contains '${searchQuery.replace(/'/g, "\\'")}' and trashed=false`;
            
            if (GOOGLE_DRIVE_FOLDER_IDS && GOOGLE_DRIVE_FOLDER_IDS.trim()) {
                const folderIds = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                const folderQueries = folderIds.map(id => `'${id}' in parents`).join(' or ');
                query += ` and (${folderQueries})`;
            }
            
            console.log('[GoogleDrive] Search query:', query);
            
            const res = await drive.files.list({
                pageSize: 50,
                q: query,
                fields: 'files(id, name, mimeType, modifiedTime, webViewLink, size)',
                orderBy: 'name'
            });
            
            console.log('[GoogleDrive] Search results:', res.data.files?.length || 0);
            return Response.json(res.data.files || []);
        }

        // LIST FILES
        if (action === 'listFiles') {
            console.log('[GoogleDrive] Listing files...');
            await refreshTokensIfNeeded();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            let query = "trashed=false and mimeType != 'application/vnd.google-apps.folder'";
            if (GOOGLE_DRIVE_FOLDER_IDS && GOOGLE_DRIVE_FOLDER_IDS.trim()) {
                const folderIds = GOOGLE_DRIVE_FOLDER_IDS.split(',').map(id => id.trim());
                const folderQueries = folderIds.map(id => `'${id}' in parents`).join(' or ');
                query += ` and (${folderQueries})`;
            }
            
            console.log('[GoogleDrive] List query:', query);
            
            const res = await drive.files.list({
                pageSize: 100,
                q: query,
                fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, webViewLink, parents)',
            });
            
            console.log('[GoogleDrive] Found files:', res.data.files?.length || 0);
            return Response.json(res.data.files || []);
        }
        
        // GET FILE CONTENT
        if (action === 'getFileContent') {
            const fileId = url.searchParams.get('fileId');
            if (!fileId) {
                return Response.json({ error: 'File ID missing' }, { status: 400 });
            }

            console.log('[GoogleDrive] Getting file content:', fileId);
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
                    console.error('[GoogleDrive] Access denied to file:', fileId);
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

            console.log('[GoogleDrive] File content retrieved, length:', fileContent.length);
            return new Response(fileContent, {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        return Response.json({ 
            error: 'Invalid action',
            available: ['authorize', 'callback', 'listFolders', 'searchFiles', 'listFiles', 'getFileContent']
        }, { status: 400 });

    } catch (error) {
        console.error('[GoogleDrive] ====== GLOBAL ERROR ======');
        console.error('[GoogleDrive] Error:', error.message);
        console.error('[GoogleDrive] Stack:', error.stack);
        
        // Check if it's an auth error
        if (error.message && (error.message.includes('Token expired') || error.message.includes('Not authorized'))) {
            return Response.json({ 
                error: error.message,
                needsAuth: true 
            }, { status: 403 });
        }
        
        return Response.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});