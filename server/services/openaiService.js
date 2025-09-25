const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validates an image using OpenAI Vision API
 * @param {string} base64Image - Base64 encoded image
 * @param {string} mimeType - MIME type of the image
 * @returns {Promise<Object>} Validation result
 */
async function validateImage(base64Image, mimeType) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key nie jest skonfigurowany');
    }

    const prompt = `Przeanalizuj to zdjęcie produktu i zwróć JSON w dokładnie tym formacie:
{
  "people": true/false,
  "score": 0-100,
  "decision": "accept"|"reject",
  "feedback": "krótki opis po polsku"
}

Kryteria walidacji:
1. people: true jeśli zdjęcie zawiera osoby (w tym dzieci), false w przeciwnym razie
2. score: ocena jakości 0-100 (ostrość, ekspozycja, widoczność produktu, kompozycja)
3. decision: "reject" jeśli people=true LUB score<70 LUB zawiera treści niepożądane, "accept" w przeciwnym razie
4. feedback: krótki komunikat po polsku z konkretną wskazówką, dostosowany do typu produktu

Przykłady feedback dla różnych produktów:
- Dla mebli: "Twoja kanapa jest dobrze widoczna, ma dobrą rozdzielczość i jasne oświetlenie"
- Dla szklarni: "Twoja szklarnia jest wyraźnie widoczna, ma dobrą jakość i odpowiednie oświetlenie"
- Dla ogrodu: "Twój ogród jest dobrze pokazany, ma dobrą rozdzielczość i naturalne światło"
- Dla narzędzi: "Twoje narzędzia są wyraźnie widoczne, mają dobrą jakość i odpowiednie oświetlenie"
- Dla roślin: "Twoje rośliny są dobrze widoczne, mają dobrą rozdzielczość i naturalne światło"

Dla odrzuconych zdjęć:
- "Zdjęcie jest zbyt ciemne, spróbuj w naturalnym świetle"
- "Produkt jest nieostry, ustaw ostrość na produkt"
- "Zdjęcie zawiera osoby - usuń je z kadru"
- "Zdjęcie jest zbyt małe, zrób je w wyższej rozdzielczości"

Zwróć TYLKO JSON, bez dodatkowych komentarzy.`;

    console.log(`Sending request to OpenAI API for image analysis...`);
    console.log(`Image size: ${base64Image.length} characters`);
    console.log(`MIME type: ${mimeType}`);
    
    // Check if image is too large (OpenAI has limits)
    if (base64Image.length > 20000000) { // ~20MB limit
      throw new Error('Zdjęcie jest zbyt duże dla analizy. Zmniejsz rozmiar pliku.');
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "low" // Changed from "high" to "low" to reduce size
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.1
    });
    
    console.log(`OpenAI API response received:`, response.choices[0].message.content);

    const content = response.choices[0].message.content.trim();
    
    // Clean content - remove markdown formatting if present
    let cleanContent = content;
    if (content.startsWith('```json')) {
      cleanContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      cleanContent = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    console.log('Cleaned content:', cleanContent);
    
    // Parse JSON response
    let result;
    try {
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Błąd parsowania odpowiedzi OpenAI:', cleanContent);
      throw new Error('Nieprawidłowa odpowiedź z OpenAI API');
    }

    // Validate response structure
    if (!result.hasOwnProperty('people') || 
        !result.hasOwnProperty('score') || 
        !result.hasOwnProperty('decision') || 
        !result.hasOwnProperty('feedback')) {
      throw new Error('Nieprawidłowa struktura odpowiedzi z OpenAI');
    }

    // Ensure score is within range
    result.score = Math.max(0, Math.min(100, parseInt(result.score) || 0));
    
    // Ensure decision is valid
    if (!['accept', 'reject'].includes(result.decision)) {
      result.decision = result.score >= 70 && !result.people ? 'accept' : 'reject';
    }

    // Ensure people is boolean
    result.people = Boolean(result.people);

    // Override decision if people detected
    if (result.people) {
      result.decision = 'reject';
      result.feedback = 'Zdjęcie zawiera osoby - usuń je z kadru';
    }

    return result;

  } catch (error) {
    console.error('Błąd OpenAI API:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    
    // More specific error messages
    let errorMessage = 'Błąd analizy zdjęcia. Spróbuj ponownie.';
    
    if (error.status === 401) {
      errorMessage = 'Błąd autoryzacji OpenAI API. Sprawdź klucz API.';
    } else if (error.status === 429) {
      errorMessage = 'Przekroczono limit OpenAI API. Spróbuj za chwilę.';
    } else if (error.status === 400) {
      errorMessage = 'Nieprawidłowe dane do OpenAI API.';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Przekroczono limit czasu. Spróbuj ponownie.';
    }
    
    // Fallback response in case of API error
    return {
      people: false,
      score: 0,
      decision: 'reject',
      feedback: errorMessage
    };
  }
}

/**
 * Test OpenAI API connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return false;
    }

    const response = await openai.models.list();
    return response.data && response.data.length > 0;
  } catch (error) {
    console.error('Błąd połączenia z OpenAI:', error);
    return false;
  }
}

module.exports = {
  validateImage,
  testConnection
};

