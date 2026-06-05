// Read WebP dimensions
function getWebpDimensions(buffer) {
  // Simple WebP parsing for VP8/VP8L/VP8X
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff !== 'RIFF' || webp !== 'WEBP') {
    return { error: 'Not a WEBP image' };
  }
  
  const type = buffer.toString('ascii', 12, 16);
  if (type === 'VP8 ') {
    // Lossy WebP
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height, type: 'lossy' };
  } else if (type === 'VP8L') {
    // Lossless WebP
    const val = buffer.readUInt32LE(21);
    const width = (val & 0x3fff) + 1;
    const height = ((val >> 14) & 0x3fff) + 1;
    return { width, height, type: 'lossless' };
  } else if (type === 'VP8X') {
    // Extended WebP
    const width = (buffer.readUInt32LE(24) & 0xffffff) + 1;
    const height = (buffer.readUInt32LE(27) & 0xffffff) + 1;
    return { width, height, type: 'extended' };
  }
  return { error: 'Unknown WebP format ' + type };
}

async function check() {
  const url1 = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/render/image/public/base44-prod/public/6916d89a485af231beb54c71/75a2a4d2b_Palermoexteriermurovka3.jpg?width=400&format=webp&quality=75';
  const url2 = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/render/image/public/base44-prod/public/6916d89a485af231beb54c71/75a2a4d2b_Palermoexteriermurovka3.jpg?width=400&resize=contain&format=webp&quality=75';

  const res1 = await fetch(url1);
  const buffer1 = Buffer.from(await res1.arrayBuffer());
  console.log('Without resize param:', getWebpDimensions(buffer1), 'Size:', buffer1.length);

  const res2 = await fetch(url2);
  const buffer2 = Buffer.from(await res2.arrayBuffer());
  console.log('With resize=contain:', getWebpDimensions(buffer2), 'Size:', buffer2.length);
}

check().catch(console.error);
