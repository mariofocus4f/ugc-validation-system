import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { validateImages } from '../services/api';

function ImageUploader({ onValidationStart, onValidationComplete, onValidationError, isLoading, fixMode = false, rejectedImages = [], acceptedImages = [] }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [filePreviews, setFilePreviews] = useState({});
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [textReview, setTextReview] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [orderEmail, setOrderEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  
  // New review fields
  const [customerName, setCustomerName] = useState('');
  const [starRating, setStarRating] = useState(0);

  // Create preview URLs for images
  const createPreview = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => 
        `${file.file.name}: ${file.errors.map(e => e.message).join(', ')}`
      );
      onValidationError(errors.join('; '));
      return;
    }

    // In fix mode, limit to number of rejected images
    // In normal mode, limit to 6 files
    const maxFiles = fixMode ? rejectedImages.length : 6;
    const filesToAdd = acceptedFiles.slice(0, maxFiles - selectedFiles.length);
    
    // Create previews for new files
    const newPreviews = {};
    for (const file of filesToAdd) {
      const preview = await createPreview(file);
      newPreviews[file.name] = preview;
    }
    
    setFilePreviews(prev => ({ ...prev, ...newPreviews }));
    setSelectedFiles(prev => [...prev, ...filesToAdd]);
  }, [selectedFiles.length, onValidationError, createPreview, fixMode, rejectedImages.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
        maxFiles: fixMode ? rejectedImages.length : 3,
    disabled: isLoading
  });

  const removeFile = (index) => {
    const fileToRemove = selectedFiles[index];
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[fileToRemove.name];
      return newPreviews;
    });
  };

  const handleSubmit = async () => {
    if (!orderEmail.trim()) {
      onValidationError('Wprowadź adres email zamówienia');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderEmail.trim())) {
      onValidationError('Wprowadź prawidłowy adres email');
      return;
    }
    
    if (!orderNumber.trim()) {
      onValidationError('Wprowadź numer zamówienia');
      return;
    }
    
    const requiredFiles = fixMode ? rejectedImages.length : 3;
    const maxFiles = fixMode ? rejectedImages.length : 6;
    
    if (selectedFiles.length < requiredFiles) {
      onValidationError(`Dodaj przynajmniej ${requiredFiles} ${requiredFiles === 1 ? 'zdjęcie' : 'zdjęcia'} produktu`);
      return;
    }
    
    if (selectedFiles.length > maxFiles) {
      onValidationError(`Możesz dodać maksymalnie ${maxFiles} ${maxFiles === 1 ? 'zdjęcie' : 'zdjęć'} produktu`);
      return;
    }
    
    // Check if text review has minimum content
    if (textReview.trim().length < 20) {
      onValidationError('Dodaj opinię tekstową o produkcie (minimum 20 znaków)');
      return;
    }
    
    if (!customerName.trim()) {
      onValidationError('Wprowadź swoje imię');
      return;
    }
    
    if (starRating === 0) {
      onValidationError('Wybierz ocenę w skali 1-5 gwiazdek');
      return;
    }
    
    if (!acceptTerms) {
      onValidationError('Musisz zaakceptować regulamin, aby dodać opinię');
      return;
    }

    onValidationStart();
    setCurrentStep('Przygotowywanie zdjęć...');
    setProgress(10);

    try {
      
      // Symulacja postępu - szybsza animacja z wartościami procentowymi
      const progressSteps = [
        { step: 'Przygotowywanie zdjęć... (20%)', progress: 20, delay: 300 },
        { step: 'Wysyłanie do analizy... (40%)', progress: 40, delay: 400 },
        { step: 'Analizowanie jakości... (60%)', progress: 60, delay: 600 },
        { step: 'Sprawdzanie bezpieczeństwa... (80%)', progress: 80, delay: 400 },
        { step: 'Finalizowanie wyników... (80%)', progress: 80, delay: 200 }
      ];

      // Uruchom postęp z szybszymi opóźnieniami
      let currentStepIndex = 0;
      let finalizingProgress = 80;
      const progressInterval = setInterval(() => {
        if (currentStepIndex < progressSteps.length) {
          const step = progressSteps[currentStepIndex];
          setCurrentStep(step.step);
          setProgress(step.progress);
          currentStepIndex++;

          // Jeśli to etap "Finalizowanie wyników...", zacznij animację rosnącego procentu
          if (step.step.includes('Finalizowanie wyników')) {
            const finalizingInterval = setInterval(() => {
              finalizingProgress += 3;
              if (finalizingProgress <= 95) {
                setProgress(finalizingProgress);
                setCurrentStep(`Finalizowanie wyników... (${finalizingProgress}%)`);
              } else {
                clearInterval(finalizingInterval);
              }
            }, 150); // Co 150ms zwiększaj o 3%
          }
        }
      }, 300); // Szybsze przełączanie co 300ms
      
      const fixModeData = fixMode ? { rejectedImages, acceptedImages } : null;
      const results = await validateImages(selectedFiles, textReview, orderEmail, orderNumber, fixModeData, customerName, starRating);
      
      clearInterval(progressInterval);
      setCurrentStep('Zakończono!');
      setProgress(100);
      
      setTimeout(() => {
        onValidationComplete(results);
        setCurrentStep('');
        setProgress(0);
      }, 500);
      
    } catch (error) {
      setCurrentStep('');
      setProgress(0);
      onValidationError(error.message || 'Wystąpił błąd podczas walidacji');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [filePreviews]);

  return (
    <div className="card">
      {/* Order Info */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-900">Dodajesz opinie do zamówienia</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="orderEmail" className="block text-sm font-medium text-primary-800 mb-2">
              Adres email zamówienia <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="orderEmail"
              value={orderEmail}
              onChange={(e) => setOrderEmail(e.target.value)}
              placeholder="np. klient@example.com"
              className="w-full p-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-xs text-primary-600 mt-1">
              Email używany przy składaniu zamówienia - służy do weryfikacji
            </p>
          </div>
          
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-primary-800 mb-2">
              Numer zamówienia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="np. #ORD-2024-7891"
              className="w-full p-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-xs text-primary-600 mt-1">
              Numer zamówienia - służy do weryfikacji i pobrania nazwy produktu
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {fixMode ? 'Popraw błędne zdjęcia' : 'Dodaj zdjęcia i opinię'}
        </h2>
        <p className="text-gray-600">
          {fixMode 
            ? `Zastąp ${rejectedImages.length} odrzucone zdjęcia nowymi. Masz już ${acceptedImages.length} zaakceptowanych zdjęć.`
            : 'Dodaj 2 zdjęcia produktu + opinię tekstową.'
          }
        </p>
        {fixMode && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Odrzucone zdjęcia do poprawy:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {rejectedImages.map((img, index) => (
                <li key={index}>• {img.filename} - {img.feedback}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
          ${isDragActive || dragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Upuść zdjęcia tutaj' : 'Przeciągnij zdjęcia lub kliknij, aby wybrać'}
          </h3>
          <p className="text-gray-500 mb-4">
            {fixMode 
              ? `Maksymalnie ${rejectedImages.length} plik${rejectedImages.length === 1 ? '' : 'i'}, do 5MB każdy`
              : <>
                  Dodaj dokładnie 3 zdjęcia, do 5 MB każde. (jpg, png). Pamiętaj aby na zdjęciu nie pokazywać ludzi, tylko zakupione produkty.{' '}
                  <a href="#photo-instructions" className="text-primary-600 hover:text-primary-700 underline text-sm">
                    Sprawdź jak zrobić dobre zdjęcia
                  </a>
                </>
            }
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 bg-gray-100 rounded">JPG</span>
            <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
            <span className="px-2 py-1 bg-gray-100 rounded">WebP</span>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Wybrane zdjęcia ({selectedFiles.length}/{fixMode ? rejectedImages.length : 3})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {filePreviews[file.name] ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={filePreviews[file.name]} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isLoading}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Requirements - Compact Version */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Wymagania dotyczące zdjęć:
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Minimalna szerokość: 400px</li>
                <li>• Maksymalny rozmiar: 5MB na plik</li>
                <li>• Dozwolone formaty: JPG, PNG, WebP</li>
                <li>• Zdjęcia nie mogą zawierać osób, dzieci</li>
                <li>• Produkt powinien być dobrze widoczny i ostry</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Twoja opinia o produkcie <span className="text-red-500 text-sm">*</span>
        </h3>
        
        <div className="space-y-6">
          {/* Customer Name */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
              Twoje Imię <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="np. Anna Kowalska"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              To imię będzie wyświetlane przy Twojej opinii na stronie
            </p>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ocena produktu <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStarRating(star)}
                  disabled={isLoading}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors duration-200
                    ${star <= starRating 
                      ? 'text-yellow-400 bg-yellow-50' 
                      : 'text-gray-300 hover:text-yellow-300 hover:bg-yellow-50'
                    }
                    ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  ★
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {starRating > 0 ? `${starRating} z 5 gwiazdek` : 'Wybierz ocenę'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ocena w skali od 1 do 5 gwiazdek
            </p>
          </div>

          {/* Text Review */}
          <div>
            <label htmlFor="textReview" className="block text-sm font-medium text-gray-700 mb-2">
              Twoja opinia tekstowa <span className="text-red-500">*</span>
            </label>
            <textarea
              id="textReview"
              value={textReview}
              onChange={(e) => setTextReview(e.target.value)}
              placeholder="Opisz swoje doświadczenia z produktem - jakość, funkcjonalność, czy poleciłbyś go innym..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={4}
              disabled={isLoading}
            />
            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {textReview.length}/500 znaków 
                {textReview.length < 20 && <span className="text-red-500"> - minimum 20 znaków</span>}
              </div>
              <div className="text-xs text-gray-400">
                {textReview.length >= 20 ? '✓ Wystarczająco długie' : 'Za krótkie'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Review Guide */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <h4 className="font-semibold mb-3 flex items-center">
            <span className="mr-2">💡</span> Wskazówki do opinii:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Co opisać:</h5>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Pierwsze wrażenia po rozpakowaniu</li>
                <li>Jakość materiałów i wykonania</li>
                <li>Funkcjonalność w praktyce</li>
                <li>Stosunek ceny do jakości</li>
                <li>Rekomendacja dla innych</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">Przykład:</h5>
              <p className="text-xs italic">
                "Produkt wyglądał świetnie po rozpakowaniu. Materiał jest solidny, montaż prosty. 
                Sprawdza się idealnie w codziennym użytkowaniu. Za tę cenę to świetny wybór - polecam!"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mt-6">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            disabled={isLoading}
            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700">
            <span className="text-red-500">*</span> Akceptuję{' '}
            <a href="https://focusgarden.pl/regulamin" className="text-primary-600 hover:text-primary-700 underline" target="_blank" rel="noopener noreferrer">
              regulamin
            </a>{' '}
            i{' '}
            <a href="https://focusgarden.pl/polityka-prywatnosci" className="text-primary-600 hover:text-primary-700 underline" target="_blank" rel="noopener noreferrer">
              politykę prywatności
            </a>
            . Zgadzam się na przetwarzanie moich danych osobowych w celu publikacji opinii i otrzymania kodu rabatowego.
          </label>
        </div>
      </div>


      {/* Progress Bar */}
      {isLoading && (
        <div className="mt-6">
          <div className="bg-gray-100 rounded-full h-3 mb-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
            <span>{currentStep}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!orderEmail.trim() || !orderNumber.trim() || selectedFiles.length === 0 || isLoading || !acceptTerms || !customerName.trim() || starRating === 0 || textReview.trim().length < 20}
          className={`
            px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2
            ${!orderEmail.trim() || !orderNumber.trim() || selectedFiles.length === 0 || isLoading || !acceptTerms || !customerName.trim() || starRating === 0 || textReview.trim().length < 20
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
            }
          `}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{fixMode ? 'Poprawiam zdjęcia...' : 'Analizuję zdjęcia...'}</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>{fixMode ? 'Popraw zdjęcia' : 'Dodaj swoją opinię'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ImageUploader;

