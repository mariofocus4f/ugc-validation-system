# ✅ Cloudflare Pages Deployment Checklist

Użyj tej checklisty aby upewnić się, że wszystko jest gotowe do wdrożenia.

---

## 📋 Pre-Deployment

### Przygotowanie kodu

- [ ] Kod jest na GitHub i zsynchronizowany
- [ ] Wszystkie zmiany są zacommitowane
- [ ] Branch `main` jest aktualny
- [ ] `.gitignore` zawiera `/client/build` i `/client/.env.production`

### Pliki konfiguracyjne

- [ ] `client/wrangler.toml` istnieje i jest poprawny
- [ ] `client/public/_redirects` istnieje
- [ ] `client/public/_headers` istnieje
- [ ] Przeczytano `CLOUDFLARE_MIGRATION.md`

### Zmienne środowiskowe

- [ ] Znasz URL backendu Railway: `https://ugc-validation-system-production.up.railway.app`
- [ ] Masz gotową wartość dla `REACT_APP_API_URL`

---

## 🚀 Deployment

### Cloudflare Account

- [ ] Masz konto na Cloudflare (darmowe wystarczy)
- [ ] Jesteś zalogowany na [dash.cloudflare.com](https://dash.cloudflare.com)

### Wybór metody deploymentu

**Metoda 1: GitHub (Rekomendowana)**
- [ ] Połączono repozytorium GitHub z Cloudflare Pages
- [ ] Ustawiono Framework preset: "Create React App"
- [ ] Build command: `cd client && npm install && npm run build`
- [ ] Build output: `client/build`
- [ ] Dodano zmienną środowiskową `REACT_APP_API_URL` w Cloudflare Dashboard
- [ ] Kliknięto "Save and Deploy"

**Metoda 2: Wrangler CLI**
- [ ] Zainstalowano Wrangler: `npm install -g wrangler`
- [ ] Zalogowano się: `wrangler login`
- [ ] Zbudowano projekt: `./build-cloudflare.sh`
- [ ] Wdrożono: `wrangler pages deploy client/build --project-name=ugc-validation-frontend`

---

## 🔧 Post-Deployment

### Weryfikacja URL

- [ ] Otrzymano URL Cloudflare Pages (np. `https://twoj-projekt.pages.dev`)
- [ ] Zapisano URL w bezpiecznym miejscu
- [ ] URL otwiera się w przeglądarce

### Aktualizacja CORS na backendzie

- [ ] Edytowano `server/index.js` (dodano URL Cloudflare do `allowedOrigins`)
- [ ] Commit: `git add server/index.js && git commit -m "Add Cloudflare to CORS"`
- [ ] Push na Railway: `git push origin main`
- [ ] Sprawdzono logi Railway (backend restart successful)

Przykład kodu CORS:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://ugc-validation-frontend-production-ce00.up.railway.app',
  'https://twoj-projekt.pages.dev', // 👈 DODAJ TEN
];
```

---

## 🧪 Testing

### Frontend

- [ ] Otwarto aplikację: `https://twoj-projekt.pages.dev`
- [ ] Strona ładuje się poprawnie
- [ ] Brak błędów w Console (F12)
- [ ] CSS i obrazki są widoczne

### API Connection

- [ ] Otwarto DevTools (F12) → Network
- [ ] Wypełniono formularz (numer zamówienia, email)
- [ ] Upload 3 zdjęć testowych
- [ ] Sprawdzono czy request do API przechodzi (status 200)
- [ ] Brak błędów CORS w Console
- [ ] Wyniki walidacji wyświetlają się poprawnie

### Full Flow Test

- [ ] Test z prawdziwym numerem zamówienia
- [ ] Upload zdjęć produktów (min. 3)
- [ ] Wypełnienie opinii tekstowej
- [ ] Wybór oceny gwiazdkowej
- [ ] Submit formularza
- [ ] Otrzymanie wyników walidacji
- [ ] (Opcjonalnie) Sprawdzenie czy dane trafiły do Airtable

### Cross-Browser Testing

- [ ] Chrome/Edge (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Mobile Chrome/Safari

---

## 🌍 Custom Domain (Opcjonalne)

Jeśli chcesz użyć własnej domeny (np. `ugc.focusgarden.com`):

- [ ] W Cloudflare Pages → Custom domains → Add domain
- [ ] Dodano domenę: `ugc.focusgarden.com`
- [ ] DNS został automatycznie skonfigurowany przez Cloudflare
- [ ] SSL certyfikat jest aktywny (może zająć 1-5 minut)
- [ ] Domena otwiera się w przeglądarce
- [ ] Zaktualizowano CORS na backendzie z nową domeną

---

## 📊 Monitoring

### Cloudflare Analytics

- [ ] Przejrzano Cloudflare Analytics
- [ ] Sprawdzono Requests per second
- [ ] Sprawdzono Error rate
- [ ] Ustawiono alerty (opcjonalnie)

### Railway Backend

- [ ] Sprawdzono logi Railway: `railway logs`
- [ ] Backend odpowiada poprawnie
- [ ] Health check działa: `https://ugc-validation-system-production.up.railway.app/api/health`

---

## 🔒 Security

### Headers

- [ ] Sprawdzono security headers (SecurityHeaders.com)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] HTTPS enforcement

### Rate Limiting

- [ ] Przetestowano rate limiting (10 requestów/godzinę)
- [ ] Sprawdzono czy działa blokada po przekroczeniu limitu

---

## 📝 Documentation

### Aktualizacja dokumentacji

- [ ] Zaktualizowano README.md z nowym URL
- [ ] Dodano URL Cloudflare do `APLIKACJA_PODSUMOWANIE.md`
- [ ] Zapisano credentials w bezpiecznym miejscu

### Team Notification

- [ ] Powiadomiono zespół o nowym URL
- [ ] Udostępniono link do frontendu
- [ ] Udostępniono dokumentację

---

## 🎉 Final Checks

### Production Ready

- [ ] Wszystkie testy przeszły pomyślnie
- [ ] CORS działa poprawnie
- [ ] Performance jest zadowalający
- [ ] Brak błędów w Console
- [ ] Mobile responsywność działa
- [ ] Wszystkie funkcje działają

### Rollback Plan

- [ ] Stary URL Railway frontend jest nadal dostępny (backup)
- [ ] Wiem jak cofnąć deployment w Cloudflare
- [ ] Backend może działać z obiema wersjami frontend

---

## 📈 Success Metrics

Po tygodniu sprawdź:

- [ ] **Uptime**: >99%
- [ ] **Load Time**: <2s (First Contentful Paint)
- [ ] **Error Rate**: <1%
- [ ] **User Satisfaction**: Brak zgłoszeń problemów

---

## 🔄 Ongoing Maintenance

### Tygodniowo

- [ ] Sprawdź Cloudflare Analytics
- [ ] Sprawdź logi Railway
- [ ] Monitor error rate

### Miesięcznie

- [ ] Aktualizuj dependencies: `npm update`
- [ ] Sprawdź Cloudflare usage (czy w limicie darmowym)
- [ ] Review security headers

---

## 📞 Support

Jeśli coś nie działa:

1. **Sprawdź dokumentację**:
   - `CLOUDFLARE_MIGRATION.md` - pełny przewodnik
   - `UPDATE_CORS.md` - problemy z CORS
   - `CLOUDFLARE_QUICKSTART.md` - szybki start

2. **Debugowanie**:
   - Cloudflare logs: Dashboard → Deployment logs
   - Railway logs: `railway logs`
   - Browser Console: F12 → Console

3. **Community**:
   - [Cloudflare Discord](https://discord.gg/cloudflaredev)
   - [Cloudflare Community](https://community.cloudflare.com/)

---

## ✅ Status

**Deployment Status:** [ ] Not Started / [ ] In Progress / [ ] Completed

**Date Deployed:** _________________

**Deployed By:** _________________

**Frontend URL:** _________________

**Backend URL:** `https://ugc-validation-system-production.up.railway.app`

**Notes:**
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

**🎉 Gratulacje! Twoja aplikacja jest na Cloudflare Pages!**

*Checklist v1.0 - Październik 2025*


