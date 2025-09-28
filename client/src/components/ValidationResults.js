import React from 'react';
import { CheckCircle, XCircle, Image as ImageIcon, Gift, Copy, RefreshCw } from 'lucide-react';

function ValidationResults({ results, onReset, onAddOpinion, onFixRejected }) {
  const { results: validationResults, summary, discountCode, reviewId, orderInfo } = results;
  
  // Check if opinion can be added (2+ accepted images + text review)
  const canAddOpinion = summary?.accepted >= 2 && orderInfo?.textReview && orderInfo.textReview.trim().length >= 20;
  
  // Check if opinion was already added to system
  const opinionAlreadyAdded = reviewId !== null && reviewId !== undefined;
  
  // Check if there are rejected images that can be fixed
  const hasRejectedImages = summary?.rejected > 0;
  const rejectedResults = validationResults?.filter(result => result.decision === 'reject') || [];


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Kod skopiowany do schowka');
    });
  };

  return (
    <div className="space-y-4">
      {/* Congratulations Section - At the top */}
      {canAddOpinion && !opinionAlreadyAdded && (
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600 mb-3">
            Gratulacje, Twoje zdjęcia zostały wstępnie zaakceptowane!
          </p>
          <button 
            onClick={onAddOpinion}
            className="btn-success"
          >
            Dodaj swoją opinię do systemu
          </button>
        </div>
      )}

      {/* Summary Card */}
      <div className="card">

        {/* Summary Stats - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-1">
              <ImageIcon className="w-3 h-3 text-primary-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{summary?.total || 0}</div>
            <div className="text-xs text-gray-600">Łącznie zdjęć</div>
          </div>

          <div className="bg-success-50 rounded-lg p-2 text-center">
            <div className="w-6 h-6 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-1">
              <CheckCircle className="w-3 h-3 text-success-600" />
            </div>
            <div className="text-lg font-bold text-success-600">{summary?.accepted || 0}</div>
            <div className="text-xs text-gray-600">Zaakceptowane</div>
          </div>

          <div className="bg-error-50 rounded-lg p-2 text-center">
            <div className="w-6 h-6 bg-error-100 rounded-lg flex items-center justify-center mx-auto mb-1">
              <XCircle className="w-3 h-3 text-error-600" />
            </div>
            <div className="text-lg font-bold text-error-600">{summary?.rejected || 0}</div>
            <div className="text-xs text-gray-600">Odrzucone</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
              <CheckCircle className="w-3 h-3 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-blue-600">
              {opinionAlreadyAdded ? 'Tak' : 'Nie'}
            </div>
            <div className="text-xs text-gray-600">Opinia zaakceptowana</div>
          </div>
        </div>

      </div>

      {/* Discount Code Section - Show only if review was saved to Airtable */}
      {discountCode && reviewId && (
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              🎉 Gratulacje! Otrzymujesz kod rabatowy!
            </h3>
            <p className="text-green-700 mb-2">
              Twoja opinia została zaakceptowana i zapisana w systemie.
            </p>
            <p className="text-sm text-green-600 mb-6">
              ID opinii: {reviewId}
            </p>
            
            {/* Discount Code */}
            <div className="bg-white rounded-lg p-6 border-2 border-green-200 mb-4">
              <p className="text-sm text-gray-600 mb-2">Twój kod rabatowy:</p>
              <div className="flex items-center justify-center space-x-3">
                <code className="text-2xl font-mono font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  {discountCode}
                </code>
                <button
                  onClick={() => copyToClipboard(discountCode)}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Skopiuj kod"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Wartość: 100 zł zniżki na następne zamówienie
              </p>
              
            </div>
          </div>
        </div>
      )}


      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {/* Show "Popraw błędne zdjęcia" if there are rejected images and opinion not added yet */}
        {hasRejectedImages && !opinionAlreadyAdded && (
          <button
            onClick={() => onFixRejected(rejectedResults)}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Popraw błędne zdjęcia ({summary?.rejected || 0})</span>
          </button>
        )}
        
        
        
        {/* Show success message if opinion was already added */}
        {opinionAlreadyAdded && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Opinia została dodana do systemu!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ValidationResults;

