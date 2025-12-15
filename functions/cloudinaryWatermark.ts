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

    // Upload to Cloudinary with watermark transformation
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('api_key', apiKey);
    formData.append('timestamp', Math.floor(Date.now() / 1000).toString());
    formData.append('upload_preset', 'ml_default'); // Using default unsigned preset
    
    // Add watermark transformation
    formData.append('transformation', JSON.stringify({
      overlay: {
        font_family: 'Arial',
        font_size: 48,
        font_weight: 'bold',
        text: watermarkText
      },
      gravity: 'south_east',
      opacity: 30,
      x: 20,
      y: 20
    }));

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    const result = await uploadResponse.json();

    if (!uploadResponse.ok) {
      return Response.json({ 
        success: false, 
        error: result.error?.message || 'Upload failed' 
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