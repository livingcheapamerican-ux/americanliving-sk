import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const logs = [];
  
  try {
    logs.push('🚀 Starting watermark function');
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ success: false, error: 'Unauthorized', logs }, { status: 401 });
    }
    logs.push(`✅ User authenticated: ${user.email}`);

    let body;
    try {
      body = await req.json();
      logs.push(`📦 Body parsed: ${JSON.stringify(Object.keys(body))}`);
    } catch (e) {
      logs.push(`❌ Failed to parse body: ${e.message}`);
      return Response.json({ success: false, error: `Failed to parse JSON: ${e.message}`, logs }, { status: 400 });
    }

    const { imageUrl, watermarkText, position, opacity, size } = body;
    logs.push(`📝 Params: url=${imageUrl?.substring(0, 50)}..., text="${watermarkText}", pos="${position}", opacity=${opacity}, size="${size}"`);

    if (!imageUrl || !watermarkText) {
      logs.push(`❌ Missing params`);
      return Response.json({ success: false, error: 'Missing required parameters', logs }, { status: 400 });
    }

    // Validovať URL
    try {
      new URL(imageUrl);
      logs.push(`✅ URL is valid`);
    } catch (e) {
      logs.push(`❌ Invalid URL: ${e.message}`);
      return Response.json({ success: false, error: `Invalid URL: ${imageUrl}`, logs }, { status: 400 });
    }

    // Stiahnuť obrázok
    logs.push(`📥 Fetching image...`);
    let imageResponse;
    try {
      imageResponse = await fetch(imageUrl);
      logs.push(`📥 Fetch status: ${imageResponse.status}`);
      if (!imageResponse.ok) {
        logs.push(`❌ Fetch failed: ${imageResponse.status}`);
        return Response.json({ success: false, error: `Failed to fetch (${imageResponse.status})`, logs }, { status: 400 });
      }
    } catch (fetchError) {
      logs.push(`❌ Fetch error: ${fetchError.message}`);
      return Response.json({ success: false, error: `Network error: ${fetchError.message}`, logs }, { status: 400 });
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    logs.push(`✅ Downloaded ${imageBuffer.byteLength} bytes`);

    if (imageBuffer.byteLength === 0) {
      logs.push(`❌ Empty image`);
      return Response.json({ success: false, error: 'Image is empty', logs }, { status: 400 });
    }

    // Canvas processing
    logs.push(`🎨 Creating canvas...`);
    let imageBitmap;
    try {
      imageBitmap = await createImageBitmap(new Blob([imageBuffer]));
      logs.push(`✅ Image bitmap: ${imageBitmap.width}x${imageBitmap.height}`);
    } catch (bitmapError) {
      logs.push(`❌ Bitmap error: ${bitmapError.message}`);
      logs.push(`🔍 Bitmap stack: ${bitmapError.stack?.substring(0, 200)}`);
      return Response.json({ success: false, error: `Bitmap failed: ${bitmapError.message}`, logs }, { status: 400 });
    }
    
    logs.push(`🎨 Creating OffscreenCanvas...`);
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');
    logs.push(`✅ Canvas context created`);

    ctx.drawImage(imageBitmap, 0, 0);
    logs.push(`✅ Image drawn`);

    const fontSize = {
      'small': imageBitmap.height * 0.03,
      'medium': imageBitmap.height * 0.05,
      'large': imageBitmap.height * 0.07,
      'xlarge': imageBitmap.height * 0.09,
      'xxlarge': imageBitmap.height * 0.12
    }[size || 'medium'];

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity || 0.3})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${(opacity || 0.3) * 0.5})`;
    ctx.lineWidth = 2;

    const textMetrics = ctx.measureText(watermarkText);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    let x, y;
    const padding = imageBitmap.width * 0.02;

    switch (position || 'bottom-right') {
      case 'top-left':
        x = padding;
        y = padding + textHeight;
        break;
      case 'top-right':
        x = imageBitmap.width - textWidth - padding;
        y = padding + textHeight;
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
        y = (imageBitmap.height + textHeight) / 2;
        break;
      default:
        x = imageBitmap.width - textWidth - padding;
        y = imageBitmap.height - padding;
    }

    ctx.strokeText(watermarkText, x, y);
    ctx.fillText(watermarkText, x, y);
    logs.push(`✅ Watermark drawn at (${Math.round(x)}, ${Math.round(y)})`);

    logs.push(`🔄 Converting to blob...`);
    let blob;
    try {
      blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
      logs.push(`✅ Blob created: ${blob.size} bytes`);
    } catch (convertError) {
      logs.push(`❌ Convert error: ${convertError.message}`);
      logs.push(`🔍 Convert stack: ${convertError.stack?.substring(0, 200)}`);
      return Response.json({ success: false, error: `Convert failed: ${convertError.message}`, logs }, { status: 500 });
    }

    const fileName = `watermarked_${Date.now()}_${imageUrl.split('/').pop() || 'image.jpg'}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });
    logs.push(`📤 Uploading as: ${fileName}`);

    let uploadResult;
    try {
      uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
      logs.push(`✅ Upload successful: ${uploadResult.file_url}`);
    } catch (uploadError) {
      logs.push(`❌ Upload error: ${uploadError.message}`);
      return Response.json({ success: false, error: `Upload failed: ${uploadError.message}`, logs }, { status: 500 });
    }

    logs.push(`✅ SUCCESS`);
    return Response.json({ 
      success: true, 
      newImageUrl: uploadResult.file_url,
      originalUrl: imageUrl,
      logs
    });

  } catch (error) {
    logs.push(`❌ CRITICAL ERROR: ${error.message}`);
    logs.push(`🔍 Stack: ${error.stack?.substring(0, 500)}`);
    return Response.json({ success: false, error: error.message, logs }, { status: 500 });
  }
});