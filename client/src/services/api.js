import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 60000, // 60 seconds timeout for image processing
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Zbyt wiele prób. Spróbuj ponownie za godzinę.');
    }
    
    if (error.response?.status === 413) {
      throw new Error('Pliki są zbyt duże. Maksymalny rozmiar: 10MB na plik.');
    }
    
    if (error.response?.status === 400) {
      const message = error.response.data?.message || error.response.data?.error;
      throw new Error(message || 'Nieprawidłowe dane wejściowe.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Błąd serwera. Spróbuj ponownie za chwilę.');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Przekroczono limit czasu. Spróbuj ponownie.');
    }
    
    if (!error.response) {
      throw new Error('Brak połączenia z serwerem. Sprawdź połączenie internetowe.');
    }
    
    throw new Error(error.response.data?.message || 'Wystąpił nieoczekiwany błąd.');
  }
);

/**
 * Validates images using the UGC validation API
 * @param {File[]} files - Array of image files to validate
 * @param {string} textReview - Text review of the product
 * @param {string} orderEmail - Order email address
 * @param {string} orderNumber - Order number
 * @param {Object} fixModeData - Data for fix mode (rejectedImages, acceptedImages)
 * @returns {Promise<Object>} Validation results
 */
export const validateImages = async (files, textReview, orderEmail, orderNumber, fixModeData = null) => {
  try {
    const formData = new FormData();
    
    // Add files to form data
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    
    // Add text review
    formData.append('textReview', textReview);
    
    // Add order data
    formData.append('orderEmail', orderEmail);
    formData.append('orderNumber', orderNumber);
    
    // Add fix mode data if provided
    if (fixModeData) {
      formData.append('fixMode', 'true');
      formData.append('rejectedImages', JSON.stringify(fixModeData.rejectedImages));
      formData.append('acceptedImages', JSON.stringify(fixModeData.acceptedImages));
    }

    const response = await api.post('/ugc/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Gets the status of the validation system
 * @returns {Promise<Object>} System status
 */
export const getSystemStatus = async () => {
  try {
    const response = await api.get('/ugc/status');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;

