# 🚀 Instrukcje wdrożenia UGC Validation System

## 📋 Wymagania przed wdrożeniem

1. **Konto GitHub** z kodem w repozytorium
2. **Konto na platformie hostingu** (Railway/Render)
3. **Wszystkie klucze API** skonfigurowane

## 🎯 Opcje hostingu

### 1. Railway (Zalecane)

**Zalety:**
- ✅ Darmowy tier: 500h/miesiąc
- ✅ Automatyczne wdrożenie z GitHub
- ✅ Łatwa konfiguracja zmiennych środowiskowych
- ✅ Wbudowane bazy danych
- ✅ HTTPS out of the box

**Kroki wdrożenia:**

1. **Zarejestruj się na [Railway.app](https://railway.app)**
2. **Połącz z GitHub** i wybierz repozytorium
3. **Utwórz nowy projekt** z GitHub
4. **Dodaj zmienne środowiskowe:**
   ```
   NODE_ENV=production
   PORT=3001
   OPENAI_API_KEY=your_key_here
   AIRTABLE_API_KEY=your_key_here
   AIRTABLE_BASE_ID=your_base_id_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_FOLDER=ugc-validation
   GOOGLE_OAUTH_CLIENT_ID=your_client_id
   GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id
   ```
5. **Wdróż** - Railway automatycznie zbuduje i uruchomi aplikację

### 2. Render

**Zalety:**
- ✅ Darmowy tier: 750h/miesiąc
- ✅ Automatyczne wdrożenie
- ✅ Wbudowane bazy PostgreSQL
- ✅ HTTPS out of the box

**Kroki wdrożenia:**

1. **Zarejestruj się na [Render.com](https://render.com)**
2. **Połącz z GitHub** i wybierz repozytorium
3. **Utwórz nowy Web Service**
4. **Skonfiguruj:**
   - **Build Command:** `docker build -f server/Dockerfile -t ugc-api ./server`
   - **Start Command:** `npm start`
   - **Dockerfile Path:** `server/Dockerfile`
5. **Dodaj zmienne środowiskowe** (jak wyżej)
6. **Wdróż**

### 3. Vercel (Frontend) + Railway (Backend)

**Zalety:**
- ✅ Vercel: Frontend React (darmowy)
- ✅ Railway: Backend Node.js (darmowy)
- ✅ Najlepsza wydajność dla frontendu
- ✅ Global CDN

**Kroki wdrożenia:**

1. **Backend na Railway** (jak wyżej)
2. **Frontend na Vercel:**
   - Zarejestruj się na [Vercel.com](https://vercel.com)
   - Połącz z GitHub
   - Wybierz folder `client`
   - Dodaj zmienną: `REACT_APP_API_URL=https://your-railway-app.railway.app/api`
   - Wdróż

## 🔧 Konfiguracja zmiennych środowiskowych

### Wymagane zmienne:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...

# Airtable
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Drive (opcjonalne)
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Frontend
REACT_APP_API_URL=https://your-domain.com/api
```

## 📁 Struktura plików

```
UGC/
├── server/
│   ├── Dockerfile          # Backend container
│   ├── package.json
│   └── ...
├── client/
│   ├── Dockerfile          # Frontend container
│   ├── package.json
│   └── ...
├── docker-compose.yml      # Local development
├── railway.json           # Railway configuration
├── render.yaml            # Render configuration
└── env.production.example # Environment template
```

## 🚀 Szybkie wdrożenie

### Railway (1 klik):

1. Kliknij [Deploy on Railway](https://railway.app/template/your-template)
2. Połącz z GitHub
3. Dodaj zmienne środowiskowe
4. Wdróż!

### Render (1 klik):

1. Kliknij [Deploy on Render](https://render.com/deploy)
2. Połącz z GitHub
3. Wybierz `render.yaml`
4. Dodaj zmienne środowiskowe
5. Wdróż!

## 🔍 Testowanie po wdrożeniu

1. **Sprawdź health check:** `https://your-domain.com/api/health`
2. **Przetestuj walidację:** Wyślij zdjęcie przez formularz
3. **Sprawdź Airtable:** Czy opinie są zapisywane
4. **Sprawdź Cloudinary:** Czy zdjęcia są uploadowane

## 📊 Monitoring

- **Railway:** Dashboard z logami i metrykami
- **Render:** Dashboard z logami i metrykami
- **Vercel:** Analytics i performance

## 🆘 Rozwiązywanie problemów

### Częste problemy:

1. **Błąd 500:** Sprawdź zmienne środowiskowe
2. **Timeout:** Zwiększ limit czasu w konfiguracji
3. **Memory limit:** Zwiększ plan na płatny
4. **CORS errors:** Sprawdź REACT_APP_API_URL

### Logi:

- **Railway:** `railway logs`
- **Render:** Dashboard → Logs
- **Vercel:** Dashboard → Functions → Logs

## 💰 Koszty

### Darmowe limity:

- **Railway:** 500h/miesiąc, 1GB RAM, 1GB storage
- **Render:** 750h/miesiąc, 512MB RAM
- **Vercel:** 100GB bandwidth/miesiąc

### Płatne plany:

- **Railway Pro:** $5/miesiąc
- **Render Starter:** $7/miesiąc
- **Vercel Pro:** $20/miesiąc

## 🔐 Bezpieczeństwo

1. **Nigdy nie commituj** plików `.env`
2. **Używaj HTTPS** w produkcji
3. **Ogranicz CORS** do domeny frontendu
4. **Rate limiting** jest włączony
5. **Helmet.js** dla bezpieczeństwa headers

## 📞 Wsparcie

- **Railway:** [Discord](https://discord.gg/railway)
- **Render:** [Community](https://community.render.com)
- **Vercel:** [GitHub Discussions](https://github.com/vercel/vercel/discussions)
