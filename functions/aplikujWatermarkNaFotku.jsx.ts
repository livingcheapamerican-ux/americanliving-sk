import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return Response.json({ 
        success: false,
        error: `Failed to parse JSON body: ${e.message}` 
      }, { status: 400 });
    }

    const { imageUrl, watermarkText, position, opacity, size } = body;

    if (!imageUrl || !watermarkText) {
      return Response.json({ 
        success: false,
        error: `Missing required parameters. Received: ${JSON.stringify({ imageUrl: imageUrl ? 'present' : 'missing', watermarkText: watermarkText ? 'present' : 'missing', body: Object.keys(body || {}) })}` 
      }, { status: 400 });
    }

    // Validovať URL
    try {
      new URL(imageUrl);
    } catch (e) {
      return Response.json({ 
        success: false, 
        error: `Invalid image URL: ${imageUrl}` 
      }, { status: 400 });
    }

    // Stiahnuť pôvodný obrázok
    let imageResponse;
    try {
      imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        return Response.json({ 
          success: false,
          error: `Failed to fetch image (${imageResponse.status}): ${imageUrl}` 
        }, { status: 400 });
      }
    } catch (fetchError) {
      return Response.json({ 
        success: false,
        error: `Network error fetching image: ${fetchError.message}` 
      }, { status: 400 });
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Kontrola veľkosti súboru
    if (imageBuffer.byteLength === 0) {
      return Response.json({ 
        success: false,
        error: 'Image file is empty' 
      }, { status: 400 });
    }

    // Použiť Canvas API na aplikovanie watermarku
    let imageBitmap;
    try {
      imageBitmap = await createImageBitmap(new Blob([imageBuffer]));
    } catch (bitmapError) {
      return Response.json({ 
        success: false,
        error: `Failed to create image bitmap: ${bitmapError.message}` 
      }, { status: 400 });
    }
    
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const ctx = canvas.getContext('2d');

    // Nakresliť pôvodný obrázok
    ctx.drawImage(imageBitmap, 0, 0);

    // Nastaviť štýl watermarku
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

    // Vypočítať pozíciu
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

    // Nakresliť watermark s tieňom
    ctx.strokeText(watermarkText, x, y);
    ctx.fillText(watermarkText, x, y);

    // Konvertovať canvas na blob
    let blob;
    try {
      blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
    } catch (convertError) {
      return Response.json({ 
        success: false,
        error: `Failed to convert canvas to blob: ${convertError.message}` 
      }, { status: 500 });
    }

    // Uploadnúť nový obrázok
    const fileName = `watermarked_${Date.now()}_${imageUrl.split('/').pop() || 'image.jpg'}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    let uploadResult;
    try {
      uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    } catch (uploadError) {
      return Response.json({ 
        success: false,
        error: `Failed to upload watermarked image: ${uploadError.message}` 
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      newImageUrl: uploadResult.file_url,
      originalUrl: imageUrl
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});