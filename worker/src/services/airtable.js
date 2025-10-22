/**
 * Airtable Integration Service
 * Handles communication with Airtable API
 */

export async function checkOrderInAirtable(orderNumber, env) {
  try {
    if (!env.AIRTABLE_API_KEY || !env.AIRTABLE_BASE_ID) {
      console.warn('⚠️ Airtable credentials not configured');
      return false;
    }
    
    const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/reviews_done?filterByFormula={order_number}="${orderNumber}"`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.records && data.records.length > 0;
    
  } catch (error) {
    console.error('❌ Airtable check error:', error);
    throw error;
  }
}

export async function saveToAirtable(reviewData, env) {
  try {
    if (!env.AIRTABLE_API_KEY || !env.AIRTABLE_BASE_ID) {
      console.warn('⚠️ Airtable credentials not configured');
      return null;
    }
    
    const {
      orderNumber,
      orderEmail,
      customerName,
      textReview,
      starRating,
      status,
      imageUrl
    } = reviewData;
    
    const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/reviews_done`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          order_number: orderNumber,
          order_email: orderEmail,
          customer_name: customerName,
          text_review: textReview,
          star_rating: starRating,
          status: status,
          image_url: imageUrl,
          created_at: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Saved to Airtable: ${data.id}`);
    return data.id;
    
  } catch (error) {
    console.error('❌ Airtable save error:', error);
    throw error;
  }
}

