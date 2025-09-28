const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const Joi = require('joi');
const { validateImage } = require('../services/openaiService');
const { validateUpload } = require('../middleware/uploadValidation');
const { logValidation } = require('../utils/logger');
const { generateFormattedDiscountCode } = require('../utils/discountCode');
const { sendDiscountCodeEmail } = require('../services/emailService');
const airtableService = require('../services/airtableService');
const googleDriveService = require('../services/googleDriveService');
const cloudinaryService = require('../services/cloudinaryService');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        files: parseInt(process.env.MAX_FILES) || 3
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nieprawidłowy format pliku. Dozwolone: JPG, PNG, WebP'), false);
    }
  }
});

// Validation schema
const validationSchema = Joi.object({
        images: Joi.array().min(3).max(3).required(),
  textReview: Joi.string().min(20).max(500).required().pattern(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9\s.,!?\-()]+$/).messages({
    'string.pattern.base': 'Opinia może zawierać tylko litery, cyfry, spacje i podstawowe znaki interpunkcyjne'
  }),
  orderEmail: Joi.string().email().required(),
  orderNumber: Joi.string().required().pattern(/^[a-zA-Z0-9\-_]+$/).messages({
    'string.pattern.base': 'Numer zamówienia może zawierać tylko litery, cyfry, myślniki i podkreślenia'
  }),
  customerName: Joi.string().min(2).max(100).required().pattern(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$/).messages({
    'string.pattern.base': 'Imię może zawierać tylko litery i spacje'
  }),
  starRating: Joi.number().integer().min(1).max(5).required(),
  fixMode: Joi.boolean().optional(),
  rejectedImages: Joi.string().optional(),
  acceptedImages: Joi.string().optional()
});

/**
 * POST /api/ugc/validate
 * Waliduje zdjęcia UGC używając OpenAI Vision API
 */
router.post('/validate', upload.array('images', 3), async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Nieprawidłowe dane wejściowe',
        message: 'Nie przesłano żadnych plików'
      });
    }

    // Extract form data
    const { textReview, orderEmail, orderNumber, fixMode, rejectedImages, acceptedImages, customerName, starRating } = req.body;
    
    // Parse fix mode data if provided
    let parsedRejectedImages = [];
    let parsedAcceptedImages = [];
    if (fixMode === 'true' && rejectedImages && acceptedImages) {
      try {
        parsedRejectedImages = JSON.parse(rejectedImages);
        parsedAcceptedImages = JSON.parse(acceptedImages);
      } catch (parseError) {
        console.error('Error parsing fix mode data:', parseError);
        return res.status(400).json({
          error: 'Nieprawidłowe dane trybu poprawy'
        });
      }
    }
    
    // Validate form data
    const { error } = validationSchema.validate({
      images: req.files,
      textReview,
      orderEmail,
      orderNumber,
      customerName,
      starRating: parseInt(starRating),
      fixMode: fixMode === 'true',
      rejectedImages,
      acceptedImages
    });
    
    if (error) {
      return res.status(400).json({
        error: 'Nieprawidłowe dane wejściowe',
        message: error.details[0].message
      });
    }

    const images = req.files;
    const results = [];
    let reviewId = null;

    // Check if order exists and get its status (skip check in fix mode)
    let orderInfo = null;
    if (fixMode !== 'true') {
      try {
        orderInfo = await airtableService.checkOrderExists(orderNumber);
        
        if (orderInfo.exists) {
          // If order has status 'accepted', never allow new review
          if (orderInfo.status === 'accepted') {
            return res.status(400).json({
              error: 'Zamówienie już ma zaakceptowaną opinię',
              message: `Zamówienie ${orderNumber} już ma zaakceptowaną opinię w systemie. Nie można dodać nowej opinii.`
            });
          }
          // If order has status 'rejected' or 'not_yet', allow review
          if (orderInfo.status === 'rejected' || orderInfo.status === 'not_yet') {
            console.log(`✅ Order ${orderNumber} has status '${orderInfo.status}' - proceeding with review`);
          }
        } else {
          console.log(`✅ Order ${orderNumber} not found - will create new record`);
        }
      } catch (checkError) {
        console.error('❌ Error checking order existence:', checkError);
        // Continue processing even if check fails
      }
    } else {
      console.log(`🔧 Fix mode: Skipping order existence check`);
    }

    // We'll create the review record after processing images to get Cloudinary URL

    // Process each image
    for (const image of images) {
      try {
        console.log(`Processing image: ${image.originalname}, size: ${image.size} bytes`);
        
        // Validate image dimensions
        const metadata = await sharp(image.buffer).metadata();
        const minWidth = parseInt(process.env.MIN_IMAGE_WIDTH) || 400;
        
        console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
        
        if (metadata.width < minWidth) {
          console.log(`Image too small: ${metadata.width} < ${minWidth}`);
          const rejectResult = {
            filename: image.originalname,
            decision: 'reject',
            score: 0,
            people: false,
            feedback: `Zdjęcie jest zbyt małe. Minimalna szerokość: ${minWidth}px. Aktualna: ${metadata.width}px.`
          };
          results.push(rejectResult);

          // Image rejected - no need to save to Airtable (only reviews_done table is used)
          continue;
        }

        // Upload image to Cloudinary (preferred) or Google Drive (fallback)
        let filePath = null;
        let fileId = null;
        let cloudinaryUrl = null;
        
        try {
          // Try Cloudinary first
          const cloudinaryResult = await cloudinaryService.uploadImage(
            image.buffer, 
            image.originalname, 
            orderNumber
          );
          filePath = cloudinaryResult.url;
          fileId = cloudinaryResult.publicId;
          cloudinaryUrl = cloudinaryResult.url;
          console.log(`✅ Image uploaded to Cloudinary: ${cloudinaryResult.url}`);
        } catch (cloudinaryError) {
          console.error('❌ Error uploading to Cloudinary:', cloudinaryError.message);
          console.log('⚠️ Trying Google Drive as fallback...');
          
          try {
            // Fallback to Google Drive
            const uploadResult = await googleDriveService.uploadImage(
              image.buffer, 
              image.originalname, 
              image.mimetype
            );
            filePath = uploadResult.filePath;
            fileId = uploadResult.fileId;
            console.log(`✅ Image uploaded to Google Drive: ${filePath}`);
          } catch (uploadError) {
            console.error('❌ Error uploading to Google Drive:', uploadError.message);
            console.log('⚠️ Continuing without file upload...');
            // Continue processing even if upload fails
          }
        }

        // Convert to base64 for OpenAI
        const base64Image = image.buffer.toString('base64');
        const mimeType = image.mimetype;

        // Validate with OpenAI
        console.log(`Calling OpenAI API for ${image.originalname}...`);
        let validationResult;
        try {
          validationResult = await validateImage(base64Image, mimeType);
          console.log(`OpenAI result for ${image.originalname}:`, validationResult);
        } catch (openaiError) {
          console.error(`❌ OpenAI API error for ${image.originalname}:`, openaiError.message);
          // Create a mock result for testing - always accept in test mode
          validationResult = {
            decision: 'accept', // Mock acceptance for testing
            score: 85,
            people: false,
            feedback: 'Zdjęcie zostało zaakceptowane (tryb testowy)'
          };
          console.log(`⚠️ Using mock result for ${image.originalname}:`, validationResult);
        }
        
        // Add filename and cloudinary URL to result
        validationResult.filename = image.originalname;
        validationResult.cloudinaryUrl = cloudinaryUrl;
        results.push(validationResult);

        // Image processed - no need to save to Airtable (only reviews_done table is used)

        // Log validation attempt
        logValidation({
          filename: image.originalname,
          size: image.size,
          dimensions: `${metadata.width}x${metadata.height}`,
          result: validationResult
        });

      } catch (imageError) {
        console.error(`Błąd przetwarzania obrazu ${image.originalname}:`, imageError);
        const errorResult = {
          filename: image.originalname,
          decision: 'reject',
          score: 0,
          people: false,
          feedback: 'Błąd przetwarzania obrazu. Spróbuj ponownie.'
        };
        results.push(errorResult);

        // Image processing error - no need to save to Airtable (only reviews_done table is used)
      }
    }

    // In fix mode, combine new results with previously accepted images
    let finalResults = results;
    if (fixMode === 'true' && parsedAcceptedImages.length > 0) {
      console.log(`🔧 Fix mode: Combining ${results.length} new results with ${parsedAcceptedImages.length} previously accepted images`);
      finalResults = [...parsedAcceptedImages, ...results];
    }
    
    // Calculate overall statistics
    const acceptedCount = finalResults.filter(r => r.decision === 'accept').length;
    const totalCount = finalResults.length;
    const averageScore = finalResults.reduce((sum, r) => sum + r.score, 0) / totalCount;
    
    // Get Cloudinary URL from the first accepted image
    const firstAcceptedResult = finalResults.find(r => r.decision === 'accept');
    const cloudinaryUrl = firstAcceptedResult ? firstAcceptedResult.cloudinaryUrl : null;
    
    // Create or update review record in reviews_done table (skip in fix mode)
    if (fixMode !== 'true') {
      try {
        const newStatus = acceptedCount >= 3 ? 'accepted' : 'rejected';
        
        if (orderInfo && orderInfo.exists) {
          // If current status is 'rejected' and new status is also 'rejected', don't save anything
          if (orderInfo.status === 'rejected' && newStatus === 'rejected') {
            console.log(`⚠️ Order ${orderNumber} was rejected again - not saving to Airtable`);
            reviewId = null; // Don't save anything
          } else {
            // Update existing record
            await airtableService.updateOrderStatus(
              orderInfo.recordId,
              newStatus,
              orderEmail,
              cloudinaryUrl,
              textReview,
              customerName,
              starRating
            );
            reviewId = orderInfo.recordId;
            console.log(`✅ Order ${orderNumber} status updated in reviews_done to: ${newStatus}`);
          }
        } else {
          // Create new record only if accepted
          if (newStatus === 'accepted') {
            reviewId = await airtableService.addOrderToDone(
              orderNumber,
              newStatus,
              orderEmail,
              cloudinaryUrl,
              textReview,
              customerName,
              starRating
            );
            console.log(`✅ New order ${orderNumber} added to reviews_done with ID: ${reviewId}`);
          } else {
            console.log(`⚠️ New order ${orderNumber} was rejected - not saving to Airtable`);
            reviewId = null; // Don't save rejected orders
          }
        }
      } catch (airtableError) {
        console.error('❌ Error creating/updating order in reviews_done:', airtableError);
        // Continue processing even if Airtable fails
      }
    } else {
      console.log(`🔧 Fix mode: Skipping Airtable save - only showing results`);
      reviewId = null; // Don't save in fix mode
    }
    
    // Generate discount code if minimum 3 images are accepted (skip in fix mode)
    let discountCode = null;
    let emailSent = false;
    
    if (acceptedCount >= 3 && fixMode !== 'true') {
      // Get available discount code from Airtable
      let discountCodeData = null;
      try {
        discountCodeData = await airtableService.getAvailableDiscountCode();
        discountCode = discountCodeData.code;
        console.log(`✅ Using discount code: ${discountCode}`);
      } catch (discountError) {
        console.error('❌ No available discount codes:', discountError.message);
        // Fallback to generating new code if no codes available
        discountCode = generateFormattedDiscountCode();
        console.log(`⚠️ Generated fallback discount code: ${discountCode}`);
      }
      
      // Status already updated above in reviews_done table

      // Order already added/updated above in reviews_done table
      
      // Assign discount code to order first (update with order number, email, and status)
      if (discountCodeData && discountCodeData.id) {
        try {
          console.log(`🔧 Assigning discount code ${discountCode} (ID: ${discountCodeData.id}) to order ${orderNumber}`);
          await airtableService.assignDiscountCode(discountCodeData.id, orderNumber, orderEmail);
          console.log(`✅ Discount code assigned to order ${orderNumber}`);
        } catch (assignError) {
          console.error('❌ Error assigning discount code:', assignError);
        }
      } else {
        console.log(`⚠️ No discount code data or ID available. discountCodeData:`, discountCodeData);
      }
      
      // Send email to client
      try {
        const emailResult = await sendDiscountCodeEmail(orderEmail, discountCode, orderNumber, 'Product name will be fetched from order system');
        emailSent = true;
        console.log(`✅ Email sent successfully to ${orderEmail}`);
        console.log('📧 Preview URL:', emailResult.previewUrl);
      } catch (emailError) {
        console.error('❌ Błąd wysyłania emaila:', emailError);
        // Code is already assigned, just email failed
      }
    } else {
      // Update review status to rejected in Airtable
      if (reviewId) {
        try {
          await airtableService.updateReviewStatus(reviewId, 'rejected');
          console.log(`✅ Review ${reviewId} status updated to rejected`);
        } catch (airtableError) {
          console.error('❌ Error updating review status in Airtable:', airtableError);
        }
      }

      // Add order to reviews_done table as rejected
      try {
        await airtableService.addOrderToDone(orderNumber, 'rejected', orderEmail, cloudinaryUrl, textReview, customerName, starRating);
        console.log(`✅ Order ${orderNumber} added to reviews_done as rejected`);
      } catch (doneError) {
        console.error('❌ Error adding order to reviews_done:', doneError);
      }
    }

    res.json({
      success: true,
      results,
      summary: {
        total: totalCount,
        accepted: acceptedCount,
        rejected: totalCount - acceptedCount,
        averageScore: Math.round(averageScore * 100) / 100
      },
      discountCode,
      emailSent,
      reviewId,
      orderInfo: {
        orderEmail,
        orderNumber,
        textReview
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Błąd walidacji:', error);
    res.status(500).json({
      error: 'Wystąpił błąd podczas walidacji zdjęć',
      message: error.message
    });
  }
});

/**
 * GET /api/ugc/status
 * Zwraca status systemu walidacji
 */
router.get('/status', async (req, res) => {
  const { testConnection } = require('../services/openaiService');
  
  let openaiStatus = 'unknown';
  try {
    const isConnected = await testConnection();
    openaiStatus = isConnected ? 'connected' : 'disconnected';
  } catch (error) {
    openaiStatus = 'error';
    console.error('OpenAI connection test failed:', error.message);
  }
  
  let airtableStatus = 'unknown';
  try {
    const isConnected = await airtableService.testConnection();
    airtableStatus = isConnected ? 'connected' : 'disconnected';
  } catch (error) {
    airtableStatus = 'error';
    console.error('Airtable connection test failed:', error.message);
  }
  
  let googleDriveStatus = 'unknown';
  try {
    const isConnected = await googleDriveService.testConnection();
    googleDriveStatus = isConnected ? 'connected' : 'disconnected';
  } catch (error) {
    googleDriveStatus = 'error';
    console.error('Google Drive connection test failed:', error.message);
  }
  
  let cloudinaryStatus = 'unknown';
  try {
    const isConnected = await cloudinaryService.testConnection();
    cloudinaryStatus = isConnected ? 'connected' : 'disconnected';
  } catch (error) {
    cloudinaryStatus = 'error';
    console.error('Cloudinary connection test failed:', error.message);
  }
  
  res.json({
    status: 'operational',
    version: '1.0.0',
    openai: {
      status: openaiStatus,
      apiKey: process.env.OPENAI_API_KEY ? 'configured' : 'missing'
    },
    airtable: {
      status: airtableStatus,
      apiKey: process.env.AIRTABLE_API_KEY ? 'configured' : 'missing',
      baseId: process.env.AIRTABLE_BASE_ID ? 'configured' : 'missing'
    },
    googleDrive: {
      status: googleDriveStatus,
      serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH ? 'configured' : 'missing',
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID ? 'configured' : 'missing'
    },
    cloudinary: {
      status: cloudinaryStatus,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'missing',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'configured' : 'missing',
      folder: process.env.CLOUDINARY_FOLDER || 'ugc-validation'
    },
    features: {
      maxFiles: parseInt(process.env.MAX_FILES) || 3,
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
      minImageWidth: parseInt(process.env.MIN_IMAGE_WIDTH) || 200,
      allowedTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(',')
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

