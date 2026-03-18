import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { OAuth2Client } from 'npm:google-auth-library@9.6.3';
import { google } from 'npm:googleapis@134.0.0';

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const BASE44_APP_ID = Deno.env.get("BASE44_APP_ID");

Deno.serve(async (req) => {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'sync';
    
    console.log('[GoogleDriveSync] Action:', action);

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const callbackUrl = BASE44_APP_ID 
            ? `https://${BASE44_APP_ID}.base44.io/functions/googleDrive?action=callback`
            : `${url.origin}/functions/googleDrive?action=callback`;
        
        const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, callbackUrl);

        // Refresh tokens helper
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

        // Synchronizovať konkrétny priečinok
        if (action === 'syncFolder') {
            const syncId = url.searchParams.get('syncId');
            if (!syncId) {
                return Response.json({ error: 'Missing syncId' }, { status: 400 });
            }

            await refreshTokens();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });

            // Načítať sync konfiguráciu
            const syncs = await base44.entities.GoogleDriveSync.filter({ id: syncId });
            if (!syncs || syncs.length === 0) {
                return Response.json({ error: 'Sync not found' }, { status: 404 });
            }
            const syncConfig = syncs[0];

            // Aktualizovať stav na in_progress
            await base44.entities.GoogleDriveSync.update(syncId, {
                last_sync_status: 'in_progress',
                last_sync: new Date().toISOString()
            });

            try {
                // Rekurzívne načítať všetky obrázky z priečinka
                const listFolderRecursive = async (parentId, path = '') => {
                    const results = [];
                    
                    const folderInfo = await drive.files.get({ fileId: parentId, fields: 'name' });
                    const currentPath = path ? `${path}/${folderInfo.data.name}` : folderInfo.data.name;
                    
                    const res = await drive.files.list({
                        pageSize: 1000,
                        q: `'${parentId}' in parents and trashed=false`,
                        fields: 'files(id, name, mimeType, modifiedTime, size)',
                        orderBy: 'name'
                    });
                    
                    for (const file of res.data.files || []) {
                        if (file.mimeType === 'application/vnd.google-apps.folder') {
                            const subResults = await listFolderRecursive(file.id, currentPath);
                            results.push(...subResults);
                        } else if (file.mimeType?.startsWith('image/')) {
                            results.push({
                                ...file,
                                path: currentPath,
                                folderName: folderInfo.data.name
                            });
                        }
                    }
                    
                    return results;
                };

                const allFiles = await listFolderRecursive(syncConfig.folder_id);
                const syncedIds = syncConfig.synced_file_ids || [];
                
                // Nájsť nové súbory
                const newFiles = allFiles.filter(f => !syncedIds.includes(f.id));
                
                console.log(`[GoogleDriveSync] Found ${allFiles.length} total files, ${newFiles.length} new`);

                let importedCount = 0;
                const newSyncedIds = [...syncedIds];

                for (const file of newFiles) {
                    try {
                        // Stiahnuť a nahrať súbor
                        const meta = await drive.files.get({ fileId: file.id, fields: 'name, mimeType' });
                        const res = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });
                        
                        const blob = new Blob([res.data], { type: meta.data.mimeType });
                        const uploadFile = new File([blob], meta.data.name, { type: meta.data.mimeType });
                        
                        const uploadResult = await base44.integrations.Core.UploadFile({ file: uploadFile });
                        
                        // Vytvoriť záznam Fotka
                        await base44.entities.Fotka.create({
                            nazov: file.name,
                            url: uploadResult.file_url,
                            typ_fotky: syncConfig.default_typ_fotky || 'galeria',
                            kategoria: syncConfig.default_kategoria || 'exterier',
                            dom_id: syncConfig.target_dom_id || '',
                            dom_nazov: syncConfig.target_dom_nazov || '',
                            zdroj: 'google_drive',
                            povodny_nazov: file.name,
                            cesta_priecinka: file.path,
                            tagy: []
                        });
                        
                        newSyncedIds.push(file.id);
                        importedCount++;
                    } catch (err) {
                        console.error(`[GoogleDriveSync] Error importing ${file.name}:`, err.message);
                    }
                }

                // Aktualizovať sync konfiguráciu
                await base44.entities.GoogleDriveSync.update(syncId, {
                    last_sync_status: 'success',
                    last_sync: new Date().toISOString(),
                    last_sync_message: `Importovaných ${importedCount} nových fotiek`,
                    files_synced: (syncConfig.files_synced || 0) + importedCount,
                    synced_file_ids: newSyncedIds
                });

                return Response.json({
                    success: true,
                    totalFiles: allFiles.length,
                    newFiles: newFiles.length,
                    importedFiles: importedCount
                });

            } catch (err) {
                console.error('[GoogleDriveSync] Sync error:', err.message);
                
                await base44.entities.GoogleDriveSync.update(syncId, {
                    last_sync_status: 'error',
                    last_sync: new Date().toISOString(),
                    last_sync_message: err.message
                });

                return Response.json({ error: err.message }, { status: 500 });
            }
        }

        // Skontrolovať zmeny v priečinku
        if (action === 'checkChanges') {
            const syncId = url.searchParams.get('syncId');
            if (!syncId) {
                return Response.json({ error: 'Missing syncId' }, { status: 400 });
            }

            await refreshTokens();
            const drive = google.drive({ version: 'v3', auth: oauth2Client });

            const syncs = await base44.entities.GoogleDriveSync.filter({ id: syncId });
            if (!syncs || syncs.length === 0) {
                return Response.json({ error: 'Sync not found' }, { status: 404 });
            }
            const syncConfig = syncs[0];

            // Počítať súbory v priečinku
            const countFiles = async (parentId) => {
                let count = 0;
                const res = await drive.files.list({
                    pageSize: 1000,
                    q: `'${parentId}' in parents and trashed=false`,
                    fields: 'files(id, mimeType)'
                });
                
                for (const file of res.data.files || []) {
                    if (file.mimeType === 'application/vnd.google-apps.folder') {
                        count += await countFiles(file.id);
                    } else if (file.mimeType?.startsWith('image/')) {
                        count++;
                    }
                }
                return count;
            };

            const totalFiles = await countFiles(syncConfig.folder_id);
            const syncedCount = (syncConfig.synced_file_ids || []).length;
            const newFilesCount = totalFiles - syncedCount;

            return Response.json({
                totalFiles,
                syncedFiles: syncedCount,
                newFiles: Math.max(0, newFilesCount),
                hasChanges: newFilesCount > 0
            });
        }

        // Synchronizovať všetky aktívne priečinky
        if (action === 'syncAll') {
            const syncs = await base44.entities.GoogleDriveSync.filter({ sync_enabled: true });
            const results = [];

            for (const sync of syncs) {
                try {
                    // Zavolať syncFolder pre každý
                    const syncResult = await fetch(`${url.origin}/functions/googleDriveSync?action=syncFolder&syncId=${sync.id}`, {
                        headers: req.headers
                    });
                    const data = await syncResult.json();
                    results.push({ folderId: sync.folder_id, folderName: sync.folder_name, ...data });
                } catch (err) {
                    results.push({ folderId: sync.folder_id, folderName: sync.folder_name, error: err.message });
                }
            }

            return Response.json({ results });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('[GoogleDriveSync] Error:', error.message);
        
        if (error.message?.includes('Token expired') || error.message?.includes('Not authorized')) {
            return Response.json({ error: error.message, needsAuth: true }, { status: 403 });
        }
        
        return Response.json({ error: error.message }, { status: 500 });
    }
});