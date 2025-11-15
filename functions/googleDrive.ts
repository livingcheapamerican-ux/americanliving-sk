import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { OAuth2Client } from 'npm:google-auth-library@9.6.3';
import { google } from 'npm:googleapis@134.0.0';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_DRIVE_FOLDER_IDS = Deno.env.get("GOOGLE_DRIVE_FOLDER_IDS");

Deno.serve(async (req) => {
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'listFiles';
        
        // Callback URL musí byť absolútna URL, ktorá smeruje na túto funkciu
        const callbackUrl = `${url.protocol}//${url.host}${url.pathname}?action=oauthCallback`;

        const oauth2Client = new OAuth2Client(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            callbackUrl
        );

        // OAuth callback - táto vetva sa volá po návrate z Google
        if (action === 'oauthCallback') {
            const code = url.searchParams.get('code');
            if (!code) {
                return Response.json({ error: 'Authorization code missing' }, { status: 400 });
            }

            try {
                const { tokens } = await oauth2Client.getToken(code);
                
                // Tu nemôžeme použiť base44 auth, pretože user ešte nie je prihlásený v tomto requeste
                // Musíme získať session token z URL alebo cookies
                const sessionToken = url.searchParams.get('state') || req.headers.get('cookie')?.match(/session=([^;]+)/)?.[1];
                
                if (!sessionToken) {
                    return new Response(`
                        <html>
                            <body>
                                <script>
                                    // Pošleme tokeny cez postMessage na otvárajúce okno
                                    if (window.opener) {
                                        window.opener.postMessage({
                                            type: 'GOOGLE_DRIVE_AUTH',
                                            tokens: ${JSON.stringify(tokens)}
                                        }, '*');
                                        window.close();
                                    } else {
                                        window.location.href = '/?google_drive_tokens=' + encodeURIComponent(JSON.stringify(${JSON.stringify(tokens)}));
                                    }
                                </script>
                            </body>
                        </html>
                    `, {
                        headers: { 'Content-Type': 'text/html' }
                    });
                }
                
                // Ak máme session, skúsime uložiť tokeny
                const base44 = createClientFromRequest(req);
                await base44.auth.updateMe({
                    google_drive_access_token: tokens.access_token,
                    google_drive_refresh_token: tokens.refresh_token,
                    google_drive_token_expiry: tokens.expiry_date,
                });
                
                return Response.redirect(url.origin, 302);
            } catch (error) {
                console.error('OAuth callback error:', error);
                return Response.json({ error: error.message }, { status: 500 });
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
            return Response.redirect(authorizeUrl, 302);
        }

        if (action === 'saveTokens') {
            const body = await req.json();
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

            const tokens = await oauth2Client.refreshAccessToken();
            if (tokens.credentials.access_token !== user.google_drive_access_token) {
                await base44.auth.updateMe({
                    google_drive_access_token: tokens.credentials.access_token,
                    google_drive_refresh_token: tokens.credentials.refresh_token || user.google_drive_refresh_token,
                    google_drive_token_expiry: tokens.credentials.expiry_date,
                });
                oauth2Client.setCredentials(tokens.credentials);
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

            const tokens = await oauth2Client.refreshAccessToken();
            if (tokens.credentials.access_token !== user.google_drive_access_token) {
                await base44.auth.updateMe({
                    google_drive_access_token: tokens.credentials.access_token,
                    google_drive_refresh_token: tokens.credentials.refresh_token || user.google_drive_refresh_token,
                    google_drive_token_expiry: tokens.credentials.expiry_date,
                });
                oauth2Client.setCredentials(tokens.credentials);
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

            const tokens = await oauth2Client.refreshAccessToken();
            if (tokens.credentials.access_token !== user.google_drive_access_token) {
                await base44.auth.updateMe({
                    google_drive_access_token: tokens.credentials.access_token,
                    google_drive_refresh_token: tokens.credentials.refresh_token || user.google_drive_refresh_token,
                    google_drive_token_expiry: tokens.credentials.expiry_date,
                });
                oauth2Client.setCredentials(tokens.credentials);
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