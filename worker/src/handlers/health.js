/**
 * Health check endpoint
 */
export async function handleHealth(request, env, headers) {
  const response = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    platform: 'Cloudflare Workers',
    features: {
      maxFiles: parseInt(env.MAX_FILES) || 3,
      maxFileSize: parseInt(env.MAX_FILE_SIZE) || 5242880,
      minImageWidth: parseInt(env.MIN_IMAGE_WIDTH) || 400
    }
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

