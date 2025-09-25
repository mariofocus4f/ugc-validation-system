const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    this.serviceAccountKeyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    this.oauthClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    this.oauthClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    
    this.init();
  }

  init() {
    if (this.serviceAccountKeyPath && this.folderId) {
      try {
        // Load service account key from file
        const serviceAccount = JSON.parse(fs.readFileSync(this.serviceAccountKeyPath, 'utf8'));
        
        // Create JWT auth client
        const auth = new google.auth.JWT(
          serviceAccount.client_email,
          null,
          serviceAccount.private_key,
          ['https://www.googleapis.com/auth/drive']
        );

        // Initialize Drive API
        this.drive = google.drive({ version: 'v3', auth });
        console.log('✅ Google Drive service initialized');
      } catch (error) {
        console.error('❌ Error initializing Google Drive with Service Account:', error.message);
        this.initOAuth();
      }
    } else if (this.oauthClientId && this.oauthClientSecret && this.folderId) {
      this.initOAuth();
    } else {
      console.log('⚠️ Google Drive not configured - check environment variables');
    }
  }

  initOAuth() {
    try {
      // Create OAuth2 client
      const auth = new google.auth.OAuth2(
        this.oauthClientId,
        this.oauthClientSecret,
        'urn:ietf:wg:oauth:2.0:oob'
      );

      // Set refresh token (you'll need to get this first)
      auth.setCredentials({
        refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN
      });

      // Initialize Drive API
      this.drive = google.drive({ version: 'v3', auth });
      console.log('✅ Google Drive service initialized with OAuth');
    } catch (error) {
      console.error('❌ Error initializing Google Drive with OAuth:', error.message);
    }
  }

  async uploadImage(fileBuffer, originalFilename, mimeType) {
    if (!this.drive) {
      throw new Error('Google Drive not configured');
    }

    try {
      const fileExtension = path.extname(originalFilename);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      
      // Create file metadata
      const fileMetadata = {
        name: uniqueFilename,
        parents: [this.folderId]
      };

      // Create media object - convert buffer to stream
      const { Readable } = require('stream');
      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null);
      
      const media = {
        mimeType: mimeType,
        body: stream
      };

      // Upload file
      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink,webContentLink'
      });

      console.log(`✅ Image uploaded to Google Drive: ${response.data.name}`);
      
      return {
        success: true,
        filename: uniqueFilename,
        fileId: response.data.id,
        filePath: response.data.webViewLink,
        downloadUrl: response.data.webContentLink,
        storageType: 'google_drive'
      };
    } catch (error) {
      console.error('❌ Error uploading to Google Drive:', error);
      throw new Error(`Failed to upload image to Google Drive: ${error.message}`);
    }
  }

  async deleteImage(fileId) {
    if (!this.drive) {
      throw new Error('Google Drive not configured');
    }

    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      
      console.log(`✅ Image deleted from Google Drive: ${fileId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting from Google Drive:', error);
      throw new Error(`Failed to delete image from Google Drive: ${error.message}`);
    }
  }

  async getImageUrl(fileId) {
    if (!this.drive) {
      throw new Error('Google Drive not configured');
    }

    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink,webContentLink'
      });

      return {
        viewUrl: response.data.webViewLink,
        downloadUrl: response.data.webContentLink
      };
    } catch (error) {
      console.error('❌ Error getting image URL:', error);
      throw error;
    }
  }

  async createFolder(folderName) {
    if (!this.drive) {
      throw new Error('Google Drive not configured');
    }

    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.folderId]
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id,name'
      });

      console.log(`✅ Folder created: ${response.data.name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating folder:', error);
      throw error;
    }
  }

  async listFiles() {
    if (!this.drive) {
      throw new Error('Google Drive not configured');
    }

    try {
      const response = await this.drive.files.list({
        q: `'${this.folderId}' in parents`,
        fields: 'files(id,name,size,mimeType,createdTime,webViewLink)'
      });

      return response.data.files;
    } catch (error) {
      console.error('❌ Error listing files:', error);
      throw error;
    }
  }

  async getStorageStats() {
    if (!this.drive) {
      return { error: 'Google Drive not configured' };
    }

    try {
      const files = await this.listFiles();
      
      const totalSize = files.reduce((sum, file) => {
        return sum + (parseInt(file.size) || 0);
      }, 0);

      return {
        storageType: 'google_drive',
        totalFiles: files.length,
        totalSize: totalSize,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        folderId: this.folderId
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return { error: error.message };
    }
  }

  // Test connection
  async testConnection() {
    if (!this.drive) {
      return false;
    }

    try {
      await this.drive.files.get({
        fileId: this.folderId,
        fields: 'id,name'
      });
      console.log('✅ Google Drive connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Google Drive connection test failed:', error.message);
      return false;
    }
  }
}

module.exports = new GoogleDriveService();
