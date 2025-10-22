/**
 * Cloudflare D1 Database Service
 * Handles data persistence in D1 SQL database
 */

export async function saveToDatabase(data, db) {
  try {
    const {
      orderNumber,
      orderEmail,
      customerName,
      textReview,
      starRating,
      status,
      images,
      imageUrls
    } = data;
    
    // Insert review record
    const insertReview = await db.prepare(`
      INSERT INTO reviews (
        order_number,
        order_email,
        customer_name,
        text_review,
        star_rating,
        status,
        image_urls,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderNumber,
      orderEmail,
      customerName,
      textReview,
      starRating,
      status,
      JSON.stringify(imageUrls)
    ).run();
    
    const reviewId = insertReview.meta.last_row_id;
    
    // Insert image records
    for (const image of images) {
      await db.prepare(`
        INSERT INTO images (
          review_id,
          filename,
          decision,
          score,
          feedback,
          cloudinary_url,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        reviewId,
        image.filename,
        image.decision,
        image.score,
        image.feedback,
        image.cloudinaryUrl || null
      ).run();
    }
    
    console.log(`✅ Saved to D1 database: review ID ${reviewId}`);
    return reviewId;
    
  } catch (error) {
    console.error('❌ D1 database error:', error);
    throw new Error(`Database save failed: ${error.message}`);
  }
}

export async function getReview(reviewId, db) {
  try {
    const review = await db.prepare(
      'SELECT * FROM reviews WHERE id = ?'
    ).bind(reviewId).first();
    
    if (!review) {
      return null;
    }
    
    const images = await db.prepare(
      'SELECT * FROM images WHERE review_id = ? ORDER BY created_at'
    ).bind(reviewId).all();
    
    return {
      ...review,
      images: images.results
    };
    
  } catch (error) {
    console.error('❌ D1 query error:', error);
    throw new Error(`Database query failed: ${error.message}`);
  }
}

