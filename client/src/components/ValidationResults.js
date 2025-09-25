import React from 'react';
import { CheckCircle, XCircle, RotateCcw, Users, Image as ImageIcon, Gift, Mail, Copy, RefreshCw } from 'lucide-react';

function ValidationResults({ results, onReset, onAddOpinion, onFixRejected }) {
  const { results: validationResults, summary, discountCode, emailSent, reviewId, orderInfo } = results;
  
  // Check if opinion can be added (2+ accepted images + text review)
  const canAddOpinion = summary.accepted >= 2 && orderInfo?.textReview && orderInfo.textReview.trim().length >= 20;
  
  // Check if opinion was already added to system
  const opinionAlreadyAdded = reviewId !== null && reviewId !== undefined;
  
  // Check if there are rejected images that can be fixed
  const hasRejectedImages = summary.rejected > 0;
  const rejectedResults = validationResults.filter(result => result.decision === 'reject');

  const getStatusIcon = (decision) => {
    return decision === 'accept' ? (
      <CheckCircle className="w-6 h-6 text-success-600" />
    ) : (
      <XCircle className="w-6 h-6 text-error-600" />
    );
  };

  const getStatusClass = (decision) => {
    return decision === 'accept' ? 'status-accepted' : 'status-rejected';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-error-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-success-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-error-100';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Kod skopiowany do schowka');
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Wyniki walidacji
          </h2>
          <button
            onClick={onReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Nowa walidacja</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-4 h-4 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-600">Łącznie zdjęć</div>
          </div>

          <div className="bg-success-50 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-success-600" />
            </div>
            <div className="text-2xl font-bold text-success-600">{summary.accepted}</div>
            <div className="text-sm text-gray-600">Zaakceptowane</div>
          </div>

          <div className="bg-error-50 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-4 h-4 text-error-600" />
            </div>
            <div className="text-2xl font-bold text-error-600">{summary.rejected}</div>
            <div className="text-sm text-gray-600">Odrzucone</div>
          </div>
        </div>

        {/* Overall Status */}
        <div className={`
          p-4 rounded-lg border-2 text-center
          ${summary.accepted === summary.total 
            ? 'status-accepted' 
            : summary.accepted > 0 
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'status-rejected'
          }
        `}>
          <div className="flex items-center justify-center space-x-2 mb-2">
            {summary.accepted === summary.total ? (
              <CheckCircle className="w-6 h-6" />
            ) : summary.accepted > 0 ? (
              <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            <h3 className="text-lg font-semibold">
              {summary.accepted === summary.total 
                ? 'Wszystkie zdjęcia zostały zaakceptowane!' 
                : summary.accepted > 0 
                  ? 'Część zdjęć wymaga poprawy'
                  : 'Wszystkie zdjęcia zostały odrzucone'
              }
            </h3>
          </div>
          <p className="text-sm">
            {summary.accepted === summary.total 
              ? 'Twoje zdjęcia spełniają wszystkie wymagania jakości i bezpieczeństwa.'
              : summary.accepted > 0 
                ? 'Sprawdź szczegóły poniżej, aby zobaczyć które zdjęcia wymagają poprawy.'
                : 'Sprawdź szczegóły poniżej, aby zobaczyć co należy poprawić w zdjęciach.'
            }
          </p>
          
          {/* Missing requirements info */}
          {summary.accepted >= 2 && !canAddOpinion && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Brakuje opisu produktu.</strong> Dodaj opinię tekstową (minimum 20 znaków), aby móc dodać opinię.
              </p>
            </div>
          )}
          
          {summary.accepted < 2 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Wymagane minimum 2 zaakceptowane zdjęcia</strong> do dodania opinii. Aktualnie: {summary.accepted}/2.
              </p>
            </div>
          )}
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
              
              {/* Download Code Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    const file = new Blob([`Kod rabatowy: ${discountCode}\nWartość: 100 zł zniżki\nZamówienie: ${orderInfo?.orderNumber}\nProdukt: ${orderInfo?.productName}\nData: ${new Date().toLocaleDateString('pl-PL')}`], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = `kod-rabatowy-${discountCode}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Pobierz kod</span>
                </button>
              </div>
            </div>

            {/* Email Status */}
            <div className="flex items-center justify-center space-x-2 text-sm">
              {emailSent ? (
                <>
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Kod został wysłany na email</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700">Kod dostępny w panelu</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Individual Results */}
      <div className="space-y-4">
        {validationResults.map((result, index) => (
          <div key={index} className="card">
            <div className="flex items-start space-x-4">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(result.decision)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {result.filename}
                  </h3>
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${getStatusClass(result.decision)}
                  `}>
                    {result.decision === 'accept' ? 'Zaakceptowane' : 'Odrzucone'}
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Wynik jakości:</span>
                    <div className={`
                      px-2 py-1 rounded-full text-sm font-medium
                      ${getScoreBg(result.score)} ${getScoreColor(result.score)}
                    `}>
                      {result.score}/100
                    </div>
                  </div>
                  
                  {result.people && (
                    <div className="flex items-center space-x-1 text-error-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Wykryto osoby</span>
                    </div>
                  )}
                </div>

                {/* Feedback */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {result.decision === 'accept' ? 'Pozytywny feedback:' : 'Wskazówki do poprawy:'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    {result.feedback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {/* Show "Popraw błędne zdjęcia" if there are rejected images and opinion not added yet */}
        {hasRejectedImages && !opinionAlreadyAdded && (
          <button
            onClick={() => onFixRejected(rejectedResults)}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Popraw błędne zdjęcia ({summary.rejected})</span>
          </button>
        )}
        
        
        {/* Show "Dodaj opinię do systemu" only if opinion can be added and wasn't added yet */}
        {canAddOpinion && !opinionAlreadyAdded && (
          <button 
            onClick={onAddOpinion}
            className="btn-success"
          >
            Dodaj opinię do systemu
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

