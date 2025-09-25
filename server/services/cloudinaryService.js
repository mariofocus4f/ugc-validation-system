const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

class CloudinaryService {
  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = process.env.CLOUDINARY_API_KEY;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET;
    this.folder = process.env.CLOUDINARY_FOLDER || 'ugc-validation';
    
    this.init();
  }

  init() {
    if (this.cloudName && this.apiKey && this.apiSecret) {
      try {
        cloudinary.config({
          cloud_name: this.cloudName,
          api_key: this.apiKey,
          api_secret: this.apiSecret
        });
        
        console.log('✅ Cloudinary service initialized');
        if (logger.info) {
          logger.info('Cloudinary service initialized successfully');
        }
      } catch (error) {
        console.error('❌ Error initializing Cloudinary:', error.message);
        if (logger.error) {
          logger.error('Failed to initialize Cloudinary service', { error: error.message });
        }
      }
    } else {
      console.log('⚠️ Cloudinary not configured - check environment variables');
      if (logger.warn) {
        logger.warn('Cloudinary not configured - missing environment variables');
      }
    }
  }

  async uploadImage(buffer, originalName, orderNumber) {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error('Cloudinary not configured');
    }

    try {
      // Use order number as the main identifier, add timestamp only if needed for uniqueness
      const publicId = `${this.folder}/${orderNumber}`;
      
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: this.folder,
            resource_type: 'image',
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      if (logger.info) {
        logger.info('Image uploaded to Cloudinary successfully', {
          publicId: result.public_id,
          url: result.secure_url,
          originalName
        });
      }

      return {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      if (logger.error) {
        logger.error('Failed to upload image to Cloudinary', {
          error: error.message,
          originalName
        });
      }
      throw new Error(`Błąd przesyłania do Cloudinary: ${error.message}`);
    }
  }

  async deleteImage(publicId) {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        if (logger.info) {
          logger.info('Image deleted from Cloudinary', { publicId });
        }
        return true;
      } else {
        if (logger.warn) {
          logger.warn('Failed to delete image from Cloudinary', { publicId, result });
        }
        return false;
      }
    } catch (error) {
      if (logger.error) {
        logger.error('Error deleting image from Cloudinary', {
          error: error.message,
          publicId
        });
      }
      throw new Error(`Błąd usuwania z Cloudinary: ${error.message}`);
    }
  }

  async testConnection() {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      return false;
    }

    try {
      // Test connection by getting account info
      const result = await cloudinary.api.ping();
      return result.status === 'ok';
    } catch (error) {
      if (logger.error) {
        logger.error('Cloudinary connection test failed', { error: error.message });
      }
      return false;
    }
  }

  getImageUrl(publicId, options = {}) {
    if (!publicId) return null;
    
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    };

    return cloudinary.url(publicId, defaultOptions);
  }
}

module.exports = new CloudinaryService();
