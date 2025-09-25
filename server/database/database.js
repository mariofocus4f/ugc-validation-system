const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, 'ugc_validation.db');
  }

  async init() {
    return new Promise((resolve, reject) => {
      // Ensure database directory exists
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('❌ Error creating tables:', err.message);
          reject(err);
        } else {
          console.log('✅ Database tables created successfully');
          resolve();
        }
      });
    });
  }

  // Review operations
  async createReview(reviewData) {
    return new Promise((resolve, reject) => {
      const { orderNumber, productName, textReview, discountCode, emailSent, status } = reviewData;
      
      const sql = `
        INSERT INTO reviews (order_number, product_name, text_review, discount_code, email_sent, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [orderNumber, productName, textReview, discountCode, emailSent || false, status || 'pending'], function(err) {
        if (err) {
          console.error('❌ Error creating review:', err.message);
          reject(err);
        } else {
          console.log(`✅ Review created with ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      });
    });
  }

  async getReview(reviewId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM reviews WHERE id = ?';
      
      this.db.get(sql, [reviewId], (err, row) => {
        if (err) {
          console.error('❌ Error getting review:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async updateReviewStatus(reviewId, status) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE reviews SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      this.db.run(sql, [status, reviewId], function(err) {
        if (err) {
          console.error('❌ Error updating review status:', err.message);
          reject(err);
        } else {
          console.log(`✅ Review ${reviewId} status updated to ${status}`);
          resolve(this.changes);
        }
      });
    });
  }

  // Image operations
  async createImage(imageData) {
    return new Promise((resolve, reject) => {
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
      
      const sql = `
        INSERT INTO images (
          review_id, filename, original_filename, file_path, file_size, mime_type,
          width, height, validation_result, decision, quality_score, feedback, has_people
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        reviewId, filename, originalFilename, filePath, fileSize, mimeType,
        width, height, JSON.stringify(validationResult), decision, qualityScore, feedback, hasPeople || false
      ], function(err) {
        if (err) {
          console.error('❌ Error creating image record:', err.message);
          reject(err);
        } else {
          console.log(`✅ Image record created with ID: ${this.lastID}`);
          resolve(this.lastID);
        }
      });
    });
  }

  async getImagesByReview(reviewId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM images WHERE review_id = ? ORDER BY created_at';
      
      this.db.all(sql, [reviewId], (err, rows) => {
        if (err) {
          console.error('❌ Error getting images:', err.message);
          reject(err);
        } else {
          // Parse validation_result JSON
          const images = rows.map(row => ({
            ...row,
            validation_result: row.validation_result ? JSON.parse(row.validation_result) : null
          }));
          resolve(images);
        }
      });
    });
  }

  // Validation log operations
  async createValidationLog(logData) {
    return new Promise((resolve, reject) => {
      const { reviewId, imageId, action, details } = logData;
      
      const sql = `
        INSERT INTO validation_logs (review_id, image_id, action, details)
        VALUES (?, ?, ?, ?)
      `;
      
      this.db.run(sql, [reviewId, imageId, action, JSON.stringify(details)], function(err) {
        if (err) {
          console.error('❌ Error creating validation log:', err.message);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Statistics
  async getReviewStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_reviews,
          SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted_reviews,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_reviews,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reviews
        FROM reviews
      `;
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          console.error('❌ Error getting review stats:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getImageStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_images,
          SUM(CASE WHEN decision = 'accept' THEN 1 ELSE 0 END) as accepted_images,
          SUM(CASE WHEN decision = 'reject' THEN 1 ELSE 0 END) as rejected_images,
          AVG(quality_score) as avg_quality_score
        FROM images
      `;
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          console.error('❌ Error getting image stats:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('✅ Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database();
