# UGC Validation System

System automatycznej walidacji zdjęć UGC (User Generated Content) z wykorzystaniem OpenAI Vision API. Pozwala na automatyczne sprawdzanie jakości i bezpieczeństwa zdjęć produktów.

## 🎯 Funkcje

- **Automatyczna walidacja jakości** - ocena ostrości, ekspozycji i widoczności produktu
- **Wykrywanie osób** - automatyczne odrzucanie zdjęć zawierających osoby
- **Analiza bezpieczeństwa** - wykrywanie treści niepożądanych
- **Natychmiastowy feedback** - konkretne wskazówki poprawy w języku polskim
- **Responsywny interfejs** - nowoczesny UI z drag & drop
- **Rate limiting** - zabezpieczenia przed nadużyciami
- **Monitoring** - logi i statystyki walidacji

## 🏗️ Architektura

```
├── client/          # Frontend React → Cloudflare Pages
├── server/          # Backend Node.js/Express → Railway
├── package.json     # Root package.json
└── README.md        # Dokumentacja
```

### Frontend (React) → ☁️ Cloudflare Pages
- Komponent uploadu z drag & drop
- Wyświetlanie wyników walidacji
- Responsywny design z Tailwind CSS
- Integracja z backend API
- **Gotowy do wdrożenia na Cloudflare Pages!**

### Backend (Node.js/Express) → 🚂 Railway
- Endpoint `/api/ugc/validate` - walidacja zdjęć
- Integracja z OpenAI Vision API
- Rate limiting i zabezpieczenia
- Walidacja plików i wymiarów
- Pozostaje na Railway

## 🚀 Instalacja i uruchomienie

### Wymagania
- Node.js 16+
- npm lub yarn
- Klucz API OpenAI

### 1. Klonowanie i instalacja

```bash
# Instalacja wszystkich zależności
npm run install:all
```

### 2. Konfiguracja

Skopiuj plik konfiguracyjny i uzupełnij dane:

```bash
cp server/env.example server/.env
```

Edytuj `server/.env`:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# File Upload Limits
MAX_FILE_SIZE=10485760
MAX_FILES=5
MIN_IMAGE_WIDTH=1200

# Allowed MIME types
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
```

### 3. Uruchomienie

```bash
# Uruchomienie w trybie deweloperskim (frontend + backend)
npm run dev

# Lub osobno:
npm run server:dev  # Backend na porcie 3001
npm run client:dev  # Frontend na porcie 3000
```

### 4. Produkcja

```bash
# Build frontendu
npm run build

# Uruchomienie serwera produkcyjnego
npm start
```

## 📡 API Endpoints

### POST `/api/ugc/validate`
Waliduje zdjęcia produktów.

**Request:**
```javascript
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

### GET `/api/ugc/status`
Zwraca status systemu walidacji.

### GET `/api/health`
Health check endpoint.

## 🔧 Konfiguracja

### Zmienne środowiskowe

| Zmienna | Opis | Domyślna wartość |
|---------|------|------------------|
| `OPENAI_API_KEY` | Klucz API OpenAI | - |
| `PORT` | Port serwera | 3001 |
| `NODE_ENV` | Środowisko | development |
| `RATE_LIMIT_WINDOW_MS` | Okno rate limitingu (ms) | 3600000 |
| `RATE_LIMIT_MAX_REQUESTS` | Maksymalna liczba requestów | 10 |
| `MAX_FILE_SIZE` | Maksymalny rozmiar pliku (bytes) | 10485760 |
| `MAX_FILES` | Maksymalna liczba plików | 5 |
| `MIN_IMAGE_WIDTH` | Minimalna szerokość obrazu (px) | 1200 |
| `ALLOWED_MIME_TYPES` | Dozwolone typy MIME | image/jpeg,image/png,image/webp |

### Kryteria walidacji

1. **Wymiary obrazu**: minimalna szerokość 1200px
2. **Rozmiar pliku**: maksymalnie 10MB
3. **Format**: JPG, PNG, WebP
4. **Liczba plików**: 1-5 na request
5. **Wykrywanie osób**: automatyczne odrzucanie
6. **Jakość**: ocena 0-100, próg akceptacji ≥70
7. **Bezpieczeństwo**: wykrywanie treści niepożądanych

## 🛡️ Zabezpieczenia

- **Rate limiting**: 10 requestów na godzinę na IP
- **Walidacja plików**: sprawdzanie MIME type i rozmiaru
- **CORS**: konfiguracja dla określonych domen
- **Helmet**: zabezpieczenia HTTP headers
- **Walidacja wymiarów**: sprawdzanie minimalnych wymiarów obrazu

## 📊 Monitoring

System loguje wszystkie próby walidacji z następującymi danymi:
- Timestamp
- Nazwa pliku
- Rozmiar i wymiary
- Wynik walidacji
- User agent i IP

## 🧪 Testowanie

### Testowanie API

```bash
# Health check
curl http://localhost:3001/api/health

# Status systemu
curl http://localhost:3001/api/ugc/status

# Test walidacji (wymaga pliku)
curl -X POST -F "images=@test-image.jpg" http://localhost:3001/api/ugc/validate
```

### Testowanie frontendu

```bash
cd client
npm test
```

## 🚀 Deployment

### Cloudflare Pages (Frontend) - REKOMENDOWANE ⭐

Frontend jest gotowy do wdrożenia na **Cloudflare Pages**:

```bash
# Metoda 1: GitHub Integration (najprostsza)
# 1. Push do GitHub
# 2. Połącz repozytorium w Cloudflare Dashboard
# 3. Gotowe! Automatyczne deploymenty

# Metoda 2: Wrangler CLI
cd client
npm run build
wrangler pages deploy build --project-name=ugc-validation-frontend
```

**Szczegóły:**
- 📚 [CLOUDFLARE_QUICKSTART.md](./CLOUDFLARE_QUICKSTART.md) - Szybki start (5 minut)
- 📖 [CLOUDFLARE_MIGRATION.md](./CLOUDFLARE_MIGRATION.md) - Pełna dokumentacja

**Korzyści Cloudflare Pages:**
- ⚡ Globalny CDN (300+ lokalizacji)
- 💰 Darmowy hosting
- 🔒 Automatyczne SSL
- 🚀 Automatyczne deploymenty z GitHub

### Railway (Backend) - Obecny

Backend pozostaje na Railway:
- URL: `https://ugc-validation-system-production.up.railway.app`
- Automatyczne deploymenty z GitHub
- Environment variables w Railway Dashboard

### Docker (opcjonalnie)

```dockerfile
# Dockerfile dla serwera
FROM node:16-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ .
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment variables dla produkcji

**Frontend (Cloudflare):**
```env
REACT_APP_API_URL=https://ugc-validation-system-production.up.railway.app/api
NODE_ENV=production
```

**Backend (Railway):**
```env
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=your_production_key
RATE_LIMIT_MAX_REQUESTS=100
AIRTABLE_API_KEY=your_key
CLOUDINARY_API_KEY=your_key
```

## 📈 KPI i metryki

System śledzi następujące metryki:
- % zdjęć zaakceptowanych vs odrzuconych
- Średni score jakości
- Czas odpowiedzi (upload → feedback)
- Liczba requestów na godzinę
- Błędy API

## 🔄 Aktualizacje

### v1.0.0
- Podstawowa funkcjonalność walidacji
- Integracja z OpenAI Vision API
- Frontend React z drag & drop
- Rate limiting i zabezpieczenia

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi serwera
2. Zweryfikuj konfigurację OpenAI API
3. Sprawdź limity rate limitingu
4. Upewnij się, że pliki spełniają wymagania

## 📄 Licencja

MIT License - zobacz plik LICENSE dla szczegółów.

