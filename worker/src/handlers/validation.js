/**
 * Validation endpoint - handles image upload and validation
 */

import { uploadImageToR2 } from '../services/r2Storage';
import { saveToDatabase } from '../services/database';
import { checkOrderInAirtable, saveToAirtable } from '../services/airtable';

export async function handleValidation(request, env, headers) {
  try {
    // Parse FormData
    const formData = await request.formData();
    
    // Extract fields
    const orderNumber = formData.get('orderNumber');
    const orderEmail = formData.get('orderEmail');
    const textReview = formData.get('textReview');
    const customerName = formData.get('customerName');
    const starRating = parseInt(formData.get('starRating'));
    
    // Get image files
    const images = formData.getAll('images');
    
    console.log(`📝 Processing validation for order: ${orderNumber}`);
    console.log(`📧 Email: ${orderEmail}`);
    console.log(`📸 Received ${images.length} images`);
    
    // Validate required fields
    if (!orderNumber || !orderEmail || !textReview || !customerName || !starRating) {
      return new Response(JSON.stringify({
        error: 'Nieprawidłowe dane wejściowe',
        message: 'Wszystkie pola są wymagane'
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderEmail)) {
      return new Response(JSON.stringify({
        error: 'Nieprawidłowy email',
        message: 'Wprowadź prawidłowy adres email'
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate images count
    if (images.length < 3 || images.length > 3) {
      return new Response(JSON.stringify({
        error: 'Nieprawidłowa liczba zdjęć',
        message: 'Wymagane są dokładnie 3 zdjęcia'
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate text review length
    if (textReview.length < 20 || textReview.length > 500) {
      return new Response(JSON.stringify({
        error: 'Nieprawidłowa długość opinii',
        message: 'Opinia musi mieć od 20 do 500 znaków'
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate star rating
    if (starRating < 1 || starRating > 5) {
      return new Response(JSON.stringify({
        error: 'Nieprawidłowa ocena',
        message: 'Ocena musi być w zakresie 1-5'
      }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    // Check order in Airtable (optional - can be disabled for now)
    let orderExists = false;
    try {
      if (env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID) {
        orderExists = await checkOrderInAirtable(orderNumber, env);
        console.log(`✅ Order ${orderNumber} check: ${orderExists ? 'exists' : 'new'}`);
      }
    } catch (airtableError) {
      console.warn('⚠️ Airtable check failed, continuing:', airtableError.message);
    }

    // Process each image
    const results = [];
    const uploadedUrls = [];
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const filename = image.name || `image-${i + 1}.jpg`;
      
      console.log(`📤 Processing image ${i + 1}: ${filename}`);
      
      try {
        // Get image as ArrayBuffer
        const imageBuffer = await image.arrayBuffer();
        const imageSize = imageBuffer.byteLength;
        
        // Validate file size (5MB max)
        const maxSize = parseInt(env.MAX_FILE_SIZE) || 5242880;
        if (imageSize > maxSize) {
          results.push({
            filename,
            decision: 'reject',
            score: 0,
            people: false,
            feedback: `Plik zbyt duży (${(imageSize / 1024 / 1024).toFixed(2)}MB). Maksymalny rozmiar: ${(maxSize / 1024 / 1024).toFixed(2)}MB`
          });
          continue;
        }
        
        // Upload to Cloudflare R2
        let imageUrl = null;
        try {
          imageUrl = await uploadImageToR2(
            imageBuffer,
            filename,
            orderNumber,
            env.IMAGES_BUCKET
          );
          console.log(`✅ Image uploaded to R2: ${imageUrl}`);
          uploadedUrls.push(imageUrl);
        } catch (uploadError) {
          console.error(`❌ R2 upload failed for ${filename}:`, uploadError);
          results.push({
            filename,
            decision: 'reject',
            score: 0,
            people: false,
            feedback: 'Błąd podczas przesyłania pliku'
          });
          continue;
        }
        
        // AUTO-ACCEPT: All images are automatically accepted
        const validationResult = {
          filename,
          decision: 'accept',
          score: 100,
          people: false,
          feedback: 'Zdjęcie zostało zaakceptowane automatycznie',
          cloudinaryUrl: imageUrl
        };
        
        results.push(validationResult);
        
      } catch (imageError) {
        console.error(`❌ Error processing image ${filename}:`, imageError);
        results.push({
          filename,
          decision: 'reject',
          score: 0,
          people: false,
          feedback: 'Błąd przetwarzania obrazu'
        });
      }
    }
    
    // Calculate statistics
    const acceptedCount = results.filter(r => r.decision === 'accept').length;
    const totalCount = results.length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalCount;
    const status = acceptedCount >= 3 ? 'accepted' : 'rejected';
    
    // Save to Cloudflare D1 database
    let reviewId = null;
    try {
      reviewId = await saveToDatabase({
        orderNumber,
        orderEmail,
        customerName,
        textReview,
        starRating,
        status,
        images: results,
        imageUrls: uploadedUrls
      }, env.DB);
      console.log(`✅ Saved to D1 database with ID: ${reviewId}`);
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError);
      // Continue even if DB save fails
    }
    
    // Save to Airtable
    try {
      if (env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID && status === 'accepted') {
        await saveToAirtable({
          orderNumber,
          orderEmail,
          customerName,
          textReview,
          starRating,
          status,
          imageUrl: uploadedUrls[0] || null
        }, env);
        console.log(`✅ Saved to Airtable`);
      }
    } catch (airtableError) {
      console.error('❌ Airtable save failed:', airtableError);
      // Continue even if Airtable fails
    }
    
    // Return success response
    const response = {
      success: true,
      results,
      summary: {
        total: totalCount,
        accepted: acceptedCount,
        rejected: totalCount - acceptedCount,
        averageScore: Math.round(averageScore * 100) / 100
      },
      reviewId,
      orderInfo: {
        orderNumber,
        orderEmail,
        textReview,
        customerName,
        starRating
      },
      timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    return new Response(JSON.stringify({
      error: 'Wystąpił błąd podczas walidacji zdjęć',
      message: error.message
    }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}

