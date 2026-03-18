import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract folder ID from the provided URL
    const folderId = '1uInfccJPEWdUjPBht039zL9hReQsBRKi';
    
    // Call the googleDrive function to list files
    const response = await base44.functions.invoke('googleDrive', {}, {
      params: { action: 'listFolderContents', folderId, recursive: 'true' }
    });
    
    return Response.json({
      success: true,
      folderId,
      filesCount: response.data?.length || 0,
      files: response.data || [],
      message: `Successfully retrieved ${response.data?.length || 0} files from Google Drive folder`
    });
    
  } catch (error) {
    console.error('Test Google Drive Error:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      details: error.response?.data || null
    }, { status: 500 });
  }
});