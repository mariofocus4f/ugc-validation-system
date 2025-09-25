# Google Drive Setup Guide

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the **Google Drive API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in details:
   - Name: `ugc-validation-service`
   - Description: `Service account for UGC validation system`
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

## 3. Generate Service Account Key

1. Find your service account in the list
2. Click on it
3. Go to "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the JSON file

## 4. Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder called "UGC Validation Images"
3. Right-click the folder > "Share"
4. Add your service account email (from the JSON file)
5. Give it "Editor" permissions
6. Copy the folder ID from the URL

## 5. Get Folder ID

The folder URL looks like:
```
https://drive.google.com/drive/folders/1ABC123DEF456GHI789JKL
```

The folder ID is: `1ABC123DEF456GHI789JKL`

## 6. Environment Variables

Add to your `.env` file:

```env
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
GOOGLE_DRIVE_FOLDER_ID=1ABC123DEF456GHI789JKL
```

**Important:** The `GOOGLE_SERVICE_ACCOUNT_KEY` should be the entire JSON content as a single line string.

## 7. Test Connection

The system will automatically test the connection on startup. You should see:
```
✅ Google Drive service initialized
✅ Google Drive connection test successful
```

## 8. Folder Structure

Images will be organized as:
```
UGC Validation Images/
├── 2024-09-17/
│   ├── uuid1.jpg
│   ├── uuid2.png
│   └── uuid3.webp
└── 2024-09-18/
    └── ...
```

## 9. Permissions

Make sure your service account has:
- Access to the Google Drive API
- Editor permissions on the target folder
- The folder is shared with the service account email

## 10. Storage Limits

- **Free Google Drive:** 15GB total
- **Google Workspace:** 30GB+ depending on plan
- **Individual files:** Up to 5TB

## 11. Security Notes

- Keep your service account JSON file secure
- Don't commit it to version control
- Use environment variables in production
- Regularly rotate service account keys
