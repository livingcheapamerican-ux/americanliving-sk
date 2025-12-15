import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, watermarkText } = await req.json();
    
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      return Response.json({ 
        error: 'Missing Cloudinary credentials. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.' 
      }, { status: 400 });
    }

    // Generate signature for authenticated upload
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const transformation = `l_text:Arial_48_bold:${encodeURIComponent(watermarkText)},g_south_east,o_30,x_20,y_20`;
    
    // Create string to sign
    const stringToSign = `timestamp=${timestamp}&transformation=${transformation}${apiSecret}`;
    
    // Generate SHA-256 signature
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Upload to Cloudinary with signed request
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('transformation', transformation);
    formData.append('signature', signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    const result = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return Response.json({ 
        success: false, 
        error: result.error?.message || JSON.stringify(result) || 'Upload failed',
        cloudinaryResponse: result
      }, { status: 400 });
    }

    return Response.json({ 
      success: true, 
      newImageUrl: result.secure_url,
      originalUrl: imageUrl,
      cloudinaryPublicId: result.public_id
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});