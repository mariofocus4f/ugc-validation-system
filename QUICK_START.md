# 🚀 UGC Validation System - Quick Start

## Szybki start w 3 krokach

### 1. Konfiguracja OpenAI API
```bash
# Skopiuj plik konfiguracyjny
cp server/env.example server/.env

# Edytuj plik i dodaj swój klucz API
nano server/.env
```

Dodaj swój klucz OpenAI API:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 2. Instalacja i uruchomienie
```bash
# Automatyczna instalacja i uruchomienie
./start.sh

# Lub ręcznie:
npm run install:all
npm run dev
```

### 3. Testowanie
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Health check: http://localhost:3001/api/health

## 🐳 Deployment z Docker

```bash
# Szybki deployment
./deploy.sh

# Lub ręcznie:
docker-compose up -d
```

## 📋 Wymagania

- Node.js 16+
- Klucz OpenAI API
- 2GB RAM (dla Docker)

## 🔧 Rozwiązywanie problemów

### Błąd: "OpenAI API key nie jest skonfigurowany"
- Sprawdź czy plik `server/.env` istnieje
- Upewnij się, że klucz API jest poprawny
- Sprawdź czy masz środki na koncie OpenAI

### Błąd: "Zbyt wiele prób"
- System ma limit 10 requestów na godzinę
- Poczekaj lub zwiększ limit w `server/.env`

### Błąd: "Plik jest zbyt duży"
- Maksymalny rozmiar: 10MB na plik
- Maksymalnie 5 plików na raz

## 📞 Wsparcie

W przypadku problemów sprawdź:
1. Logi serwera: `docker-compose logs api`
2. Status systemu: http://localhost:3001/api/ugc/status
3. Dokumentację: README.md
