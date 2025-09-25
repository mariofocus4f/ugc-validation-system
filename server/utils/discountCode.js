/**
 * Utility functions for generating discount codes
 */

/**
 * Generates a random discount code
 * @param {number} length - Length of the code (default: 8)
 * @returns {string} Generated discount code
 */
function generateDiscountCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Generates a discount code with format: PREFIX-XXXX-XXXX
 * @returns {string} Formatted discount code
 */
function generateFormattedDiscountCode() {
  const prefix = 'UGC';
  const part1 = generateDiscountCode(4);
  const part2 = generateDiscountCode(4);
  
  return `${prefix}-${part1}-${part2}`;
}

/**
 * Simulates sending discount code via email
 * @param {string} email - Recipient email
 * @param {string} discountCode - Generated discount code
 * @param {string} orderNumber - Order number
 * @param {string} productName - Product name
 * @returns {Promise<Object>} Email sending result
 */
async function sendDiscountCodeEmail(email, discountCode, orderNumber, productName) {
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`📧 Email sent to ${email}:`);
  console.log(`   Subject: Twój kod rabatowy za opinię o ${productName}`);
  console.log(`   Code: ${discountCode}`);
  console.log(`   Order: ${orderNumber}`);
  
  return {
    success: true,
    email,
    discountCode,
    orderNumber,
    productName,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateDiscountCode,
  generateFormattedDiscountCode,
  sendDiscountCodeEmail
};
