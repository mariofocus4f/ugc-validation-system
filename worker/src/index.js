/**
 * Cloudflare Worker for UGC Validation API
 * Replaces Express.js backend with serverless architecture
 */

import { handleValidation } from './handlers/validation';
import { handleHealth } from './handlers/health';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be set dynamically
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Set dynamic CORS origin
    const origin = request.headers.get('Origin');
    const allowedOrigins = [
      'https://ugc-validation.pages.dev',
      'https://1d1063b5.ugc-validation.pages.dev',
      'http://localhost:3000'
    ];
    
    // Allow any subdomain of ugc-validation.pages.dev
    const isCloudflarePages = origin && origin.match(/^https:\/\/[a-z0-9]+\.ugc-validation\.pages\.dev$/);
    
    const corsOrigin = allowedOrigins.includes(origin) || isCloudflarePages ? origin : allowedOrigins[0];
    
    const headers = {
      ...corsHeaders,
      'Access-Control-Allow-Origin': corsOrigin,
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    try {
      // Route handling
      if (url.pathname === '/api/health') {
        return handleHealth(request, env, headers);
      }
      
      if (url.pathname === '/api/ugc/validate' && request.method === 'POST') {
        return handleValidation(request, env, headers);
      }

      // 404 Not Found
      return new Response(JSON.stringify({ 
        error: 'Endpoint nie został znaleziony',
        path: url.pathname 
      }), {
        status: 404,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Wystąpił błąd serwera',
        message: error.message
      }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
  }
};

