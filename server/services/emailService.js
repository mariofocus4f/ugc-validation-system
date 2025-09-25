const nodemailer = require('nodemailer');

/**
 * Email service for sending discount codes
 */

// Create transporter (using Ethereal Email for testing)
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'verysecret'
    }
  });
};

/**
 * Sends discount code email
 * @param {string} email - Recipient email
 * @param {string} discountCode - Generated discount code
 * @param {string} orderNumber - Order number
 * @param {string} productName - Product name
 * @returns {Promise<Object>} Email sending result
 */
async function sendDiscountCodeEmail(email, discountCode, orderNumber, productName) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: 'UGC Validation System <noreply@ugc-validation.com>',
      to: email,
      subject: `🎉 Twój kod rabatowy za opinię o ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Gratulacje!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Twoja opinia została zaakceptowana</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border: 2px solid #e2e8f0; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 15px 0; text-align: center;">Twój kod rabatowy</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #10b981; text-align: center;">
              <code style="font-size: 24px; font-weight: bold; color: #059669; letter-spacing: 2px;">${discountCode}</code>
            </div>
            <p style="text-align: center; color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">
              Wartość: <strong>100 zł zniżki</strong> na następne zamówienie
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Szczegóły zamówienia:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Numer zamówienia:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Produkt:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Data:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${new Date().toLocaleDateString('pl-PL')}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>💡 Wskazówka:</strong> Kod rabatowy jest ważny przez 30 dni od daty otrzymania.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Dziękujemy za opinię! 🛍️
            </p>
          </div>
        </div>
      `,
      text: `
        🎉 Gratulacje! Twoja opinia została zaakceptowana!
        
        Twój kod rabatowy: ${discountCode}
        Wartość: 100 zł zniżki na następne zamówienie
        
        Szczegóły zamówienia:
        - Numer: ${orderNumber}
        - Produkt: ${productName}
        - Data: ${new Date().toLocaleDateString('pl-PL')}
        
        💡 Kod rabatowy jest ważny przez 30 dni od daty otrzymania.
        
        Dziękujemy za opinię! 🛍️
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
    
    return {
      success: true,
      messageId: result.messageId,
      previewUrl: nodemailer.getTestMessageUrl(result),
      email,
      discountCode,
      orderNumber,
      productName,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error(`Błąd wysyłania emaila: ${error.message}`);
  }
}

/**
 * Test email connection
 * @returns {Promise<boolean>} Connection status
 */
async function testEmailConnection() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service connection failed:', error.message);
    return false;
  }
}

module.exports = {
  sendDiscountCodeEmail,
  testEmailConnection
};
