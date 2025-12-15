import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import sharp from 'npm:sharp@0.33.2';

Deno.serve(async (req) => {
  const logs = [];
  
  try {
    logs.push('🚀 Sharp watermark starting');
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ success: false, error: 'Unauthorized', logs }, { status: 401 });
    }

    const { imageUrl, watermarkText, position, opacity, size } = await req.json();
    logs.push(`📝 Params: ${watermarkText}, ${position}, ${opacity}, ${size}`);

    if (!imageUrl || !watermarkText) {
      return Response.json({ success: false, error: 'Missing params', logs }, { status: 400 });
    }

    // Download image
    logs.push(`📥 Fetching: ${imageUrl.substring(0, 60)}...`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      logs.push(`❌ Fetch failed: ${response.status}`);
      return Response.json({ success: false, error: `HTTP ${response.status}`, logs }, { status: 400 });
    }

    const imageBuffer = await response.arrayBuffer();
    logs.push(`✅ Downloaded ${imageBuffer.byteLength} bytes`);

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    logs.push(`📐 Image: ${metadata.width}x${metadata.height}`);

    // Calculate font size based on image height
    const fontSizes = {
      'small': Math.floor(metadata.height * 0.03),
      'medium': Math.floor(metadata.height * 0.05),
      'large': Math.floor(metadata.height * 0.07),
      'xlarge': Math.floor(metadata.height * 0.09),
      'xxlarge': Math.floor(metadata.height * 0.12)
    };
    const fontSize = fontSizes[size || 'medium'] || fontSizes.medium;

    // Create SVG text overlay
    const textOpacity = opacity || 0.3;
    const padding = Math.floor(metadata.width * 0.02);
    const textWidth = watermarkText.length * fontSize * 0.6; // Approximate
    
    let x, y;
    switch (position || 'bottom-right') {
      case 'top-left':
        x = padding;
        y = padding + fontSize;
        break;
      case 'top-right':
        x = metadata.width - textWidth - padding;
        y = padding + fontSize;
        break;
      case 'bottom-left':
        x = padding;
        y = metadata.height - padding;
        break;
      case 'bottom-right':
        x = metadata.width - textWidth - padding;
        y = metadata.height - padding;
        break;
      case 'center':
        x = (metadata.width - textWidth) / 2;
        y = (metadata.height + fontSize) / 2;
        break;
      default:
        x = metadata.width - textWidth - padding;
        y = metadata.height - padding;
    }

    // Create SVG watermark
    const svg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <text 
          x="${x}" 
          y="${y}" 
          font-size="${fontSize}" 
          font-family="Arial, sans-serif" 
          font-weight="bold"
          fill="white" 
          fill-opacity="${textOpacity}"
          stroke="black"
          stroke-opacity="${textOpacity * 0.5}"
          stroke-width="2"
        >${watermarkText}</text>
      </svg>
    `;

    logs.push(`🎨 Creating watermark at (${Math.round(x)}, ${Math.round(y)})`);

    // Apply watermark
    const watermarkedBuffer = await sharp(imageBuffer)
      .composite([{
        input: Buffer.from(svg),
        top: 0,
        left: 0
      }])
      .jpeg({ quality: 95 })
      .toBuffer();

    logs.push(`✅ Watermark applied: ${watermarkedBuffer.byteLength} bytes`);

    // Upload
    const fileName = `watermarked_${Date.now()}_${imageUrl.split('/').pop() || 'image.jpg'}`;
    const file = new File([watermarkedBuffer], fileName, { type: 'image/jpeg' });
    
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    logs.push(`✅ Uploaded: ${uploadResult.file_url}`);

    return Response.json({ 
      success: true, 
      newImageUrl: uploadResult.file_url,
      originalUrl: imageUrl,
      logs
    });

  } catch (error) {
    logs.push(`❌ ERROR: ${error.message}`);
    logs.push(`Stack: ${error.stack?.substring(0, 300)}`);
    return Response.json({ success: false, error: error.message, logs }, { status: 500 });
  }
});