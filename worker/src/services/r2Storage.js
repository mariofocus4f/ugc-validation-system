/**
 * Cloudflare R2 Storage Service
 * Handles image uploads to R2 bucket
 */

export async function uploadImageToR2(imageBuffer, filename, orderNumber, bucket) {
  try {
    // Create unique filename with order number
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `orders/${orderNumber}/${timestamp}-${safeName}`;
    
    // Upload to R2
    await bucket.put(key, imageBuffer, {
      httpMetadata: {
        contentType: getContentType(filename)
      }
    });
    
    // Return public URL (you'll need to configure R2 custom domain)
    // For now, return the key - you'll add custom domain later
    const url = `https://images.your-domain.com/${key}`;
    
    console.log(`✅ Uploaded to R2: ${key}`);
    return url;
    
  } catch (error) {
    console.error('❌ R2 upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

function getContentType(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  const types = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif'
  };
  return types[ext] || 'application/octet-stream';
}

