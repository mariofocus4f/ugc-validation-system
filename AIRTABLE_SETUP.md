# Airtable Setup Guide

## 1. Create Airtable Base

1. Go to [Airtable.com](https://airtable.com) and create a new base
2. Name it "UGC Validation System"

## 2. Create Tables

### Reviews Table
Create a table called "Reviews" with these fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| Order Number | Single line text | - |
| Product Name | Single line text | - |
| Text Review | Long text | - |
| Discount Code | Single line text | - |
| Email Sent | Checkbox | - |
| Status | Single select | Options: pending, accepted, rejected |
| Created At | Date | Include time: Yes |
| Updated At | Date | Include time: Yes |

### Images Table
Create a table called "Images" with these fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| Review ID | Link to another record | Link to Reviews table |
| Filename | Single line text | - |
| Original Filename | Single line text | - |
| File Path | URL | - |
| File Size | Number | Format: Integer |
| MIME Type | Single line text | - |
| Width | Number | Format: Integer |
| Height | Number | Format: Integer |
| Validation Result | Long text | - |
| Decision | Single select | Options: accept, reject |
| Quality Score | Number | Format: Integer |
| Feedback | Long text | - |
| Has People | Checkbox | - |
| Created At | Date | Include time: Yes |

### Validation Logs Table
Create a table called "Validation Logs" with these fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| Review ID | Link to another record | Link to Reviews table |
| Image ID | Link to another record | Link to Images table |
| Action | Single line text | - |
| Details | Long text | - |
| Created At | Date | Include time: Yes |

## 3. Get API Credentials

1. Go to [Airtable API Documentation](https://airtable.com/api)
2. Select your base
3. Copy the **Base ID** (starts with `app...`)
4. Go to [Airtable Account](https://airtable.com/account)
5. Generate a new **Personal Access Token**
6. Copy the token

## 4. Environment Variables

Add to your `.env` file:

```env
AIRTABLE_API_KEY=your-personal-access-token
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

## 5. Test Connection

The system will automatically test the connection on startup. You should see:
```
✅ Airtable service initialized
✅ Airtable connection test successful
```

## 6. Permissions

Make sure your Personal Access Token has:
- `data.records:read`
- `data.records:write`
- `schema.bases:read`

## 7. Base URL

Your base URL will be: `https://airtable.com/appXXXXXXXXXXXXXX`
