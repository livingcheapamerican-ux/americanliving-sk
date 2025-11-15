import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { OAuth2Client } from 'npm:google-auth-library@9.6.3';
import { google } from 'npm:googleapis@134.0.0';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_DRIVE_FOLDER_IDS = Deno.env.get("GOOGLE_DRIVE_FOLDER_IDS");
const BASE44_APP_ID = Deno.env.get("BASE44_APP_ID");

Deno.serve(async (req) => {
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'listFiles';
        
        // Dynamicky vytvoríme callback URL na základe požiadavky
        const baseUrl = `${url.protocol}//${url.host}`;
        const callbackPath = url.pathname; // zachováme rovnakú cestu
        const callbackUrl = `${baseUrl}${callbackPath}?action=oauthCallback`;

        console.log('Callback URL:', callbackUrl);
        console.log('Action:', action);

        const oauth2Client = new OAuth2Client(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            callbackUrl
        );

        // OAuth callback - sem Google presmeruje po autorizácii
        if (action === 'oauthCallback') {
            const code = url.searchParams.get('code');
            console.log('OAuth callback, code:', code ? 'present' : 'missing');
            
            if (!code) {
                return new Response(`
                    <html><body>
                        <h1>Error: Authorization code missing</h1>
                        <p>Please try authorizing again.</p>
                        <a href="${baseUrl}">Go back</a>
                    </body></html>
                `, {
                    headers: { 'Content-Type': 'text/html' },
                    status: 400
                });
            }

            try {
                // Získame tokeny z Google
                const { tokens } = await oauth2Client.getToken(code);
                console.log('Tokens received:', tokens.access_token ? 'yes' : 'no');
                
                // Uložíme tokeny do localStorage cez HTML
                return new Response(`
                    <html>
                        <body>
                            <h1>Authorization successful!</h1>
                            <p>Saving credentials...</p>
                            <script>
                                // Uložíme tokeny do localStorage
                                localStorage.setItem('google_drive_tokens', JSON.stringify(${JSON.stringify(tokens)}));
                                // Presmerujeme na admin stránku
                                window.location.href = '${baseUrl}/preview/pages/AdminGoogleDrive?save_tokens=1';
                            </script>
                        </body>
                    </html>
                `, {
                    headers: { 'Content-Type': 'text/html' }
                });
            } catch (error) {
                console.error('OAuth callback error:', error);
                return new Response(`
                    <html><body>
                        <h1>Error during authorization</h1>
                        <p>${error.message}</p>
                        <a href="${baseUrl}">Go back</a>
                    </body></html>
                `, {
                    headers: { 'Content-Type': 'text/html' },
                    status: 500
                });
            }
        }

        // Pre všetky ostatné akcie vyžadujeme autentifikáciu
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (action === 'authorize') {
            const authorizeUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: [
                    'https://www.googleapis.com/auth/drive.readonly',
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile'
                ],
                prompt: 'consent',
            });
            console.log('Redirecting to:', authorizeUrl);
            return Response.redirect(authorizeUrl, 302);
        }

        if (action === 'saveTokens') {
            const body = await req.json();
            console.log('Saving tokens for user:', user.email);
            await base44.auth.updateMe({
                google_drive_access_token: body.access_token,
                google_drive_refresh_token: body.refresh_token,
                google_drive_token_expiry: body.expiry_date,
            });
            return Response.json({ success: true });
        }

        if (action === 'listFolders') {
            if (!user.google_drive_access_token) {
                return Response.json({ error: 'Google Drive not authorized. Please authorize first.' }, { status: 403 });
            }

            oauth2Client.setCredentials({
                access_token: user.google_drive_access_token,
                refresh_token: user.google_drive_refresh_token,
                expiry_date: user.google_drive_token_expiry,
            });

            try {
                const tokens = await oauth2Client.refreshAccessToken();
                if (tokens.credentials.access_token !== user.google_drive_access_token) {
                    await base44.auth.updateMe({
                        google_drive_access_token: tokens.credentials.access_token,
                        google_drive_refresh_token: tokens.credentials.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: tokens.credentials.expiry_date,
                    });
                    oauth2Client.setCredentials(tokens.credentials);
                }
            } catch (error) {
                console.error('Token refresh error:', error);
                return Response.json({ error: 'Failed to refresh token. Please re-authorize.' }, { status: 403 });
            }

            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            const res = await drive.files.list({
                pageSize: 100,
                q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name, modifiedTime, webViewLink)',
            });
            
            return Response.json(res.data.files || []);
        }

        if (action === 'listFiles') {
            if (!user.google_drive_access_token) {
                return Response.json({ error: 'Google Drive not authorized. Please authorize first.' }, { status: 403 });
            }

            oauth2Client.setCredentials({
                access_token: user.google_drive_access_token,
                refresh_token: user.google_drive_refresh_token,
                expiry_date: user.google_drive_token_expiry,
            });

            try {
                const tokens = await oauth2Client.refreshAccessToken();
                if (tokens.credentials.access_token !== user.google_drive_access_token) {
                    await base44.auth.updateMe({
                        google_drive_access_token: tokens.credentials.access_token,
                        google_drive_refresh_token: tokens.credentials.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: tokens.credentials.expiry_date,
                    });
                    oauth2Client.setCredentials(tokens.credentials);
                }
            } catch (error) {
                console.error('Token refresh error:', error);
                return Response.json({ error: 'Failed to refresh token. Please re-authorize.' }, { status: 403 });
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
        
        if (action === 'getFileContent') {
            const fileId = url.searchParams.get('fileId');
            if (!fileId) {
                return Response.json({ error: 'File ID missing' }, { status: 400 });
            }

            if (!user.google_drive_access_token) {
                return Response.json({ error: 'Google Drive not authorized. Please authorize first.' }, { status: 403 });
            }

            oauth2Client.setCredentials({
                access_token: user.google_drive_access_token,
                refresh_token: user.google_drive_refresh_token,
                expiry_date: user.google_drive_token_expiry,
            });

            try {
                const tokens = await oauth2Client.refreshAccessToken();
                if (tokens.credentials.access_token !== user.google_drive_access_token) {
                    await base44.auth.updateMe({
                        google_drive_access_token: tokens.credentials.access_token,
                        google_drive_refresh_token: tokens.credentials.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: tokens.credentials.expiry_date,
                    });
                    oauth2Client.setCredentials(tokens.credentials);
                }
            } catch (error) {
                console.error('Token refresh error:', error);
                return Response.json({ error: 'Failed to refresh token. Please re-authorize.' }, { status: 403 });
            }
            
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
                    return Response.json({ error: 'Access denied: File is not in allowed folders' }, { status: 403 });
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
            availableActions: ['authorize', 'saveTokens', 'listFolders', 'listFiles', 'getFileContent']
        }, { status: 400 });

    } catch (error) {
        console.error("Google Drive function error:", error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});