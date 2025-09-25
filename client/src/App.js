import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ValidationResults from './components/ValidationResults';
import Header from './components/Header';
import Footer from './components/Footer';
import { Copy } from 'lucide-react';

function App() {
  const [validationResults, setValidationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fixMode, setFixMode] = useState(false);
  const [rejectedImages, setRejectedImages] = useState([]);
  const [acceptedImages, setAcceptedImages] = useState([]);
  
  // Demo discount code for rewards section
  const demoDiscountCode = 'UGC-1234-5678';
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Kod skopiowany do schowka');
    });
  };

  const handleValidationComplete = (results) => {
    setValidationResults(results);
    setIsLoading(false);
    setError(null);
  };

  const handleValidationStart = () => {
    setIsLoading(true);
    setError(null);
    setValidationResults(null);
  };

  const handleValidationError = (error) => {
    setError(error);
    setIsLoading(false);
    setValidationResults(null);
  };

  const handleReset = () => {
    setValidationResults(null);
    setError(null);
    setIsLoading(false);
    setFixMode(false);
    setRejectedImages([]);
    setAcceptedImages([]);
  };

  const handleFixRejected = (rejectedImgs) => {
    setFixMode(true);
    setRejectedImages(rejectedImgs);
    setAcceptedImages(validationResults.results.filter(result => result.decision === 'accept'));
    setValidationResults(null);
    setError(null);
    setIsLoading(false);
  };

  const handleAddOpinion = () => {
    // Trigger the same validation process again to save opinion to Airtable
    if (validationResults) {
      setIsLoading(true);
      setError(null);
      
      // Simulate the same process but this time it will save to Airtable
      setTimeout(() => {
        // The backend will handle saving to Airtable
        setValidationResults({
          ...validationResults,
          reviewId: 'temp-review-id', // This will be replaced by real ID from backend
          discountCode: validationResults.discountCode || 'UGC-TEMP-CODE'
        });
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dodaj zdjęcie i odbierz kupon 100zł na zakupy !
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Zweryfikuj zamówienie, wgraj 3–5 zdjęć produktu oraz opinie. Po akceptacji dostaniesz kupon 100 zł.
            </p>
          </div>

          {/* Upload Section */}
          {!validationResults && (
            <div className="mb-8">
              <ImageUploader
                onValidationStart={handleValidationStart}
                onValidationComplete={handleValidationComplete}
                onValidationError={handleValidationError}
                isLoading={isLoading}
                fixMode={fixMode}
                rejectedImages={rejectedImages}
                acceptedImages={acceptedImages}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8">
              <div className="card border-error-200 bg-error-50">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-error-800">
                      Wystąpił błąd
                    </h3>
                    <div className="mt-2 text-sm text-error-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleReset}
                    className="btn-secondary"
                  >
                    Spróbuj ponownie
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {validationResults && (
            <div className="mb-8">
              <ValidationResults 
                results={validationResults} 
                onReset={handleReset}
                onAddOpinion={handleAddOpinion}
                onFixRejected={handleFixRejected}
              />
            </div>
          )}


          {/* Rewards Section */}
          <div className="mt-8">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Twoje nagrody
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Źródło</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Wartość</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kod rabatowy</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kod ważny do</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">Opinia zaakceptowana</td>
                      <td className="py-3 px-4 text-gray-900 font-semibold">100 zł</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <code className="bg-green-50 text-green-700 px-2 py-1 rounded text-sm font-mono">
                            {demoDiscountCode}
                          </code>
                          <button
                            onClick={() => copyToClipboard(demoDiscountCode)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Skopiuj kod"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktywny
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">2025-12-31</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;

