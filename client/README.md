# Frontend - UGC Validation System

React frontend dla systemu walidacji zdjęć UGC, gotowy do wdrożenia na **Cloudflare Pages**.

---

## 🚀 Quick Start

### Development

```bash
# Instalacja
npm install

# Uruchomienie dev server
npm start

# Otwórz http://localhost:3000
```

### Production Build

```bash
# Build dla Cloudflare Pages
npm run build

# Lub użyj skryptu
cd ..
./build-cloudflare.sh
```

---

## 📦 Stack Technologiczny

- **React** 18.2.0
- **Tailwind CSS** 3.3.6
- **Axios** 1.6.2
- **React Dropzone** 14.2.3
- **Lucide React** 0.294.0 (ikony)

---

## 🌐 Deployment na Cloudflare Pages

### Metoda 1: GitHub (Rekomendowana) ⭐

1. **Połącz z GitHub**
   - Dashboard: [dash.cloudflare.com](https://dash.cloudflare.com)
   - Workers & Pages → Create application → Pages
   - Connect to Git → wybierz repozytorium

2. **Konfiguracja buildu**
   ```
   Framework preset: Create React App
   Build command: cd client && npm install && npm run build
   Build output directory: client/build
   Root directory: /
   Node version: 18
   ```

3. **Environment variables**
   ```
   REACT_APP_API_URL=https://ugc-validation-system-production.up.railway.app/api
   ```

4. **Deploy**
   - Save and Deploy
   - Otrzymasz URL: `https://twoj-projekt.pages.dev`

### Metoda 2: Wrangler CLI

```bash
# Instalacja Wrangler
npm install -g wrangler

# Login
wrangler login

# Build
npm run build

# Deploy
wrangler pages deploy build --project-name=ugc-validation-frontend
```

---

## 🔧 Konfiguracja

### Pliki konfiguracyjne

- **wrangler.toml** - konfiguracja Cloudflare Pages
- **public/_redirects** - SPA routing
- **public/_headers** - security headers
- **.env.production** - zmienne środowiskowe (utwórz ręcznie)

### Zmienne środowiskowe

Utwórz plik `.env.production`:

```env
REACT_APP_API_URL=https://ugc-validation-system-production.up.railway.app/api
NODE_ENV=production
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
```

---

## 📁 Struktura

```
client/
├── public/              # Pliki statyczne
│   ├── _redirects      # SPA routing dla Cloudflare
│   ├── _headers        # Security headers
│   └── index.html      # HTML template
├── src/
│   ├── components/      # Komponenty React
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── ImageUploader.js
│   │   ├── ValidationResults.js
│   │   └── PhotoInstructions.js
│   ├── services/        # API services
│   │   └── api.js      # Axios configuration
│   ├── App.js          # Main component
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── wrangler.toml       # Cloudflare config
├── package.json        # Dependencies
└── tailwind.config.js  # Tailwind configuration
```

---

## 🔌 API Integration

Frontend komunikuje się z backendem na Railway:

```javascript
// src/services/api.js
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://ugc-validation-system-production.up.railway.app/api',
  timeout: 60000,
});
```

### Endpoints

- `POST /ugc/validate` - walidacja zdjęć
- `GET /ugc/status` - status systemu
- `GET /health` - health check

---

## 🧪 Testing

```bash
# Run tests
npm test

# Test coverage
npm test -- --coverage
```

---

## 🎨 Styling

### Tailwind CSS

Projekt używa Tailwind CSS do stylowania. Konfiguracja w `tailwind.config.js`.

### Customizacja

Główne kolory i style można zmienić w:
- `tailwind.config.js` - kolory, fonty, breakpoints
- `src/index.css` - globalne style

---

## 📱 Responsywność

Frontend jest w pełni responsywny:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## ⚡ Performance

### Optymalizacje

- Code splitting
- Lazy loading komponentów
- Image optimization (Sharp na backendzie)
- Cloudflare CDN caching
- Brotli compression

### Build optimization

Plik `.env.production` zawiera optymalizacje:
```env
GENERATE_SOURCEMAP=false      # Mniejszy bundle
INLINE_RUNTIME_CHUNK=false    # Lepsze cache'owanie
```

---

## 🔒 Security

### Headers (w `public/_headers`)

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`

### Best Practices

- ✅ HTTPS tylko (Cloudflare automatycznie)
- ✅ Security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ Rate limiting (backend)

---

## 📚 Dokumentacja

### Cloudflare Deployment

- [CLOUDFLARE_QUICKSTART.md](../CLOUDFLARE_QUICKSTART.md) - Quick start (5 min)
- [CLOUDFLARE_MIGRATION.md](../CLOUDFLARE_MIGRATION.md) - Pełny przewodnik
- [CLOUDFLARE_INDEX.md](../CLOUDFLARE_INDEX.md) - Index dokumentacji

### Project Documentation

- [README.md](../README.md) - Główna dokumentacja
- [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) - Podsumowanie
- [APLIKACJA_PODSUMOWANIE.md](../APLIKACJA_PODSUMOWANIE.md) - Architektura

---

## 🐛 Troubleshooting

### Problem: CORS errors

**Rozwiązanie:**
- Sprawdź czy backend ma dodany URL Cloudflare do allowedOrigins
- Zobacz [UPDATE_CORS.md](../UPDATE_CORS.md)

### Problem: 404 na routach

**Rozwiązanie:**
- Sprawdź czy `public/_redirects` istnieje
- Powinien zawierać: `/* /index.html 200`

### Problem: Environment variables nie działają

**Rozwiązanie:**
- Zmienne muszą zaczynać się od `REACT_APP_`
- W Cloudflare Dashboard dodaj zmienną `REACT_APP_API_URL`
- Redeploy projekt

### Problem: Wolne ładowanie

**Rozwiązanie:**
- Sprawdź czy `public/_headers` zawiera cache headers
- Cloudflare automatycznie cache'uje statyczne pliki
- Użyj Cloudflare Analytics do monitorowania

---

## 📊 Available Scripts

```bash
npm start              # Development server (port 3000)
npm run build         # Production build
npm test              # Run tests
npm run eject         # Eject from Create React App (nie zalecane)
```

---

## 🔄 Development Workflow

### Local Development

```bash
# 1. Start backend (w innym terminalu)
cd ../server
npm run dev

# 2. Start frontend
cd ../client
npm start

# 3. Otwórz http://localhost:3000
```

### Deploy na Cloudflare

```bash
# Via GitHub (automatic)
git add .
git commit -m "Update frontend"
git push origin main
# Cloudflare automatycznie deployuje!

# Via CLI
npm run build
wrangler pages deploy build
```

---

## 🌟 Features

- ✅ Drag & drop upload zdjęć
- ✅ Preview zdjęć przed uploadem
- ✅ Real-time walidacja formularza
- ✅ Progress indicator podczas uploadu
- ✅ Szczegółowe wyniki walidacji
- ✅ Instrukcje fotograficzne dla użytkowników
- ✅ Responsywny design
- ✅ Error handling i user feedback
- ✅ Ocena gwiazdkowa (1-5)
- ✅ Fix mode dla odrzuconych zdjęć

---

## 🎯 Component Overview

### ImageUploader.js
- Upload zdjęć (drag & drop lub file picker)
- Walidacja plików (typ, rozmiar)
- Preview zdjęć
- Formularz zamówienia i opinii

### ValidationResults.js
- Wyświetlanie wyników walidacji
- Status dla każdego zdjęcia
- Feedback od AI
- Statystyki (accepted/rejected)

### PhotoInstructions.js
- Instrukcje jak robić dobre zdjęcia
- Best practices
- Przykłady

### Header.js & Footer.js
- Branding
- Nawigacja
- Informacje kontaktowe

---

## 🔮 Future Enhancements

Możliwe rozszerzenia:

- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Advanced image editor
- [ ] Batch upload (więcej niż 3 zdjęcia)
- [ ] WebSocket real-time updates
- [ ] Progressive Web App (PWA)
- [ ] Analytics dashboard

---

## 📞 Support

Problemy? Sprawdź:
1. [CLOUDFLARE_MIGRATION.md](../CLOUDFLARE_MIGRATION.md) - troubleshooting
2. [UPDATE_CORS.md](../UPDATE_CORS.md) - CORS issues
3. DevTools Console (F12) - błędy JavaScript

---

**🚀 Ready to deploy on Cloudflare Pages!**

*Documentation updated: Październik 2025*


