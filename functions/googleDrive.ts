import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { OAuth2Client } from 'npm:google-auth-library@9.6.3';
import { google } from 'npm:googleapis@134.0.0';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_DRIVE_FOLDER_IDS = Deno.env.get("GOOGLE_DRIVE_FOLDER_IDS");

Deno.serve(async (req) => {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'listFiles';
    
    console.log('[GoogleDrive] Action:', action);
    console.log('[GoogleDrive] URL:', url.toString());

    try {
        const callbackUrl = `${url.origin}${url.pathname}?action=callback`;
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
            
            console.log('[GoogleDrive] User:', user.email, 'ID:', user.id);
            console.log('[GoogleDrive] State:', state);
            
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/drive.readonly'],
                prompt: 'consent',
                state
            });
            
            console.log('[GoogleDrive] Redirecting to auth URL');
            return Response.redirect(authUrl, 302);
        }

        // CALLBACK
        if (action === 'callback') {
            const code = url.searchParams.get('code');
            const stateStr = url.searchParams.get('state');
            const error = url.searchParams.get('error');
            
            console.log('[GoogleDrive] Callback received');
            console.log('[GoogleDrive] Code:', code ? 'present' : 'missing');
            console.log('[GoogleDrive] State:', stateStr);
            console.log('[GoogleDrive] Error:', error);
            
            if (error) {
                console.error('[GoogleDrive] OAuth error:', error);
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Authorization Failed</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; }
                            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="error">✗</div>
                        <h1>Autorizácia zlyhala</h1>
                        <p>Chyba: ${error}</p>
                        <p><a href="javascript:window.close()">Zavrieť okno</a></p>
                    </body>
                    </html>
                `, { headers: { 'Content-Type': 'text/html' } });
            }
            
            if (!code || !stateStr) {
                console.error('[GoogleDrive] Missing code or state');
                return new Response('Missing code or state', { status: 400 });
            }

            try {
                console.log('[GoogleDrive] Exchanging code for tokens...');
                const { tokens } = await oauth2Client.getToken(code);
                console.log('[GoogleDrive] Tokens received:', {
                    hasAccessToken: !!tokens.access_token,
                    hasRefreshToken: !!tokens.refresh_token,
                    expiryDate: tokens.expiry_date
                });
                
                const state = JSON.parse(stateStr);
                console.log('[GoogleDrive] Parsed state:', state);
                
                // Create base44 client WITHOUT user context (service role only)
                const base44 = createClientFromRequest(req);
                
                console.log('[GoogleDrive] Fetching user with ID:', state.userId);
                const users = await base44.asServiceRole.entities.User.filter({ id: state.userId });
                
                if (users.length === 0) {
                    console.error('[GoogleDrive] User not found:', state.userId);
                    return new Response('User not found', { status: 404 });
                }
                
                console.log('[GoogleDrive] User found:', users[0].email);
                console.log('[GoogleDrive] Updating user tokens...');
                
                await base44.asServiceRole.entities.User.update(state.userId, {
                    google_drive_access_token: tokens.access_token,
                    google_drive_refresh_token: tokens.refresh_token,
                    google_drive_token_expiry: tokens.expiry_date,
                });
                
                console.log('[GoogleDrive] Tokens saved successfully');
                
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Authorization Successful</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; }
                            .success { color: #059669; font-size: 48px; margin-bottom: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="success">✓</div>
                        <h1>Úspešne pripojené!</h1>
                        <p>Google Drive bol úspešne pripojený. Presmerovávam...</p>
                        <script>
                            setTimeout(() => {
                                window.location.href = '${state.returnUrl}';
                            }, 1500);
                        </script>
                    </body>
                    </html>
                `, {
                    headers: { 'Content-Type': 'text/html' }
                });
            } catch (error) {
                console.error('[GoogleDrive] Token exchange error:', error);
                console.error('[GoogleDrive] Error stack:', error.stack);
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Token Exchange Failed</title>
                        <style>
                            body { font-family: Arial; text-align: center; padding: 50px; }
                            .error { color: #dc2626; font-size: 48px; margin-bottom: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="error">✗</div>
                        <h1>Chyba pri ukladaní tokenov</h1>
                        <p>${error.message}</p>
                        <p><a href="javascript:window.close()">Zavrieť okno</a></p>
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
                throw new Error('Not authorized');
            }

            console.log('[GoogleDrive] Setting credentials...');
            oauth2Client.setCredentials({
                access_token: user.google_drive_access_token,
                refresh_token: user.google_drive_refresh_token,
                expiry_date: user.google_drive_token_expiry,
            });

            try {
                console.log('[GoogleDrive] Refreshing access token...');
                const { credentials } = await oauth2Client.refreshAccessToken();
                console.log('[GoogleDrive] Token refreshed');
                
                if (credentials.access_token !== user.google_drive_access_token) {
                    console.log('[GoogleDrive] Saving new tokens...');
                    await base44.auth.updateMe({
                        google_drive_access_token: credentials.access_token,
                        google_drive_refresh_token: credentials.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: credentials.expiry_date,
                    });
                    oauth2Client.setCredentials(credentials);
                }
            } catch (error) {
                console.error('[GoogleDrive] Token refresh failed:', error);
                throw new Error('Token expired. Please re-authorize.');
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
        console.error('[GoogleDrive] Error:', error);
        console.error('[GoogleDrive] Error stack:', error.stack);
        
        // Check if it's an auth error
        if (error.message && error.message.includes('Token expired')) {
            return Response.json({ 
                error: error.message,
                needsAuth: true 
            }, { status: 403 });
        }
        
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});