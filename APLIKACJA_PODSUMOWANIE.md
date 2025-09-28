# UGC Validation System - Podsumowanie Aplikacji

## 🎯 **Opis Biznesowy i UX**

### **Cel Aplikacji**
System walidacji zdjęć UGC (User Generated Content) dla sklepu FocusGarden, który automatycznie sprawdza jakość zdjęć produktów przesłanych przez klientów i przyznaje kody rabatowe za pozytywne opinie.

### **Model Biznesowy**
- **Klienci** przesyłają zdjęcia zakupionych produktów wraz z opinią
- **System** automatycznie waliduje jakość zdjęć używając AI
- **Zaakceptowane zdjęcia** (3+) + opinia = kod rabatowy 100 zł
- **Korzyść dla sklepu**: autentyczne zdjęcia produktów do marketingu

### **User Experience (UX)**
1. **Prosty formularz** - numer zamówienia, 3 zdjęcia, opinia tekstowa, ocena gwiazdkowa
2. **Natychmiastowa walidacja** - AI sprawdza zdjęcia w czasie rzeczywistym
3. **Przejrzyste wyniki** - jasne komunikaty o akceptacji/odrzuceniu
4. **Automatyczny kod rabatowy** - wysyłany na email po akceptacji

---

## 🔍 **Zasady Działania i Walidacji**

### **Proces Walidacji Zdjęć**
1. **Sprawdzenie wymiarów** - minimum 400px szerokości
2. **Analiza AI (OpenAI Vision)** - sprawdza:
   - Czy zdjęcie zawiera osoby (automatyczne odrzucenie)
   - Jakość zdjęcia (ostrość, ekspozycja, kompozycja)
   - Widoczność produktu
   - Ogólna ocena 0-100 punktów

### **Kryteria Akceptacji**
- **Minimum 3 zdjęcia** zaakceptowane (score ≥ 70)
- **Brak osób** na zdjęciach
- **Dobra jakość** - ostrość, światło, kompozycja
- **Widoczny produkt** - główny element zdjęcia

### **Sprawdzanie Zamówień**
- **Weryfikacja numeru zamówienia** w głównej tabeli `Orders` w Airtable
- **Sprawdzenie czy zamówienie istnieje** - jeśli nie, komunikat błędu
- **Sprawdzenie statusu** - czy zamówienie już ma opinię w tabeli `reviews_done`
- **Zapobieganie duplikatom** - jeden kod rabatowy na zamówienie
- **Walidacja biznesowa** - tylko istniejące zamówienia mogą otrzymać kod rabatowy

### **Zapis Danych**
- **Airtable** - główna baza danych zamówień i opinii
- **Cloudinary** - przechowywanie zdjęć
- **Email** - wysyłka kodów rabatowych

---

## 🏗️ **Struktura Techniczna**

### **Frontend (React)**
- **Technologie**: React, Tailwind CSS, Axios
- **Hosting**: Railway.app
- **URL**: `https://ugc-validation-frontend-production-ce00.up.railway.app`
- **Funkcje**:
  - Formularz uploadu zdjęć
  - Walidacja formularza
  - Wyświetlanie wyników
  - Responsywny design

### **Backend (Node.js)**
- **Technologie**: Express.js, Multer, Sharp, Joi
- **Hosting**: Railway.app
- **URL**: `https://ugc-validation-system-production.up.railway.app`
- **Funkcje**:
  - API endpoints
  - Walidacja zdjęć
  - Integracje z zewnętrznymi serwisami
  - Rate limiting i bezpieczeństwo

### **Baza Danych - Airtable**
- **Tabela główna**: `Orders` - wszystkie zamówienia sklepu
- **Tabela opinii**: `reviews_done` - opinie i kody rabatowe
- **Pola w reviews_done**:
  - Order number (numer zamówienia)
  - Status (not_yet, accepted, rejected)
  - Client Email (email klienta)
  - Cloudinary Link (link do zdjęcia)
  - Review Text (tekst opinii)
  - Imie (imię klienta)
  - Gwiazdki (ocena 1-5)

### **Przechowywanie Zdjęć - Cloudinary**
- **Funkcje**:
  - Upload zdjęć
  - Optymalizacja rozmiaru
  - CDN dla szybkiego dostępu
- **Struktura**: `ugc-validation/{orderNumber}/{filename}`

### **AI Walidacja - OpenAI Vision API**
- **Model**: GPT-4o-mini
- **Funkcje**:
  - Analiza zdjęć
  - Wykrywanie osób
  - Ocena jakości
  - Generowanie feedbacku

---

## 🔄 **Przepływ Danych**

### **1. Weryfikacja Zamówienia**
```
Frontend → Backend → Airtable (Orders) → Sprawdzenie czy istnieje
```

### **2. Upload Zdjęć**
```
Frontend → Backend → Multer → Sharp (resize) → Cloudinary
```

### **3. Walidacja AI**
```
Backend → OpenAI Vision API → Analiza → Wynik JSON
```

### **4. Zapis Wyników**
```
Backend → Airtable (reviews_done) → Status update
```

### **5. Kod Rabatowy**
```
Backend → Airtable (discount_codes) → Email Service → Klient
```

---

## 🛡️ **Bezpieczeństwo**

### **Walidacja Input**
- **Joi schemas** - walidacja wszystkich danych wejściowych
- **Pattern matching** - tylko bezpieczne znaki w tekstach
- **File validation** - sprawdzanie typów i rozmiarów plików

### **Rate Limiting**
- **10 requestów na godzinę** na IP
- **Ochrona przed spamem** i nadużyciami

### **CORS**
- **Konfiguracja** dla konkretnych domen
- **Bezpieczne** cross-origin requests

### **Error Handling**
- **Graceful degradation** - system działa nawet przy błędach API
- **Logging** - szczegółowe logi dla debugowania
- **Fallback responses** - bezpieczne domyślne wartości

---

## 📊 **Monitoring i Logi**

### **Railway Logs**
- **Frontend logs** - błędy JavaScript, requesty
- **Backend logs** - API calls, błędy serwera
- **HTTP logs** - statystyki requestów

### **Airtable**
- **Audit trail** - historia zmian statusów
- **Dashboard** - przegląd wszystkich zamówień

### **Cloudinary**
- **Usage statistics** - wykorzystanie storage
- **Performance metrics** - czasy uploadu

---

## 🚀 **Deployment i Hosting**

### **Railway.app**
- **Automatyczny deployment** z GitHub
- **Environment variables** - bezpieczne przechowywanie kluczy
- **Health checks** - monitoring dostępności
- **Scaling** - automatyczne skalowanie

### **Environment Variables**
```
# Backend
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
OPENAI_API_KEY
MAX_FILES=3
MAX_FILE_SIZE=5242880
MIN_IMAGE_WIDTH=400

# Frontend
REACT_APP_API_URL
```

---

## 📈 **Metryki i KPI**

### **Biznesowe**
- **Liczba przesłanych opinii** dziennie/miesięcznie
- **Wskaźnik akceptacji** zdjęć (%)
- **Liczba przyznanych kodów** rabatowych
- **Czas odpowiedzi** systemu

### **Techniczne**
- **Uptime** aplikacji
- **Czasy odpowiedzi** API
- **Wykorzystanie** OpenAI API
- **Storage usage** Cloudinary

---

## 🔧 **Maintenance i Rozwój**

### **Regularne Zadania**
- **Monitoring** błędów w logach
- **Aktualizacja** kluczy API
- **Backup** danych Airtable
- **Optymalizacja** wydajności

### **Możliwe Rozszerzenia**
- **Więcej języków** - internacjonalizacja
- **Analytics dashboard** - szczegółowe statystyki
- **Mobile app** - aplikacja mobilna
- **Integracja** z innymi systemami sklepu

---

*Dokumentacja aktualna na: 28 września 2025*
