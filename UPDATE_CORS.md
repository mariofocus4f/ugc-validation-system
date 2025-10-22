# ⚠️ WAŻNE: Aktualizacja CORS po wdrożeniu na Cloudflare

Po wdrożeniu frontendu na Cloudflare Pages, **musisz zaktualizować CORS na backendzie**, aby zezwolić na requesty z nowej domeny.

---

## 🔧 Co trzeba zrobić?

### 1. Znajdź swój URL Cloudflare

Po wdrożeniu na Cloudflare otrzymasz URL w formacie:
- `https://twoj-projekt.pages.dev` (automatycznie wygenerowany)
- lub własną domenę, np. `https://ugc.focusgarden.com`

### 2. Edytuj `server/index.js`

Znajdź sekcję CORS (linie 17-23) i zamień ją na:

```javascript
// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',                                           // Development
  'https://ugc-validation-frontend-production-ce00.up.railway.app',  // Railway (stary)
  'https://twoj-projekt.pages.dev',                                  // 👈 DODAJ: Cloudflare Pages
  'https://ugc.focusgarden.com'                                      // 👈 OPCJONALNIE: Twoja własna domena
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Commit i push na Railway

```bash
# Zapisz zmiany
git add server/index.js
git commit -m "Add Cloudflare Pages to CORS allowed origins"

# Wypchnij na Railway
git push origin main
```

Railway automatycznie wdroży nową wersję backendu w ciągu 1-2 minut.

---

## ✅ Sprawdź czy działa

### 1. Otwórz frontend na Cloudflare
```
https://twoj-projekt.pages.dev
```

### 2. Otwórz DevTools (F12)
- Przejdź do zakładki **Console**
- Sprawdź czy nie ma błędów CORS

### 3. Przetestuj upload zdjęć
- Wypełnij formularz
- Upload 3 zdjęcia
- Sprawdź czy walidacja działa

### 4. Jeśli widzisz błąd CORS:

```
Access to XMLHttpRequest at 'https://...' from origin 'https://twoj-projekt.pages.dev' 
has been blocked by CORS policy
```

**Rozwiązanie:**
- Sprawdź czy URL w `allowedOrigins` jest DOKŁADNIE taki sam (bez trailing slash!)
- Upewnij się że zmiany zostały wdrożone na Railway
- Sprawdź logi Railway: `railway logs`

---

## 🔍 Debugowanie

### Sprawdź logi Railway:

```bash
# Zaloguj się do Railway CLI
railway login

# Zobacz logi
railway logs

# Powinno być widać:
# "🚀 Server uruchomiony na porcie 3001"
```

### Test CORS przez cURL:

```bash
# Test OPTIONS request
curl -X OPTIONS \
  https://ugc-validation-system-production.up.railway.app/api/health \
  -H "Origin: https://twoj-projekt.pages.dev" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Powinno zwrócić:
# Access-Control-Allow-Origin: https://twoj-projekt.pages.dev
```

---

## 📝 Przykład pełnej konfiguracji

```javascript
// server/index.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./database/database');
require('dotenv').config();

const validationRoutes = require('./routes/validation');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration - UPDATED FOR CLOUDFLARE
const allowedOrigins = [
  'http://localhost:3000',
  'https://ugc-validation-frontend-production-ce00.up.railway.app',
  'https://ugc-validation-frontend.pages.dev',        // Cloudflare Pages
  'https://ugc.focusgarden.com'                       // Custom domain
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
  message: {
    error: 'Zbyt wiele prób. Spróbuj ponownie za godzinę.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/ugc', validationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint nie został znaleziony',
    path: req.originalUrl 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server uruchomiony na porcie ${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`🔍 UGC Validation: http://0.0.0.0:${PORT}/api/ugc/validate`);
  console.log(`🌍 Allowed origins:`, allowedOrigins);
});

module.exports = app;
```

---

## ⚠️ Uwagi Bezpieczeństwa

### NIE dodawaj wildcards:
```javascript
// ❌ ŹLE - niebezpieczne!
origin: '*'

// ❌ ŹLE - niebezpieczne!
origin: /\.pages\.dev$/

// ✅ DOBRZE - tylko konkretne domeny
origin: ['https://twoj-projekt.pages.dev', 'https://ugc.focusgarden.com']
```

### Dlaczego?
- Wildcard `*` zezwala na requesty z KAŻDEJ domeny
- Regex może być exploitowany
- Lista konkretnych domen jest najbezpieczniejsza

---

## 🎯 Checklist

Przed testem produkcyjnym:

- [ ] Zaktualizowano `server/index.js` z nowym URL Cloudflare
- [ ] Commit i push na Railway
- [ ] Sprawdzono logi Railway (brak błędów)
- [ ] Przetestowano frontend na Cloudflare
- [ ] Sprawdzono Console w DevTools (brak błędów CORS)
- [ ] Przetestowano pełny flow (upload → walidacja → wyniki)
- [ ] Sprawdzono na różnych urządzeniach/przeglądarkach

---

**🎉 Po aktualizacji CORS wszystko powinno działać!**

*Dokumentacja: Październik 2025*


