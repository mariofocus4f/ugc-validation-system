# 📡 UGC Validation API Reference

## Base URL
```
http://localhost:3001/api
```

## Authentication
API nie wymaga autentykacji, ale ma wbudowane rate limiting.

## Rate Limiting
- **Limit**: 10 requestów na godzinę na IP
- **Window**: 3600 sekund (1 godzina)
- **Response**: HTTP 429 gdy limit przekroczony

---

## Endpoints

### 🏥 Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

### 📊 System Status
```http
GET /ugc/status
```

**Response:**
```json
{
  "status": "operational",
  "version": "1.0.0",
  "features": {
    "maxFiles": 5,
    "maxFileSize": 10485760,
    "minImageWidth": 1200,
    "allowedTypes": ["image/jpeg", "image/png", "image/webp"]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 🔍 Image Validation
```http
POST /ugc/validate
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData {
  images: File[] // 1-5 plików JPG/PNG/WebP
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "filename": "product1.jpg",
      "people": false,
      "score": 85,
      "decision": "accept",
      "feedback": "Zdjęcie jasne i wyraźne. Produkt dobrze widoczny."
    }
  ],
  "summary": {
    "total": 1,
    "accepted": 1,
    "rejected": 0,
    "averageScore": 85
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - nieprawidłowe dane |
| 413 | Payload Too Large - plik zbyt duży |
| 429 | Too Many Requests - przekroczony limit |
| 500 | Internal Server Error |
| 503 | Service Unavailable - błąd OpenAI API |

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Nieprawidłowe dane wejściowe",
  "details": "Validation error message"
}
```

### 413 Payload Too Large
```json
{
  "error": "Plik jest zbyt duży",
  "message": "Maksymalny rozmiar: 10MB"
}
```

### 429 Too Many Requests
```json
{
  "error": "Zbyt wiele prób. Spróbuj ponownie za godzinę.",
  "retryAfter": 3600
}
```

### 500 Internal Server Error
```json
{
  "error": "Wystąpił błąd podczas walidacji zdjęć",
  "message": "Detailed error message"
}
```

---

## Validation Criteria

### File Requirements
- **Formats**: JPG, PNG, WebP
- **Max size**: 10MB per file
- **Max files**: 5 per request
- **Min width**: 1200px
- **Min height**: 800px

### Quality Scoring (0-100)
- **90-100**: Excellent quality
- **80-89**: Good quality
- **70-79**: Acceptable quality
- **0-69**: Poor quality (rejected)

### Decision Logic
```javascript
if (people === true) {
  decision = "reject"
} else if (score < 70) {
  decision = "reject"
} else if (inappropriateContent === true) {
  decision = "reject"
} else {
  decision = "accept"
}
```

---

## Example Usage

### cURL
```bash
curl -X POST \
  -F "images=@product1.jpg" \
  -F "images=@product2.jpg" \
  http://localhost:3001/api/ugc/validate
```

### JavaScript (Fetch)
```javascript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

const response = await fetch('/api/ugc/validate', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### Python (Requests)
```python
import requests

files = [
    ('images', open('product1.jpg', 'rb')),
    ('images', open('product2.jpg', 'rb'))
]

response = requests.post(
    'http://localhost:3001/api/ugc/validate',
    files=files
)

result = response.json()
print(result)
```

---

## Monitoring

### Logs
System loguje wszystkie requesty z następującymi danymi:
- Timestamp
- IP address
- User agent
- File details (name, size, dimensions)
- Validation results
- Processing time

### Metrics
- Request count per hour
- Success/failure rate
- Average processing time
- File size distribution
- Quality score distribution

---

## Rate Limiting Details

### Limits
- **Development**: 10 requests/hour
- **Production**: 100 requests/hour (configurable)

### Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

### Bypass
Rate limiting można wyłączyć ustawiając:
```env
RATE_LIMIT_MAX_REQUESTS=0
```
