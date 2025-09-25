# 🧪 UGC Validation System - Testing Guide

## Automated Testing

### Backend API Tests
```bash
cd server
node test-api.js
```

### Frontend Tests
```bash
cd client
npm test
```

---

## Manual Testing Scenarios

### 1. Basic Functionality

#### ✅ Valid Image Upload
- **Test**: Upload 1-5 valid images (JPG/PNG/WebP)
- **Expected**: Success response with validation results
- **Files**: Use images >1200px width, <10MB

#### ✅ File Size Validation
- **Test**: Upload file >10MB
- **Expected**: Error "Plik jest zbyt duży"
- **Files**: Create large test image

#### ✅ File Format Validation
- **Test**: Upload non-image file (e.g., .txt, .pdf)
- **Expected**: Error "Nieprawidłowy format pliku"
- **Files**: Any non-image file

#### ✅ Dimension Validation
- **Test**: Upload image <1200px width
- **Expected**: Rejection with dimension feedback
- **Files**: Small test image

### 2. Quality Validation

#### ✅ High Quality Image
- **Test**: Upload sharp, well-lit product photo
- **Expected**: Score 80+, decision "accept"
- **Files**: Professional product photos

#### ✅ Low Quality Image
- **Test**: Upload blurry, dark, or poorly composed image
- **Expected**: Score <70, decision "reject"
- **Files**: Blurry or dark images

#### ✅ People Detection
- **Test**: Upload image containing people
- **Expected**: people: true, decision "reject"
- **Files**: Photos with people in them

### 3. Edge Cases

#### ✅ Empty Upload
- **Test**: Submit form without files
- **Expected**: Error "Wybierz przynajmniej jedno zdjęcie"

#### ✅ Too Many Files
- **Test**: Upload 6+ files
- **Expected**: Error "Zbyt wiele plików"

#### ✅ Mixed Results
- **Test**: Upload mix of good and bad images
- **Expected**: Individual results for each file

### 4. Rate Limiting

#### ✅ Normal Usage
- **Test**: Make 5 requests within hour
- **Expected**: All requests succeed

#### ✅ Rate Limit Exceeded
- **Test**: Make 11+ requests within hour
- **Expected**: HTTP 429 after 10th request

### 5. Error Handling

#### ✅ Network Error
- **Test**: Disconnect internet during upload
- **Expected**: User-friendly error message

#### ✅ Server Error
- **Test**: Stop backend server
- **Expected**: "Brak połączenia z serwerem"

#### ✅ OpenAI API Error
- **Test**: Use invalid API key
- **Expected**: Fallback response with error message

---

## Test Data

### Sample Images Needed

#### Valid Product Images
- Sharp, well-lit product photos
- Various angles and compositions
- Different product types
- High resolution (>1200px width)

#### Invalid Images
- Blurry photos
- Dark/underexposed images
- Images with people
- Small images (<1200px)
- Large files (>10MB)
- Non-image files

### Creating Test Images

#### Using ImageMagick
```bash
# Create valid test image
convert -size 1200x800 xc:lightblue test-valid.jpg

# Create small image
convert -size 800x600 xc:lightblue test-small.jpg

# Create large file
convert -size 2000x2000 xc:lightblue -quality 100 test-large.jpg
```

#### Using Sharp (Node.js)
```javascript
const sharp = require('sharp');

// Valid image
await sharp({
  create: { width: 1200, height: 800, channels: 3, background: 'lightblue' }
}).jpeg().toFile('test-valid.jpg');

// Small image
await sharp({
  create: { width: 800, height: 600, channels: 3, background: 'lightblue' }
}).jpeg().toFile('test-small.jpg');
```

---

## Performance Testing

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### Load Test Configuration (load-test.yml)
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Image validation"
    weight: 100
    flow:
      - post:
          url: "/api/ugc/validate"
          formData:
            images: "@test-image.jpg"
```

### Memory Testing
```bash
# Monitor memory usage
node --inspect server/index.js

# Use Chrome DevTools to profile memory
```

---

## Integration Testing

### End-to-End Test Flow
1. **Start System**: `npm run dev`
2. **Open Frontend**: http://localhost:3000
3. **Upload Images**: Use drag & drop or file picker
4. **Submit Validation**: Click "Wyślij do walidacji"
5. **Verify Results**: Check individual and summary results
6. **Test Reset**: Click "Nowa walidacja"

### API Integration Test
```bash
# Test complete flow
curl -X POST \
  -F "images=@test-valid.jpg" \
  -F "images=@test-invalid.jpg" \
  http://localhost:3001/api/ugc/validate
```

---

## Browser Testing

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Test Scenarios
- **Drag & Drop**: Test file dropping
- **File Picker**: Test file selection
- **Mobile**: Test on mobile devices
- **Responsive**: Test different screen sizes

---

## Security Testing

### File Upload Security
- **Malicious Files**: Test with executable files
- **Large Files**: Test with very large files
- **Invalid Headers**: Test with corrupted files

### Rate Limiting
- **Burst Requests**: Test rapid-fire requests
- **IP Spoofing**: Test with different IPs
- **Bypass Attempts**: Test rate limit bypass

---

## Monitoring Tests

### Log Verification
```bash
# Check server logs
docker-compose logs api

# Check validation logs
grep "VALIDATION_LOG" server/logs/app.log
```

### Health Checks
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test status endpoint
curl http://localhost:3001/api/ugc/status
```

---

## Test Automation

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm run install:all
      - run: npm test
      - run: cd server && node test-api.js
```

### Pre-commit Hooks
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

---

## Debugging

### Common Issues

#### OpenAI API Errors
```bash
# Check API key
echo $OPENAI_API_KEY

# Test API connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

#### File Upload Issues
```bash
# Check file permissions
ls -la test-images/

# Check disk space
df -h
```

#### Rate Limiting Issues
```bash
# Check rate limit headers
curl -I http://localhost:3001/api/health

# Reset rate limits (restart server)
docker-compose restart api
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable verbose API logging
NODE_ENV=development npm run dev
```
