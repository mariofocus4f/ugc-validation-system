/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Plik jest zbyt duży',
      message: `Maksymalny rozmiar: ${Math.round((process.env.MAX_FILE_SIZE || 10485760) / 1024 / 1024)}MB`
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Zbyt wiele plików',
      message: `Maksymalna liczba plików: ${process.env.MAX_FILES || 1}`
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Nieprawidłowe pole pliku',
      message: 'Użyj pola "images" do przesyłania zdjęć'
    });
  }

  // Validation errors
  if (err.message && err.message.includes('Nieprawidłowy format pliku')) {
    return res.status(400).json({
      error: 'Nieprawidłowy format pliku',
      message: 'Dozwolone formaty: JPG, PNG, WebP'
    });
  }

  // OpenAI API errors
  if (err.message && err.message.includes('OpenAI')) {
    return res.status(503).json({
      error: 'Błąd usługi analizy',
      message: 'Usługa analizy zdjęć jest tymczasowo niedostępna'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Wystąpił nieoczekiwany błąd',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = {
  errorHandler
};

