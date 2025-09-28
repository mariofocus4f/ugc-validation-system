import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ValidationResults from './components/ValidationResults';
import Header from './components/Header';
import Footer from './components/Footer';
import PhotoInstructions from './components/PhotoInstructions';

function App() {
  const [validationResults, setValidationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fixMode, setFixMode] = useState(false);
  const [rejectedImages, setRejectedImages] = useState([]);
  const [acceptedImages, setAcceptedImages] = useState([]);
  

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
      
      <main className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section - Only show before validation */}
          {!validationResults && (
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Dodaj zdjęcie i odbierz kupon 100zł na zakupy !
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Zweryfikuj zamówienie, wgraj 3–5 zdjęć produktu oraz napisz swoją opinię.
                <br />
                Po akceptacji zdjęć otrzymasz kupon o wartości 100 zł.
              </p>
            </div>
          )}

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
            <div className="mb-4">
              <ValidationResults 
                results={validationResults} 
                onReset={handleReset}
                onAddOpinion={handleAddOpinion}
                onFixRejected={handleFixRejected}
              />
            </div>
          )}



        </div>
      </main>

      {!validationResults && <PhotoInstructions />}
      <Footer />
    </div>
  );
}

export default App;

