import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const logs = [];
  
  try {
    logs.push('🚀 Canvas watermark starting');
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ success: false, error: 'Unauthorized', logs }, { status: 401 });
    }

    const { imageUrl, watermarkText, position, opacity, size } = await req.json();
    logs.push(`📝 Params: text="${watermarkText}", pos="${position}", opacity=${opacity}, size="${size}"`);

    if (!imageUrl || !watermarkText) {
      return Response.json({ success: false, error: 'Missing params', logs }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(imageUrl);
    } catch (e) {
      logs.push(`❌ Invalid URL`);
      return Response.json({ success: false, error: 'Invalid URL', logs }, { status: 400 });
    }

    // Download image with timeout
    logs.push(`📥 Fetching image...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    let imageResponse;
    try {
      imageResponse = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeout);
    } catch (fetchError) {
      clearTimeout(timeout);
      logs.push(`❌ Fetch failed: ${fetchError.message}`);
      return Response.json({ success: false, error: `Fetch error: ${fetchError.message}`, logs }, { status: 400 });
    }

    if (!imageResponse.ok) {
      logs.push(`❌ HTTP ${imageResponse.status}`);
      return Response.json({ success: false, error: `HTTP ${imageResponse.status}`, logs }, { status: 400 });
    }

    const imageBlob = await imageResponse.blob();
    if (imageBlob.size === 0) {
      logs.push(`❌ Empty image`);
      return Response.json({ success: false, error: 'Empty image', logs }, { status: 400 });
    }
    
    logs.push(`✅ Downloaded ${imageBlob.size} bytes`);

    // Create image bitmap
    let imageBitmap;
    try {
      imageBitmap = await createImageBitmap(imageBlob);
      logs.push(`✅ Bitmap: ${imageBitmap.width}x${imageBitmap.height}`);
    } catch (bitmapError) {
      logs.push(`❌ Bitmap error: ${bitmapError.message}`);
      return Response.json({ success: false, error: 'Bitmap creation failed', logs }, { status: 400 });
    }

    // Create canvas
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(imageBitmap, 0, 0);

    // Configure watermark
    const fontSizes = {
      'small': imageBitmap.height * 0.03,
      'medium': imageBitmap.height * 0.05,
      'large': imageBitmap.height * 0.07,
      'xlarge': imageBitmap.height * 0.09,
      'xxlarge': imageBitmap.height * 0.12
    };
    const fontSize = fontSizes[size || 'medium'];
    
    ctx.font = `bold ${fontSize}px Arial`;
    const textMetrics = ctx.measureText(watermarkText);
    const textWidth = textMetrics.width;
    const padding = imageBitmap.width * 0.02;

    // Calculate position
    let x, y;
    switch (position || 'bottom-right') {
      case 'top-left':
        x = padding;
        y = padding + fontSize;
        break;
      case 'top-right':
        x = imageBitmap.width - textWidth - padding;
        y = padding + fontSize;
        break;
      case 'bottom-left':
        x = padding;
        y = imageBitmap.height - padding;
        break;
      case 'bottom-right':
        x = imageBitmap.width - textWidth - padding;
        y = imageBitmap.height - padding;
        break;
      case 'center':
        x = (imageBitmap.width - textWidth) / 2;
        y = (imageBitmap.height + fontSize) / 2;
        break;
      default:
        x = imageBitmap.width - textWidth - padding;
        y = imageBitmap.height - padding;
    }

    // Draw watermark
    const watermarkOpacity = opacity || 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacity})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${watermarkOpacity * 0.5})`;
    ctx.lineWidth = 2;
    
    ctx.strokeText(watermarkText, x, y);
    ctx.fillText(watermarkText, x, y);
    
    logs.push(`🎨 Watermark drawn at (${Math.round(x)}, ${Math.round(y)})`);

    // Convert to blob
    let blob;
    try {
      blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
      logs.push(`✅ Blob created: ${blob.size} bytes`);
    } catch (convertError) {
      logs.push(`❌ Convert error: ${convertError.message}`);
      return Response.json({ success: false, error: 'Conversion failed', logs }, { status: 500 });
    }

    // Upload
    const fileName = `watermarked_${Date.now()}_${imageUrl.split('/').pop()?.split('?')[0] || 'image.jpg'}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    
    let uploadResult;
    try {
      uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
      logs.push(`✅ Uploaded: ${uploadResult.file_url}`);
    } catch (uploadError) {
      logs.push(`❌ Upload error: ${uploadError.message}`);
      return Response.json({ success: false, error: 'Upload failed', logs }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      newImageUrl: uploadResult.file_url,
      originalUrl: imageUrl,
      logs
    });

  } catch (error) {
    logs.push(`❌ CRITICAL: ${error.message}`);
    return Response.json({ success: false, error: error.message, logs }, { status: 500 });
  }
});