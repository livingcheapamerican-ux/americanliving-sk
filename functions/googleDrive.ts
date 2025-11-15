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
    console.log('[GoogleDrive] URL:', url.href);

    try {
        const callbackUrl = `${url.origin}${url.pathname}?action=callback`;
        console.log('[GoogleDrive] Callback URL:', callbackUrl);

        const oauth2Client = new OAuth2Client(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            callbackUrl
        );

        // Autorizácia - získanie user ID a presmerovanie na Google
        if (action === 'authorize') {
            const base44 = createClientFromRequest(req);
            const user = await base44.auth.me();
            
            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }
            
            const returnUrl = url.searchParams.get('return_url') || '/';
            const state = JSON.stringify({ userId: user.id, returnUrl });
            
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/drive.readonly'],
                prompt: 'consent',
                state
            });
            
            console.log('[GoogleDrive] Redirecting to Google for user:', user.id);
            return Response.redirect(authUrl, 302);
        }

        // Callback z Google - uloženie tokenov
        if (action === 'callback') {
            const code = url.searchParams.get('code');
            const stateStr = url.searchParams.get('state');
            
            console.log('[GoogleDrive] Callback received, code:', code ? 'present' : 'missing');
            
            if (!code || !stateStr) {
                return new Response('Authorization failed: Missing code or state', { status: 400 });
            }

            try {
                const state = JSON.parse(stateStr);
                const { tokens } = await oauth2Client.getToken(code);
                console.log('[GoogleDrive] Tokens received for user:', state.userId);
                
                // Použijeme service role na uloženie tokenov
                const base44 = createClientFromRequest(req);
                const users = await base44.asServiceRole.entities.User.filter({ id: state.userId });
                
                if (users.length === 0) {
                    throw new Error('User not found');
                }
                
                await base44.asServiceRole.entities.User.update(state.userId, {
                    google_drive_access_token: tokens.access_token,
                    google_drive_refresh_token: tokens.refresh_token,
                    google_drive_token_expiry: tokens.expiry_date,
                });
                
                console.log('[GoogleDrive] Tokens saved, redirecting to:', state.returnUrl);
                return Response.redirect(state.returnUrl, 302);
            } catch (error) {
                console.error('[GoogleDrive] Callback error:', error);
                return new Response(`Authorization error: ${error.message}`, { status: 500 });
            }
        }

        // Všetky ostatné akcie vyžadujú prihlásenie
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // List folders
        if (action === 'listFolders') {
            if (!user.google_drive_access_token) {
                return Response.json({ 
                    error: 'Not authorized. Please authorize first.',
                    needsAuth: true 
                }, { status: 403 });
            }

            oauth2Client.setCredentials({
                access_token: user.google_drive_access_token,
                refresh_token: user.google_drive_refresh_token,
                expiry_date: user.google_drive_token_expiry,
            });

            // Refresh token if needed
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
            } catch (error) {
                console.error('[GoogleDrive] Token refresh failed:', error);
                return Response.json({ 
                    error: 'Token refresh failed. Please re-authorize.',
                    needsAuth: true 
                }, { status: 403 });
            }

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

        // List files
        if (action === 'listFiles') {
            if (!user.google_drive_access_token) {
                return Response.json({ error: 'Not authorized' }, { status: 403 });
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
            } catch (error) {
                console.error('[GoogleDrive] Token refresh failed:', error);
            }

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
        
        // Get file content
        if (action === 'getFileContent') {
            const fileId = url.searchParams.get('fileId');
            if (!fileId) {
                return Response.json({ error: 'File ID missing' }, { status: 400 });
            }

            if (!user.google_drive_access_token) {
                return Response.json({ error: 'Not authorized' }, { status: 403 });
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
            } catch (error) {
                console.error('[GoogleDrive] Token refresh failed:', error);
            }
            
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            // Check folder access if restricted
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
                    return Response.json({ error: 'Access denied: File not in allowed folders' }, { status: 403 });
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
            available: ['authorize', 'callback', 'listFolders', 'listFiles', 'getFileContent']
        }, { status: 400 });

    } catch (error) {
        console.error('[GoogleDrive] Error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});