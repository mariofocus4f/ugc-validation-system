/**
 * Logs validation attempts for monitoring and analytics
 * @param {Object} data - Validation data to log
 */
function logValidation(data) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    filename: data.filename,
    size: data.size,
    dimensions: data.dimensions,
    result: {
      decision: data.result.decision,
      score: data.result.score,
      people: data.result.people
    },
    userAgent: data.userAgent || 'unknown',
    ip: data.ip || 'unknown'
  };

  // In production, you might want to send this to a logging service
  // For now, we'll just console.log it
  console.log('VALIDATION_LOG:', JSON.stringify(logEntry));

  // You could also write to a file or send to external service
  // Example: fs.appendFileSync('validation.log', JSON.stringify(logEntry) + '\n');
}

/**
 * Logs system events
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function logSystem(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };

  console.log(`SYSTEM_${level.toUpperCase()}:`, JSON.stringify(logEntry));
}

module.exports = {
  logValidation,
  logSystem
};

