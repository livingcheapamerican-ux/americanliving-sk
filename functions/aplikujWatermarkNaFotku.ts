import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, watermarkText, position, opacity, size } = await req.json();

    if (!imageUrl || !watermarkText) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Stiahnuť pôvodný obrázok
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Použiť Canvas API na aplikovanie watermarku
    const imageBitmap = await createImageBitmap(new Blob([imageBuffer]));
    
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
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });

    // Uploadnúť nový obrázok
    const fileName = `watermarked_${Date.now()}_${imageUrl.split('/').pop() || 'image.jpg'}`;
    const file = new File([blob], fileName, { type: 'image/jpeg' });

    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({ 
      success: true, 
      newImageUrl: uploadResult.file_url,
      originalUrl: imageUrl
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});