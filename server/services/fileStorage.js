const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileStorage {
  constructor() {
    this.s3 = null;
    this.bucketName = process.env.AWS_S3_BUCKET || 'ugc-validation-images';
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.localStoragePath = path.join(__dirname, '../../uploads');
    
    this.init();
  }

  init() {
    // Initialize AWS S3 if credentials are provided
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: this.region
      });
      console.log('✅ AWS S3 initialized');
    } else {
      console.log('⚠️ AWS S3 not configured, using local storage');
    }

    // Ensure local storage directory exists
    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
      console.log('✅ Local storage directory created');
    }
  }

  async uploadImage(fileBuffer, originalFilename, mimeType) {
    try {
      const fileExtension = path.extname(originalFilename);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      
      if (this.s3) {
        // Upload to S3
        const uploadResult = await this.uploadToS3(fileBuffer, uniqueFilename, mimeType);
        return {
          success: true,
          filename: uniqueFilename,
          filePath: uploadResult.Location,
          storageType: 's3',
          bucket: this.bucketName
        };
      } else {
        // Upload to local storage
        const uploadResult = await this.uploadToLocal(fileBuffer, uniqueFilename);
        return {
          success: true,
          filename: uniqueFilename,
          filePath: uploadResult.filePath,
          storageType: 'local',
          localPath: uploadResult.localPath
        };
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadToS3(fileBuffer, filename, mimeType) {
    const params = {
      Bucket: this.bucketName,
      Key: `images/${filename}`,
      Body: fileBuffer,
      ContentType: mimeType,
      ACL: 'public-read' // Make images publicly accessible
    };

    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          console.error('❌ S3 upload error:', err);
          reject(err);
        } else {
          console.log(`✅ Image uploaded to S3: ${data.Location}`);
          resolve(data);
        }
      });
    });
  }

  async uploadToLocal(fileBuffer, filename) {
    const filePath = path.join(this.localStoragePath, filename);
    
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, fileBuffer, (err) => {
        if (err) {
          console.error('❌ Local upload error:', err);
          reject(err);
        } else {
          console.log(`✅ Image saved locally: ${filePath}`);
          resolve({
            filePath: `/uploads/${filename}`,
            localPath: filePath
          });
        }
      });
    });
  }

  async deleteImage(filename, storageType = 'auto') {
    try {
      if (storageType === 's3' || (storageType === 'auto' && this.s3)) {
        await this.deleteFromS3(filename);
      } else {
        await this.deleteFromLocal(filename);
      }
      
      console.log(`✅ Image deleted: ${filename}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async deleteFromS3(filename) {
    const params = {
      Bucket: this.bucketName,
      Key: `images/${filename}`
    };

    return new Promise((resolve, reject) => {
      this.s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async deleteFromLocal(filename) {
    const filePath = path.join(this.localStoragePath, filename);
    
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getImageUrl(filename, storageType = 'auto') {
    if (storageType === 's3' || (storageType === 'auto' && this.s3)) {
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/images/${filename}`;
    } else {
      return `/uploads/${filename}`;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      if (this.s3) {
        return await this.getS3Stats();
      } else {
        return await this.getLocalStats();
      }
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return { error: error.message };
    }
  }

  async getS3Stats() {
    const params = {
      Bucket: this.bucketName,
      Prefix: 'images/'
    };

    return new Promise((resolve, reject) => {
      this.s3.listObjectsV2(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const totalSize = data.Contents.reduce((sum, obj) => sum + obj.Size, 0);
          resolve({
            storageType: 's3',
            totalFiles: data.Contents.length,
            totalSize: totalSize,
            totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
          });
        }
      });
    });
  }

  async getLocalStats() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.localStoragePath, (err, files) => {
        if (err) {
          reject(err);
        } else {
          let totalSize = 0;
          files.forEach(file => {
            const filePath = path.join(this.localStoragePath, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
          });
          
          resolve({
            storageType: 'local',
            totalFiles: files.length,
            totalSize: totalSize,
            totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
          });
        }
      });
    });
  }
}

module.exports = new FileStorage();
