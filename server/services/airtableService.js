const Airtable = require('airtable');
require('dotenv').config();

class AirtableService {
  constructor() {
    this.base = null;
    this.baseId = process.env.AIRTABLE_BASE_ID;
    this.apiKey = process.env.AIRTABLE_API_KEY;
    
    if (this.baseId && this.apiKey) {
      Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: this.apiKey
      });
      this.base = Airtable.base(this.baseId);
      console.log('✅ Airtable service initialized');
    } else {
      console.log('⚠️ Airtable not configured - check AIRTABLE_BASE_ID and AIRTABLE_API_KEY');
    }
  }

  // Reviews table operations
  async createReview(reviewData) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const { orderEmail, orderNumber, productName, textReview, discountCode, emailSent, status, cloudinaryUrl } = reviewData;
      
      const record = await this.base('Reviews').create([
        {
          fields: {
            'Order Number': orderNumber,
            'Order Email': orderEmail,
            'Product Name': productName,
            'Text Review': textReview,
            'Discount Code': discountCode || '',
            'Email Sent': emailSent || false,
            'Status': status || 'pending',
            'Cloudinary URL': cloudinaryUrl || ''
          }
        }
      ]);

      console.log(`✅ Review created in Airtable: ${record[0].id}`);
      return record[0].id;
    } catch (error) {
      console.error('❌ Error creating review in Airtable:', error);
      throw error;
    }
  }

  async updateReviewStatus(reviewId, status) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const record = await this.base('Reviews').update([
        {
          id: reviewId,
          fields: {
            'Status': status,
            'Updated At': new Date().toISOString()
          }
        }
      ]);

      console.log(`✅ Review ${reviewId} status updated to ${status}`);
      return record[0];
    } catch (error) {
      console.error('❌ Error updating review status:', error);
      throw error;
    }
  }

  async getReview(reviewId) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const record = await this.base('Reviews').find(reviewId);
      return record.fields;
    } catch (error) {
      console.error('❌ Error getting review:', error);
      throw error;
    }
  }

  // Images table operations
  async createImage(imageData) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const { 
        reviewId, 
        filename, 
        originalFilename, 
        filePath, 
        fileSize, 
        mimeType, 
        width, 
        height, 
        validationResult, 
        decision, 
        qualityScore, 
        feedback, 
        hasPeople 
      } = imageData;
      
      const record = await this.base('Images').create([
        {
          fields: {
            'Review ID': [reviewId], // Link to Reviews table
            'Filename': filename,
            'Original Filename': originalFilename,
            'File Path': filePath,
            'File Size': fileSize,
            'MIME Type': mimeType,
            'Width': width || 0,
            'Height': height || 0,
            'Validation Result': JSON.stringify(validationResult || {}),
            'Decision': decision,
            'Quality Score': qualityScore || 0,
            'Feedback': feedback || '',
            'Has People': hasPeople || false,
          }
        }
      ]);

      console.log(`✅ Image record created in Airtable: ${record[0].id}`);
      return record[0].id;
    } catch (error) {
      console.error('❌ Error creating image record:', error);
      throw error;
    }
  }

  async getImagesByReview(reviewId) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const records = await this.base('Images').select({
        filterByFormula: `{Review ID} = "${reviewId}"`,
        sort: [{ field: 'Order Number', direction: 'asc' }]
      }).all();

      return records.map(record => ({
        id: record.id,
        ...record.fields,
        validationResult: record.fields['Validation Result'] ? 
          JSON.parse(record.fields['Validation Result']) : null
      }));
    } catch (error) {
      console.error('❌ Error getting images by review:', error);
      throw error;
    }
  }

  // Validation logs table operations
  async createValidationLog(logData) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const { reviewId, imageId, action, details } = logData;
      
      const record = await this.base('Validation Logs').create([
        {
          fields: {
            'Review ID': reviewId ? [reviewId] : [],
            'Image ID': imageId ? [imageId] : [],
            'Action': action,
            'Details': JSON.stringify(details || {}),
          }
        }
      ]);

      return record[0].id;
    } catch (error) {
      console.error('❌ Error creating validation log:', error);
      throw error;
    }
  }

  // Statistics
  async getReviewStats() {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const records = await this.base('Reviews').select().all();
      
      const stats = {
        total_reviews: records.length,
        accepted_reviews: records.filter(r => r.fields.Status === 'accepted').length,
        rejected_reviews: records.filter(r => r.fields.Status === 'rejected').length,
        pending_reviews: records.filter(r => r.fields.Status === 'pending').length
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting review stats:', error);
      throw error;
    }
  }

  async getImageStats() {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const records = await this.base('Images').select().all();
      
      const acceptedImages = records.filter(r => r.fields.Decision === 'accept');
      const qualityScores = records
        .filter(r => r.fields['Quality Score'])
        .map(r => r.fields['Quality Score']);
      
      const avgQualityScore = qualityScores.length > 0 
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
        : 0;

      const stats = {
        total_images: records.length,
        accepted_images: acceptedImages.length,
        rejected_images: records.length - acceptedImages.length,
        avg_quality_score: Math.round(avgQualityScore * 100) / 100
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting image stats:', error);
      throw error;
    }
  }

  // Check if order exists and get its status
  async checkOrderExists(orderNumber) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      // Check only in reviews_done table
      const doneRecords = await this.base('reviews_done').select({
        filterByFormula: `{Order number} = "${orderNumber}"`,
        maxRecords: 1
      }).all();

      if (doneRecords.length > 0) {
        const record = doneRecords[0];
        const status = record.fields.Status;
        console.log(`✅ Order ${orderNumber} found in reviews_done table with status: ${status}`);
        
        return {
          exists: true,
          status: status,
          recordId: record.id
        };
      }

      console.log(`✅ Order ${orderNumber} not found in reviews_done table - can proceed`);
      return {
        exists: false,
        status: null,
        recordId: null
      };
    } catch (error) {
      console.error('❌ Error checking order existence:', error);
      throw error;
    }
  }

  async addOrderToDone(orderNumber, status = 'accepted', clientEmail = '', cloudinaryLink = '', reviewText = '', customerName = '', starRating = 0) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const record = await this.base('reviews_done').create([
        {
          fields: {
            'Order number': orderNumber,
            'Status': status,
            'Client Email': clientEmail,
            'Cloudinary Link': cloudinaryLink,
            'Review Text': reviewText,
            'Imie': customerName,
            'Gwiazdki': parseInt(starRating) || 0
          }
        }
      ]);

      console.log(`✅ Order ${orderNumber} added to reviews_done with status: ${status}`);
      return record[0].id;
    } catch (error) {
      console.error('❌ Error adding order to reviews_done:', error);
      throw error;
    }
  }

  // Update order status in reviews_done table
  async updateOrderStatus(recordId, status, clientEmail = '', cloudinaryLink = '', reviewText = '', customerName = '', starRating = 0) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const updateFields = {
        'Status': status
      };

      // Add additional fields if provided
      if (clientEmail) updateFields['Client Email'] = clientEmail;
      if (cloudinaryLink) updateFields['Cloudinary Link'] = cloudinaryLink;
      if (reviewText) updateFields['Review Text'] = reviewText;
      if (customerName) updateFields['Imie'] = customerName;
      if (starRating) updateFields['Gwiazdki'] = starRating.toString();

      await this.base('reviews_done').update([
        {
          id: recordId,
          fields: updateFields
        }
      ]);

      console.log(`✅ Order status updated to: ${status}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  // Discount codes table operations
  async getAvailableDiscountCode() {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      const records = await this.base('discount_codes').select({
        filterByFormula: `{Status} = "to_send"`,
        maxRecords: 1
      }).all();

      if (records.length === 0) {
        throw new Error('No available discount codes');
      }

      const record = records[0];
      console.log(`✅ Found available discount code: ${record.fields['Discount Code']}`);
      return {
        id: record.id,
        code: record.fields['Discount Code']
      };
    } catch (error) {
      console.error('❌ Error getting available discount code:', error);
      throw error;
    }
  }

  async assignDiscountCode(discountCodeId, orderNumber, clientEmail) {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      await this.base('discount_codes').update([
        {
          id: discountCodeId,
          fields: {
            'Order Number': orderNumber,
            'Client Email': clientEmail,
            'Status': 'send'
          }
        }
      ]);

      console.log(`✅ Discount code assigned to order ${orderNumber}`);
      return true;
    } catch (error) {
      console.error('❌ Error assigning discount code:', error);
      throw error;
    }
  }

  async updateDiscountCodeStatus(discountCodeId, status = 'sent') {
    if (!this.base) {
      throw new Error('Airtable not configured');
    }

    try {
      await this.base('discount_codes').update([
        {
          id: discountCodeId,
          fields: {
            'Status': status
          }
        }
      ]);

      console.log(`✅ Discount code status updated to: ${status}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating discount code status:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    if (!this.base) {
      return false;
    }

    try {
      await this.base('reviews_done').select({ maxRecords: 1 }).all();
      console.log('✅ Airtable connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Airtable connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = new AirtableService();
