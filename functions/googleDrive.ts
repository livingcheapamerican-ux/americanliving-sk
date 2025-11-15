import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { OAuth2Client } from 'npm:google-auth-library';
import { google } from 'npm:googleapis';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const GOOGLE_DRIVE_FOLDER_IDS = Deno.env.get("GOOGLE_DRIVE_FOLDER_IDS");

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const action = url.searchParams.get('action');

        const oauth2Client = new OAuth2Client(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            `${url.origin}/functions/googleDrive?action=oauthCallback`
        );

        switch (action) {
            case 'authorize': {
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

            case 'oauthCallback': {
                const code = url.searchParams.get('code');
                if (!code) {
                    return Response.json({ error: 'Authorization code missing' }, { status: 400 });
                }

                const { tokens } = await oauth2Client.getToken(code);
                
                await base44.auth.updateMe({
                    google_drive_access_token: tokens.access_token,
                    google_drive_refresh_token: tokens.refresh_token,
                    google_drive_token_expiry: tokens.expiry_date,
                });
                
                return Response.redirect(url.origin, 302);
            }

            case 'listFolders': {
                if (!user.google_drive_access_token) {
                    return Response.json({ error: 'Google Drive not authorized. Please authorize first.' }, { status: 403 });
                }

                oauth2Client.setCredentials({
                    access_token: user.google_drive_access_token,
                    refresh_token: user.google_drive_refresh_token,
                    expiry_date: user.google_drive_token_expiry,
                });

                await oauth2Client.refreshAccessToken();
                const refreshedTokens = oauth2Client.credentials;

                if (refreshedTokens.access_token !== user.google_drive_access_token) {
                    await base44.auth.updateMe({
                        google_drive_access_token: refreshedTokens.access_token,
                        google_drive_refresh_token: refreshedTokens.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: refreshedTokens.expiry_date,
                    });
                }

                const drive = google.drive({ version: 'v3', auth: oauth2Client });
                
                const res = await drive.files.list({
                    pageSize: 100,
                    q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
                    fields: 'files(id, name, modifiedTime, webViewLink)',
                });
                
                return Response.json(res.data.files);
            }

            case 'listFiles': {
                if (!user.google_drive_access_token) {
                    return Response.json({ error: 'Google Drive not authorized. Please authorize first.' }, { status: 403 });
                }

                oauth2Client.setCredentials({
                    access_token: user.google_drive_access_token,
                    refresh_token: user.google_drive_refresh_token,
                    expiry_date: user.google_drive_token_expiry,
                });

                await oauth2Client.refreshAccessToken();
                const refreshedTokens = oauth2Client.credentials;

                if (refreshedTokens.access_token !== user.google_drive_access_token) {
                    await base44.auth.updateMe({
                        google_drive_access_token: refreshedTokens.access_token,
                        google_drive_refresh_token: refreshedTokens.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: refreshedTokens.expiry_date,
                    });
                }

                const drive = google.drive({ version: 'v3', auth: oauth2Client });
                
                // Build query based on allowed folders
                let query = "trashed=false";
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
                return Response.json(res.data.files);
            }
            
            case 'getFileContent': {
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

                await oauth2Client.refreshAccessToken();
                const refreshedTokens = oauth2Client.credentials;

                if (refreshedTokens.access_token !== user.google_drive_access_token) {
                    await base44.auth.updateMe({
                        google_drive_access_token: refreshedTokens.access_token,
                        google_drive_refresh_token: refreshedTokens.refresh_token || user.google_drive_refresh_token,
                        google_drive_token_expiry: refreshedTokens.expiry_date,
                    });
                }
                
                const drive = google.drive({ version: 'v3', auth: oauth2Client });
                
                // Verify file is in allowed folders if restriction is set
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

            default:
                return Response.json({ error: 'Invalid action. Use: authorize, listFolders, listFiles, or getFileContent' }, { status: 400 });
        }
    } catch (error) {
        console.error("Google Drive function error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});