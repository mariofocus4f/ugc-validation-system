/**
 * Test script for UGC Validation API
 * Run with: node test-api.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';

// Test configuration
const TEST_CONFIG = {
  // Create a test image if none exists
  createTestImage: true,
  testImagePath: './test-image.jpg',
  testImageSize: { width: 1200, height: 800 }
};

/**
 * Creates a simple test image using sharp
 */
async function createTestImage() {
  try {
    const sharp = require('sharp');
    
    // Create a simple test image
    const testImage = await sharp({
      create: {
        width: TEST_CONFIG.testImageSize.width,
        height: TEST_CONFIG.testImageSize.height,
        channels: 3,
        background: { r: 100, g: 150, b: 200 }
      }
    })
    .jpeg()
    .toFile(TEST_CONFIG.testImagePath);
    
    console.log('✅ Test image created:', TEST_CONFIG.testImagePath);
    return true;
  } catch (error) {
    console.log('❌ Failed to create test image:', error.message);
    return false;
  }
}

/**
 * Test health endpoint
 */
async function testHealth() {
  try {
    console.log('\n🔍 Testing health endpoint...');
    const response = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

/**
 * Test system status endpoint
 */
async function testStatus() {
  try {
    console.log('\n🔍 Testing status endpoint...');
    const response = await axios.get(`${API_BASE}/ugc/status`);
    console.log('✅ Status check passed:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Status check failed:', error.message);
    return false;
  }
}

/**
 * Test image validation endpoint
 */
async function testValidation() {
  try {
    console.log('\n🔍 Testing validation endpoint...');
    
    // Check if test image exists
    if (!fs.existsSync(TEST_CONFIG.testImagePath)) {
      if (TEST_CONFIG.createTestImage) {
        const created = await createTestImage();
        if (!created) {
          console.log('❌ Cannot test validation without test image');
          return false;
        }
      } else {
        console.log('❌ Test image not found. Set createTestImage: true or provide test image');
        return false;
      }
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('images', fs.createReadStream(TEST_CONFIG.testImagePath));
    
    // Make request
    const response = await axios.post(`${API_BASE}/ugc/validate`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000 // 60 seconds
    });
    
    console.log('✅ Validation test passed:');
    console.log('   Results:', response.data.results?.length || 0, 'images processed');
    console.log('   Summary:', response.data.summary);
    
    return true;
  } catch (error) {
    console.log('❌ Validation test failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test rate limiting
 */
async function testRateLimit() {
  try {
    console.log('\n🔍 Testing rate limiting...');
    
    const promises = [];
    for (let i = 0; i < 12; i++) { // Try to exceed limit of 10
      promises.push(
        axios.get(`${API_BASE}/health`).catch(err => ({ error: err.response?.status }))
      );
    }
    
    const results = await Promise.all(promises);
    const errors = results.filter(r => r.error === 429);
    
    if (errors.length > 0) {
      console.log('✅ Rate limiting working:', errors.length, 'requests blocked');
      return true;
    } else {
      console.log('⚠️  Rate limiting may not be working (no 429 errors)');
      return false;
    }
  } catch (error) {
    console.log('❌ Rate limit test failed:', error.message);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🚀 Starting UGC Validation API Tests\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'System Status', fn: testStatus },
    { name: 'Image Validation', fn: testValidation },
    { name: 'Rate Limiting', fn: testRateLimit }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`❌ ${test.name} crashed:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! API is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
  
  // Cleanup
  if (fs.existsSync(TEST_CONFIG.testImagePath)) {
    fs.unlinkSync(TEST_CONFIG.testImagePath);
    console.log('🧹 Cleaned up test image');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testHealth,
  testStatus,
  testValidation,
  testRateLimit
};

