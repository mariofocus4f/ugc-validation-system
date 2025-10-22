# ⚡ Cloudflare Pages - Quick Start

Szybki przewodnik wdrożenia frontendu na Cloudflare Pages w 5 minut.

---

## 🎯 Metoda 1: GitHub (Najprostsza) - 5 minut

### 1. Push do GitHub

```bash
# Jeśli jeszcze nie masz repozytorium na GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/twoje-konto/ugc-validation.git
git push -u origin main
```

### 2. Połącz z Cloudflare

1. Zaloguj się na [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create application** → **Pages**
3. **Connect to Git** → wybierz swoje repozytorium
4. **Konfiguracja buildu**:
   ```
   Framework preset: Create React App
   Build command: cd client && npm install && npm run build
   Build output directory: client/build
   Root directory: /
   ```
5. **Environment variables**:
   - `REACT_APP_API_URL` = `https://ugc-validation-system-production.up.railway.app/api`
6. **Save and Deploy**

### 3. Gotowe! 🎉

Twoja aplikacja jest dostępna pod: `https://twoj-projekt.pages.dev`

---

## 🎯 Metoda 2: Wrangler CLI - 3 minuty

### 1. Instalacja Wrangler

```bash
npm install -g wrangler
```

### 2. Login

```bash
wrangler login
```

### 3. Build i Deploy

```bash
cd client
npm install
npm run build
wrangler pages deploy build --project-name=ugc-validation-frontend
```

### 4. Gotowe! 🎉

Wrangler wyświetli URL: `https://ugc-validation-frontend.pages.dev`

---

## 🔧 Konfiguracja zmiennych środowiskowych

### W Cloudflare Dashboard:

1. Przejdź do swojego projektu
2. **Settings** → **Environment variables**
3. **Production** → **Add variable**
4. Dodaj: `REACT_APP_API_URL` = `https://ugc-validation-system-production.up.railway.app/api`
5. **Redeploy** aby zastosować zmiany

---

## ⚠️ Ważne: Aktualizuj CORS na backendzie

Po deployment dodaj nowy URL Cloudflare do CORS w `server/index.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://ugc-validation-frontend-production-ce00.up.railway.app',
  'https://twoj-projekt.pages.dev', // 👈 DODAJ TO
];
```

Wypchnij zmiany na Railway:
```bash
git add server/index.js
git commit -m "Add Cloudflare to CORS"
git push
```

---

## ✅ Test

1. Otwórz: `https://twoj-projekt.pages.dev`
2. Wypełnij formularz
3. Upload 3 zdjęcia
4. Sprawdź czy działa!

---

## 🚀 Automatyczne deploymenty

Każdy push do `main` automatycznie wdroży nową wersję:

```bash
git add .
git commit -m "Update"
git push
# Cloudflare automatycznie wdroży! 🚀
```

---

## 📚 Więcej informacji

Zobacz pełną dokumentację: [CLOUDFLARE_MIGRATION.md](./CLOUDFLARE_MIGRATION.md)

---

**🎉 To wszystko! Twój frontend jest na Cloudflare Pages!**


