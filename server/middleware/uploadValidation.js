const sharp = require('sharp');

/**
 * Validates uploaded image file
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Validation result
 */
async function validateUpload(file) {
  const errors = [];
  
  try {
    // Check file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB
    if (file.size > maxSize) {
      errors.push(`Plik ${file.originalname} jest zbyt duży (${Math.round(file.size / 1024 / 1024)}MB). Maksymalny rozmiar: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check MIME type
    const allowedTypes = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Plik ${file.originalname} ma nieprawidłowy format. Dozwolone: ${allowedTypes.join(', ')}`);
    }

    // Check image dimensions and validity
    try {
      const metadata = await sharp(file.buffer).metadata();
      const minWidth = parseInt(process.env.MIN_IMAGE_WIDTH) || 400;
      
      if (metadata.width < minWidth) {
        errors.push(`Plik ${file.originalname} jest zbyt mały. Minimalna szerokość: ${minWidth}px. Aktualna: ${metadata.width}px`);
      }

      if (metadata.height < 400) {
        errors.push(`Plik ${file.originalname} jest zbyt niski. Minimalna wysokość: 400px. Aktualna: ${metadata.height}px`);
      }

    } catch (imageError) {
      errors.push(`Plik ${file.originalname} nie jest prawidłowym obrazem lub jest uszkodzony`);
    }

  } catch (error) {
    errors.push(`Błąd walidacji pliku ${file.originalname}: ${error.message}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateUpload
};

